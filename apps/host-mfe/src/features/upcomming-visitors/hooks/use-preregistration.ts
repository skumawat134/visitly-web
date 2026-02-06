// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields, usePreregistration } from './use-preregistration.queries';
import type { UserOption } from '@visitly/ui';
import { createPreregistration, updatePreregistration, preScreenSingle } from '../api/pre-registration.api';

export interface PreRegistrationForm {
  id?: string;
  siteId: string;
  visitorTypeId: string;
  scheduleCheckinDate: Date | null;
  scheduleCheckoutDate: Date | null;
  scheduleCheckinTimeOnly: string | null;
  scheduleCheckoutTimeOnly: string | null;
  recurrenceType: string;
  recurrenceEndDateOnly: Date | null;
  checkoutTimeOnly: string | null;
  hostUserId: string | null;
  hostEmail?: string;
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
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
  poeId?: string;
  buildingId?: string;
  parkingLotId?: string;
}

export const usePreRegistrationForm = (visitId?: string) => {
  const { data: sites } = useSites();
  const siteOptions = sites?.results?.map((site) => ({
    label: site.name,
    value: site.id,
  })) || [];

  const { data: existingVisit } = usePreregistration(visitId || '');

  const formik = useFormik<PreRegistrationForm>({
    initialValues: React.useMemo(() => ({
      siteId: '',
      visitorTypeId: '',
      scheduleCheckinDate: new Date(),
      scheduleCheckoutDate: null,
      scheduleCheckinTimeOnly: '00:00',
      scheduleCheckoutTimeOnly: null,
      recurrenceType: 'NONE',
      recurrenceEndDateOnly: null,
      checkoutTimeOnly: null,
      hostUserId: null,
      fullName: '',
      email: '',
      companyName: '',
      phoneNumber: '',
      groupName: '',
      internalNote: '',
      notifyVisitFlag: true,
      notifyHostFlag: true,
      parentVisitId: undefined,
      cohostUserIds: [],
      preregisterVisitCustomFieldModels: [],
      shouldPrefill: true,
    }), []),
    validationSchema: Yup.object({
      siteId: Yup.string().required('Location is required'),
      visitorTypeId: Yup.string().required('Visitor Type is required'),
      fullName: Yup.string().matches(/^[a-zA-Z\s]*$/, 'Invalid name').required('Full Name is required'),
      email: Yup.string().email('Invalid email'),
      scheduleCheckinDate: Yup.date().required('Check-in Date is required'),
      poeId: Yup.string().nullable(),
      buildingId: Yup.string().nullable(),
      parkingLotId: Yup.string().nullable(),
      preregisterVisitCustomFieldModels: Yup.array().of(
        Yup.object().shape({
          orgCustomFieldId: Yup.string(),
          value: Yup.string().test('is-required', 'Field is required', function (value) {
            const { orgCustomFieldId } = this.parent;
            const field = visitorTypeFields?.fields?.find((f: any) => f.orgCustomFieldId === orgCustomFieldId);
            if (field?.isMandatoryForPreregistration && !value) {
              return false;
            }
            return true;
          })
        })
      )
    }),
    onSubmit: async (values) => {
      // Logic handled in handleSave
    },
    enableReinitialize: true,
  });

  const form = formik.values;

  const lastLoadedId = React.useRef<string | undefined>(undefined);
  // Pre-fill on update
  useEffect(() => {
    if (existingVisit && lastLoadedId.current !== visitId) {
      formik.setValues({
        ...formik.initialValues,
        ...existingVisit,
        id: visitId,
        notifyVisitFlag: existingVisit.notifyVisitFlag !== false,
        notifyHostFlag: existingVisit.notifyHostFlag !== false,
        cohostUserIds: existingVisit.cohosts?.map((c: any) => c.cohostUserId) || [],
      });
      lastLoadedId.current = visitId;
    }
  }, [existingVisit, visitId, formik]);

  const { data: visitorTypes } = useVisitorTypes(form.siteId);
  const visitorTypeOptions = visitorTypes?.results?.map((vt) => ({
    label: vt.visitorType,
    value: vt.id,
  })) || [];

  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData } = useHosts(hostSearch, form.siteId);
  const hostOptions = hostsData?.results?.map((user: any) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} - ${user.email}`,
    email: user.email,
  })) ?? [];

  const [coHostSearch, setCoHostSearch] = React.useState('');
  const { data: coHostsData } = useCoHosts(coHostSearch, form.siteId);
  const coHostOptions = coHostsData?.results?.map((user: any) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} - ${user.email}`,
    email: user.email,
  })) ?? [];

  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);

  const setFormField = useCallback(
    <K extends keyof PreRegistrationForm>(field: K, value: PreRegistrationForm[K]) => {
      formik.setFieldValue(field, value);
    },
    [formik]
  );

  const setCustomField = useCallback((fieldId: string, value: any) => {
    formik.setFieldValue('preregisterVisitCustomFieldModels', (prev: any[]) => {
      const existing = prev.find((f) => f.orgCustomFieldId === fieldId);
      if (existing) {
        return prev.map((f) => (f.orgCustomFieldId === fieldId ? { ...f, value } : f));
      }
      return [...prev, { name: '', orgCustomFieldId: fieldId, visitTypeFieldId: '', value }];
    });
  }, [formik]);

  const resetForm = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return {
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
    visitorTypeFields,
  };
};