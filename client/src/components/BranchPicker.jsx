import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function BranchPicker({ repoFullName, value, onChange }) {
  const [state, setState] = useState({ status: 'idle' });

  useEffect(() => {
    if (!repoFullName) {
      setState({ status: 'idle' });
      return;
    }
    let alive = true;
    setState({ status: 'loading' });
    api
      .listBranches(repoFullName)
      .then((data) => {
        if (alive) setState({ status: 'ok', branches: data.branches });
      })
      .catch((err) => {
        if (alive) setState({ status: 'error', message: err.message });
      });
    return () => {
      alive = false;
    };
  }, [repoFullName]);

  if (state.status === 'idle') return null;
  if (state.status === 'loading') {
    return <p className="placeholder">branch 불러오는 중...</p>;
  }
  if (state.status === 'error') {
    return <p className="health-error">branch 조회 실패: {state.message}</p>;
  }

  return (
    <label className="field">
      <span className="field-label">Branch</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">— 선택하세요 —</option>
        {state.branches.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );
}
