import { WorkerMailer } from 'worker-mailer';
import { validateContentType, validateBody, validateBoolean, createErrorResponse } from './validator';

export default {
  async fetch(request, env) {
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
      };

      // 4. 验证通过，提取变量
      const { from, to, subject, html } = validation.data;

      // 5. SMTP 配置，mailOpinions 顺手的事
      // 先声明
      const authTypeOptions = [ 'plain', 'login', 'cram-md5' ];
      let secure;
      let startTls;
      let authType;
      let SMTP_CONFIG;
      let mailOpinions;
      try {
        secure = validateBoolean(env.secure);
        startTls = validateBoolean(env.startTls);
        authType = env.authType;
        if (!authTypeOptions.includes(authType)) {
          return createErrorResponse('Invalid STMP config', 500);
        };
        SMTP_CONFIG = {
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
        mailOpinions = {
          from: from,
          to: to,
          subject: subject,
          html: html,
        };
      } catch(err) {
        console.error(err)
        return createErrorResponse('Invalid STMP config', 500);
      }

      // 6. 调用 worker-mail
      await WorkerMailer.send(SMTP_CONFIG, mailOpinions);

      // 7. 返回成功
      return new Response(
        JSON.stringify({ success: true, message: 'Request processed successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      // JSON 解析失败
      console.error(err)
      return createErrorResponse('Invalid JSON body', 400);
    }
  }
};

/**
*                             _ooOoo_
*                            o8888888o
*                            88" . "88
*                            (| -_- |)
*                            O\  =  /O
*                         ____/`---'\____
*                       .'  \\|     |//  `.
*                      /  \\|||  :  |||//  \
*                     /  _||||| -:- |||||-  \
*                     |   | \\\  -  /// |   |
*                     | \_|  ''\---/''  |   |
*                     \  .-\__  `-`  ___/-. /
*                   ___`. .'  /--.--\  `. . __
*                ."" '<  `.___\_<|>_/___.'  >'"".
*               | | :  `- \`.;`\ _ /`;.`/ - ` : | |
*               \  \ `-.   \_ __\ /__ _/   .-` /  /
*          ======`-.____`-.___\_____/___.-`____.-'======
*                             `=---='
*          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*                     佛祖保佑        永无BUG
**/
