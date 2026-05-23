import './Spinner.css';

export default function Spinner({ label = '불러오는 중' }) {
  return (
    <p className="spinner-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}
