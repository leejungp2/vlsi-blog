import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import PostCard from '../components/PostCard.jsx';
import DraftEditor from '../components/DraftEditor.jsx';
import Spinner from '../components/Spinner.jsx';
import '../components/PostCard.css';

export default function SavedPostsPage() {
  const [state, setState] = useState({ status: 'loading' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const data = await api.listPosts();
      setState({ status: 'ok', posts: data.posts });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handlePublish(post) {
    await api.updatePost(post.id, { status: 'published' });
    await refresh();
  }

  async function handleDelete(post) {
    if (!confirm(`"${post.title}" 포스트를 삭제할까요?`)) return;
    await api.deletePost(post.id);
    await refresh();
  }

  async function handleEditSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await api.updatePost(editing.id, {
        title: editing.title,
        body: editing.body,
      });
      setEditing(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  if (state.status === 'loading') {
    return (
      <section className="section">
        <h2>저장된 포스트</h2>
        <Spinner label="포스트 불러오는 중" />
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="section">
        <h2>저장된 포스트</h2>
        <p className="health-error">불러오기 실패: {state.message}</p>
      </section>
    );
  }

  return (
    <section className="section">
      <h2>저장된 포스트</h2>
      {state.posts.length === 0 ? (
        <p className="placeholder">
          아직 저장된 포스트가 없습니다. My Blog 탭에서 초안을 만들어 저장하세요.
        </p>
      ) : (
        <div className="posts-grid">
          {state.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={(p) => setEditing({ ...p })}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editing && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="포스트 수정"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="modal-content">
            <h3 style={{ marginTop: 0 }}>포스트 수정</h3>
            <DraftEditor
              draft={editing}
              onChange={setEditing}
              disabled={saving}
            />
            <div className="draft-actions">
              <button
                type="button"
                className="primary-button"
                disabled={saving}
                onClick={handleEditSave}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
