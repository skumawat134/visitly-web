// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields } from './use-preregistration.queries';
import type { UserOption } from '@visitly/ui';

export interface PreRegistrationForm {
  siteId: string;
  visitorTypeId: string;
  scheduleCheckinDate: Date | null;
  scheduleCheckoutDate: Date | null;
  recurrenceType: string;
  recurrenceEndDateOnly: Date | null;
  checkoutTimeOnly: string | null;
  hostUserId: string | null;
  groupName: string;
  internalNote: string;
  notifyVisitFlag: boolean;
  notifyHostFlag: boolean;
  parentVisitId?: string;
  cohostUserIds: string[];
  preregisterVisitCustomFieldModels: Array<{
    name: string;
    orgCustomFieldId: string;
    visitTypeFieldId: string;
    value: any;
  }>;
  shouldPrefill: boolean;
}
export const usePreRegistrationForm = (initialData?: Partial<PreRegistrationForm>) => {
  const { data: sites, isLoading } = useSites();
  const siteOptions = sites?.results?.map((site) => ({
    label: site.name,
    value: site.id,
  }));
  const [selectedCoHosts, setSelectedCoHosts] = React.useState<UserOption[]>([]);
  const [selectedHost, setSelectedHost] = React.useState<UserOption | null>(null);
  const formik = useFormik<PreRegistrationForm>({
    initialValues: {
      siteId: '',
      visitorTypeId: '',
      scheduleCheckinDate: null,
      scheduleCheckoutDate: null,
      recurrenceType: 'NONE',
      recurrenceEndDateOnly: null,
      checkoutTimeOnly: null,
      hostUserId: null,
      groupName: '',
      internalNote: '',
      notifyVisitFlag: true,
      notifyHostFlag: true,
      parentVisitId: undefined,
      cohostUserIds: [],
      preregisterVisitCustomFieldModels: [],
      shouldPrefill: true,
      ...initialData,
    },
    // validationSchema: Yup.object({...}),
    onSubmit: () => {
      // We don't use Formik's submit here — component will call handleSubmit
    },
    enableReinitialize: true, // important when initialData changes
  });
  const form = formik.values;
  const { data: visitorTypes } = useVisitorTypes(form.siteId);
  const visitorTypeOptions = visitorTypes?.results.map((vt) => ({
    label: vt.visitorType,
    value: vt.id,
  }));
  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData, isLoading: hostsLoading } = useHosts(hostSearch, form.siteId);
  const hostOptions = hostsData?.results?.map((user: any) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} - ${user.email}`,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })) ?? [];
  const [coHostSearch, setCoHostSearch] = React.useState('');
  const { data: coHostsData, isLoading: coHostsLoading } =
    useCoHosts(coHostSearch, form.siteId);
  const coHostOptions =
    coHostsData?.results?.map((user: any) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.email}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })) ?? [];
  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);

  const setFormField = useCallback(
    <K extends keyof PreRegistrationForm>(field: K, value: PreRegistrationForm[K]) => {
      formik.setFieldValue(field, value);
    },
    [formik]
  );
  // Speial setter for custom fields (preregisterVisitCustomFieldModels)
  const setCustomField = useCallback((fieldId: string, value: any) => {
    formik.setFieldValue('preregisterVisitCustomFieldModels', (prev: any[]) => {
      const existing = prev.find((f) => f.orgCustomFieldId === fieldId);
      let updated = [...prev];

      if (existing) {
        updated = updated.map((f) =>
          f.orgCustomFieldId === fieldId ? { ...f, value } : f
        );
      } else {
        updated.push({
          name: '',
          orgCustomFieldId: fieldId,
          visitTypeFieldId: '',
          value,
        });
      }

      return updated;
    });
  }, [formik]);

  // Reset form (same API as before)
  const resetForm = useCallback(() => {
    formik.resetForm({
      values: {
        siteId: '',
        visitorTypeId: '',
        scheduleCheckinDate: null,
        scheduleCheckoutDate: null,
        recurrenceType: 'NONE',
        recurrenceEndDateOnly: null,
        checkoutTimeOnly: null,
        hostUserId: null,
        groupName: '',
        internalNote: '',
        notifyVisitFlag: true,
        notifyHostFlag: true,
        parentVisitId: undefined,
        cohostUserIds: [],
        preregisterVisitCustomFieldModels: [],
        shouldPrefill: true,
      },
    });
  }, [formik]);
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (key in form) {
          setFormField(key as keyof PreRegistrationForm, value);
        }
      });
    }
  }, [initialData, setFormField]);

  return {
    form,
    setFormField,
    setCustomField,
    resetForm,
    isSubmitting: formik.isSubmitting,
    isValid: formik.isValid,
    dirty: formik.dirty,
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    setFieldValue: formik.setFieldValue,
    handleSubmit: formik.handleSubmit,
    siteOptions,
    visitorTypeOptions,
    setHostSearch,
    hostOptions,
    coHostOptions,
    setCoHostSearch,
    selectedCoHosts, setSelectedCoHosts,
    selectedHost, setSelectedHost,
    visitorTypeFields
  };
};