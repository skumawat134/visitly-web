import { Checkbox, cn } from "@visitly/ui";

type FieldCheckboxProps = {
  field: any;
  checked: boolean;
  onToggle: () => void;
};

const FieldCheckbox: React.FC<FieldCheckboxProps> = ({
  field,
  checked,
  onToggle,
}) => {
  return (
    <div
    //   className={cn(
    //     "tw:rounded-lg tw:p-2 tw:transition-colors",
    //     field.isDisabled
    //       ? "tw:opacity-50"
    //       : "hover:tw:bg-slate-50"
    //   )}
    >
      <Checkbox
        checked={checked}
        disabled={field.isDisabled}
        onChange={onToggle}
        label={field.columnTitle}
        className="tw:mr-2"
        data-testid={`column-setting-checkbox-${field.columnTitle.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
};

export default FieldCheckbox;