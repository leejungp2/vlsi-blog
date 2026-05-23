import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function MyBlogPage() {
  const [health, setHealth] = useState({ state: 'loading' });

  useEffect(() => {
    api
      .getHealth()
      .then((data) => setHealth({ state: 'ok', data }))
      .catch((err) => setHealth({ state: 'error', message: err.message }));
  }, []);

  return (
    <section className="section">
      <h2>서버 연결 상태</h2>
      {health.state === 'loading' && <p className="placeholder">확인 중...</p>}
      {health.state === 'ok' && (
        <pre className="health-ok">{JSON.stringify(health.data, null, 2)}</pre>
      )}
      {health.state === 'error' && (
        <p className="health-error">
          서버에 연결할 수 없습니다: {health.message}
        </p>
      )}
      <p className="placeholder" style={{ marginTop: 'var(--sp-4)' }}>
        다음 commit에서 GitHub repo / branch / commit 선택 UI가 여기에 들어옵니다.
      </p>
    </section>
  );
}
