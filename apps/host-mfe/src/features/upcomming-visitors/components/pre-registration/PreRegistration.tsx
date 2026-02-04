// features/pre-registration/components/PreRegistrationModal.tsx
import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Input,
  Checkbox,
  cn,
} from '@visitly/ui';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
// import { usePreRegistrationStore } from '../store/preRegistrationStore';
import { useSites, useVisitorTypes } from '../../hooks/use-preregistration.queries';
import { usePreRegistrationForm } from '../../hooks/use-preregistration';
import { VisitorTypeSelect } from './VisitorTypeSelect';
// import { VisitorTypeSelect } from './VisitorTypeSelect';
// import { HostSelect } from './HostSelect';
// import other sub-components as needed: CoHostSelect, DateTimePicker, CustomFieldsRenderer, etc.

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Create' | 'Update';
  initialData?: any;
  visitId?: string;
}

// Basic validation schema (expand as needed)
const validationSchema = Yup.object({
  siteId: Yup.string().required('Site is required'),
  visitorTypeId: Yup.string().required('Visitor Type is required'),
  scheduleCheckinDate: Yup.date().required('Check-in Date is required').nullable(),
  hostUserId: Yup.string().when('visitorTypeId', {
    is: (val) => val ,
    then: (schema) => schema.required('Host is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  // Add more fields: email, fullName, recurrenceType, etc.
});

export const PreRegistrationModal = ({
  isOpen,
  onClose,
  status,
  initialData,
  visitId,
}: PreRegistrationModalProps) => {
  const { form, setFormField, resetForm } = usePreRegistrationForm();

  const { data: sites = [] } = useSites();
  const { data: visitorTypes = [], isLoading: typesLoading } = useVisitorTypes(form.siteId);

//   const { mutate: createVisit } = useCreatePreRegistration();
//   const { mutate: updateVisit } = useUpdatePreRegistration(visitId!);

  // Initial values from store or initialData
  const initialValues = {
    siteId: form.siteId || '',
    visitorTypeId: form.visitorTypeId || '',
    scheduleCheckinDate: form.scheduleCheckinDate || null,
    hostUserId: form.hostUserId || null,
    notifyHostFlag: form.notifyHostFlag ?? true,
    notifyVisitFlag: form.notifyVisitFlag ?? true,
    // ... add all other fields
  };

  useEffect(() => {
    if (status === 'Create') {
      resetForm();
    } else if (initialData) {
      // Prefill from initialData / API response
      Object.entries(initialData).forEach(([key, value]) => {
        if (key in initialValues) {
          setFormField(key as keyof typeof form, value);
        }
      });
    }
  }, [status, initialData]);

  const handleSubmit = (values: typeof initialValues, actions: FormikHelpers<typeof initialValues>) => {
    const payload = {
      ...form,
      ...values,
      // Transform dates if needed
      scheduleCheckinDate: values.scheduleCheckinDate ? format(values.scheduleCheckinDate, "yyyy-MM-dd'T'HH:mm:ss") : null,
      // Add custom fields, cohosts, etc.
    };

    // if (status === 'Create') {
    //   createVisit(payload, {
    //     onSuccess: () => {
    //       actions.setSubmitting(false);
    //       onClose();
    //     },
    //     onError: () => actions.setSubmitting(false),
    //   });
    // } else {
    //   updateVisit(payload, {
    //     onSuccess: () => {
    //       actions.setSubmitting(false);
    //       onClose();
    //     },
    //     onError: () => actions.setSubmitting(false),
    //   });
    // }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="tw:max-w-5xl tw:p-0 tw:overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="tw:flex-row tw:items-center tw:justify-between tw:px-8 tw:py-5 tw:border-b tw:border-gray-400">
          <DialogTitle className="tw:text-xl">
            {status === 'Create' ? 'Create Pre-Registration' : 'Update Pre-Registration'}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="tw:flex-1 tw:overflow-y-auto tw:px-8 tw:py-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize // important when pre-filling from props/store
          >
            {({ values, setFieldValue, isSubmitting, dirty }) => (
              <Form className="tw:space-y-8">
                {/* Grid layout for main fields */}
                <div className="tw:grid tw:grid-cols-2 tw:gap-8">
                  {/* Site */}
                  <div>
                    <Label className="tw:mb-1.5">Site</Label>
                    <Field
                      as="select"
                      name="siteId"
                      className={cn(
                        "tw:w-full tw:rounded tw:border tw:border-gray-300 tw:px-3 tw:py-2 tw:text-sm",
                        "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500"
                      )}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setFieldValue('siteId', e.target.value);
                        setFormField('siteId', e.target.value);
                      }}
                    >
                      <option value="">Select Site</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="siteId" component="div" className="tw:text-red-600 tw:text-xs tw:mt-1" />
                  </div>

                  {/* Visitor Type */}
                  <div>
                    <Label className="tw:mb-1.5">Visitor Type</Label>
                    <VisitorTypeSelect
                      value={values.visitorTypeId}
                      onChange={(id) => {
                        setFieldValue('visitorTypeId', id);
                        setFormField('visitorTypeId', id);
                      }}
                      visitorTypes={visitorTypes}
                      loading={typesLoading}
                    />
                    <ErrorMessage name="visitorTypeId" component="div" className="tw:text-red-600 tw:text-xs tw:mt-1" />
                  </div>
                </div>

                {/* Date Pickers (example) */}
                <div className="tw:grid tw:grid-cols-2 tw:gap-8">
                  <div>
                    <Label>Check-in Date</Label>
                    {/* Use your DatePicker component or shadcn Calendar */}
                    {/* Example placeholder */}
                    <Input
                      type="date"
                      value={values.scheduleCheckinDate ? format(values.scheduleCheckinDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        setFieldValue('scheduleCheckinDate', date);
                        setFormField('scheduleCheckinDate', date);
                      }}
                    />
                  </div>

                  {/* Add checkout date, time pickers, etc. */}
                </div>

                {/* Host / Co-Host / Custom Fields / Recurrence / Notifications */}
                {/* ... render HostSelect, CoHostSelect, dynamic custom fields, etc. */}

                {/* Example Notification Flags */}
                <div className="tw:space-y-4">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Checkbox
                      checked={values.notifyHostFlag}
                      onChange={(checked) => {
                        setFieldValue('notifyHostFlag', !!checked);
                        setFormField('notifyHostFlag', !!checked);
                      }}
                    />
                    <Label htmlFor="notifyHost">Notify Host</Label>
                  </div>

                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Checkbox
                      checked={values.notifyVisitFlag}
                      onChange={(checked) => {
                        setFieldValue('notifyVisitFlag', !!checked);
                        setFormField('notifyVisitFlag', !!checked);
                      }}
                    />
                    <Label htmlFor="notifyVisit">Notify Visitor</Label>
                  </div>
                </div>

                {/* Submit button is in footer */}
              </Form>
            )}
          </Formik>
        </div>

        {/* Footer */}
        <DialogFooter className="tw:px-8 tw:py-6 tw:border-t tw:border-gray-400">
          <div className="tw:flex tw:justify-end tw:items-center tw:gap-4">
            <Button
              onClick={onClose}
              className="tw:px-6 tw:py-2.5 tw:text-sm tw:font-bold tw:text-slate-500 tw:rounded-lg"
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="pre-registration-form" // if you want to use form id
              className="tw:px-10 tw:py-2.5 tw:text-white tw:text-sm tw:font-bold tw:rounded-lg"
            //   disabled={isSubmitting}
            >
              {status === 'Create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};