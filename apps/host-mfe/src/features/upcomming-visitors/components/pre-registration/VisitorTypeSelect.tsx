import type { VisitorType } from "../../types/pre-registration.types";
import { Select } from "@visitly/ui";

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
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        options={[
          { label: "Select Visitor Type", value: "" },
          ...visitorTypes.map((type) => ({
            label: type.visitorType,
            value: type.id,
          }))
        ]}
        className="w-full"
      />
    </div>
  );
};