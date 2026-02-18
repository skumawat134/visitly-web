// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields, usePreregistration, usePointOfEntry, useParkingLot, useDestination } from './use-preregistration.queries';
import { createPreregistration, updatePreregistration, preScreenSingle } from '../api/pre-registration.api';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export interface PreRegistrationForm {
  id?: string;
  siteId: string;
  visitorTypeId: string;
  scheduleCheckinDate: string | Date | null;
  scheduleCheckoutDate: string | Date | null;
  scheduleCheckinTimeOnly: string | null;
  scheduleCheckoutTimeOnly: string | null;
  recurrenceType: string;
  recurrenceEndDateOnly: string | null;
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
    isMandatoryForPreregistration?: boolean;
    type?: string;
    options?: any;
    displayText?: string;
  }>;
  shouldPrefill: boolean;
  poeId?: string;
  buildingId?: string;
  parkingLotId?: string;
}

export const usePreRegistrationForm = (visitId?: string, onClose?: () => void, status?: 'Create' | 'Update') => {
  const { data: sites } = useSites();
  const siteOptions = [
    { label: 'Select Location', value: '' },
    ...(sites?.results?.map((site) => ({
      label: site.name,
      value: site.id,
    })) || [])
  ];

  const { data: existingVisit } = usePreregistration(visitId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const initialValues = React.useMemo(() => ({
    siteId: '',
    visitorTypeId: '',
    scheduleCheckinDate: new Date(),
    scheduleCheckoutDate: null,
    scheduleCheckinTimeOnly: '',
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

  const [isPreScreening, setIsPreScreening] = useState(false);
  const [preScreenStatus, setPreScreenStatus] = useState<'IDLE' | 'SAFE' | 'WATCHLIST_HIT'>('IDLE');
  const queryClient = useQueryClient();
  const [matchedRule, setMatchedRule] = useState('');

  // ─── Validation Schemas ───

  // Step 1: Where & When
  const step1Schema = Yup.object({
    siteId: Yup.string().required('Location is required'),
    visitorTypeId: Yup.string().required('Visitor Type is required'),
    scheduleCheckinDate: Yup.date().required('Check-in Date is required'),
    scheduleCheckinTimeOnly: Yup.string().required('Check-in Time is required'),
  });

  // Step 2: Who is visiting? (Identity + Dynamic Fields)
  const step2Schema = Yup.object({
    preregisterVisitCustomFieldModels: Yup.array().of(
      Yup.object().shape({
        name: Yup.string(),
        value: Yup.mixed().test('required', function (value) {
          const { isMandatoryForPreregistration, name } = this.parent as any;
          // Identity fields are mandatory in Step 2
          if (name === 'Full Name' || name === 'Email') {
            if (value === null || value === undefined || value === '') {
              return this.createError({ message: `${name} is required` });
            }
          }
          // Dynamic fields mandatory check
          if (isMandatoryForPreregistration && (value === null || value === undefined || value === '')) {
            return this.createError({ message: `${name || 'Field'} is required` });
          }
          return true;
        }),
      })
    )
  });

  // Step 3: Review & Confirm (Extra Details)
  const step3Schema = Yup.object({
    hostUserId: Yup.string().nullable(), // Host selection might be optional depending on org settings, but we'll leave it as is
    groupName: Yup.string().nullable(),
    internalNote: Yup.string().nullable(),
  });

  const formik = useFormik<PreRegistrationForm>({
    initialValues,
    validationSchema: step1Schema.concat(step2Schema).concat(step3Schema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsSaving(true);
        const payload = preparePayload();
        if (status === 'Create') {
          await createPreregistration(payload);
        } else if (visitId) {
          await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
        }
        queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
        formik.resetForm();
        onClose && onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const form = formik.values;
  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);

  const { data: poeData } = usePointOfEntry(form.siteId);
  const { data: parkingData } = useParkingLot(form.siteId);
  const { data: destData } = useDestination(form.siteId);

  const poeOptions = [
    { label: 'Select Point of Entry', value: '' },
    ...((poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [])
  ];
  const parkingOptions = [
    { label: 'Select Parking Lot', value: '' },
    ...((parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [])
  ];
  const destOptions = [
    { label: 'Select Building', value: '' },
    ...((destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || [])
  ];

  const preparePayload = () => {
    const checkin = new Date(form.scheduleCheckinDate || new Date());
    if (form.scheduleCheckinTimeOnly) {
      const [h, m] = (form.scheduleCheckinTimeOnly ?? '').split(':');
      checkin.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
    }

    let checkout = null;
    if (form.scheduleCheckoutDate && form.scheduleCheckoutTimeOnly) {
      checkout = new Date(form.scheduleCheckoutDate);
      const [h, m] = (form.scheduleCheckoutTimeOnly ?? '').split(':');
      checkout.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
    }

    const TOP_LEVEL_FIELDS = ['Full Name', 'Email', 'Company Name', 'Phone Number', 'Host', 'Point of Entry', 'Building', 'Parking Lot'];
    const customFields = form.preregisterVisitCustomFieldModels
      .filter((f: any) => !TOP_LEVEL_FIELDS.includes(f.name))
      .map((f: any) => ({
        name: f.name,
        orgCustomFieldId: f.orgCustomFieldId,
        visitTypeFieldId: f.visitTypeFieldId,
        value: f.value
      })) || [];

    const getValueByFieldName = (fieldName: string) => {
      return (
        form.preregisterVisitCustomFieldModels.find(
          cm => cm.name === fieldName
        )?.value || ''
      );
    };

    return {
      ...form,
      fullName: getValueByFieldName('Full Name'),
      email: getValueByFieldName('Email'),
      companyName: getValueByFieldName('Company Name'),
      phoneNumber: String(getValueByFieldName('Phone Number') || ''),
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

  useEffect(() => {
    if (visitorTypeFields?.fields) {
      if (!formik.values.visitorTypeId) {
        if (formik.values.preregisterVisitCustomFieldModels.length > 0) {
          formik.setFieldValue('preregisterVisitCustomFieldModels', []);
        }
        return;
      }

      const currentFields = formik.values.preregisterVisitCustomFieldModels;
      const newFields = visitorTypeFields.fields
        .filter((f: any) => f.isPreregistrationOnly)
        .map((f: any) => {
          const existing = currentFields.find(
            (curr) => (curr.orgCustomFieldId && curr.orgCustomFieldId === (f.orgCustomFieldId || f.id)) || curr.name === f.name
          );

          return {
            name: f.name,
            orgCustomFieldId: f.orgCustomFieldId || f.id,
            visitTypeFieldId: f.id,
            value: existing ? existing.value : (f.defaultValue || ''),
            isMandatoryForPreregistration: f.isMandatoryForPreregistration,
            type: f.type,
            options: f.options,
            displayText: f.displayText
          };
        });

      const isStructureDifferent =
        newFields.length !== currentFields.length ||
        newFields.some((nf, idx) => nf.orgCustomFieldId !== currentFields[idx]?.orgCustomFieldId);

      if (isStructureDifferent) {
        formik.setFieldValue('preregisterVisitCustomFieldModels', newFields);
      }
    }
  }, [visitorTypeFields, formik.values.visitorTypeId]);

  const lastLoadedId = React.useRef<string | undefined>(undefined);
  useEffect(() => {
    if (existingVisit && lastLoadedId.current !== visitId) {
      const mappedCustomFields = existingVisit.preregisterVisitCustomFieldModels?.map((cf: any) => ({
        name: cf.name,
        orgCustomFieldId: cf.orgCustomFieldId,
        visitTypeFieldId: cf.visitTypeFieldId,
        value: cf.value,
        isMandatoryForPreregistration: false
      })) || [];

      const TOP_LEVEL_FIELDS_MAP: Record<string, any> = {
        'Full Name': existingVisit.fullName,
        'Email': existingVisit.email,
        'Company Name': existingVisit.companyName,
        'Phone Number': existingVisit.phoneNumber
      };

      Object.entries(TOP_LEVEL_FIELDS_MAP).forEach(([name, value]) => {
        if (value !== undefined && value !== null) {
          const existingIdx = mappedCustomFields.findIndex((f: any) => f.name === name);
          if (existingIdx >= 0) {
            mappedCustomFields[existingIdx].value = value;
          } else {
            mappedCustomFields.push({
              name: name,
              value: value,
            });
          }
        }
      });

      formik.setValues({
        ...initialValues,
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
  }, [existingVisit, visitId, initialValues]);

  const { data: visitorTypes } = useVisitorTypes(form.siteId);
  const visitorTypeOptions = [
    { label: 'Select Visitor Type', value: '' },
    ...(visitorTypes?.results?.map((vt) => ({
      label: vt.visitorType,
      value: vt.id,
    })) || [])
  ];

  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData } = useHosts(hostSearch, form.siteId);
  const hostOptions = hostsData?.results?.map((user: any) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} - ${user.email}`,
    email: user.email,
    emailValue: user.email
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
    [formik]
  );

  const resetForm = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  const validateStep = async (step: 1 | 2 | 3) => {
    const schemas = [step1Schema, step2Schema, step3Schema];
    const schema = schemas[step - 1];
    if (!schema) return { isValid: true, errors: {} };

    try {
      await schema.validate(formik.values, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (err: any) {
      const errors: Record<string, string> = {};
      if (err.inner) {
        err.inner.forEach((error: any) => {
          if (error.path) errors[error.path] = error.message;
        });
      }
      return { isValid: false, errors };
    }
  };

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
    preScreenStatus,
    isPreScreening,
    handlePreScreen,
    matchedRule,
    isSaving,
    validateStep,
    poeOptions,
    parkingOptions,
    destOptions,
    poeData,
    parkingData,
    destData,
    wizardStep,
    setWizardStep
  };
};