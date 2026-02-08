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

  // Stable initial values to prevent re-initialization loops
  const initialValues = React.useMemo(() => ({
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
    groupName: '',
    internalNote: '',
    notifyVisitFlag: true,
    notifyHostFlag: true,
    parentVisitId: undefined,
    cohostUserIds: [],
    preregisterVisitCustomFieldModels: [],
    shouldPrefill: true,
    poeId: '',
    buildingId: '',
    parkingLotId: '',
  }), []);

  const formik = useFormik<PreRegistrationForm>({
    initialValues,
    validationSchema: Yup.object({
      siteId: Yup.string().required('Location is required'),
      visitorTypeId: Yup.string().required('Visitor Type is required'),
      scheduleCheckinDate: Yup.date().required('Check-in Date is required'),
      poeId: Yup.string().nullable(),
      buildingId: Yup.string().nullable(),
      parkingLotId: Yup.string().nullable(),
      preregisterVisitCustomFieldModels: Yup.array().of(
        Yup.object().shape({
          name: Yup.string(),
          value: Yup.mixed().test('required', function (value) {
            const { isMandatoryForPreregistration, name } = this.parent as any;
            if (isMandatoryForPreregistration && (value === null || value === undefined || value === '')) {
              return this.createError({ message: `${name || 'Field'} is required` });
            }
            return true;
          }),
        })
      )
    }),
    onSubmit: async (values) => {
      // Logic handled in handleSave
    },
    enableReinitialize: true,
  });

  const form = formik.values;
  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);

  // Sync visitorTypeFields to Formik Values
  useEffect(() => {
    // Only proceed if we have field definitions
    if (visitorTypeFields?.fields) {
      if (!formik.values.visitorTypeId) {
        // If no visitor type selected, clear fields
        if (formik.values.preregisterVisitCustomFieldModels.length > 0) {
          formik.setFieldValue('preregisterVisitCustomFieldModels', []);
        }
        return;
      }

      const currentFields = formik.values.preregisterVisitCustomFieldModels;

      const newFields = visitorTypeFields.fields
        .filter((f: any) => f.isPreregistrationOnly)
        .map((f: any) => {
          // Try to map existing value by ID
          const existing = currentFields.find(
            (curr) => curr.orgCustomFieldId === (f.orgCustomFieldId || f.id)
          );

          return {
            name: f.name,
            orgCustomFieldId: f.orgCustomFieldId || f.id,
            visitTypeFieldId: f.id,
            // If existing value matches structure, keep it. Else default.
            value: existing ? existing.value : (f.defaultValue || ''),
            isMandatoryForPreregistration: f.isMandatoryForPreregistration,
            type: f.type,
            options: f.options,
            displayText: f.displayText
          };
        });

      // Deep compare structure to prevent infinite loop.

      const isStructureDifferent =
        newFields.length !== currentFields.length ||
        newFields.some((nf, idx) => nf.orgCustomFieldId !== currentFields[idx]?.orgCustomFieldId);

      if (isStructureDifferent) {
        formik.setFieldValue('preregisterVisitCustomFieldModels', newFields);
      }
    }
  }, [visitorTypeFields, formik.values.visitorTypeId]); // Dependencies: Data (stable usually) and visitorTypeId (stable across keystrokes)


  const lastLoadedId = React.useRef<string | undefined>(undefined);
  // Pre-fill on update
  useEffect(() => {
    if (existingVisit && lastLoadedId.current !== visitId) {
      const mappedCustomFields = existingVisit.preregisterVisitCustomFieldModels?.map((cf: any) => ({
        name: cf.name,
        orgCustomFieldId: cf.orgCustomFieldId,
        visitTypeFieldId: cf.visitTypeFieldId,
        value: cf.value,
        // For edit mode, we can relax mandatory check or fetch from defs if needed, 
        // generally existing data is valid.
        isMandatoryForPreregistration: false
      })) || [];

      formik.setValues({
        ...formik.initialValues, // Use the memoized initialValues as base
        ...existingVisit,
        id: visitId,
        scheduleCheckinDate: existingVisit.scheduleCheckinDate ? new Date(existingVisit.scheduleCheckinDate) : new Date(),
        scheduleCheckoutDate: existingVisit.scheduleCheckoutDate ? new Date(existingVisit.scheduleCheckoutDate) : null,
        notifyVisitFlag: existingVisit.notifyVisitFlag !== false,
        notifyHostFlag: existingVisit.notifyHostFlag !== false,
        cohostUserIds: existingVisit.cohosts?.map((c: any) => c.cohostUserId) || [],
        preregisterVisitCustomFieldModels: mappedCustomFields
      });
      lastLoadedId.current = visitId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingVisit, visitId]);

  const { data: visitorTypes } = useVisitorTypes(form.siteId);
  const visitorTypeOptions = visitorTypes?.results?.map((vt) => ({
    label: vt.visitorType,
    value: vt.id,
  })) || [];

  // Auto-select first visitor type if none selected
  useEffect(() => {
    if (visitorTypes?.results?.length && !form.visitorTypeId) {
      // Only set if we really have options and current value is empty
      // Also ensure we are not in an 'loading existing visit' state which might set it momentarily
      formik.setFieldValue('visitorTypeId', visitorTypes.results[0]?.id);
    }
  }, [visitorTypes, form.visitorTypeId, formik.setFieldValue]);

  // Auto-select first site if none selected (e.g. initial load)
  useEffect(() => {
    if (sites?.results && sites.results.length && !form.siteId) {
      formik.setFieldValue('siteId', sites.results[0]?.id);
    }
  }, [sites, form.siteId, formik.setFieldValue]);

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


  const setFormField = useCallback(
    <K extends keyof PreRegistrationForm>(field: K, value: PreRegistrationForm[K]) => {
      formik.setFieldValue(field, value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const resetForm = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return {
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
  };
};