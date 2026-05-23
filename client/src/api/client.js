// 모든 서버 호출은 이 래퍼를 거친다.
// baseURL은 "/api"로 시작하므로 vite proxy가 자동으로 Express로 보냄.
const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body.error ? ` — ${body.error}` : '';
    } catch {
      /* body가 JSON이 아닌 경우는 무시 */
    }
    throw new Error(`API ${path} failed: ${res.status}${detail}`);
  }
  return res.json();
}

function splitFullName(fullName) {
  const [owner, repo] = String(fullName).split('/');
  if (!owner || !repo) throw new Error('repoFullName은 "owner/repo" 형식이어야 합니다.');
  return { owner, repo };
}

export const api = {
  getHealth: () => request('/health'),
  listRepos: () => request('/github/repos'),
  listBranches: (fullName) => {
    const { owner, repo } = splitFullName(fullName);
    return request(`/github/repos/${owner}/${repo}/branches`);
  },
  listCommits: (fullName, branch) => {
    const { owner, repo } = splitFullName(fullName);
    const qs = new URLSearchParams({ branch }).toString();
    return request(`/github/repos/${owner}/${repo}/commits?${qs}`);
  },
  createDraft: ({ repoFullName, branch, commitShas, tone }) =>
    request('/draft', {
      method: 'POST',
      body: JSON.stringify({ repoFullName, branch, commitShas, tone }),
    }),
};
