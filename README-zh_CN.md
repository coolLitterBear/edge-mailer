# Edge Mailer

[English](README.md) | [简体中文](README-zh_CN.md)

![AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?link=https://www.gnu.org/licenses/agpl-3.0)

基于 Cloudflare Workers 与 [zou-yu/worker-mailer](https://github.com/zou-yu/worker-mailer/) 的邮件发送请求转译服务，调用第三方包通过 SMTP 协议发送邮件。

*说白了，就是传话的* 😂

---

## 快速开始

### 部署步骤

1. 点击 Fork 按钮，将仓库复刻到你的 GitHub 账号下。
![step1](./resources/img/01.jpg)

2. 打开此仓库的 [/resources/.env.example](./resources/.env.example) ，复制备用
![step2-1](./resources/img/02-1.jpg)
![step2-2](./resources/img/02-2.jpg)
![step2-3](./resources/img/02-3.jpg)

3. 打开 [Cloudflare](https://dash.cloudflare.com) ， 选择 **计算** > **Workers & Pages** ，点击 **创建应用程序**
![step3](./resources/img/03.jpg)

4. 选择 **Continue with GitHub**
![step4](./resources/img/04.jpg)

5. 连接到你的 GitHub 账户，授权刚刚 Fork 的仓库，回到 Cloudflare 后选择刚刚授权的仓库并继续
![step5](./resources/img/05.jpg)

6. 如果你不知道你在做什么，请勿修改，点击部署
![step6](./resources/img/06.jpg)

7. 部署完成后，点击上方 **设置** 标签页，在 **运行时变量** 一栏选择 **导入.env文件** ，粘贴并修改刚刚复制的内容，点击 **导入.env** ，并将 **password** 一栏中 **类型** 改为 **密钥**
![step7-1](./resources/img/07-1.jpg)
![step7-2](./resources/img/07-2.jpg)
	> Worker 每次拉取 GitHub 存储库时，都会删去运行时变量，记得更新

8. 检查 **域** 标签页是否开启生产环境域，复制域
![step8](./resources/img/08.jpg)

### 请求方法

仅支持 `POST` 方法。

### 请求头

必须包含 `Content-Type: application/json`。

*其实我们只处理这个*

### 请求体格式

JSON 对象，包含以下四个字段：

- `from`（字符串。可选，需在环境变量配置）：发件人邮箱地址。
- `to`（字符串数组）：收件人邮箱地址列表，至少一个。
- `subject`（字符串）：邮件主题。
- `html`（字符串）：邮件正文（由于技术原因，暂不支持 HTML 格式，预计在下一补丁修复）。

示例请求体：
```json
{
	"from": "sender@example.com",
	"to": [ "user1@example.com", "user2@example.com" ],
	"subject": "测试邮件",
	"html": "你好这是一封测试邮件"
}
```

### 响应说明

- 成功时返回 HTTP 200，附带 JSON：`{"success":true,"message":"Email sent successfully"}`。
- 失败时返回对应的 HTTP 状态码（400、415、500 等）和 JSON 错误信息，包含具体原因。

---

## 环境变量说明

```env
# host 类型: 字符串
host=
# port 类型: 整型
port=
# secure 类型: 布尔值
secure=
# startTls 类型: 布尔值
startTls=
# username 类型: 字符串
username=
# password 类型: 字符串
# password 为敏感变量，导入后记得勾选密钥复选框
password=
# authType 类型: 字符串	选项: plain, login, cram-md5
# 建议：当 secure=true 且邮件服务器支持时，使用 cram-md5 
authType=
# from 类型: 字符串 可选
# from 为关键变量，环境变量与请求体至少包含一处，优先使用请求体，即使它是错误的
from=
```

> Worker 每次拉取 GitHub 存储库时，都会删去环境变量，记得更新

---

## 安全建议

- 始终使用 TLS/SSL 加密连接（设置 `secure=true` 或 `startTls=true`），并配合 PLAIN 认证，兼顾安全与兼容性。
- 切勿将密码写入代码或提交到版本控制系统
- 定期更新依赖和 Wrangler 版本，及时修复安全漏洞。

---

## 贡献与许可证

本项目采用 [AGPL v3](./LICENSE) 许可证，欢迎提交 Issue 和 Pull Request。

如有任何问题，请参考 [Cloudflare Workers 官方文档](https://developers.cloudflare.com)或[联系我](mailto:hi@clb.us.ci)。