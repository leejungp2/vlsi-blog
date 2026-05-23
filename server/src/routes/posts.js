import { Router } from 'express';
import {
  createPost,
  listPosts,
  getPost,
  updatePost,
  deletePost,
} from '../store/postStore.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ posts: listPosts() });
});

router.post('/', (req, res) => {
  const { title, body, branchTag, sourceCommits } = req.body ?? {};
  if (!body) {
    return res.status(400).json({ error: 'body는 필수입니다.' });
  }
  const post = createPost({ title, body, branchTag, sourceCommits });
  res.status(201).json({ post });
});

router.get('/:id', (req, res) => {
  const post = getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  res.json({ post });
});

router.patch('/:id', (req, res) => {
  const post = updatePost(req.params.id, req.body ?? {});
  if (!post) return res.status(404).json({ error: 'post not found' });
  res.json({ post });
});

router.delete('/:id', (req, res) => {
  const ok = deletePost(req.params.id);
  if (!ok) return res.status(404).json({ error: 'post not found' });
  res.status(204).end();
});

export default router;
