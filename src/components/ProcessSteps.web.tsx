import type { ProcessStep } from './ProcessSteps';

/**
 * Web booking-process steps — a Bootstrap `list-group` with numbered badges.
 * The badge is a fixed 32px slot and the label/body stack in a flex column,
 * so every step's text starts at the same x. Metro resolves this file instead
 * of ProcessSteps.tsx on web.
 */
export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="list-group shadow-sm">
      {steps.map((item) => (
        <li
          key={item.step}
          className="list-group-item py-3"
        >
          <span className="d-flex align-items-start gap-3 w-100">
            <span
              className="badge rounded-pill text-bg-primary fs-6 flex-shrink-0 d-inline-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32 }}
            >
              {item.step}
            </span>
            <span className="flex-grow-1 d-flex flex-column">
              <span className="fw-bold lh-sm text-body">{item.label}</span>
              <span className="text-body-secondary small lh-sm mt-1">{item.body}</span>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
