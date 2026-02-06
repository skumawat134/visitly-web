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
    setCustomField,
    resetForm,
    formik,
    siteOptions,
    visitorTypeOptions,
    hostOptions,
    setHostSearch,
    coHostOptions,
    setCoHostSearch,
    visitorTypeFields
  } = usePreRegistrationForm(visitId);
  const queryClient = useQueryClient();
  const [timeOptions, setTimeOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreScreening, setIsPreScreening] = useState(false);
  const [preScreenStatus, setPreScreenStatus] = useState<'IDLE' | 'SAFE' | 'WATCHLIST_HIT'>('IDLE');
  const [matchedRule, setMatchedRule] = useState('');

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

  const preparePayload = () => {
    const checkin = new Date(form.scheduleCheckinDate || new Date());
    if (form.scheduleCheckinTimeOnly) {
      const [h, m] = form.scheduleCheckinTimeOnly.split(':');
      checkin.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    let checkout = null;
    if (form.scheduleCheckoutDate && form.scheduleCheckoutTimeOnly) {
      checkout = new Date(form.scheduleCheckoutDate);
      const [h, m] = form.scheduleCheckoutTimeOnly.split(':');
      checkout.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    const customFields = (visitorTypeFields as any)?.fields
      ?.filter((f: any) => f.isPreregistrationOnly && f.orgCustomFieldId)
      ?.map((f: any) => ({
        name: f.name,
        orgCustomFieldId: f.orgCustomFieldId,
        visitTypeFieldId: f.id,
        value: form.preregisterVisitCustomFieldModels.find(cm => cm.orgCustomFieldId === f.orgCustomFieldId)?.value || ''
      })) || [];

    // Map standard fields from visitorTypeFields if they exist
    const fullNameField = (visitorTypeFields as any)?.fields?.find((f: any) => f.name === 'Full Name');
    const emailField = (visitorTypeFields as any)?.fields?.find((f: any) => f.name === 'Email');
    const companyField = (visitorTypeFields as any)?.fields?.find((f: any) => f.name === 'Company Name');
    const phoneField = (visitorTypeFields as any)?.fields?.find((f: any) => f.name === 'Phone Number');
    const getValueByFieldName = (fieldName: string) => {
      const fieldDef = (visitorTypeFields as any)?.fields?.find(
        (f: any) => f.name === fieldName
      );
      console.log("sfsdf" , fieldName , form.preregisterVisitCustomFieldModels, form.preregisterVisitCustomFieldModels.find(
          cm => cm.fieldName === fieldName
        )?.value || '')
      // if (!fieldDef?.orgCustomFieldId) return '';
      return (
        form.preregisterVisitCustomFieldModels.find(
          cm => cm.fieldName === fieldName
        )?.value || ''
      );
    };
    return {
      ...form,
      fullName: getValueByFieldName('Full Name'),
      email: getValueByFieldName('Email'),
      companyName: getValueByFieldName('Company Name'),
      phoneNumber: getValueByFieldName('Phone Number'),
      scheduleCheckinDate: format(checkin, "yyyy-MM-dd'T'HH:mm:ss"),
      scheduleCheckoutDate: checkout ? format(checkout, "yyyy-MM-dd'T'HH:mm:ss") : null,
      preregisterVisitCustomFieldModels: customFields,
      checkinMethod: 'WEB',
    };
  };

  const handlePreScreen = async () => {
    setIsPreScreening(true);
    setPreScreenStatus('IDLE');
    try {
      const payload = preparePayload();
      const response = await preScreenSingle(payload);
      if (response.visitStatus === 'safe') {
        setPreScreenStatus('SAFE');
      } else {
        setPreScreenStatus('WATCHLIST_HIT');
        setMatchedRule(response.matchedRule?.keyName || 'Unknown rule');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreScreening(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = preparePayload();
      if (status === 'Create') {
        await createPreregistration(payload);
      } else if (visitId) {
        await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
      resetForm();
      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const repeatOptions = [
    { label: 'Does Not Repeat', value: 'NONE' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Annually', value: 'ANNUALLY' },
    { label: 'Weekdays (Mon–Fri)', value: 'WEEKDAY' },
  ];

  console.log("values >>", formik.values, formik.errors);
  const renderDynamicField = (field: any) => {
    const fieldId = field.orgCustomFieldId || field.fid || field.id;
    const fieldIndex = form.preregisterVisitCustomFieldModels?.findIndex(cm => cm.orgCustomFieldId === fieldId) ?? -1;
    const value = fieldIndex > -1 ? form.preregisterVisitCustomFieldModels?.[fieldIndex]?.value : '';
    const fieldError = (formik.errors.preregisterVisitCustomFieldModels as any)?.[fieldIndex]?.value;
    const isTouched = (formik.touched.preregisterVisitCustomFieldModels as any)?.[fieldIndex]?.value;

    if (field.name === 'Point of Entry') {
      // render poiint of entries and check if previsit stuff
      return (<div className="tw:space-y-1.5">
        <Select
          options={(poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
          value={form.poeId || ''}
          onChange={(e: any) => setFormField('poeId', e.target.value)}
          onBlur={formik.handleBlur}
          name="poeId"
          required={field.isMandatoryForPreregistration}
          label="Point of Entry"
          error={fieldError}
        />
        {formik.errors.poeId && formik.touched.poeId && (
          <p className="tw:text-xs tw:text-red-500">{formik.errors.poeId as string}</p>
        )}
      </div>)
    }
    if (field.name === 'Building') {
      return <div className="tw:space-y-1.5">
        <Select
          options={(destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || []}
          value={form.buildingId || ''}
          onChange={(e: any) => setFormField('buildingId', e.target.value)}
          onBlur={formik.handleBlur}
          name="buildingId"
          label="Building / Destination"
          required={
            field.isMandatoryForPreregistration}
          error={fieldError}

        />
        {formik.errors.buildingId && formik.touched.buildingId && (
          <p className="tw:text-xs tw:text-red-500">{formik.errors.buildingId as string}</p>
        )}
      </div>

    }
    if (field.name === 'Parking Lot') {
      return (<div className="tw:space-y-1.5">
        <Select
          options={(parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
          value={form.parkingLotId || ''}
          onChange={(e: any) => setFormField('parkingLotId', e.target.value)}
          onBlur={formik.handleBlur}
          name="parkingLotId"
          label="Parking Lot"
          required={
            field.isMandatoryForPreregistration}
          error={fieldError}

        />
        {formik.errors.parkingLotId && formik.touched.parkingLotId && (
          <p className="tw:text-xs tw:text-red-500">{formik.errors.parkingLotId as string}</p>
        )}
      </div>)
    }
    if (field.name === 'Host') {
      return (<div className="tw:space-y-1.5">
        <Label required={field.isMandatoryForPreregistration}>Host</Label>
        <SearchUserSelect
          options={hostOptions}
          onSearch={setHostSearch}
          onChange={(opt) => {
            setFormField('hostUserId', opt?.value || null);
            setFormField('hostEmail', (opt as any)?.email || '');
          }}
          placeholder="Search host"
        />
      </div>
      )

    }
    if (field.type === 'TEXT') {
      return (
        <Input
          label={field.name}
          placeholder={field.displayText}
          required={field.isMandatoryForPreregistration}
          error={fieldError}
          value={value}
          onChange={(e) => {
            // if (field.name === 'Full Name') {
            //   setFormField('fullName', e.target.value);
            // }
            // else if (field.name === 'Email') {
            //   setFormField('email', e.target.value);
            // }
            // else if (field.name === 'Company Name') {
            //   setFormField('companyName', e.target.value);
            // }
            // else if (field.name === 'Phone Number') {
            //   setFormField('phoneNumber', e.target.value);
            // }
            // else {
            setCustomField(fieldId, e.target.value, field.isMandatoryForPreregistration, field.name);
            // }
          }}
          onBlur={() => {
            // if(field.name ==='Full Name'){
            //   formik.setFieldTouched('fullName', true);
            // } else if(field.name ==='Email'){
            //   formik.setFieldTouched('email', true);
            // } else if(field.name ==='Company Name'){
            //   formik.setFieldTouched('companyName', true);
            // } else if(field.name ==='Phone Number'){
            //   formik.setFieldTouched('phoneNumber', true);
            // }
            // let allow to set on both levels
            //  else {
            formik.setFieldTouched(
              `preregisterVisitCustomFieldModels.${fieldIndex}.value`,
              true
            )

            // }

          }

          }
        />
      );
    }

    if (field.type === 'DROPDOWN') {
      return (
        <Select
          label={field.name}
          required={field.isMandatoryForPreregistration}
          options={
            field.options?.map((o: any) => ({
              label: o.label,
              value: o.value
            })) || []
          }
          value={value}
          onChange={(e) => setCustomField(fieldId, e.target.value, field.isMandatoryForPreregistration, field.name)}
          onBlur={() =>
            formik.setFieldTouched(
              `preregisterVisitCustomFieldModels.${fieldIndex}.value`,
              true
            )
          }
          error={fieldError}
        />
      );
    }

    if (field.type === 'RADIO') {
      return (
        <div className="tw:flex tw:gap-4">
          <Label>{field.name}     {field.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}</Label>
          {field.options?.map((o: any) => (
            <div key={o.value} className="tw:flex tw:items-center tw:gap-2">
              <Radio
                label={o.label}
                checked={value === o.value}
                required={field.isMandatoryForPreregistration}
                onChange={() => {
                  setCustomField(fieldId, o.value, field.isMandatoryForPreregistration, field.name);
                  formik.setFieldTouched(
                    `preregisterVisitCustomFieldModels.${fieldIndex}.value`,
                    true
                  );
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'DATEPICKER') {
      return (
        <Input
          type="date"
          label={field.name}
          required={field.isMandatoryForPreregistration}
          value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
          onChange={(e) => setCustomField(fieldId, e.target.value ? new Date(e.target.value).toISOString() : '', field.isMandatoryForPreregistration, field.name)}
          onBlur={() =>
            formik.setFieldTouched(
              `preregisterVisitCustomFieldModels.${fieldIndex}.value`,
              true
            )
          }
          error={fieldError}
        />
      );
    }

    // ✅ default fallback
    return (
      <Input
        type={field.type.toLowerCase()}
        placeholder={field.displayText}
        label={field.name}
        required={field.isMandatoryForPreregistration}
        value={value}
        onChange={(e) => setCustomField(fieldId, e.target.value, field.isMandatoryForPreregistration, field.name)}
        onBlur={() =>
          formik.setFieldTouched(
            `preregisterVisitCustomFieldModels.${fieldIndex}.value`,
            true
          )
        }
        error={fieldError}
      />

    );
  };



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
                    if (opt) {
                      const current = form.cohostUserIds;
                      if (!current.includes(opt.value)) {
                        setFormField('cohostUserIds', [...current, opt.value]);
                      }
                    }
                  }}
                  placeholder="Search co-hosts"
                />
              </div>
            </>
          )}
          {form.visitorTypeId && (
            <>
              <hr className="tw:border-gray-100" />

              {/* Dynamic Fields & Mega Location */}
              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                {(visitorTypeFields as any)?.fields
                  ?.filter(
                    (f: any) =>
                      f.isPreregistrationOnly

                  )
                  .map((field: any) => renderDynamicField(field))}

              </div>

              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                <Input
                  type="text"
                  name="groupName"
                  label="Group Name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <Input
                  name="internalNote"
                  label="Internal Note"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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

        </div>

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
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!formik.isValid || !form.visitorTypeId}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};