import { Router } from 'express';
import {
  splitRepoFullName,
  getCommitDetail,
} from '../services/githubService.js';
import { summarizeCommits } from '../services/llmService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { repoFullName, branch, commitShas, tone } = req.body ?? {};

    if (!repoFullName || !branch) {
      return res
        .status(400)
        .json({ error: 'repoFullName과 branch는 필수입니다.' });
    }
    if (!Array.isArray(commitShas) || commitShas.length === 0) {
      return res
        .status(400)
        .json({ error: '최소 1개 이상의 commit sha가 필요합니다.' });
    }

    const { owner, repo } = splitRepoFullName(repoFullName);

    const commits = await Promise.all(
      commitShas.map((sha) => getCommitDetail({ owner, repo, sha }))
    );

    const draft = await summarizeCommits({
      repoFullName,
      branch,
      commits,
      tone,
    });

    res.json({
      ...draft,
      sourceCommits: commitShas,
      branchTag: branch,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
