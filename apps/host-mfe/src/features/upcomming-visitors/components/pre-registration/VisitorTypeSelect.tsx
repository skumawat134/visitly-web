import type { VisitorType } from "../../types/pre-registration.types";

// features/pre-registration/components/VisitorTypeSelect.tsx
interface Props {
  value: string;
  onChange: (id: string) => void;
  visitorTypes: VisitorType[];
  loading: boolean;
}

export const VisitorTypeSelect = ({ value, onChange, visitorTypes, loading }: Props) => {
  return (
    <div>
      <label className="tw:block tw:mb-1.5">Visitor Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full border rounded p-2"
      >
        <option value="">Select Visitor Type</option>
        {visitorTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.visitorType}
          </option>
        ))}
      </select>
    </div>
  );
};