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
   console.log( "Checked:", checked );
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
      />
    </div>
  );
};

export default FieldCheckbox;