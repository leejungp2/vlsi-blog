import 'dotenv/config';
import express from 'express';
import healthRouter from './routes/health.js';
import githubRouter from './routes/github.js';
import draftRouter from './routes/draft.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// 요청 로그 (개발 중 디버깅 편의)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/github', githubRouter);
app.use('/api/draft', draftRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Smart Blog server listening on http://localhost:${PORT}`);
});
