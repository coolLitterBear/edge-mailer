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
export function validateBody(body) {
  const { from, to, subject, html } = body;

  // 检查字段是否存在
  if (from === undefined || to === undefined || subject === undefined || html === undefined) {
    return {
      valid: false,
      status: 400,
      error: 'Missing required fields: from, to, subject, html'
    };
  }

  // 检查类型
  if (typeof from !== 'string') {
    return {
      valid: false,
      status: 400,
      error: 'Field "from" must be a string'
    };
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

  // 全部通过，返回提取的字段
  return {
    valid: true,
    data: { from, to, subject, html }
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

// 统一的错误响应生成器（可复用）
export function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

