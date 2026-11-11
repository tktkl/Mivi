# Mivi

Mivi 是一个轻量的私人影音库前端，提供英文界面、海报浏览、分类筛选、影片详情与登录入口。采用深色主题，支持桌面和手机，可直接部署到现有 Nginx。

![Mivi 桌面首页](docs/screenshots/home-desktop.png)

## 本地预览

运行网站只需要一个静态文件服务器，不需要安装 npm 依赖：

```sh
git clone https://github.com/tktkl/Mivi.git
cd Mivi
python3 -m http.server 4173 --bind 127.0.0.1 --directory site
```

打开 <http://127.0.0.1:4173>。不要直接双击 HTML，浏览器对本地文件的 ES module 有跨域限制。

## 现有 Nginx 部署

推荐复用 VPS 上已有的 Nginx。生产环境只提供 `site/`，不需要 Node、Python、Docker、构建步骤或应用进程。

```sh
sudo git clone https://github.com/tktkl/Mivi.git /opt/mivi
```

Nginx 的站点根目录应为 **`/opt/mivi/site`**。不要把整个 Git 仓库设为根目录；README、部署文件、测试和 `.git` 都应留在公开目录外。

已有站点只需把对应 `server` 的静态配置指向本项目；新站点可以选下面的一份模板。保留你现有的 `nginx.conf` 和其他站点配置。模板以 Nginx **1.25.1 及以上**为默认；旧版的替换方式见下文。

### 自动部署参数

后续部署人员或 AI 可以按以下参数和步骤执行。域名、证书、私钥和公网入口方式以部署任务或服务器现状为准；`media.example.com` 仅为占位域名。

| 参数 | 默认值或要求 |
| --- | --- |
| 代码仓库 | `https://github.com/tktkl/Mivi.git`，分支 `main` |
| 安装目录 | `/opt/mivi` |
| 公开根目录 | `/opt/mivi/site` |
| 站点域名 | 使用实际部署域名，替换模板中的 `media.example.com` |
| TLS 证书 | 已签发且匹配域名的证书链与私钥；使用服务器现有续期方式 |
| 直接 HTTPS | Nginx 监听公网 `80/443`，选 `nginx-https.conf.example` |
| 本机 TLS | Nginx 监听 `127.0.0.1:8443`，选 `nginx-reality.conf.example` |
| 共用配置 | 两份模板均引用 `/opt/mivi/deploy/static-site.conf` |

执行顺序：检查 Nginx 版本、现有站点和端口占用 → 记录当前代码版本并备份待修改的站点配置 → 拉取代码 → 选择一份模板并填写域名、证书路径 → `nginx -t` → 检查通过后重载 → 验证页面、证书和 HTTP/2。若服务器按 `sites-available/sites-enabled` 管理站点，沿用原有目录布局。

已有 `/opt/mivi` 时先确认它属于本仓库且工作区干净，再更新；不要覆盖非本项目的目录或未提交修改。只为 Mivi 添加或调整站点配置，不覆盖全局 `nginx.conf`，保留其他站点及已有的证书续期路由。修改安装目录时，同步修改模板中的 `include` 路径和共用配置中的 `root`。

### 普通 HTTPS 站点

适用于 Nginx 自己监听公网 443 的情况：

```sh
sudo cp /opt/mivi/deploy/nginx-https.conf.example /etc/nginx/conf.d/mivi.conf
sudoedit /etc/nginx/conf.d/mivi.conf
```

启用前将模板中的 `media.example.com` 全部换成自己的域名，并填写真实的证书、私钥路径。域名需解析到服务器；证书签发和续期继续使用你已有的工具。模板没有内置 ACME HTTP challenge 路由；使用 HTTP-01 续期时，保留或另行添加你现有的 challenge 配置。

检查端口没有与现有默认站点产生配置冲突，然后：

```sh
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` 失败时不要执行 reload；先处理提示的域名、端口、证书或配置冲突。若你使用 `sites-available/sites-enabled` 管理站点，可按原有方式安装模板，而不是放进 `conf.d`。

### 本机 TLS 对接

适用于公网入口由已有网关管理的情况。Nginx 在 `127.0.0.1:8443` 提供 HTTPS，选用 **`deploy/nginx-reality.conf.example`**；不要同时启用上面的公网 443 模板：

```sh
sudo cp /opt/mivi/deploy/nginx-reality.conf.example /etc/nginx/conf.d/mivi.conf
sudoedit /etc/nginx/conf.d/mivi.conf
```

同样替换域名和证书路径，检查配置后再按你的服务管理方式重载 Nginx。已有 Xray 接入时，将以下字段合并到对应的 `realitySettings`：

```json
{
  "target": "127.0.0.1:8443",
  "serverNames": ["media.example.com"]
}
```

不要用这个局部示例替换完整配置。旧版对应字段可能叫 `dest`。客户端 SNI 填同一个域名；Nginx 需持有该域名有效的证书并支持 TLS 1.3、HTTP/2。该接入方式的公网域名应直达入口，不通过普通 CDN 的 HTTP 代理。

