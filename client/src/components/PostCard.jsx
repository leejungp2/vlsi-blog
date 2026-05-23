export default function PostCard({ post, onEdit, onPublish, onDelete }) {
  const isPublished = post.status === 'published';
  return (
    <article className={`post-card ${isPublished ? 'post-card--published' : ''}`}>
      <header className="post-card-head">
        <h3 className="post-card-title">{post.title}</h3>
        <span className={`post-status post-status--${post.status}`}>
          {isPublished ? '발행' : '초안'}
        </span>
      </header>
      <p className="post-card-preview">{post.summaryPreview}</p>
      <footer className="post-card-meta">
        <span className="post-card-branch">#{post.branchTag || 'main'}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span>{post.sourceCommits?.length ?? 0}개 commit</span>
      </footer>
      <div className="post-card-actions">
        <button type="button" onClick={() => onEdit(post)}>수정하기</button>
        {!isPublished && (
          <button type="button" onClick={() => onPublish(post)}>발행하기</button>
        )}
        <button
          type="button"
          className="post-card-danger"
          onClick={() => onDelete(post)}
        >
          삭제
        </button>
      </div>
    </article>
  );
}
