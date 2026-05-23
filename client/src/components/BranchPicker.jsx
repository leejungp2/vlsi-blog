import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Spinner from './Spinner.jsx';

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
    return <Spinner label="branch 불러오는 중" />;
  }
  if (state.status === 'error') {
    return <p className="health-error">branch 조회 실패: {state.message}</p>;
  }
  if (state.branches.length === 0) {
    return <p className="placeholder">이 repo에는 branch가 없습니다.</p>;
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
