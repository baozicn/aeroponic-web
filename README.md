# Web 控制台（MQTT）

这是一个**纯静态**网页：无需后端、无需注册。

默认连接 **EMQX 公共 Broker**（免费）：

- WebSocket: `wss://broker.emqx.io:8084/mqtt`
- 订阅：`home/data`（ESP32 上报）
- 发布：`home/control`（下发控制）

## 1) 最快本地打开方式（用于验证）
在该目录运行：

```bash
python -m http.server 8080
```

然后浏览器打开：

- `http://localhost:8080`

## 2) 公网访问（免费）
把 `web/` 目录下的 `index.html` 上传到你腾讯云 CloudBase 的“静态网站托管”即可获得公网 URL（默认域名）。

> 注意：如果网页是 `https://`，必须使用 `wss://` 连接 MQTT（已默认配置）。

