import type { DropdownOption } from './DropdownSelect';
import { useI18n } from '../i18n';

type Props = {
  label: string;
  value: string | null;
  placeholder?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  error?: string;
};

/**
 * Web select — a native `<select class="form-select">`. Bootstrap styles it
 * without loading the Bootstrap JS bundle, and the platform control keeps full
 * keyboard, screen-reader and mobile picker behaviour. Metro resolves this file
 * on web.
 */
export default function DropdownSelect({
  label,
  value,
  placeholder,
  options,
  onSelect,
  error,
}: Props) {
  const { t } = useI18n();
  const selectId = `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        value={value ?? ''}
        onChange={(event) => onSelect(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        <option value="" disabled>
          {placeholder ?? t('common.search')}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <div id={errorId} className="invalid-feedback">
          {error}
        </div>
      ) : null}
    </div>
  );
}

