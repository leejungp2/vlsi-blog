import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Spinner from './Spinner.jsx';

function shortSha(sha) {
  return sha?.slice(0, 7) ?? '';
}

function firstLine(message) {
  return (message ?? '').split('\n')[0];
}

export default function CommitList({ repoFullName, branch, selected, onChange }) {
  const [state, setState] = useState({ status: 'idle' });

  useEffect(() => {
    if (!repoFullName || !branch) {
      setState({ status: 'idle' });
      return;
    }
    let alive = true;
    setState({ status: 'loading' });
    api
      .listCommits(repoFullName, branch)
      .then((data) => {
        if (alive) setState({ status: 'ok', commits: data.commits });
      })
      .catch((err) => {
        if (alive) setState({ status: 'error', message: err.message });
      });
    return () => {
      alive = false;
    };
  }, [repoFullName, branch]);

  if (state.status === 'idle') return null;
  if (state.status === 'loading') {
    return <Spinner label="commit 불러오는 중" />;
  }
  if (state.status === 'error') {
    return <p className="health-error">commit 조회 실패: {state.message}</p>;
  }
  if (state.commits.length === 0) {
    return <p className="placeholder">이 branch에 commit이 없습니다.</p>;
  }

  const selectedSet = new Set(selected);

  function toggle(sha) {
    const next = new Set(selectedSet);
    if (next.has(sha)) next.delete(sha);
    else next.add(sha);
    onChange([...next]);
  }

  return (
    <div className="commit-list" role="group" aria-label="commit 다중 선택">
      <p className="commit-list-summary">
        {state.commits.length}개 commit 중 <strong>{selectedSet.size}개</strong> 선택됨
      </p>
      <ul>
        {state.commits.map((c) => {
          const checked = selectedSet.has(c.sha);
          return (
            <li key={c.sha} className={checked ? 'commit-item commit-item--checked' : 'commit-item'}>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c.sha)}
                />
                <span className="commit-sha">{shortSha(c.sha)}</span>
                <span className="commit-message">{firstLine(c.message)}</span>
                <span className="commit-author">
                  {c.author.name}
                  {c.author.date ? ` · ${new Date(c.author.date).toLocaleDateString()}` : ''}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
