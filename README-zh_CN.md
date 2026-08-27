# Edge Mailer

![AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?link=https://www.gnu.org/licenses/agpl-3.0)

基于 Cloudflare Workers 与 zou-yu/worker-mailer 的邮件发送请求转译服务，调用第三方包通过 SMTP 协议发送邮件。

*说白了，就是传话的* 😂
## 快速开始

### 部署步骤

1. 点击
### 请求方法

仅支持 `POST` 方法。
### 请求头

必须包含 `Content-Type: application/json`。

*其实我们只处理这个*
### 请求体格式

JSON 对象，包含以下四个字段：

- `from`（字符串）：发件人邮箱地址。
- `to`（字符串数组）：收件人邮箱地址列表，至少一个。
- `subject`（字符串）：邮件主题。
- `html`（字符串）：邮件正文（HTML 格式）。

示例请求体：
```json
{
	"from": "sender@example.com",
	"to": [ "user1@example.com", "user2@example.com" ],
	"subject": "测试邮件",
	"html": "<h1>你好</h1><p>这是一封测试邮件</p>"
}
```

### 响应说明

- 成功时返回 HTTP 200，附带 JSON：`{"success":true,"message":"Email sent successfully"}`。
- 失败时返回对应的 HTTP 状态码（400、415、500 等）和 JSON 错误信息，包含具体原因。

## 环境变量说明

```env
# host 类型: 字符串
host=
# port 类型: 整型
port=
# secure 类型: 布尔值
secure=
# startTls 类型: boolean
startTls=
# username 类型: string
username=
# password 类型: string
# password 为敏感变量，导入后记得勾选密钥复选框
password=
# authType 选项: plain, login, cram-md5
# 建议：当 secure=true 且邮件服务器支持时，使用 cram-md5 
authType=
```

> Worker 每次拉取 GitHub 存储库时，都会删去运行时变量，记得更新

## 安全建议

- 始终使用 TLS/SSL 加密连接（设置 `SMTP_SECURE=true` 或 `SMTP_STARTTLS=true`），并配合 PLAIN 认证，兼顾安全与兼容性。
- 切勿将密码写入代码或提交到版本控制系统，务必使用 Secrets 管理。
- 定期更新依赖和 Wrangler 版本，及时修复安全漏洞。

## 贡献与许可证

本项目采用 [AGPLv3.0](./LICENSE) 许可证，欢迎提交 Issue 和 Pull Request。

如有任何问题，请参考 Cloudflare Workers 官方文档或联系我。