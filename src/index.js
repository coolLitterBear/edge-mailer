import { WorkerMailer } from 'worker-mailer';
import { validateContentType, validateBody, validateBoolean, createErrorResponse } from './validator';

export default {
  async fetch(request) {
    // 1. 只允许 POST
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed. Only POST is supported.', 405);
    }

    // 2. 验证 Content-Type
    const contentTypeResult = validateContentType(request);
    if (!contentTypeResult.valid) {
      return createErrorResponse(contentTypeResult.error, contentTypeResult.status);
    }

    // 3. 解析 JSON 并验证字段
    try {
      const body = await request.json();
      const validation = validateBody(body);
      if (!validation.valid) {
        return createErrorResponse(validation.error, validation.status);
      }

      // 4. 验证通过，提取变量
      const { from, to, subject, html } = validation.data;

      // SMTP 配置
      // 先看布尔值
      const secure = validateBoolean(env.secure);
      const startTls = validateBoolean(env.startTls);

      // 再看选项
      const authType = env.authType;
      const authTypeOptions = [ 'plain', 'login', 'cram-md5' ];
      if (!authType in authTypeOptions) {
        return createErrorResponse('Invalid STMP config', 500);
      }

      // 最后赋值
      try {
        const SMTP_CONFIG = {
          host: env.host,
          port: parseInt(env.port, 10),
          secure: secure,
          startTls: startTls,
          credentials: {
            username: env.username,
            password: env.password,
          },
          authType: authType,
        };
        const mailOpinions = {
          from: from,
          to: to,
          subject: subject,
          html: html,
        };
      } catch(err) {
        return createErrorResponse('Invalid STMP config', 500);
      }

      // 调用 worker-mail
      await WorkerMailer.send(SMTP_CONFIG, mailOpinions);

      // 返回成功
      return new Response(
        JSON.stringify({ success: true, message: 'Request processed successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      // JSON 解析失败
      return createErrorResponse('Invalid JSON body', 400);
    }
  }
};