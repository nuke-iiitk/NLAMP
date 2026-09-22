import type { ProcessStep } from './ProcessSteps';

/**
 * Web booking-process steps — quiet paper rows with soft indigo number chips.
 * Metro resolves this file instead of ProcessSteps.tsx on web.
 */
export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <ol className="list-unstyled m-0 d-flex flex-column gap-2">
      {steps.map((item) => (
        <li
          key={item.step}
          className="d-flex align-items-center gap-3 w-100"
          style={{
            background: 'var(--harvest-paper, #fffdf8)',
            borderRadius: 12,
            padding: '0.7rem 1rem',
          }}
        >
          <span
            className="flex-shrink-0 d-inline-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: '#e9edf8',
              color: '#1e2a52',
              fontSize: 13,
            }}
          >
            {item.step}
          </span>
          <span className="flex-grow-1 d-flex flex-column">
            <span className="fw-bold lh-sm text-body">{item.label}</span>
            <span className="text-body-secondary small lh-sm mt-1">{item.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
