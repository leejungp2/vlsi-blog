import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function RepoPicker({ value, onChange }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    api
      .listRepos()
      .then((data) => {
        if (alive) setState({ status: 'ok', repos: data.repos });
      })
      .catch((err) => {
        if (alive) setState({ status: 'error', message: err.message });
      });
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === 'loading') {
    return <p className="placeholder">repo 불러오는 중...</p>;
  }
  if (state.status === 'error') {
    return <p className="health-error">repo 조회 실패: {state.message}</p>;
  }

  return (
    <label className="field">
      <span className="field-label">Repository</span>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const fullName = e.target.value;
          const repo = state.repos.find((r) => r.full_name === fullName);
          onChange(repo ?? null);
        }}
      >
        <option value="">— 선택하세요 —</option>
        {state.repos.map((repo) => (
          <option key={repo.id} value={repo.full_name}>
            {repo.full_name}
            {repo.private ? ' (private)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
