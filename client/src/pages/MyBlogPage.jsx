import { useState } from 'react';
import RepoPicker from '../components/RepoPicker.jsx';
import BranchPicker from '../components/BranchPicker.jsx';
import CommitList from '../components/CommitList.jsx';
import '../components/Pickers.css';

export default function MyBlogPage() {
  const [repo, setRepo] = useState(null);
  const [branch, setBranch] = useState(null);
  const [selectedShas, setSelectedShas] = useState([]);

  // I1: repo 변경 시 default_branch로 자동 세팅, commit 선택 초기화
  function handleRepoChange(nextRepo) {
    setRepo(nextRepo);
    setBranch(nextRepo?.default_branch ?? null);
    setSelectedShas([]);
  }

  // I2: branch 변경 시 commit 선택 초기화
  function handleBranchChange(nextBranch) {
    setBranch(nextBranch);
    setSelectedShas([]);
  }

  return (
    <div className="my-blog-grid">
      <section className="section">
        <h2>commit 선택</h2>
        <RepoPicker value={repo?.full_name ?? ''} onChange={handleRepoChange} />
        {repo && (
          <BranchPicker
            repoFullName={repo.full_name}
            value={branch}
            onChange={handleBranchChange}
          />
        )}
        {repo && branch && (
          <CommitList
            repoFullName={repo.full_name}
            branch={branch}
            selected={selectedShas}
            onChange={setSelectedShas}
          />
        )}
      </section>

      <aside className="section">
        <h2>선택된 commit</h2>
        {selectedShas.length === 0 ? (
          <p className="placeholder">아직 선택된 commit이 없습니다.</p>
        ) : (
          <ul className="selected-shas">
            {selectedShas.map((sha) => (
              <li key={sha}>
                <code>{sha.slice(0, 7)}</code>
              </li>
            ))}
          </ul>
        )}
        <p className="placeholder" style={{ marginTop: 'var(--sp-4)' }}>
          다음 commit에서 "요약 생성" 버튼과 에디터가 여기에 들어옵니다.
        </p>
      </aside>
    </div>
  );
}
