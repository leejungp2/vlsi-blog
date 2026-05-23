import './DraftEditor.css';

export default function DraftEditor({ draft, onChange, disabled }) {
  if (!draft) return null;

  const charCount = (draft.body ?? '').length;

  return (
    <div className="draft-editor">
      <label className="field">
        <span className="field-label">제목</span>
        <input
          type="text"
          value={draft.title ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">
          본문 (마크다운) · {charCount.toLocaleString()}자
        </span>
        <textarea
          className="draft-body"
          value={draft.body ?? ''}
          disabled={disabled}
          rows={18}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
        />
      </label>
    </div>
  );
}
