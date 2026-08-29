// 验证 POST 请求的 Content-Type
export function validateContentType(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return {
      valid: false,
      status: 415,
      error: 'Unsupported Media Type. Content-Type must be application/json.'
    };
  }
  return { valid: true };
}

// 验证请求体 JSON 及其字段
export function validateBody(body, env) {
  const { to, subject, html } = body;

  // 检查字段是否存在
  if (to === undefined || subject === undefined || html === undefined || !('from' in body || 'from' in env)) {
    return {
      valid: false,
      status: 400,
      error: 'Missing required fields: from, to, subject, html'
    };
  } else {
    if ('from' in body) {
      const { from } = body;
    } else {
      const { from } = env;
    }
  }
  
  if (typeof from !== 'string') {
    if ('from' in body) {
      return {
        valid: false,
        status: 400,
        error: 'Field "from" must be a string'
      };
    } else {
      console.error('Field env.from must be a string')
      return {
        valid: false,
        status: 500,
        error: 'Invalid SMTP config'
      }
    }
  }
  if (!Array.isArray(to)) {
    return {
      valid: false,
      status: 400,
      error: 'Field "to" must be an array'
    };
  }
  if (typeof subject !== 'string') {
    return {
      valid: false,
      status: 400,
      error: 'Field "subject" must be a string'
    };
  }
  if (typeof html !== 'string') {
    return {
      valid: false,
      status: 400,
      error: 'Field "html" must be a string'
    };
  }

  // 全部通过，返回
  mailOpinions = {
    from: from,
    to: to,
    subject: subject,
    html: html,
  };
  return {
    valid: true,
    data: mailOpinions
  };
}

export function validateBoolean(str) {
  // 映射表
  const map = { 'true': true, 'false':false };

  if (str in map) {
    // 有则返回
    return map[str];
  } else {
    // 无则报错
    throw new Error(`Invalid boolean string: "${str}". Expected "true" or "false".`);
  }
}

export function validateEnv(env) {
  let { host, port, secure, startTls, username, password, authType } = env;
  if (host === undefined || username === undefined || password === undefined) {
    return {
      valid: false,
      status: 500,
      error: 'Invalid SMTP config'
    };
  }
    secure = false;
  if (secure !== undefined) {
    secure = validateBoolean(secure);
  }
  if (startTls !== undefined) {
    startTls = validateBoolean(startTls);
  }
  if (port === undefined) {
    if (secure) {
      port = 465;
    } else if (startTls) {
      port = 587;
    } else {
      console.error('Cloudflare Workers has disabled the use of port 25, which should be used when both secure and startTls are set to false.');
      return {
        valid: false,
        status: 500,
        error: 'Invalid SMTP config'
      };
    }
  } else {
    try {
      port = parseInt(port, 10);
    } catch (err) {
      console.error('env.port cannot be converted to an integer');
      return {
        valid: false,
        status: 500,
        error: 'Invalid SMTP config'
      }
    }
  }
  if (authType !== undefined) {
    // authType 在 worker-mailer 默认为 plain ，这里让 worker-mailer 补全太麻烦了
    authType = 'plain';
  } else {
    const authTypeOptions = [ 'plain', 'login', 'cram-md5' ];
    if (!authTypeOptions.includes(authType)) {
      return {
        valid: false,
        status: 500,
        error: 'Invalid SMTP config'
      };
    }
  }
  const SMTP_CONFIG = {
    host: host,
    port: port,
    secure: secure,
    startTls: startTls,
    credentials: {
      username: username,
      password: password,
    },
    authType: authType,
  };
  return {
    valid: true,
    data: SMTP_CONFIG
  }
}

// 统一的错误响应生成器（可复用）
export function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

