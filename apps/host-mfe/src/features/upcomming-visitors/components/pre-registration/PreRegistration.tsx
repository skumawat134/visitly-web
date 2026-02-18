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
} from "@visitly/ui";
import { getIn } from "formik";
import { ArrowRight, MapPin, Calendar, Check, UserPlus, Info, Users, Settings } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Create' | 'Update';
  visitId?: string;
}

const IDENTITY_FIELDS = ['Full Name', 'Email', 'Company Name', 'Phone Number', 'Building', 'Parking Lot', 'Point of Entry'];
const WHOM_FIELDS = ['Host', 'CoHost'];
const EXCLUDED_DYNAMIC_FIELDS = [...IDENTITY_FIELDS, ...WHOM_FIELDS];

export const PreRegistrationModal = ({
  isOpen,
  onClose,
  status,
  visitId,
}: PreRegistrationModalProps) => {
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
    handlePreScreen,
    isPreScreening,
    isSaving,
    validateStep,
    poeOptions,
    parkingOptions,
    destOptions,
    setWizardStep,
    wizardStep,
    poeData,
    parkingData,
    destData,
  } = usePreRegistrationForm(visitId, onClose, status);

  const [timeOptions, setTimeOptions] = useState<{ label: string; value: string }[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const repeatOptions = [
    { label: 'Select Recurrence', value: '' },
    { label: 'Does Not Repeat', value: 'NONE' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Annually', value: 'ANNUALLY' },
    { label: 'Weekdays (Mon–Fri)', value: 'WEEKDAY' },
  ];
  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) setWizardStep(1);
  }, [isOpen]);

  // Generate time options
  useEffect(() => {
    const opts: typeof timeOptions = [{ label: 'Select Time', value: '' }];
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

  const modalTitle =
    status === 'Update'
      ? 'Update Visit'
      : wizardStep === 1
        ? 'Pre-Register Visitor'
        : wizardStep === 2
          ? 'Visitor Information'
          : 'Review & Options';

  const handleNextStep = async () => {
    const result = await validateStep(wizardStep as any);

    if (result.isValid) {
      setWizardStep(prev => prev + 1);
    } else {
      // Mark fields as touched to show errors
      Object.keys(result.errors).forEach(key => formik.setFieldTouched(key, true));
    }
  };

  if (!isOpen) return null;
  console.log("formikk>>", formik)

  const renderDynamicField = (field: any, index: number) => {
    const fieldName = `preregisterVisitCustomFieldModels[${index}].value`;
    const errorPath = `preregisterVisitCustomFieldModels[${index}].value`;
    const fieldError = getIn(formik.errors, errorPath);
    const isTouched = getIn(formik.touched, errorPath);
    const value = field.value || '';

    if (field.name === 'Building') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Select
            options={destOptions}
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
            options={parkingOptions}
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

    // Input fields (edit mode)
    if (field.name === 'Point of Entry') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Select
            options={poeOptions}
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
          required={field.isMandatoryForPreregistration || IDENTITY_FIELDS.includes(field.name)}
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
          options={[
            { label: `Select ${field.name}`, value: '' },
            ...(field.options?.map((o: any) => ({ label: o.label, value: o.value })) || [])
          ]}
          value={value}
          onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
          onBlur={() => formik.setFieldTouched(fieldName, true)}
          error={isTouched ? fieldError : undefined}
        />
      );
    }

    if (field.type === 'RADIO') {
      return (
        <div className="tw:flex tw:flex-col tw:gap-2" key={field.orgCustomFieldId}>
          <Label>
            {field.name} {field.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}
          </Label>
          <div className="tw:flex tw:gap-4">
            {field.options?.map((o: any) => (
              <Radio
                key={o.value}
                label={o.label}
                checked={value === o.value}
                onChange={() => {
                  formik.setFieldValue(fieldName, o.value);
                  formik.setFieldTouched(fieldName, true);
                }}
              />
            ))}
          </div>
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

    return (
      <Input
        key={field.orgCustomFieldId}
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
    <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:overflow-y-auto tw:overflow-x-hidden tw:backdrop-blur-sm tw:bg-black/40 tw:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="tw:relative tw:w-full tw:max-w-3xl tw:max-h-[95vh] tw:rounded-2xl tw:bg-white tw:shadow-[0_20px_50px_rgba(0,0,0,0.15)] tw:flex tw:flex-col tw:overflow-hidden"
      >
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-8 tw:py-4 tw:border-b tw:border-gray-100">
          <h3 className="tw:text-xl tw:font-bold tw:text-gray-900">{modalTitle}</h3>
          <button onClick={onClose} className="tw:p-2 tw:rounded-full tw:hover:bg-gray-100 tw:transition-colors">
            <Check className="tw:rotate-45" size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="tw:relative tw:mt-6 tw:mb-2 tw:px-12">
          <div className="tw:absolute tw:top-[18px] tw:left-[60px] tw:right-[60px] tw:h-[1.5px] tw:bg-gray-100 tw:rounded-full" />
          <div
            className="tw:absolute tw:top-[18px] tw:left-[60px] tw:h-[1.5px] tw:bg-blue-600 tw:rounded-full tw:transition-all tw:duration-500"
            style={{ width: wizardStep === 1 ? '0%' : wizardStep === 2 ? '50%' : '100% - 120px' }}
          // Simplified progress calculation for middle step
          />
          <div className="tw:flex tw:justify-between tw:relative">
            {[
              { step: 1, label: 'Where & When' },
              { step: 2, label: 'Who is visiting?' },
              { step: 3, label: 'Review & Confirm' }
            ].map((s) => {
              const isCompleted = wizardStep > s.step;
              const isActive = wizardStep === s.step;
              return (
                <div key={s.step} className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:z-10">
                  <div className={cn(
                    "tw:w-9 tw:h-9 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-sm tw:font-bold tw:transition-all tw:duration-300",
                    isActive
                      ? "tw:bg-blue-600 tw:text-white tw:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                      : isCompleted
                        ? "tw:bg-blue-600 tw:text-white"
                        : "tw:bg-white tw:border-2 tw:border-gray-200 tw:text-gray-400"
                  )}>
                    {isCompleted ? <Check size={18} /> : s.step}
                  </div>
                  <span className={cn(
                    "tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-wider tw:transition-colors",
                    isActive || isCompleted ? "tw:text-gray-900" : "tw:text-gray-400"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="tw:flex-1 tw:flex tw:flex-col tw:overflow-hidden">
          <div className="tw:flex-1 tw:overflow-y-auto tw:px-8 tw:py-6">
            <AnimatePresence mode="wait">
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="tw:space-y-8"
                >
                  <div className="tw:space-y-6">
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                      <div className="tw:w-1 tw:h-5 tw:bg-blue-600 tw:rounded-full" />
                      <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">Where & When</h3>
                    </div>
                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                      <div className="tw:space-y-1.5">
                        <Label required>Location</Label>
                        <Select
                          value={form.siteId}
                          options={siteOptions}
                          onChange={(e) => {
                            setFormField('siteId', e.target.value);
                            setFormField('visitorTypeId', '');
                          }}
                          onBlur={(e) => {
                            formik.setTouched({ ...formik.touched, siteId: true })
                          }}
                          error={formik.touched.siteId && formik.errors.siteId ? String(formik.errors.siteId) : undefined}
                        />
                      </div>
                      <div className="tw:space-y-1.5">
                        <Label required>Visitor Type</Label>
                        <Select
                          value={form.visitorTypeId}
                          options={visitorTypeOptions}
                          onChange={(e) => setFormField('visitorTypeId', e.target.value)}
                          disabled={!form.siteId}
                          error={formik.touched.visitorTypeId && formik.errors.visitorTypeId ? String(formik.errors.visitorTypeId) : undefined}
                        />
                      </div>
                    </div>

                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                      <div className="tw:space-y-1.5">
                        <Label required>Check-in Date</Label>
                        <Input
                          type="date"
                          value={form.scheduleCheckinDate ? format(new Date(form.scheduleCheckinDate), 'yyyy-MM-dd') : ''}
                          onChange={(e) => setFormField('scheduleCheckinDate', e.target.value ? new Date(e.target.value) : null)}
                          error={formik.touched.scheduleCheckinDate && formik.errors.scheduleCheckinDate ? String(formik.errors.scheduleCheckinDate) : undefined}
                        />
                      </div>
                      <div className="tw:space-y-1.5">
                        <Label required>Check-in Time</Label>
                        <Select
                          value={form.scheduleCheckinTimeOnly || ''}
                          options={timeOptions}
                          onChange={(e) => setFormField('scheduleCheckinTimeOnly', e.target.value)}
                          error={formik.touched.scheduleCheckinTimeOnly && formik.errors.scheduleCheckinTimeOnly ? String(formik.errors.scheduleCheckinTimeOnly) : undefined}
                        />
                      </div>
                    </div>

                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                      <div className="tw:space-y-1.5">
                        <Label>Repeats</Label>
                        <Select
                          value={form.recurrenceType}
                          options={repeatOptions}
                          onChange={(e) => setFormField('recurrenceType', e.target.value)}
                        />
                      </div>
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
                            onChange={(e) => setFormField('recurrenceEndDateOnly', e.target.value ? format(e.target.value, 'yyyy-MM-dd') : null)}
                            error={formik.touched.recurrenceEndDateOnly && !form.recurrenceEndDateOnly ? "End date is required" : undefined}
                          />
                        </div>
                      )}
                    </div>
                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
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
                </motion.div>
              )}

              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="tw:space-y-8"
                >
                  <div className="tw:space-y-6">
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                      <div className="tw:w-1 tw:h-5 tw:bg-blue-600 tw:rounded-full" />
                      <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">Who is visiting?</h3>
                    </div>
                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                      {/* Identity Fields First */}
                      {form.preregisterVisitCustomFieldModels
                        .filter(f => IDENTITY_FIELDS.includes(f.name))
                        .map(f => {
                          const idx = form.preregisterVisitCustomFieldModels.findIndex(orig => orig.name === f.name);
                          return renderDynamicField(f, idx);
                        })
                      }
                    </div>
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                     <div className="tw:w-1 tw:h-5 tw:bg-blue-600 tw:rounded-full" />
                      <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">Whom?</h3>
                    </div>
                      <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                        
                        {/* Identity Fields First */}
                        {form.preregisterVisitCustomFieldModels
                          .filter(f => WHOM_FIELDS.includes(f.name))
                          .map(f => {
                            const idx = form.preregisterVisitCustomFieldModels.findIndex(orig => orig.name === f.name);
                            return renderDynamicField(f, idx);
                          })
                        }
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
                    </div>
                    {/* Other Dynamic Fields */}
                    <div className="tw:pt-4 tw:border-t tw:border-gray-50">
                      <div className="tw:text-xs tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-widest tw:mb-4">Additional Information</div>
                      <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                        {form.preregisterVisitCustomFieldModels
                          .filter(f => !EXCLUDED_DYNAMIC_FIELDS.includes(f.name))
                          .map(f => {
                            const idx = form.preregisterVisitCustomFieldModels.findIndex(orig => orig.name === f.name);
                            return renderDynamicField(f, idx);
                          })
                        }

                        <Input
                          label="Group Name"
                          value={form.groupName}
                          onChange={(e) => setFormField('groupName', e.target.value)}
                          placeholder="Team Alpha, Project X..."
                        />
                        <Input
                          label="Internal Note"
                          value={form.internalNote}
                          onChange={(e) => setFormField('internalNote', e.target.value)}
                          placeholder="Special instructions for reception..."
                        />
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {wizardStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="tw:space-y-8"
                >
                  {/* Summary Card */}
                  <div className="tw:bg-blue-50/50 tw:rounded-2xl tw:p-6 tw:border tw:border-blue-100 tw:relative tw:overflow-hidden">
                    <div className="tw:absolute tw:top-4 tw:right-4">
                      <div className="tw:bg-blue-100 tw:p-2 tw:rounded-lg">
                        <Info size={16} className="tw:text-blue-600" />
                      </div>
                    </div>
                    <div className="tw:flex tw:items-center tw:gap-4 tw:mb-6">
                      <div className="tw:w-12 tw:h-12 tw:rounded-full tw:bg-blue-600 tw:text-white tw:flex tw:items-center tw:justify-center tw:text-lg tw:font-bold">
                        {(form.preregisterVisitCustomFieldModels.find(f => f.name === 'Full Name')?.value || '?')[0]}
                      </div>
                      <div>
                        <div className="tw:text-base tw:font-bold tw:text-gray-900">
                          {form.preregisterVisitCustomFieldModels.find(f => f.name === 'Full Name')?.value || 'Visitor Name'}
                        </div>
                        <div className="tw:text-sm tw:text-gray-500">
                          {form.preregisterVisitCustomFieldModels.find(f => f.name === 'Email')?.value || 'No email provided'}
                        </div>
                      </div>
                    </div>
                    <div className="tw:grid tw:grid-cols-2 tw:gap-y-4 tw:gap-x-8 tw:pt-4 tw:border-t tw:border-blue-100/50">
                      <div className="tw:flex tw:items-center tw:gap-2">
                        <MapPin size={14} className="tw:text-blue-500" />
                        <span className="tw:text-sm tw:text-gray-600 font-medium">{siteOptions.find(s => s.value === form.siteId)?.label}</span>
                      </div>
                      <div className="tw:flex tw:items-center tw:gap-2">
                        <Calendar size={14} className="tw:text-blue-500" />
                        <span className="tw:text-sm tw:text-gray-600 font-medium">
                          {form.scheduleCheckinDate ? format(new Date(form.scheduleCheckinDate), 'MMM dd, yyyy') : ''} at {form.scheduleCheckinTimeOnly}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Host Section */}
                  {/* <div className="tw:space-y-6">
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                      <div className="tw:w-1 tw:h-5 tw:bg-blue-600 tw:rounded-full" />
                      <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">Host & Details</h3>
                    </div>
                    <div className="tw:space-y-4">
                      <div className="tw:space-y-1.5">
                        <Label>Host</Label>
                        <SearchUserSelect
                          options={hostOptions}
                          onSearch={setHostSearch}
                          value={hostOptions.filter(opt => opt.value === form.hostUserId)}
                          onChange={(opt) => {
                            const selected = Array.isArray(opt) ? opt[0] : opt;
                            setFormField('hostUserId', selected?.value || null);
                          }}
                          placeholder="Search host"
                        />
                      </div>
                      <div className="tw:space-y-1.5">
                        <Label>Co-Hosts</Label>
                        <SearchUserSelect
                          options={coHostOptions}
                          onSearch={setCoHostSearch}
                          value={coHostOptions.filter(opt => (form.cohostUserIds || []).includes(opt.value))}
                          onChange={(opt) => {
                            if (Array.isArray(opt)) setFormField('cohostUserIds', opt.map(o => o.value));
                            else if (opt) setFormField('cohostUserIds', [(opt as any).value]);
                          }}
                          multi={true}
                          placeholder="Add co-hosts"
                        />
                      </div>
                    </div>

                    <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                      <Input
                        label="Group Name"
                        value={form.groupName}
                        onChange={(e) => setFormField('groupName', e.target.value)}
                        placeholder="Team Alpha, Project X..."
                      />
                      <Select
                        label="Point of Entry"
                        options={poeOptions}
                        value={form.poeId || ''}
                        onChange={(e) => setFormField('poeId', e.target.value)}
                      />
                    </div>
                    <div className="tw:grid tw:grid-cols-1 tw:gap-6">
                      <Input
                        label="Internal Note"
                        value={form.internalNote}
                        onChange={(e) => setFormField('internalNote', e.target.value)}
                        placeholder="Special instructions for reception..."
                      />
                    </div>
                  </div> */}

                  {/* Notifications */}
                  <div className="tw:pt-4 tw:border-t tw:border-gray-100">
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-4">
                      <Settings size={14} className="tw:text-gray-400" />
                      <span className="tw:text-[11px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-widest">Notification Settings</span>
                    </div>
                    <div className="tw:flex tw:flex-wrap tw:gap-3">
                      {[
                        { field: 'notifyVisitFlag', label: 'Email visitor' },
                        { field: 'notifyHostFlag', label: 'Notify host' },
                        { field: 'shouldPrefill', label: 'Allow pre-fill' },
                      ].map((item) => {
                        const isActive = (form as any)[item.field];
                        return (
                          <button
                            key={item.field}
                            type="button"
                            onClick={() => setFormField(item.field as any, !isActive)}
                            className={cn(
                              "tw:inline-flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-full tw:text-sm tw:font-medium tw:transition-all tw:border-2",
                              isActive
                                ? "tw:bg-blue-50 tw:border-blue-600 tw:text-blue-700"
                                : "tw:bg-white tw:border-gray-200 tw:text-gray-500 tw:hover:border-gray-300"
                            )}
                          >
                            {isActive && <Check size={14} />}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="tw:px-8 tw:py-5 tw:bg-gray-50/80 tw:backdrop-blur-md tw:border-t tw:border-gray-100 tw:flex tw:justify-between tw:items-center">
            <div>
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="tw:text-sm tw:font-bold tw:text-gray-500 tw:hover:text-gray-900 tw:transition-colors tw:px-4 tw:py-2"
                >
                  Back
                </button>
              )}
            </div>

            <div className="tw:flex tw:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="tw:text-sm tw:font-bold tw:text-gray-500 tw:hover:text-gray-900 tw:transition-colors tw:px-4 tw:py-2"
              >
                Cancel
              </button>

              {wizardStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="tw:bg-blue-600 tw:hover:bg-blue-700 tw:rounded-xl tw:px-6 tw:py-2.5 tw:shadow-lg tw:shadow-blue-200"
                >
                  Continue <ArrowRight size={18} className="tw:ml-2" />
                </Button>
              ) : (
                <div className="tw:flex tw:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreScreen}
                    isLoading={isPreScreening}
                    className="tw:rounded-xl tw:border-gray-300"
                  >
                    Pre-screen
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    className="tw:bg-blue-600 tw:hover:bg-blue-700 tw:rounded-xl tw:px-8 tw:py-2.5 tw:shadow-lg tw:shadow-blue-200"
                  >
                    <UserPlus size={18} className="tw:mr-2" />
                    {status === 'Update' ? 'Update Visit' : 'Create Visit'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  ) as any;

  return createPortal(modalContent, document.body) as any;
};
