import { Octokit } from '@octokit/rest';

let cachedOctokit = null;

function getOctokit() {
  if (cachedOctokit) return cachedOctokit;
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const err = new Error('GITHUB_TOKEN이 설정되지 않았습니다. server/.env를 확인하세요.');
    err.status = 500;
    err.code = 'missing_github_token';
    throw err;
  }
  cachedOctokit = new Octokit({ auth: token });
  return cachedOctokit;
}

export async function listRepos({ perPage = 30 } = {}) {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: perPage,
    sort: 'updated',
    visibility: 'all',
  });
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    default_branch: repo.default_branch,
    updated_at: repo.updated_at,
  }));
}

export async function listBranches({ owner, repo, perPage = 50 }) {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: perPage,
  });
  return data.map((b) => ({
    name: b.name,
    commit: { sha: b.commit.sha },
  }));
}

export async function listCommits({ owner, repo, branch, perPage = 20 }) {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    sha: branch,
    per_page: perPage,
  });
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: {
      name: c.commit.author?.name ?? 'unknown',
      date: c.commit.author?.date ?? null,
    },
    html_url: c.html_url,
  }));
}

export async function getCommitDetail({ owner, repo, sha }) {
  const octokit = getOctokit();
  const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });
  return {
    sha: data.sha,
    message: data.commit.message,
    author: {
      name: data.commit.author?.name ?? 'unknown',
      date: data.commit.author?.date ?? null,
    },
    html_url: data.html_url,
    files: (data.files ?? []).map((f) => ({
      filename: f.filename,
      patch: f.patch ?? '',
      additions: f.additions,
      deletions: f.deletions,
    })),
  };
}

export function splitRepoFullName(full) {
  const [owner, repo] = String(full ?? '').split('/');
  if (!owner || !repo) {
    const err = new Error('repoFullName 형식이 잘못되었습니다. "owner/repo"여야 합니다.');
    err.status = 400;
    err.code = 'invalid_repo_full_name';
    throw err;
  }
  return { owner, repo };
}
