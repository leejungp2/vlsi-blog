import { v4 as uuidv4 } from 'uuid';

// in-memory store. 서버 재시작 시 사라짐. 2주차 후반에 영속화 검토.
const posts = new Map();

function summaryPreview(body) {
  return String(body ?? '').slice(0, 120);
}

export function createPost({ title, body, branchTag, sourceCommits }) {
  const now = new Date().toISOString();
  const post = {
    id: uuidv4(),
    title: title ?? '제목 없음',
    body: body ?? '',
    branchTag: branchTag ?? '',
    summaryPreview: summaryPreview(body),
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    sourceCommits: Array.isArray(sourceCommits) ? sourceCommits : [],
  };
  posts.set(post.id, post);
  return post;
}

export function listPosts() {
  // 최신순
  return [...posts.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

export function getPost(id) {
  return posts.get(id) ?? null;
}

export function updatePost(id, patch) {
  const existing = posts.get(id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  if (patch.body !== undefined) {
    next.summaryPreview = summaryPreview(patch.body);
  }
  posts.set(id, next);
  return next;
}

export function deletePost(id) {
  return posts.delete(id);
}
