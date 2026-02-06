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

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Create' | 'Update';
  visitId?: string;
}

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

    return {
      ...form,
      fullName: form.fullName || fullNameField?.value || '',
      email: form.email || emailField?.value || '',
      companyName: form.companyName || companyField?.value || '',
      phoneNumber: form.phoneNumber || phoneField?.value || '',
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="tw:max-w-[1112px] tw:p-0 tw:overflow-hidden tw:rounded-xl"
      >
        <DialogHeader className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200">
          <DialogTitle className="tw:text-xl tw:font-bold">
            Pre-Registration
          </DialogTitle>
        </DialogHeader>

        <div className="tw:p-6 tw:space-y-6 tw:max-h-[80vh] tw:overflow-y-auto">
          <div className="tw:grid tw:grid-cols-2 tw:gap-6">
            {/* Left Column: Core Selection & Contacts */}
            <div className="tw:space-y-4">
              <div className="tw:space-y-1.5">
                <Label className="tw:required">Location</Label>
                <Select
                  value={form.siteId}
                  options={siteOptions}
                  onChange={(e) => {
                    setFormField('siteId', e.target.value);
                    setFormField('visitorTypeId', '');
                  }}
                />
              </div>

              {form.siteId && (
                <div className="tw:space-y-1.5">
                  <Label className="tw:required">Visitor Type</Label>
                  <Select
                    value={form.visitorTypeId}
                    options={visitorTypeOptions}
                    onChange={(e) => setFormField('visitorTypeId', e.target.value)}
                  />
                </div>
              )}

              {form.visitorTypeId && (
                <>
                  <div className="tw:space-y-1.5">
                    <Label>Host</Label>
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
            </div>

            {/* Right Column: Date & Time */}
            {form.visitorTypeId && (
              <div className="tw:space-y-4">
                <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                  <div className="tw:space-y-1.5">
                    <Label className="tw:required">Check-in Date</Label>
                    <Input
                      type="date"
                      value={form.scheduleCheckinDate ? format(form.scheduleCheckinDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormField('scheduleCheckinDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                  <div className="tw:space-y-1.5">
                    <Label className="tw:required">Check-in Time</Label>
                    <Select
                      value={form.scheduleCheckinTimeOnly || ''}
                      options={timeOptions}
                      onChange={(e) => setFormField('scheduleCheckinTimeOnly', e.target.value)}
                    />
                  </div>
                </div>

                <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                  <div className="tw:space-y-1.5">
                    <Label>Check-out Date</Label>
                    <Input
                      type="date"
                      value={form.scheduleCheckoutDate ? format(form.scheduleCheckoutDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormField('scheduleCheckoutDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                  <div className="tw:space-y-1.5">
                    <Label>Check-out Time</Label>
                    <Select
                      value={form.scheduleCheckoutTimeOnly || ''}
                      options={timeOptions}
                      onChange={(e) => setFormField('scheduleCheckoutTimeOnly', e.target.value)}
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
            )}
          </div>

          {form.visitorTypeId && (
            <>
              <hr className="tw:border-gray-100" />

              {/* Dynamic Fields & Mega Location */}
              <div className="tw:grid tw:grid-cols-2 tw:gap-6">
                {(visitorTypeFields as any)?.fields?.filter((f: any) => f.isPreregistrationOnly).map((field: any) => {
                  const fieldId = field.orgCustomFieldId || field.fid || field.id;
                  const fieldIndex = form.preregisterVisitCustomFieldModels?.findIndex(cm => cm.orgCustomFieldId === fieldId) ?? -1;
                  const value = fieldIndex > -1 ? form.preregisterVisitCustomFieldModels?.[fieldIndex]?.value : '';
                  const fieldError = (formik.errors.preregisterVisitCustomFieldModels as any)?.[fieldIndex]?.value;
                  const isTouched = (formik.touched.preregisterVisitCustomFieldModels as any)?.[fieldIndex]?.value;
                  console.log("fieldError" , formik.errors, "isTouched", isTouched);
                  return (
                    <div key={fieldId} className="tw:space-y-1.5">
                      <Label className={cn(field.isMandatoryForPreregistration && "tw:required")}>
                        {field.name}
                      </Label>
                      {field.type === 'TEXT' && (
                        <Input
                          placeholder={field.displayText}
                          value={value}
                          onChange={(e) => setCustomField(fieldId, e.target.value)}
                          onBlur={() => formik.setFieldTouched(`preregisterVisitCustomFieldModels.${fieldIndex}.value`, true)}
                            
                          />
                      )}
                      {field.type === 'DROPDOWN' && (
                        <Select
                          options={field.options?.map((o: any) => ({ label: o.label, value: o.value })) || []}
                          value={value}
                          onChange={(e) => setCustomField(fieldId, e.target.value)}
                          onBlur={() => formik.setFieldTouched(`preregisterVisitCustomFieldModels.${fieldIndex}.value`, true)}
                        />
                      )}
                      {field.type === 'RADIO' && (
                        <div className="tw:flex tw:gap-4">
                          {field.options?.map((o: any) => (
                            <div key={o.value} className="tw:flex tw:items-center tw:gap-2">
                              <Radio
                                checked={value === o.value}
                                onChange={() => {
                                  setCustomField(fieldId, o.value);
                                  formik.setFieldTouched(`preregisterVisitCustomFieldModels.${fieldIndex}.value`, true);
                                }}
                              />
                              <Label>{o.label}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                      {fieldError && isTouched && (
                        <p className="tw:text-xs tw:text-red-500">{fieldError}</p>
                      )}
                    </div>
                  );
                })}

                <div className="tw:space-y-1.5">
                  <Label>Point of Entry</Label>
                  <Select
                    options={(poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
                    value={form.poeId || ''}
                    onChange={(e: any) => setFormField('poeId', e.target.value)}
                    onBlur={formik.handleBlur}
                    name="poeId"
                  />
                  {formik.errors.poeId && formik.touched.poeId && (
                    <p className="tw:text-xs tw:text-red-500">{formik.errors.poeId as string}</p>
                  )}
                </div>
                <div className="tw:space-y-1.5">
                  <Label>Parking Lot</Label>
                  <Select
                    options={(parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || []}
                    value={form.parkingLotId || ''}
                    onChange={(e: any) => setFormField('parkingLotId', e.target.value)}
                    onBlur={formik.handleBlur}
                    name="parkingLotId"
                  />
                  {formik.errors.parkingLotId && formik.touched.parkingLotId && (
                    <p className="tw:text-xs tw:text-red-500">{formik.errors.parkingLotId as string}</p>
                  )}
                </div>
                <div className="tw:space-y-1.5">
                  <Label>Building / Destination</Label>
                  <Select
                    options={(destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || []}
                    value={form.buildingId || ''}
                    onChange={(e: any) => setFormField('buildingId', e.target.value)}
                    onBlur={formik.handleBlur}
                    name="buildingId"
                  />
                  {formik.errors.buildingId && formik.touched.buildingId && (
                    <p className="tw:text-xs tw:text-red-500">{formik.errors.buildingId as string}</p>
                  )}
                </div>
              </div>

              <div className="tw:flex tw:items-center tw:justify-between tw:bg-gray-50 tw:p-4 tw:rounded-lg">
                <div className="tw:flex tw:items-center tw:gap-6">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Checkbox
                      checked={form.notifyHostFlag}
                      onChange={(e: any) => setFormField('notifyHostFlag', e.target.checked)}
                    />
                    <Label>Notify Host</Label>
                  </div>
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Checkbox
                      checked={form.notifyVisitFlag}
                      onChange={(e: any) => setFormField('notifyVisitFlag', e.target.checked)}
                    />
                    <Label>Notify Visitor</Label>
                  </div>
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Checkbox
                      checked={form.shouldPrefill}
                      onChange={(e: any) => setFormField('shouldPrefill', e.target.checked)}
                    />
                    <Label>Allow Pre-fill</Label>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={handlePreScreen}
                  isLoading={isPreScreening}
                >
                  Pre-screen
                </Button>
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

        <DialogFooter className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
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