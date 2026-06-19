const API_BASE = 'https://simple-survey-api-c3kj.onrender.com/api';

async function request(method, path, body = null, isFormData = false) {
  const options = { method, headers: {} };

  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.body = Object.keys(body)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(body[k])}`)
        .join('&');
    }
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  const text = await res.text();
  const parsed = parseXml(text);
  if (parsed?.status === 'error') throw new Error(parsed?.message || 'API error');
  return parsed;
}

function parseXml(xmlText) {
  const result = {};
  parseNode(xmlText.trim(), result);
  return result;
}

function parseNode(xml, parent) {
  const tagRegex = /<([a-zA-Z_][a-zA-Z0-9_]*)(\/?)>([\s\S]*?)<\/\1>|<([a-zA-Z_][a-zA-Z0-9_]*)\/>/g;
  let match;
  while ((match = tagRegex.exec(xml)) !== null) {
    const tag = match[1] || match[4];
    const selfClose = match[2] === '/';
    const inner = selfClose ? '' : match[3] || '';
    const hasChildren = /<[a-zA-Z_]/.test(inner);
    let value;
    if (hasChildren) {
      value = {};
      parseNode(inner, value);
    } else {
      value = inner.trim();
    }
    if (parent[tag] !== undefined) {
      if (!Array.isArray(parent[tag])) parent[tag] = [parent[tag]];
      parent[tag].push(value);
    } else {
      parent[tag] = value;
    }
  }
}

function getList(parsed, listKey) {
  const container = parsed?.data?.[listKey];
  if (!container) return [];
  if (!container.item) return [];
  return Array.isArray(container.item) ? container.item : [container.item];
}

export const api = {
  surveys: {
    list: () => request('GET', '/surveys').then(r => getList(r, 'surveys')),
    get: (id) => request('GET', `/surveys/${id}`).then(r => r?.data?.survey ?? null),
  },
  questions: {
    list: (surveyId) => request('GET', `/surveys/${surveyId}/questions`).then(r => getList(r, 'questions')),
  },
  responses: {
    submit: (surveyId, formData) => request('POST', `/surveys/${surveyId}/responses`, formData, true),
  },
};
