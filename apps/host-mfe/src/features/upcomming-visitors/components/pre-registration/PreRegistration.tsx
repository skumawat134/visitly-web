import { useEffect, useState } from "react";
import { usePreRegistrationForm } from "../../hooks/use-preregistration";
import { format } from "date-fns";
import { Button, cn, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Radio, SearchUserSelect, Select } from "@visitly/ui";
import { CalendarIcon } from "lucide-react";

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
  const { form, setFormField, setCustomField, resetForm, siteOptions, visitorTypeOptions, hostOptions, setHostSearch, coHostOptions, setCoHostSearch, visitorTypeFields } = usePreRegistrationForm();

  const [timeOptions, setTimeOptions] = useState<{ label: string; value: string }[]>([]);


  // ── Fetch Sites & Visitor Types ─────────────────────────────────────────────
  // useEffect(() => {
  //   if (!isOpen) return;

    // if (form.siteId) {
      // api.get('/visitor-types', { siteId: form.siteId, status: 'ACTIVE' }).then((data) => {
      // setVisitorTypes(data.results || []);
      // });
    // }
  // }, [isOpen, form.siteId]);

  // ── Fetch Pre-registration data on Update ───────────────────────────────────
  // useEffect(() => {
  //   if (status === 'Update' && visitId && isOpen) {
      // api.get(`/preregistrations/${visitId}`).then((data) => {
      //   // Prefill form
      //   setFormField('siteId', data.siteId);
      //   setFormField('visitorTypeId', data.visitorTypeId);
      //   setFormField('scheduleCheckinDate', data.scheduleCheckinDate ? new Date(data.scheduleCheckinDate) : null);
      //   setFormField('scheduleCheckoutDate', data.scheduleCheckoutDate ? new Date(data.scheduleCheckoutDate) : null);
      //   setFormField('recurrenceType', data.recurrenceType || 'NONE');
      //   setFormField('hostUserId', data.hostUserId);
      //   setFormField('groupName', data.groupName);
      //   setFormField('internalNote', data.internalNote);
      //   setFormField('notifyVisitFlag', !!data.notifyVisitFlag);
      //   setFormField('notifyHostFlag', !!data.notifyHostFlag);
      //   setFormField('cohostUserIds', data.cohostUserIds || []);
      //   // Custom fields prefill would go here
      // });
  //   } else if (status === 'Create') {
  //     resetForm();
  //   }
  // }, [status, visitId, isOpen, setFormField, resetForm]);

  // ── Generate Time Options (15-min intervals) ────────────────────────────────
  // useEffect(() => {
  //   const opts: typeof timeOptions = [];
  //   for (let h = 0; h < 24; h++) {
  //     for (let m = 0; m < 60; m += 15) {
  //       const hour = h % 12 || 12;
  //       const ampm = h < 12 ? 'AM' : 'PM';
  //       const hh = h.toString().padStart(2, '0');
  //       const mm = m.toString().padStart(2, '0');
  //       opts.push({ label: `${hour}:${mm} ${ampm}`, value: `${hh}:${mm}` });
  //     }
  //   }
  //   setTimeOptions(opts);
  // }, []);

  // ── Form Submit ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload = {
      ...form,
      scheduleCheckinDate: form.scheduleCheckinDate
        ? format(form.scheduleCheckinDate, "yyyy-MM-dd'T'HH:mm:ss")
        : null,
      scheduleCheckoutDate: form.scheduleCheckoutDate
        ? format(form.scheduleCheckoutDate, "yyyy-MM-dd'T'HH:mm:ss")
        : null,
      // preregisterVisitCustomFieldModels: visitorTypeFields
      //   .filter((f) => f.isPreregistrationOnly)
      //   .map((f) => ({
      //     name: f.name,
      //     orgCustomFieldId: f.orgCustomFieldId!,
      //     visitTypeFieldId: f.id,
      //     value: f.value ?? '',
      //   })),
      checkinMethod: 'WEB',
    };

    try {
      if (status === 'Create') {
        // await api.post('/preregistrations', payload);
        // toast.success('Visit added successfully');
      } else if (visitId) {
        // await api.patch(`/preregistrations/${visitId}?updateType=SELECTED_VISIT`, payload);
        // toast.success('Visit updated successfully');
      }
      resetForm();
      onClose();
    } catch (err) {
      // toast.error('Failed to save visit');
      console.error(err);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  console.log('Form state', siteOptions);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="tw:max-w-2xl tw:p-0 tw:overflow-hidden tw:rounded-xl tw:shadow-xl"
        style={{ "width": "1112px", "maxWidth": "unset" }}
      >
        {/* Header */}
        <DialogHeader className="tw:flex tw:flex-row tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-400">
          <DialogTitle className="tw:text-lg tw:font-semibold">
            Pre-Registration
          </DialogTitle>
        </DialogHeader>
        {/* Body */}
        <div className="tw:flex-1 tw:overflow-y-auto tw:py-3">
          {/* Form */}
          <form className="tw:px-6 tw:py-6  md:tw:grid-cols-2 tw:gap-6 tw:grid tw:grid-cols-2" >

            {/* Site */}
            <div className="tw-space-y-1.5">
              <label className="tw:text-sm tw:font-medium">Site</label>
              <Select
                value={form.siteId}
                options={siteOptions ?? []}
                onChange={(e) => setFormField("siteId", e.target.value)}
              />
            </div>

            {/* Visitor Type */}
            <div className="tw-space-y-1.5">
              <label className="tw:text-sm tw:font-medium">Visitor Type</label>
              <Select
                value={form.visitorTypeId}
                options={visitorTypeOptions ?? []}
                disabled={!form.siteId}
                onChange={(e) => setFormField("visitorTypeId", e.target.value)}
              />
            </div>

            {/* Host – full width */}
            <div className="tw-space-y-1.5 md:tw:col-span-2">
              <label className="tw:text-sm tw:font-medium">Host</label>
              <SearchUserSelect
                options={hostOptions}
                onChange={(option) => {
                  setFormField('hostUserId', option?.value || null);
                }}
                onSearch={setHostSearch}
                placeholder="Search host by name or email"
              />

            </div>
            <div className="tw-space-y-1.5 md:tw:col-span-2">
              <label className="tw:text-sm tw:font-medium">Co Host</label>
              <SearchUserSelect
                options={coHostOptions}
                onChange={(option) => {
                  if (option?.value) {
                    setFormField('cohostUserIds', [option.value]);
                  }
                }}
                onSearch={setCoHostSearch}
                placeholder="Search co-host by name or email"
              />

            </div>

            {visitorTypeFields && visitorTypeFields.fields?.filter((field) => field.isPreregistrationOnly)
              .map((field) => (
                <div
                  // key={field.fid}
                  className={cn(
                    'tw:space-y-1.5',
                    // Full width for some fields if needed
                    ['Point of Entry', 'Building', 'Parking Lot'].includes(field.name) && 'md:tw:col-span-2'
                  )}
                >
                  <Label className="tw:text-sm tw:font-medium">
                    {field.name}
                    {field.isMandatoryForPreregistration && <span className="tw:text-red-600">*</span>}
                  </Label>

                  {/* ── TEXT ────────────────────────────────────────────────────────────── */}
                  {field.type === 'TEXT' && (
                    <Input
                      // value={field.value || ''}
                      onChange={(e) => {
                        // Update local field + form state
                        // setVisitorTypeFields((prev) =>
                        //   prev.map((f) => (f.fid === field.fid ? { ...f, value: e.target.value } : f))
                        // );
                        // setCustomField(field.orgCustomFieldId || field.fid, e.target.value);
                      }}
                      // disabled={status === 'Update' && isPrefilledVisit}
                      placeholder={field.displayText || field.name}
                      className={cn(
                        'tw:w-full',
                        field.isMandatoryForPreregistration && 'tw:border-red-500'
                      )}
                    />
                  )}

                  {/* ── NUMBER (Phone) ──────────────────────────────────────────────────── */}
                  {field.type === 'NUMBER' && (
                    <Input
                      type="tel"
                      // value={field.value || ''}
                      onChange={(e) => {
                        // setVisitorTypeFields((prev) =>
                        //   prev.map((f) => (f.fid === field.fid ? { ...f, value: e.target.value } : f))
                        // );
                        // setCustomField(field.orgCustomFieldId || field.fid, e.target.value);
                      }}
                      // disabled={status === 'Update' && isPrefilledVisit}
                      placeholder={field.displayText || field.name}
                    />
                  )}

                  {/* ── DROPDOWN ────────────────────────────────────────────────────────── */}
                  {field.type === 'DROPDOWN' && (
                    <>
                      <Select
                        options={field.options?.map((opt) => ({ label: opt.label, value: opt.value })) || []}
                        onChange={(val) => {
                          // setVisitorTypeFields((prev) =>
                          //   prev.map((f) => (f.fid === field.fid ? { ...f, value: val } : f))
                          // );
                          // setCustomField(field.orgCustomFieldId || field.fid, val);
                          // Optional: logModel-like side effect
                          if (field.name === 'Parking Lot') {
                            // const selected = getDropdownOptions(field.name)?.find((o) => o.value === val);
                            // if (selected) {
                            // Update spots info if needed
                            // }
                          }
                        }}
                        disabled={status === 'Update'}
                      >

                      </Select>

                      {/* Parking Lot spots info */}
                      {/* {field.name === 'Parking Lot' && field.availableSpots !== undefined && (
                      <div className="tw:mt-1 tw:text-sm tw:text-gray-600">
                        <span className="tw:bg-green-100 tw:px-2 tw:py-0.5 tw:rounded">
                          {field.availableSpots} Available
                        </span>
                        <span className="tw:ml-2 tw:bg-gray-100 tw:px-2 tw:py-0.5 tw:rounded">
                          {field.totalSpots} Total
                        </span>
                      </div>
                    )} */}
                    </>
                  )}

                  {/* ── DATEPICKER ──────────────────────────────────────────────────────── */}
                  {field.type === 'DATEPICKER' && (
                    <div className="tw:relative">
                      <Input
                        type="date"
                        // value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          // setVisitorTypeFields((prev) =>
                          //   prev.map((f) => (f.fid === field.fid ? { ...f, value: date } : f))
                          // );
                          // setCustomField(field.orgCustomFieldId || field.fid, date);
                        }}
                        // disabled={status === 'Update' && isPrefilledVisit}
                        className="tw:w-full"
                        rightIcon={<CalendarIcon className="tw:h-4 tw:w-4" />}
                      />
                    </div>
                  )}
                  {field.type === 'RADIO' && (
                    <div className="tw:flex tw:flex-wrap tw:gap-4">
                      {field.options?.map((opt) => (
                        <div key={opt.value} className="tw:flex tw:items-center tw:gap-2">
                          <Radio
                            id={`${field.id}-${opt.value}`}
                            name={opt.label}
                            value={opt.value}
                            // checked={fieldValue === opt.value}
                            onChange={() => {
                              // setVisitorTypeFields((prev) =>
                              //   prev.map((f) => (f.fid === field.fid ? { ...f, value: opt.value } : f))
                              // );
                              // setCustomField(fieldId, opt.value);
                            }}
                            // disabled={isDisabled}
                            className="tw:h-4 tw:w-4"
                          />
                          {/* <Label htmlFor={`${field.fid}-${opt.value}`}>{opt.label}</Label> */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </form>
        </div>
        {/* Footer */}
        <DialogFooter className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:border-gray-400">
          <div className="tw:flex tw:justify-end tw:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="tw:px-5 tw:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="tw:px-6 tw:text-sm tw:font-semibold"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  );
};