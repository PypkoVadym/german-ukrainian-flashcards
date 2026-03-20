const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getStats: () => request('/stats'),
  getWords: () => request('/words'),
  addWord: (word) => request('/words', { method: 'POST', body: JSON.stringify(word) }),
  updateWord: (id, data) => request(`/words/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWord: (id) => request(`/words/${id}`, { method: 'DELETE' }),
  bulkImport: (words) => request('/words/bulk', { method: 'POST', body: JSON.stringify({ words }) }),
};
