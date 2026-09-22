type Item = {
  id: string;
  label: string;
  hint?: string;
};

type Props = {
  items: Item[];
  value: string;
  onChange: (id: string) => void;
};

/**
 * Web choice chips - Bootstrap btn-group with btn-check radio inputs.
 * Metro resolves this file on web.
 */
export default function ChoiceChips({ items, value, onChange }: Props) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-4" role="group">
      {items.map((item) => {
        const selected = item.id === value;
        const inputId = `chip-${item.id}`;
        return (
          <div key={item.id} className="btn-group" role="group">
            <input
              id={inputId}
              type="radio"
              className="btn-check"
              name="choiceChips"
              value={item.id}
              checked={selected}
              onChange={() => onChange(item.id)}
              readOnly
              aria-label={item.label}
            />
            <label
              htmlFor={inputId}
              className={`btn btn-outline-primary ${selected ? 'active' : ''}`}
              style={{ minWidth: 88 }}
            >
              {item.label}
              {item.hint ? <small className="d-block mt-1 opacity-75">{item.hint}</small> : null}
            </label>
          </div>
        );
      })}
    </div>
  );
}
