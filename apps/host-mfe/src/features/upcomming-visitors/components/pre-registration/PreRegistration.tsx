import React, { useEffect, useState } from "react";
import { usePreRegistrationForm } from "../../hooks/use-preregistration";
import { format } from "date-fns";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Radio,
  SearchUserSelect,
  Select,
  Checkbox,
} from "@visitly/ui";
import { usePointOfEntry, useParkingLot, useDestination } from "../../hooks/use-preregistration.queries";
import { createPreregistration, updatePreregistration, preScreenSingle } from "../../api/pre-registration.api";
import { fi } from "date-fns/locale";
import { QueryClient, useQueries, useQueryClient } from "@tanstack/react-query";
import { getIn } from "formik";

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Create' | 'Update';
  visitId?: string;
}

const EXCLUDED_DYNAMIC_FILEDS = ['Point of Entry', 'Building', 'Parking Lot', 'Host'];

export const PreRegistrationModal: React.FC<PreRegistrationModalProps> = ({
  isOpen,
  onClose,
  status,
  visitId,
}) => {
  const {
    form,
    setFormField,
    resetForm,
    formik,
    siteOptions,
    visitorTypeOptions,
    hostOptions,
    setHostSearch,
    coHostOptions,
    setCoHostSearch,
    visitorTypeFields,
    preScreenStatus,
    handlePreScreen,
    isPreScreening,
    matchedRule,
    isSaving
  } = usePreRegistrationForm(visitId ,onClose, status);
  const [timeOptions, setTimeOptions] = useState<{ label: string; value: string }[]>([]);

  const { data: poeData } = usePointOfEntry(form.siteId);
  const { data: parkingData } = useParkingLot(form.siteId);
  const { data: destData } = useDestination(form.siteId);

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


  // const handleSave = async () => {
  //   setIsSaving(true);
  //   try {
  //     const payload = preparePayload();
  //     if (status === 'Create') {
  //       await createPreregistration(payload);
  //     } else if (visitId) {
  //       await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
  //     }
  //     queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
  //     resetForm();
  //     onClose();

  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const repeatOptions = [
    { label: 'Does Not Repeat', value: 'NONE' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Annually', value: 'ANNUALLY' },
    { label: 'Weekdays (Mon–Fri)', value: 'WEEKDAY' },
  ];

  const renderDynamicField = (field: any, index: number) => {
    // We now have the field directly from local form state, which includes type, options, etc.
    const fieldName = `preregisterVisitCustomFieldModels[${index}].value`;
    const errorPath = `preregisterVisitCustomFieldModels[${index}].value`;
    const fieldError = getIn(formik.errors, errorPath);
    const isTouched = getIn(formik.touched, errorPath);
    const value = field.value || '';

    if (field.name === 'Point of Entry') {
      return (<div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
        <Select
          options={(poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
          value={form.poeId || ''}
          onChange={(e: any) => {
            setFormField('poeId', e.target.value);
            // Update the array value too so dynamic validation passes
            formik.setFieldValue(fieldName, e.target.value);
          }}
          onBlur={() => formik.setFieldTouched(fieldName, true)}
          name="poeId"
          required={field.isMandatoryForPreregistration}
          label="Point of Entry"
          error={isTouched ? fieldError : undefined}
        />
      </div>)
    }
    if (field.name === 'Building') {
      return <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
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

    }
    if (field.name === 'Parking Lot') {
      return (<div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
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
      </div>)
    }
    if (field.name === 'Host') {
      return (
        <div className="tw:space-y-1.5" key={field.orgCustomFieldId}>
          <Label required={field.isMandatoryForPreregistration}>Host</Label>
          <SearchUserSelect
            options={hostOptions}
            onSearch={setHostSearch}
            onChange={(opt) => {
              if (Array.isArray(opt)) {
                setFormField('hostUserId', opt[0]?.value || null);
                setFormField('hostEmail', opt[0]?.email || '');
                formik.setFieldValue(fieldName, opt[0]?.value || '');
              } else {
                setFormField('hostUserId', opt?.value || null);
                setFormField('hostEmail', opt?.email || '');
                formik.setFieldValue(fieldName, opt?.value || '');
              }
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
          options={
            field.options?.map((o: any) => ({
              label: o.label,
              value: o.value
            })) || []
          }
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
          <Label>{field.name} {field.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}</Label>
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

    // Default fallback
    return (
      <Input
        key={field.orgCustomFieldId}
        type={(field.type || 'text').toLowerCase()}
        placeholder={field.displayText}
        label={field.name}
        name={fieldName}
        required={field.isMandatoryForPreregistration}
        value={value}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={isTouched ? fieldError : undefined}
      />
    );
  };
      
  console.log('Rendering PreRegistrationModal with form state:', formik);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="tw:max-w-3xl  tw:min-w-300 tw:w-full tw:min-h-[60vh] tw:p-0 tw:overflow-hidden tw:rounded-xl"
      >
        <DialogHeader className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200">
          <DialogTitle className="tw:text-xl tw:font-bold">
            Pre-Registration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>

        <div className="tw:p-6 tw:space-y-6 tw:max-h-[80vh] tw:overflow-y-auto tw:flex-1">
          <div className="tw:grid tw:grid-cols-2 tw:gap-6">
            {/* Left Column: Core Selection & Contacts */}
            <div className="tw:space-y-1.5">
              <Label className="tw:required" required >Location</Label>
              <Select
                value={form.siteId}
                options={siteOptions}
                onChange={(e) => {
                  setFormField('siteId', e.target.value);
                  setFormField('visitorTypeId', '');
                }}
              />
            </div>

            <div className="tw:space-y-4">

              {form.siteId && (
                <div className="tw:space-y-1.5">
                  <Label className="tw:required" required>Visitor Type</Label>
                  <Select
                    value={form.visitorTypeId}
                    options={visitorTypeOptions}
                    onChange={(e) => setFormField('visitorTypeId', e.target.value)}
                  />
                </div>
              )}
            </div>


          </div>
          {/* Right Column: Date & Time */}
          {form.visitorTypeId && (
            <div className="tw:space-y-4">
              <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                <div className="tw:space-y-1.5">
                  <Label className="tw:required" required>Check-in Date</Label>
                  <Input
                    type="date"
                    value={form.scheduleCheckinDate ? format(form.scheduleCheckinDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormField('scheduleCheckinDate', e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
                <div className="tw:space-y-1.5">
                  <Label className="tw:required" required>Check-in Time</Label>
                  <Select
                    value={form.scheduleCheckinTimeOnly || ''}
                    options={timeOptions}
                    onChange={(e) => setFormField('scheduleCheckinTimeOnly', e.target.value)}
                  />
                </div>
              </div>
              <div className="tw:space-y-1.5">
                <Label>Repeats</Label>
                <Select
                  value={form.recurrenceType}
                  options={repeatOptions}
                  onChange={(e) => setFormField('recurrenceType', e.target.value)}
                />
              </div>

              <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                {form.recurrenceType == 'NONE' && (<div className="tw:space-y-1.5">
                  <Label >Check-out Date</Label>
                  <Input
                    type="date"
                    value={form.scheduleCheckoutDate ? format(form.scheduleCheckoutDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormField('scheduleCheckoutDate', e.target.value ? new Date(e.target.value) : null)}
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
                {form.recurrenceType !== 'NONE' && (
                  <div className="tw:space-y-1.5">
                    <Label className="tw:required">Ends On</Label>
                    <Input
                      type="date"
                      value={form.recurrenceEndDateOnly ? format(form.recurrenceEndDateOnly, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormField('recurrenceEndDateOnly', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {form.visitorTypeId && (
            <>


              <div className="tw:space-y-1.5">
                <Label>Co-Host(s)</Label>
                <SearchUserSelect
                  options={coHostOptions}
                  onSearch={setCoHostSearch}
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
            </>
          )}
          {form.visitorTypeId && (
            <>
              <hr className="tw:border-gray-100" />

              {/* Dynamic Fields & Mega Location - Render directly from synchronized form state */}
              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                {form.preregisterVisitCustomFieldModels.map((field, index) => renderDynamicField(field, index))}
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
              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                <div className="tw:flex tw:items-center tw:gap-2">
                  <Checkbox
                    checked={form.notifyVisitFlag}
                    onChange={(e: any) => setFormField('notifyVisitFlag', e)}
                    label="Send Email to Visitor"
                  />
                </div>
                <div className="tw:flex tw:items-center tw:gap-2">
                  <Checkbox
                    checked={form.notifyHostFlag}
                    onChange={(e: any) => setFormField('notifyHostFlag', e)}
                    label="Send Email to Host"
                  />
                </div>
              </div>
              <div className="tw:grid tw:gap-6">

                <div className="tw:flex tw:items-center tw:gap-2">
                  <Checkbox
                    checked={form.shouldPrefill}
                    onChange={(e: any) => setFormField('shouldPrefill', e)}
                    label="Allow Visitor to submit information before Arrival"
                  />
                </div>
              </div>
              {preScreenStatus === 'SAFE' && (
                <div className="tw:bg-green-50 tw:border tw:border-green-200 tw:p-3 tw:rounded tw:text-sm tw:text-green-800">
                  No watchlist matches found.
                </div>
              )}
              {preScreenStatus === 'WATCHLIST_HIT' && (
                <div className="tw:bg-yellow-50 tw:border tw:border-yellow-200 tw:p-3 tw:rounded tw:text-sm tw:text-yellow-800">
                  Watchlist match found: {matchedRule}. Please review record before saving.
                </div>
              )}

            </>
          )}

     

        <DialogFooter className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:gap-3 tw:flex tw:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreScreen}
            isLoading={isPreScreening}
          >
            Pre-screen
          </Button>
          <Button
           type="submit"
            isLoading={isSaving}
            // disabled={!formik.isValid || !form.visitorTypeId}
          >
            Save
          </Button>
        </DialogFooter>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};