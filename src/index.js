import { WorkerMailer } from 'worker-mailer';
import { validateContentType, validateBody, validateBoolean, validateEnv, createErrorResponse } from './validator';

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
      const validatedBody = validateBody(body, env);
      if (!validatedBody.valid) {
        return createErrorResponse(validatedBody.error, validatedBody.status);
      };

      // 4. 验证通过，提取变量
      const mailOpinions = validatedBody.data;

      // 5. SMTP 配置
      // 先声明
      const validatedEnv = validateEnv(env);
      if (!validatedEnv.valid) {
        return createErrorResponse(validatedEnv.error, validatedEnv.status);
      };

      const SMTP_CONFIG = validatedEnv.data;
      
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
