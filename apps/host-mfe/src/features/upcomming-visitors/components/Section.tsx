import FieldCheckbox from "./FieldCheckbox";

type SectionProps = {
    title: string;
    fields: any[];
    isSelected: (title: string) => boolean;
    onToggle: (field: any) => void;
};

const Section: React.FC<SectionProps> = ({
    title,
    fields,
    isSelected,
    onToggle,
}) => {
    return (
        <section className=" tw:rounded-xl tw:p-6">
            <h3 className="tw:text-sm tw:font-semibold tw:text-slate-700 tw:mb-4">
                {title}
            </h3>
            <div className="tw:grid  tw:gap-x-3 tw:gap-y-3">
                {fields.map((field , index) => (
                    <FieldCheckbox
                        key={field.columnTitle + index}
                        field={field}
                        checked={isSelected(field.columnTitle) || field.isDisabled}
                        onToggle={() => onToggle(field)}
                    />
                ))}
            </div>
        </section>
    );
};
export default Section; 