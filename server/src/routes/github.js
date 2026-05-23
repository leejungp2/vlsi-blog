import { Router } from 'express';
import {
  listRepos,
  listBranches,
  listCommits,
} from '../services/githubService.js';

const router = Router();

router.get('/repos', async (_req, res, next) => {
  try {
    const repos = await listRepos();
    res.json({ repos });
  } catch (err) {
    next(err);
  }
});

router.get('/repos/:owner/:repo/branches', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branches = await listBranches({ owner, repo });
    res.json({ branches });
  } catch (err) {
    next(err);
  }
});

router.get('/repos/:owner/:repo/commits', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch;
    if (!branch) {
      return res
        .status(400)
        .json({ error: 'branch query 파라미터가 필요합니다.' });
    }
    const commits = await listCommits({ owner, repo, branch });
    res.json({ commits });
  } catch (err) {
    next(err);
  }
});

export default router;
