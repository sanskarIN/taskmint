import { strings } from '../i18n/en';

interface Props { onComplete: () => Promise<void>; }

export function Onboarding({ onComplete }: Props) {
  return (
    <div className="modal-backdrop">
      <section className="modal onboarding card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <img className="onboarding-logo" src="/taskmint-icon.svg" alt="" width="72" height="72" />
        <p className="eyebrow">Welcome</p>
        <h2 id="onboarding-title">A calmer way to keep track.</h2>
        <p>{strings.tagline}</p>
        <ul className="feature-list">
          <li>Works offline and stores tasks locally.</li>
          <li>Organize with projects, tags, priorities, due dates, and recurring tasks.</li>
          <li>Export your data whenever you want.</li>
        </ul>
        <button className="primary wide" type="button" onClick={onComplete}>Start using TaskMint</button>
        <p className="muted small">No account required.</p>
      </section>
    </div>
  );
}
