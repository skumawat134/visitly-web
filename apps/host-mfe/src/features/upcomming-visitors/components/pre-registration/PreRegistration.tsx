import React, { useEffect, useState, useRef } from "react";
import { usePreRegistrationForm } from "../../hooks/use-preregistration";
import { format } from "date-fns";
import {
  Button,
  cn,
  Input,
  Label,
  Radio,
  SearchUserSelect,
  Select,
  Checkbox,
} from "@visitly/ui";
import { getIn } from "formik";
import { ArrowRight, MapPin, Users, Calendar, Clock, Check, X } from "lucide-react";
import { createPortal } from "react-dom";

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Create' | 'Update';
  visitId?: string;
}

const EXCLUDED_DYNAMIC_FIELDS = ['Point of Entry', 'Building', 'Parking Lot', 'Host'];

export const PreRegistrationModal: React.FC<PreRegistrationModalProps> = ({
  isOpen,
  onClose,
  status,
  visitId,
}) => {
  const {
    form,
    setFormField,
    formik,
    siteOptions,
    visitorTypeOptions,
    hostOptions,
    setHostSearch,
    coHostOptions,
    setCoHostSearch,
    poeData,
    parkingData,
    destData,
    handlePreScreen,
    isPreScreening,
    isSaving,
  } = usePreRegistrationForm(visitId, onClose, status);

  const [timeOptions, setTimeOptions] = useState<{ label: string; value: string }[]>([]);
  const [wizardStep, setWizardStep] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) setWizardStep(1);
  }, [isOpen]);

  // Generate time options (every 15 minutes)
  useEffect(() => {
    const opts: typeof timeOptions = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        opts.push({ label: `${hour}:${mm} ${ampm}`, value: `${hh}:${mm}` });
      }
    }
    setTimeOptions(opts);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const repeatOptions = [
    { label: 'Does Not Repeat', value: 'NONE' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Annually', value: 'ANNUALLY' },
    { label: 'Weekdays (Mon–Fri)', value: 'WEEKDAY' },
  ];

  const modalTitle =
    status === 'Update'
      ? 'Update Visit'
      : wizardStep === 3
        ? 'Review Visit Details'
        : 'Pre-Register Visitor';

  const handleNextStep = async () => {
    const errors = await formik.validateForm();
    let isValid = true;

    if (wizardStep === 1) {
      formik.setFieldTouched('siteId', true);
      formik.setFieldTouched('visitorTypeId', true);
      formik.setFieldTouched('scheduleCheckinDate', true);
      formik.setFieldTouched('scheduleCheckinTimeOnly', true);

      if (!form.siteId || !form.visitorTypeId || !form.scheduleCheckinDate || !form.scheduleCheckinTimeOnly) {
        isValid = false;
      }
      if (form.recurrenceType !== 'NONE' && !form.recurrenceEndDateOnly) {
        formik.setFieldTouched('recurrenceEndDateOnly', true);
        isValid = false;
      }
    } else if (wizardStep === 2) {
      Object.keys(formik.values).forEach(key => formik.setFieldTouched(key, true));
      if (Object.keys(errors).length > 0) isValid = false;
    }

    if (isValid) setWizardStep(prev => prev + 1);
  };

  if (!isOpen) return null;

  const renderDynamicField = (field: any, index: number, isPreview: boolean = false) => {
    const fieldName = `preregisterVisitCustomFieldModels[${index}].value`;
    const errorPath = `preregisterVisitCustomFieldModels[${index}].value`;
    const fieldError = getIn(formik.errors, errorPath);
    const isTouched = getIn(formik.touched, errorPath);
    const value = field.value || '';

    if (isPreview) {
      let displayValue = value;

      if (field.type === 'DATEPICKER' && value) {
        displayValue = format(new Date(value), 'MMM dd, yyyy');
      } else if (field.type === 'DROPDOWN' || field.type === 'RADIO') {
        const opt = field.options?.find((o: any) => o.value === value);
        if (opt) displayValue = opt.label;
      } else if (field.name === 'Host') {
        // For host, we might have the object in options if searching, otherwise we rely on what is selected
        // We can look up in hostOptions if available
        const h = hostOptions.find(o => o.value === form.hostUserId);
        displayValue = h ? h.label : (value || '-');
      } else if (field.name === 'Point of Entry') {
        // Look up in poeData
        console.log('poeData',poeData)
        const options = (poeData as any)?.results || [];
        const match = options.find((o: any) => o.id === value);
        displayValue = match ? match.name : value;
      } else if (field.name === 'Building') {
        // Look up in destData
        console.log('destData',destData)
        const options = (destData as any)?.results || [];
        const match = options.find((o: any) => o.id === value);
        displayValue = match ? match.name : value;
      } else if (field.name === 'Parking Lot') {
        // Look up in parkingData
        console.log("parking data",parkingData)
        const options = (parkingData as any)?.results || [];
        const match = options.find((o: any) => o.id === value);
        displayValue = match ? match.name : value;
      }

      return (
        <div key={field.orgCustomFieldId} className="tw:col-span-1">
          <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">{field.name}</div>
          <div className="tw:text-sm tw:font-medium tw:text-gray-900">{displayValue || '-'}</div>
        </div>
      );
    }

    // Input fields (edit mode)
    if (field.name === 'Point of Entry') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Select
            options={(poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
            value={form.poeId || ''}
            onChange={(e: any) => {
              setFormField('poeId', e.target.value);
              formik.setFieldValue(fieldName, e.target.value);
            }}
            onBlur={() => formik.setFieldTouched(fieldName, true)}
            name="poeId"
            required={field.isMandatoryForPreregistration}
            label="Point of Entry"
            error={isTouched ? fieldError : undefined}
          />
        </div>
      );
    }

    if (field.name === 'Building') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Select
            options={(destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || []}
            value={form.buildingId || ''}
            onChange={(e: any) => {
              setFormField('buildingId', e.target.value);
              formik.setFieldValue(fieldName, e.target.value);
            }}
            onBlur={() => formik.setFieldTouched(fieldName, true)}
            name="buildingId"
            label="Building / Destination"
            required={field.isMandatoryForPreregistration}
            error={isTouched ? fieldError : undefined}
          />
        </div>
      );
    }

    if (field.name === 'Parking Lot') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Select
            options={(parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
            value={form.parkingLotId || ''}
            onChange={(e: any) => {
              setFormField('parkingLotId', e.target.value);
              formik.setFieldValue(fieldName, e.target.value);
            }}
            onBlur={() => formik.setFieldTouched(fieldName, true)}
            name="parkingLotId"
            label="Parking Lot"
            required={field.isMandatoryForPreregistration}
            error={isTouched ? fieldError : undefined}
          />
        </div>
      );
    }

    if (field.name === 'Host') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Label required={field.isMandatoryForPreregistration}>Host</Label>
          <SearchUserSelect
            options={hostOptions}
            onSearch={setHostSearch}
            value={hostOptions.filter(opt => opt.value === form.hostUserId)}
            onChange={(opt) => {
              const selected = Array.isArray(opt) ? opt[0] : opt;
              setFormField('hostUserId', selected?.value || null);
              setFormField('hostEmail', selected?.email || '');
              formik.setFieldValue(fieldName, selected?.value || '');
            }}
            placeholder="Search host"
            error={isTouched ? fieldError : undefined}
          />
        </div>
      );
    }

    if (field.type === 'TEXT') {
      return (
        <Input
          key={field.orgCustomFieldId}
          label={field.name}
          name={fieldName}
          placeholder={field.displayText}
          required={field.isMandatoryForPreregistration}
          error={isTouched ? fieldError : undefined}
          value={value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      );
    }

    if (field.type === 'DROPDOWN') {
      return (
        <Select
          key={field.orgCustomFieldId}
          label={field.name}
          required={field.isMandatoryForPreregistration}
          options={field.options?.map((o: any) => ({ label: o.label, value: o.value })) || []}
          value={value}
          onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
          onBlur={() => formik.setFieldTouched(fieldName, true)}
          error={isTouched ? fieldError : undefined}
        />
      );
    }

    if (field.type === 'RADIO') {
      return (
        <div className="tw:flex tw:gap-4" key={field.orgCustomFieldId}>
          <Label>
            {field.name} {field.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}
          </Label>
          {field.options?.map((o: any) => (
            <div key={o.value} className="tw:flex tw:items-center tw:gap-2">
              <Radio
                label={o.label}
                checked={value === o.value}
                required={field.isMandatoryForPreregistration}
                onChange={() => {
                  formik.setFieldValue(fieldName, o.value);
                  formik.setFieldTouched(fieldName, true);
                }}
              />
            </div>
          ))}
          {isTouched && fieldError && <p className="tw:text-xs tw:text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (field.type === 'DATEPICKER') {
      return (
        <Input
          key={field.orgCustomFieldId}
          type="date"
          label={field.name}
          required={field.isMandatoryForPreregistration}
          value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
          onChange={(e) => formik.setFieldValue(fieldName, e.target.value ? new Date(e.target.value).toISOString() : '')}
          onBlur={() => formik.setFieldTouched(fieldName, true)}
          error={isTouched ? fieldError : undefined}
        />
      );
    }

    // Fallback
    return (
      <Input
        key={field.orgCustomFieldId}
        type={(field.type || 'text').toLowerCase()}
        label={field.name}
        placeholder={field.displayText}
        name={fieldName}
        required={field.isMandatoryForPreregistration}
        value={value}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={isTouched ? fieldError : undefined}
      />
    );
  };

  const modalContent = (
    <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:overflow-y-auto tw:overflow-x-hidden tw:backdrop-blur-sm tw:bg-black/50 tw:p-4 md:tw:p-6">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pre-registration-title"
        className="tw:relative tw:w-full tw:max-w-3xl tw:max-h-[90vh] tw:rounded-xl tw:bg-white tw:shadow-2xl tw:flex tw:flex-col"
      >
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
          <h3 id="pre-registration-title" className="tw:text-xl tw:font-bold tw:text-gray-900">
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            className="tw:p-2 tw:rounded-full tw:hover:bg-gray-100 tw:text-gray-500 tw:transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="tw:bg-white tw:px-6 tw:pt-6 tw:pb-2">
          <div className="tw:relative tw:mb-6">
            <div className="tw:absolute tw:top-[15px] tw:left-[50px] tw:right-[50px] tw:h-0.5 tw:bg-gray-200" />
            <div
              className="tw:absolute tw:top-[15px] tw:left-[50px] tw:right-[50px] tw:h-0.5 tw:bg-blue-600 tw:transition-all tw:duration-300"
              style={{ width: wizardStep === 1 ? '0%' : wizardStep === 2 ? '50%' : '90%' }}
            />
            <div className="tw:flex tw:justify-between tw:relative">
              {[
                { step: 1, label: 'Where & When' },
                { step: 2, label: 'Who & Whom' },
                { step: 3, label: 'Review' },
              ].map((s) => (
                <div key={s.step} className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:z-10 tw:bg-white">
                  <div
                    className={cn(
                      "tw:w-8 tw:h-8 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-sm tw:font-bold tw:transition-all tw:bg-white",
                      wizardStep >= s.step
                        ? "tw:bg-blue-600! tw:text-white tw:border-none"
                        : "tw:border-2 tw:border-gray-200 tw:text-gray-400"
                    )}
                  >
                    {wizardStep > s.step ? <Check size={16} /> : s.step}
                  </div>
                  <span
                    className={cn(
                      "tw:text-xs tw:font-medium tw:transition-colors",
                      wizardStep >= s.step ? "tw:text-gray-900" : "tw:text-gray-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="tw:flex-1 tw:overflow-hidden tw:flex tw:flex-col">
          <div className="tw:flex-1 tw:overflow-y-auto tw:px-6 tw:py-4">
            {/* STEP 1 */}
            {wizardStep === 1 && (
              <div className="tw:space-y-6 tw:animate-in tw:fade-in tw:slide-in-from-right-4 tw:duration-300">
                <div className="tw:text-lg tw:font-semibold tw:text-gray-900">Where and when is the visit?</div>

                <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                  <div className="tw:space-y-1.5">
                    <Label className="tw:required" required>Location</Label>
                    <div className="tw:relative">
                      <MapPin className="tw:absolute tw:left-3 tw:top-2.5 tw:text-gray-400" size={16} />
                      <Select
                        value={form.siteId}
                        options={siteOptions}
                        onChange={(e) => {
                          setFormField('siteId', e.target.value);
                          setFormField('visitorTypeId', '');
                        }}
                        className="tw:pl-9"
                        error={formik.touched.siteId && !form.siteId ? "Location is required" : undefined}
                      />
                    </div>
                  </div>

                  <div className="tw:space-y-1.5">
                    <Label className="tw:required" required>Visitor Type</Label>
                    <div className="tw:relative">
                      <Users className="tw:absolute tw:left-3 tw:top-2.5 tw:text-gray-400" size={16} />
                      <Select
                        value={form.visitorTypeId}
                        options={visitorTypeOptions}
                        onChange={(e) => setFormField('visitorTypeId', e.target.value)}
                        disabled={!form.siteId}
                        className="tw:pl-9"
                        error={formik.touched.visitorTypeId && !form.visitorTypeId ? "Visitor Type is required" : undefined}
                      />
                    </div>
                  </div>
                </div>

                <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                  <div className="tw:space-y-1.5">
                    <Label className="tw:required" required>Check-in Date</Label>
                    <div className="tw:relative">
                      <Calendar className="tw:absolute tw:left-3 tw:top-2.5 tw:text-gray-400" size={16} />
                      <Input
                        type="date"
                        value={form.scheduleCheckinDate ? format(form.scheduleCheckinDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setFormField('scheduleCheckinDate', e.target.value ? format(e.target.value, 'yyyy-MM-dd') : null)}
                        className="tw:pl-9"
                        error={formik.touched.scheduleCheckinDate && !form.scheduleCheckinDate ? "Date is required" : undefined}
                      />
                    </div>
                  </div>

                  <div className="tw:space-y-1.5">
                    <Label className="tw:required" required>Check-in Time</Label>
                    <div className="tw:relative">
                      <Clock className="tw:absolute tw:left-3 tw:top-2.5 tw:text-gray-400" size={16} />
                      <Select
                        value={form.scheduleCheckinTimeOnly || ''}
                        options={timeOptions}
                        onChange={(e) => setFormField('scheduleCheckinTimeOnly', e.target.value)}
                        className="tw:pl-9"
                        error={formik.touched.scheduleCheckinTimeOnly && !form.scheduleCheckinTimeOnly ? "Time is required" : undefined}
                      />
                    </div>
                  </div>
                </div>

                <div className="tw:space-y-4">
                  <div className="tw:space-y-1.5">
                    <Label>Repeats</Label>
                    <Select
                      value={form.recurrenceType}
                      options={repeatOptions}
                      onChange={(e) => setFormField('recurrenceType', e.target.value)}
                    />
                  </div>

                  <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                    {form.recurrenceType === 'NONE' ? (
                      <div className="tw:space-y-1.5">
                        <Label>Check-out Date (Optional)</Label>
                        <Input
                          type="date"
                          value={form.scheduleCheckoutDate ? format(form.scheduleCheckoutDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setFormField('scheduleCheckoutDate', e.target.value ? format(e.target.value, 'yyyy-MM-dd') : null)}
                        />
                      </div>
                    ) : (
                      <div className="tw:space-y-1.5">
                        <Label className="tw:required" required>Ends On</Label>
                        <Input
                          type="date"
                          value={form.recurrenceEndDateOnly ? format(form.recurrenceEndDateOnly, 'yyyy-MM-dd') : ''}
                          onChange={(e) => setFormField('recurrenceEndDateOnly', e.target.value ?  format(e.target.value, 'yyyy-MM-dd') : null)}
                          error={formik.touched.recurrenceEndDateOnly && !form.recurrenceEndDateOnly ? "End date is required" : undefined}
                        />
                      </div>
                    )}

                    <div className="tw:space-y-1.5">
                      <Label>Check-out Time</Label>
                      <Select
                        value={form.scheduleCheckoutTimeOnly || ''}
                        options={timeOptions}
                        onChange={(e) => setFormField('scheduleCheckoutTimeOnly', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {wizardStep === 2 && (
              <div className="tw:space-y-6 tw:animate-in tw:fade-in tw:slide-in-from-right-4 tw:duration-300">
                <div className="tw:text-lg tw:font-semibold tw:text-gray-900">Who is visiting?</div>

                <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                  {form.preregisterVisitCustomFieldModels.map((field, index) => renderDynamicField(field, index))}
                </div>

                <hr className="tw:border-gray-100 tw:my-4" />

                <div className="tw:space-y-1.5">
                  <Label>Co-Host(s)</Label>
                  <SearchUserSelect
                    options={coHostOptions}
                    onSearch={setCoHostSearch}
                    value={coHostOptions.filter(opt => (form.cohostUserIds || []).includes(opt.value))}
                    onChange={(opt) => {
                      if (Array.isArray(opt)) {
                        setFormField('cohostUserIds', opt.map(o => o.value));
                      } else if (opt) {
                        const current = form.cohostUserIds || [];
                        if (!current.includes(opt.value)) {
                          setFormField('cohostUserIds', [...current, opt.value]);
                        }
                      }
                    }}
                    multi={true}
                    placeholder="Search co-hosts"
                  />
                </div>

                <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                  <Input
                    type="text"
                    name="groupName"
                    label="Group Name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={form.groupName}
                  />
                  <Input
                    name="internalNote"
                    label="Internal Note"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={form.internalNote}
                  />
                </div>
              </div>
            )}

            {/* STEP 3 - Review */}
            {wizardStep === 3 && (
              <div className="tw:space-y-6 tw:animate-in tw:fade-in tw:slide-in-from-right-4 tw:duration-300">
                <div className="tw:bg-blue-50 tw:p-4 tw:rounded-lg tw:border tw:border-blue-100">
                  <div className="tw:flex tw:items-start tw:gap-3">
                    <div className="tw:p-2 tw:bg-white tw:rounded-full tw:shadow-sm">
                      <Calendar size={20} className="tw:text-blue-600" />
                    </div>
                    <div>
                      <h4 className="tw:font-semibold tw:text-blue-900 tw:mb-1">Visit Summary</h4>
                      <p className="tw:text-sm tw:text-blue-700">
                        Please review the details below before creating the visit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden">
                  <div className="tw:bg-gray-50 tw:px-4 tw:py-2 tw:border-b tw:border-gray-200 tw:font-semibold tw:text-sm tw:text-gray-600">
                    Logistics
                  </div>
                  <div className="tw:p-4 tw:grid tw:grid-cols-2 tw:gap-4">
                    <div>
                      <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Location</div>
                      <div className="tw:text-sm tw:font-medium tw:text-gray-900">
                        {siteOptions.find(s => s.value === form.siteId)?.label || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Visitor Type</div>
                      <div className="tw:text-sm tw:font-medium tw:text-gray-900">
                        {visitorTypeOptions.find(t => t.value === form.visitorTypeId)?.label || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Check-in</div>
                      <div className="tw:text-sm tw:font-medium tw:text-gray-900">
                        {form.scheduleCheckinDate ? format(form.scheduleCheckinDate, 'MMM dd, yyyy') : ''} at {form.scheduleCheckinTimeOnly}
                      </div>
                    </div>
                    <div>
                      <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Recurrence</div>
                      <div className="tw:text-sm tw:font-medium tw:text-gray-900">
                        {repeatOptions.find(r => r.value === form.recurrenceType)?.label}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden">
                  <div className="tw:bg-gray-50 tw:px-4 tw:py-2 tw:border-b tw:border-gray-200 tw:font-semibold tw:text-sm tw:text-gray-600">
                    Visitor Details
                  </div>
                  <div className="tw:p-4 tw:grid tw:grid-cols-2 tw:gap-4">
                    {form.preregisterVisitCustomFieldModels.map((field, index) => renderDynamicField(field, index, true))}

                    {form.groupName && (
                      <div>
                        <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Group</div>
                        <div className="tw:text-sm tw:font-medium tw:text-gray-900">{form.groupName}</div>
                      </div>
                    )}

                    {form.cohostUserIds?.length > 0 && (
                      <div className="tw:col-span-2">
                        <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:mb-1">Co-Hosts</div>
                        <div className="tw:flex tw:gap-2 tw:flex-wrap">
                          {form.cohostUserIds.map(id => {
                            const opt = coHostOptions.find(c => c.value === id);
                            return (
                              <span
                                key={id}
                                className="tw:px-2 tw:py-0.5 tw:bg-gray-100 tw:rounded tw:text-xs tw:font-medium tw:text-gray-700"
                              >
                                {opt?.label || id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden">
                  <div className="tw:bg-gray-50 tw:px-4 tw:py-2 tw:border-b tw:border-gray-200 tw:font-semibold tw:text-sm tw:text-gray-600">
                    Notifications & Options
                  </div>
                  <div className="tw:p-4 tw:grid tw:grid-cols-2 tw:gap-6">
                    <div className="tw:space-y-4">
                      <div className="tw:font-medium tw:text-gray-800">Notifications</div>
                      <div className="tw:space-y-2">
                        <Checkbox
                          checked={form.notifyVisitFlag}
                          onChange={(e: any) => setFormField('notifyVisitFlag', e)}
                          label="Send Email to Visitor"
                        />
                        <Checkbox
                          checked={form.notifyHostFlag}
                          onChange={(e: any) => setFormField('notifyHostFlag', e)}
                          label="Send Email to Host"
                        />
                      </div>
                    </div>

                    <div className="tw:space-y-4">
                      <div className="tw:font-medium tw:text-gray-800">Options</div>
                      <Checkbox
                        checked={form.shouldPrefill}
                        onChange={(e: any) => setFormField('shouldPrefill', e)}
                        label="Allow Visitor to submit info before arrival"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:flex tw:justify-between tw:items-center">
            <div>
              {wizardStep > 1 && (
                <Button type="button" variant="outline" onClick={() => setWizardStep(prev => prev - 1)}>
                  Back
                </Button>
              )}
            </div>

            <div className="tw:flex tw:gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              {wizardStep < 3 ? (
                <Button type="button" onClick={handleNextStep}>
                  Continue <ArrowRight size={16} className="tw:ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePreScreen}
                    isLoading={isPreScreening}
                  >
                    Pre-screen
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    className="tw:bg-blue-600 tw:hover:bg-blue-700"
                  >
                    {status === 'Update' ? 'Update Visit' : 'Create Visit'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};