import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Spinner from './Spinner.jsx';

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
    return <Spinner label="repo 불러오는 중" />;
  }
  if (state.status === 'error') {
    return <p className="health-error">repo 조회 실패: {state.message}</p>;
  }
  if (state.repos.length === 0) {
    return (
      <p className="placeholder">
        접근 가능한 repo가 없습니다. GITHUB_TOKEN scope에 <code>repo</code> 권한이 포함되었는지 확인하세요.
      </p>
    );
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