`127.0.0.1:8443` 必须是 Nginx 的独立 TLS 端口，不能指回 Xray 自己的监听端口。只有 Xray 和 Nginx 在同一个网络命名空间时，示例中的回环地址才成立；如果 Xray 在 Docker 内，需要按实际容器网络调整 `target` 和 Nginx 的监听地址。本项目不自动修改现有服务。

可在服务器上检查握手；结果应协商到 TLS 1.3 和 `h2`：

```sh
openssl s_client -connect 127.0.0.1:8443 -servername media.example.com -tls1_3 -alpn h2 </dev/null
curl --resolve media.example.com:8443:127.0.0.1 https://media.example.com:8443/ -I
```

参考：[Nginx HTTP/2 配置](https://nginx.org/en/docs/http/ngx_http_v2_module.html)。

### Nginx 旧版兼容

先用 `nginx -v` 确认版本。`http2 on;` 从 1.25.1 开始支持。较旧版本需删除该行，并把对应监听指令改为：

```nginx
# 普通 HTTPS 模板
listen 443 ssl http2;
listen [::]:443 ssl http2;

# 本机 TLS 模板
listen 127.0.0.1:8443 ssl http2;
```

两份模板已启用 `TLSv1.2 TLSv1.3`。如果 `nginx -t` 报 HTTP/2 或 TLS 1.3 不受支持，需要使用具备对应模块和 OpenSSL 支持的 Nginx，不能靠修改网页补齐。

### 部署验收

直接 HTTPS 模式可执行：

```sh
curl -I https://media.example.com/
curl --http2 -I https://media.example.com/assets/app.js
```

本机 TLS 模式先执行上面的本地握手检查，再从公网入口访问站点。确认首页返回 200、证书域名匹配、协商 HTTP/2、CSS/JS/WebP 资源正常，并检查 `/#/library/all` 和 `/#/item/wanderer` 刷新后仍可访问。hash 路由无需服务端改写。

部署完成后记录代码提交、实际访问地址、启用的配置路径、监听端口，以及配置检查与访问验证结果；不要在记录中包含私钥内容。

### 更新

```sh
sudo git -C /opt/mivi pull --ff-only
```

页面和 JS/CSS 使用缓存重新验证，内容更新无需构建或重启应用。WebP/SVG 缓存 7 天，替换图片时应更换文件名并同步修改引用。只有修改了 Nginx 配置时才需要重新执行 `nginx -t` 和 reload。域名、证书、私钥在站点配置或服务器证书目录中管理，不提交进仓库。

### 回滚

部署或更新前，用 `git -C /opt/mivi rev-parse HEAD` 记录原提交，并备份即将修改的 Mivi 站点配置。若验收失败，工作区干净时可将代码切回记录的提交：

```sh
sudo git -C /opt/mivi switch --detach <previous-commit>
```

若同时修改了 Nginx 配置，恢复备份，确认 `nginx -t` 通过后再重载；保留失败输出供排查。修复后重新更新时，先切回 `main`，再拉取最新代码：

```sh
sudo git -C /opt/mivi switch main
sudo git -C /opt/mivi pull --ff-only
```

## 内容与界面定制

| 位置 | 用途 |
| --- | --- |
| `site/assets/catalog.js` | 24 条媒体记录、类型、评分、码率、大小、简介及展示顺序 |
| `site/assets/app.js` | 首页、分类、搜索、详情、登录交互与 hash 路由 |
| `site/assets/styles.css` | 响应式布局、颜色、海报图集定位 |
| `site/assets/images/` | 原创背景及两张 12 格海报图集，约 1 MB |
| `deploy/` | Nginx 配置模板及共用静态配置，不能作为公开根目录 |

在 `catalog.js` 中维护片名、简介、文件信息及分类。`added` 是排序序号，数值越大越靠前。海报和背景均随项目保存；更换素材时同步更新引用。

支持路由：`#/`、`#/library/all`、`#/library/movies`、`#/library/series`、`#/library/documentaries`、`#/library/recent`、`#/library/top`、`#/library/4k`、`#/item/wanderer`、`#/search?q=关键词`。排序使用 hash 内的 `sort=recent|rating|year`。刷新和浏览器前进后退均不需要服务端路由。

## 开发验证

Node 22+、Python 3 仅用于开发和测试，生产 Nginx 不需要它们：

```sh
npm ci
npx playwright install chromium --no-shell
npm test
npm run screenshots
```

测试覆盖媒体分类、搜索、排序、页面导航、响应式布局及登录交互。截图保存在 `docs/screenshots/`。

部署模板的可重复检查需要开发机器上的 Docker，**VPS 部署无需 Docker**：

```sh
python3 scripts/check-nginx.py
```

该检查使用临时容器和临时证书，验证两份模板、TLS 1.3、HTTP/2 ALPN 及静态资源响应。线上使用已签发的域名证书。

更多界面：[影片详情](docs/screenshots/detail-desktop.png) · [登录入口](docs/screenshots/login-desktop.png) · [手机首页](docs/screenshots/home-mobile.png)
