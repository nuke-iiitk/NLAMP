import BootstrapIcon from './BootstrapIcon';
import type { ProcessStep } from './ProcessSteps';

/**
 * Web booking-process steps — a Bootstrap `list-group` with numbered badges.
 * Metro resolves this file instead of ProcessSteps.tsx on web.
 */
export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="list-group list-group-numbered shadow-sm">
      {steps.map((item) => (
        <li
          key={item.step}
          className="list-group-item d-flex align-items-start gap-3 py-3"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">{item.label}</div>
            <small className="text-body-secondary">{item.body}</small>
          </div>
          <BootstrapIcon name="bi-chevron-right" size={14} color="#6c757d" />
        </li>
      ))}
    </ol>
  );
}
