#!/usr/bin/env python3
"""Check the actual Nginx templates in disposable containers, without host ports."""
import argparse
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOMAIN = "media.example.com"


def run(args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError("Command failed: " + " ".join(map(str, args)) + "\n" + result.stderr + result.stdout)
    return result.stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", default="nginx:stable-alpine", help="Nginx image; requires curl with HTTP/2 support")
    options = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="mivi-nginx-") as folder:
        temp = pathlib.Path(folder)
        cert = temp / "certificates"
        cert.mkdir()
        (temp / "certificate.conf").write_text("""[req]
distinguished_name = dn
x509_extensions = extensions
prompt = no
[dn]
CN = media.example.com
[extensions]
subjectAltName = DNS:media.example.com
basicConstraints = critical,CA:TRUE
keyUsage = critical,digitalSignature,keyEncipherment,keyCertSign
extendedKeyUsage = serverAuth
""")
        run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-sha256", "-nodes", "-days", "1", "-config", str(temp / "certificate.conf"), "-keyout", str(cert / "privkey.pem"), "-out", str(cert / "fullchain.pem")])
        (temp / "nginx.conf").write_text("""worker_processes 1;
error_log /dev/stderr warn;
pid /tmp/nginx.pid;
events { worker_connections 128; }
http {
    access_log off;
    include /tmp/mivi-site.conf;
}
""")

        for name, port in [("https", 443), ("reality", 8443)]:
            mounts = []
            for source, destination in [
                (ROOT / "site", "/opt/mivi/site"),
                (ROOT / "deploy", "/opt/mivi/deploy"),
                (cert, f"/etc/letsencrypt/live/{DOMAIN}"),
                (temp / "nginx.conf", "/tmp/nginx-test.conf"),
                (ROOT / "deploy" / f"nginx-{name}.conf.example", "/tmp/mivi-site.conf"),
            ]:
                mounts += ["--mount", f"type=bind,source={source},target={destination},readonly"]
            run(["docker", "run", "--rm", *mounts, options.image, "nginx", "-t", "-c", "/tmp/nginx-test.conf"])
            container = run(["docker", "run", "--detach", "--rm", *mounts, options.image, "nginx", "-c", "/tmp/nginx-test.conf", "-g", "daemon off;"]).strip()
            try:
                # Execute inside the same network namespace: the REALITY example
                # remains bound to 127.0.0.1, and no host port is ever published.
                curl = ["docker", "exec", container, "curl", "--noproxy", "*", "--silent", "--show-error", "--include", "--http2", "--tlsv1.3", "--tls-max", "1.3", "--cacert", f"/etc/letsencrypt/live/{DOMAIN}/fullchain.pem", "--resolve", f"{DOMAIN}:{port}:127.0.0.1", "--max-time", "15", "--retry", "5", "--retry-connrefused", "--retry-delay", "1", "--write-out", "\nMIVI_STATUS:%{http_code}\nMIVI_PROTOCOL:%{http_version}\n"]
                base = f"https://{DOMAIN}:{port}"
                response = run([*curl, base + "/"])
                assert "MIVI_STATUS:200" in response, response
                assert "MIVI_PROTOCOL:2" in response, "HTTP/2 was not negotiated"
                assert "<title>Mivi" in response, "Unexpected document root"
                for value in ["connect-src 'none'", "form-action 'none'", "frame-ancestors 'none'", "x-content-type-options: nosniff"]:
                    assert value in response.lower(), "Missing security header: " + value
                assert "MIVI_STATUS:200" in run([*curl, "--head", base + "/assets/app.js"])
                assert "MIVI_STATUS:404" in run([*curl, base + "/emby/Users/AuthenticateByName"])
                assert "MIVI_STATUS:404" in run([*curl, base + "/api/login"])
                assert "MIVI_STATUS:404" in run([*curl, base + "/README.md"])
                assert "MIVI_STATUS:405" in run([*curl, "--request", "POST", "--data", "blocked=true", base + "/"])
                print(f"PASS {name}: nginx -t, trusted TLS 1.3, HTTP/2 ALPN, GET/HEAD, CSP, API 404, POST 405, private files excluded", flush=True)
            finally:
                subprocess.run(["docker", "stop", "--time", "1", container], capture_output=True)
    print("All deployment checks passed. Temporary containers and certificates removed.", flush=True)


if __name__ == "__main__":
    main()
