import './Header.css';

const TABS = [
  { id: 'my-blog', label: 'My Blog' },
  { id: 'saved-posts', label: 'Saved Posts' },
  { id: 'settings', label: 'Settings' },
];

export default function Header({ current, onChange }) {
  return (
    <header className="header">
      <div className="header-brand">
        <h1>Smart Blog</h1>
        <p>GitHub 활동을 분석해 개발 블로그 초안을 자동으로 생성합니다.</p>
      </div>
      <nav className="header-tabs" aria-label="페이지 탭">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab ${current === tab.id ? 'tab--active' : ''}`}
            aria-current={current === tab.id ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
