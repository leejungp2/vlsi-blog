import { useState } from 'react';
import RepoPicker from '../components/RepoPicker.jsx';
import BranchPicker from '../components/BranchPicker.jsx';
import CommitList from '../components/CommitList.jsx';
import DraftEditor from '../components/DraftEditor.jsx';
import { api } from '../api/client.js';
import '../components/Pickers.css';
import '../components/DraftEditor.css';

const TONES = [
  { id: 'retrospective', label: '회고' },
  { id: 'review', label: '리뷰' },
  { id: 'tutorial', label: '튜토리얼' },
];

export default function MyBlogPage({ onNavigate }) {
  const [repo, setRepo] = useState(null);
  const [branch, setBranch] = useState(null);
  const [selectedShas, setSelectedShas] = useState([]);
  const [tone, setTone] = useState('retrospective');
  const [draft, setDraft] = useState(null);
  const [draftState, setDraftState] = useState({ status: 'idle' });
  const [saving, setSaving] = useState(false);

  function handleRepoChange(nextRepo) {
    setRepo(nextRepo);
    setBranch(nextRepo?.default_branch ?? null);
    setSelectedShas([]);
    setDraft(null);
    setDraftState({ status: 'idle' });
  }

  function handleBranchChange(nextBranch) {
    setBranch(nextBranch);
    setSelectedShas([]);
    setDraft(null);
    setDraftState({ status: 'idle' });
  }

  async function generateDraft() {
    if (!repo || !branch || selectedShas.length === 0) return;
    setDraftState({ status: 'loading' });
    try {
      const result = await api.createDraft({
        repoFullName: repo.full_name,
        branch,
        commitShas: selectedShas,
        tone,
      });
      setDraft({
        title: result.title,
        body: result.body,
        branchTag: result.branchTag,
        sourceCommits: result.sourceCommits,
      });
      setDraftState({ status: 'ok' });
    } catch (err) {
      setDraftState({ status: 'error', message: err.message });
    }
  }

  const canGenerate =
    repo && branch && selectedShas.length > 0 && draftState.status !== 'loading';

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    try {
      await api.createPost({
        title: draft.title,
        body: draft.body,
        branchTag: draft.branchTag ?? branch,
        sourceCommits: draft.sourceCommits ?? selectedShas,
      });
      onNavigate?.('saved-posts');
    } catch (err) {
      setDraftState({ status: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
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
        <h2>요약 생성</h2>
        <div className="tone-row" role="radiogroup" aria-label="요약 톤">
          {TONES.map((t) => (
            <label key={t.id}>
              <input
                type="radio"
                name="tone"
                value={t.id}
                checked={tone === t.id}
                onChange={() => setTone(t.id)}
              />
              {t.label}
            </label>
          ))}
        </div>

        <p className="placeholder">
          선택된 commit:{' '}
          <strong>{selectedShas.length}</strong>개
        </p>

        <div className="draft-actions">
          <button
            type="button"
            className="primary-button"
            disabled={!canGenerate}
            onClick={generateDraft}
          >
            {draftState.status === 'loading' ? '생성 중...' : '요약 생성'}
          </button>
        </div>

        {draftState.status === 'error' && (
          <p className="health-error" style={{ marginTop: 'var(--sp-3)' }}>
            {draftState.message}
          </p>
        )}

        {draft && (
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <DraftEditor
              draft={draft}
              onChange={setDraft}
              disabled={draftState.status === 'loading' || saving}
            />
            <div className="draft-actions">
              <button
                type="button"
                className="primary-button"
                disabled={saving || !draft.body}
                onClick={saveDraft}
              >
                {saving ? '저장 중...' : '초안 저장'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
