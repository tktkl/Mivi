# Mivi

一个 Emby 风格的纯静态私人影音馆，默认全英文，按国际影音站呈现。黑灰界面、绿色点缀、原创海报、24 条电影／剧集／纪录片展示数据。可以浏览、搜索、排序和查看文件信息；点击播放进入受邀登录入口。

**没有后端，没有真实账号系统，没有视频流，也没有模拟登录请求。** 用户名、密码不被验证、发送、记录或保存。提交立即显示 “Private library. Access is by invitation only.”，并清空密码；关闭弹窗清空整个表单。

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

### 同机 REALITY 目标站

公网 443 由 Xray 监听，Nginx 提供本机 TLS 目标站：

```text
浏览器／REALITY 客户端 → Xray :443
                          └─ 目标站 TLS → Nginx 127.0.0.1:8443 → /opt/mivi/site
```

该模式选用 **`deploy/nginx-reality.conf.example`**，不要同时启用上面的公网 443 模板。它是一个真正的 HTTPS 监听器，不是 HTTP 端口，也不需要 `proxy_pass`：

```sh
sudo cp /opt/mivi/deploy/nginx-reality.conf.example /etc/nginx/conf.d/mivi.conf
sudoedit /etc/nginx/conf.d/mivi.conf
```

同样替换域名和证书路径，检查配置后再按你的服务管理方式重载 Nginx。Xray 的对应配置片段为：

```json
{
  "target": "127.0.0.1:8443",
  "serverNames": ["media.example.com"]
}
```

这是 `realitySettings` 的局部示例，合并到你现有的 Xray 配置中；不要用它替换整个配置。旧版 Xray 对应字段可能叫 `dest`。客户端 SNI 填同一个域名；Nginx 需持有该域名有效的证书并支持 TLS 1.3、HTTP/2。公网域名应直达 Xray，不通过普通 CDN 的 HTTP 代理。

`127.0.0.1:8443` 必须是 Nginx 的独立 TLS 端口，不能指回 Xray 自己的监听端口。只有 Xray 和 Nginx 在同一个网络命名空间时，示例中的回环地址才成立；如果 Xray 在 Docker 内，需要按实际容器网络调整 `target` 和 Nginx 的监听地址。本项目不自动修改现有服务。

可在服务器上检查握手；结果应协商到 TLS 1.3 和 `h2`：

```sh
openssl s_client -connect 127.0.0.1:8443 -servername media.example.com -tls1_3 -alpn h2 </dev/null
curl --resolve media.example.com:8443:127.0.0.1 https://media.example.com:8443/ -I
```

参考：[REALITY 目标站要求](https://github.com/XTLS/REALITY)、[Nginx HTTP/2 配置](https://nginx.org/en/docs/http/ngx_http_v2_module.html)。网页仅提供影音站外观，不会产生真实 Emby 视频流量，也不保证隐藏代理协议特征。

### Nginx 旧版兼容

先用 `nginx -v` 确认版本。`http2 on;` 从 1.25.1 开始支持。较旧版本需删除该行，并把对应监听指令改为：

```nginx
# 普通 HTTPS 模板
listen 443 ssl http2;
listen [::]:443 ssl http2;

# REALITY 本机模板
listen 127.0.0.1:8443 ssl http2;
```

两份模板已启用 `TLSv1.2 TLSv1.3`。如果 `nginx -t` 报 HTTP/2 或 TLS 1.3 不受支持，需要使用具备对应模块和 OpenSSL 支持的 Nginx，不能靠修改网页补齐。

### 更新

```sh
sudo git -C /opt/mivi pull --ff-only
```

页面和 JS/CSS 使用缓存重新验证，内容更新无需构建或重启应用。WebP/SVG 缓存 7 天，替换图片时应更换文件名并同步修改引用。只有修改了 Nginx 配置时才需要重新执行 `nginx -t` 和 reload。域名、证书、私钥在站点配置或服务器证书目录中管理，不提交进仓库。

## 内容与界面定制

| 位置 | 用途 |
| --- | --- |
| `site/assets/catalog.js` | 24 条媒体记录、类型、评分、码率、大小、简介及展示顺序 |
| `site/assets/app.js` | 首页、分类、搜索、详情、登录交互与 hash 路由 |
| `site/assets/styles.css` | 响应式布局、颜色、海报图集定位 |
| `site/assets/images/` | 原创背景及两张 12 格海报图集，约 1 MB |
| `deploy/` | Nginx 配置模板及共用静态配置，不能作为公开根目录 |

媒体标题、评分、年份和文件信息均为虚构展示数据，不对应可下载或可播放的影片文件。`added` 是排序序号，数值越大越靠前。图集编号与完整生成提示词见 [原创素材说明](docs/ASSETS.md)。没有图片、字体或 JS 的外部依赖。

支持路由：`#/`、`#/library/all`、`#/library/movies`、`#/library/series`、`#/library/documentaries`、`#/library/recent`、`#/library/top`、`#/library/4k`、`#/item/wanderer`、`#/search?q=关键词`。排序使用 hash 内的 `sort=recent|rating|year`。刷新和浏览器前进后退均不需要服务端路由。

## 登录与网络边界

- 表单没有真实提交地址，账号密码输入框没有 `name`，按钮为 `type="button"`。Enter 也仅触发同一个本地提示，不进行验证。
- 不读取账号密码用于判断，不生成 token、会话或成功状态；没有 `fetch`、XHR、WebSocket、Service Worker、埋点、第三方字体或视频资源。
- 不写入 Cookie、LocalStorage、SessionStorage；应用不记录输入内容。密码在点击登录时清空，表单在弹窗关闭及页面恢复时重置。
- HTML 和 Nginx 同时提供 CSP，其中 `connect-src 'none'`、`form-action 'none'`、`media-src 'none'` 分别阻断脚本连接、原生表单提交和媒体加载。
- Nginx 仅提供 GET/HEAD 静态文件，其他方法返回 405，未知接口返回 404；没有伪造的 Emby API 或认证接口。
- 普通 Nginx 访问日志只会看到实际静态资源请求。浏览器扩展或密码管理器自身的行为不属于应用存储。

这些限制针对本项目页面；不会改变同机 Xray 的正常代理连接或你其他站点的设置。

## 开发验证

Node 22+、Python 3 仅用于开发和测试，生产 Nginx 不需要它们：

```sh
npm ci
npx playwright install chromium --no-shell
npm test
npm run screenshots
```

测试覆盖分类数量、搜索与注入字符串、排序、深链接刷新／前进后退、未知路由、360/768/1440px 布局、键盘焦点、登录密码清理、浏览器存储，以及无后端／跨域／视频请求。截图保存在 `docs/screenshots/`。

部署模板的可重复检查需要开发机器上的 Docker，**VPS 部署无需 Docker**：

```sh
python3 scripts/check-nginx.py
```

该检查只创建临时容器和临时自签名证书，验证两份模板、TLS 1.3、HTTP/2 ALPN、安全响应头、静态内容及 API/POST 拒绝行为，不操作线上 Nginx。自签名证书仅用于测试，线上仍需真实域名证书。

更多界面：[影片详情](docs/screenshots/detail-desktop.png) · [登录入口](docs/screenshots/login-desktop.png) · [手机首页](docs/screenshots/home-mobile.png)
