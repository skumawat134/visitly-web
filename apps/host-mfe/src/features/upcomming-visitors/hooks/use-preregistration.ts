// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields, usePreregistration, usePointOfEntry, useParkingLot, useDestination } from './use-preregistration.queries';
import { createPreregistration, updatePreregistration, preScreenSingle } from '../api/pre-registration.api';
import { useQueryClient } from '@tanstack/react-query';
import { format, isBefore, startOfDay } from 'date-fns';
import { useToastStore } from '@visitly/app-store';

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

    // 1. Check-in Date (Angular: Scheduled Check In Date cannot be in the past)
    scheduleCheckinDate: Yup.date()
      .required('Check-in Date is required')
      .test('not-in-past', 'Scheduled Check In Date cannot be in the past', (value) => {
        if (!value) return false;
        return !isBefore(startOfDay(value), startOfDay(new Date()));
      }),

    // 2. Check-in Time (Angular: Please select Check-in Time)
    scheduleCheckinTimeOnly: Yup.string().required('Please select Check-in Time'),

    // 3. Recurrence Logic
    recurrenceType: Yup.string().nullable(),

    // Angular: if (recurrenceType !== 'NONE' && isNullUndefinedOrBlank(recurrenceEndDateOnly))
    recurrenceEndDateOnly: Yup.date().nullable().when('recurrenceType', {
      is: (val: string) => val && val !== 'NONE',
      then: (schema) => schema.required('Recurrence end date is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    // 4. Check-out logic (Handles both Single and Recurring)
    scheduleCheckoutDate: Yup.date().nullable(),

    scheduleCheckoutTimeOnly: Yup.string().nullable().when(['scheduleCheckoutDate', 'recurrenceType'], {
      is: (scheduleCheckoutDate: any, recurrenceType: string) =>
        !!scheduleCheckoutDate || (recurrenceType && recurrenceType !== 'NONE'),
      then: (schema) => schema.required('Check-out time is required'),
      otherwise: (schema) => schema.nullable(),
    }),

  }).test('checkin-before-checkout', 'Check-in time must be before check-out time', function (values) {
    const { scheduleCheckinDate, scheduleCheckoutDate, recurrenceType, recurrenceEndDateOnly } = values;

    // Single Visit: Check if Check-in is before Check-out
    if (scheduleCheckinDate && scheduleCheckoutDate && scheduleCheckinDate > scheduleCheckoutDate) {
      return this.createError({ path: 'scheduleCheckoutDate', message: 'Check-in time must be before check-out time' });
    }

    // Recurring Visit: Check if Check-in Date is before Recurrence End Date
    if (recurrenceType && recurrenceType !== 'NONE' && scheduleCheckinDate && recurrenceEndDateOnly) {
      if (scheduleCheckinDate > recurrenceEndDateOnly) {
        return this.createError({ path: 'recurrenceEndDateOnly', message: 'Check-in date must be before the recurrence end date' });
      }
    }

    return true;
  });

  const step2Schema = Yup.object({
    preregisterVisitCustomFieldModels: Yup.array().of(
      Yup.object().shape({
        fid: Yup.string(),
        name: Yup.string(),
        value: Yup.mixed().test('dynamic-validation', function (value) {
          const { isMandatoryForPreregistration, name, fid } = this.parent as any;

          // 1. Mandatory Check (Sync with Angular's fid !== 'HOST' check)
          if (isMandatoryForPreregistration && (value === null || value === undefined || value === '')) {
            return this.createError({ message: `${name || 'Field'} is required` });
          }

          // 2. Full Name Regex (Sync with Angular's fullNameRegex)
          if (fid === 'FULL_NAME' && value!) {
            const fullNameRegex = /^[a-zA-Z ]+$/; // Standard Full Name Regex
            if (!fullNameRegex.test(value as string)) {
              return this.createError({ message: 'Please Enter Valid Full Name' });
            }
          }

          // 3. Email Regex (Sync with Angular's PATTERN_FOR_EMAIL_SECOND_REGEX)
          if (fid === 'EMAIL' && value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value as string)) {
              return this.createError({ message: 'Please enter a valid Email' });
            }
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
    const showToast = useToastStore((s) => s.showToast)

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
          showToast({ message : 'preregister created successfully.'})
        } else if (visitId) {
          await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
          showToast({ message : 'preregister updated successfully.'})
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

  // const preparePayload = () => {
  //   const checkin = new Date(form.scheduleCheckinDate || new Date());
  //   if (form.scheduleCheckinTimeOnly) {
  //     const [h, m] = (form.scheduleCheckinTimeOnly ?? '').split(':');
  //     checkin.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
  //   }

  //   let checkout = null;
  //   if (form.scheduleCheckoutDate && form.scheduleCheckoutTimeOnly) {
  //     checkout = new Date(form.scheduleCheckoutDate);
  //     const [h, m] = (form.scheduleCheckoutTimeOnly ?? '').split(':');
  //     checkout.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
  //   }

  //   const TOP_LEVEL_FIELDS = ['Full Name', 'Email', 'Company Name', 'Phone Number', 'Host', 'Point of Entry', 'Building', 'Parking Lot'];
  //   const customFields = form.preregisterVisitCustomFieldModels
  //     .filter((f: any) => !TOP_LEVEL_FIELDS.includes(f.name))
  //     .map((f: any) => ({
  //       name: f.name,
  //       orgCustomFieldId: f.orgCustomFieldId,
  //       visitTypeFieldId: f.visitTypeFieldId,
  //       value: f.value
  //     })) || [];

  //   const getValueByFieldName = (fieldName: string) => {
  //     return (
  //       form.preregisterVisitCustomFieldModels.find(
  //         cm => cm.name === fieldName
  //       )?.value
  //     );
  //   };

  //   return {
  //     ...form,
  //     fullName: getValueByFieldName('Full Name'),
  //     email: getValueByFieldName('Email'),
  //     companyName: getValueByFieldName('Company Name'),
  //     phoneNumber: String(getValueByFieldName('Phone Number') || ''),
  //     scheduleCheckinDate: format(checkin, "yyyy-MM-dd'T'HH:mm:ss"),
  //     scheduleCheckoutDate: checkout ? format(checkout, "yyyy-MM-dd'T'HH:mm:ss") : null,
  //     preregisterVisitCustomFieldModels: customFields,
  //     checkinMethod: 'WEB',
  //   };
  // };

  const preparePayload = () => {
  const values = { ...formik.values };
  const pipe = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

  // Create a deep copy of form models to avoid mutating state directly
  const processedCustomFields = values.preregisterVisitCustomFieldModels.map((f: any) => {
    let val = f.value || '';
    // Angular Logic: Transform DATEPICKER values to ISO strings
    if (f.type === 'DATEPICKER' && val) {
      val = pipe(new Date(val));
    }
    return { ...f, value: val };
  });
  const getVal = (fieldName: string) => processedCustomFields.find(f => f.name === fieldName)?.value || '';

  // 1. Initial Payload construction
  let payload: any = {
    ...values,
    fullName: getVal('Full Name'),
    email: getVal('Email'),
    companyName: getVal('Company Name'),
    phoneNumber: getVal('Phone Number'),
    poeId: getVal('POINT_OF_ENTRY') || values.poeId,
    buildingId: getVal('DESTINATION') || values.buildingId,
    parkingLotId: getVal('PARKING_LOT') || values.parkingLotId,
    shouldPrefill: JSON.stringify(values.shouldPrefill),
    checkinMethod: 'WEB',
    preregisterVisitCustomFieldModels: processedCustomFields.filter(
       (f: any) => f.isPreregistrationOnly // Angular: only push if isPreregistrationOnly is true
    )
  };

  // 2. Handle Dates (Single Visit Logic)
  if (values.scheduleCheckinDate) {
    const checkinDate = new Date(values.scheduleCheckinDate);
    if (values.scheduleCheckinTimeOnly) {
      const [h, m] = values.scheduleCheckinTimeOnly.split(':');
      checkinDate.setHours(parseInt(h), parseInt(m), 0);
    }
    payload.scheduleCheckinDate = pipe(checkinDate);
  }

  if (values.scheduleCheckoutDate) {
    const checkoutDate = new Date(values.scheduleCheckoutDate);
    if (values.scheduleCheckoutTimeOnly) {
      const [h, m] = values.scheduleCheckoutTimeOnly.split(':');
      checkoutDate.setHours(parseInt(h), parseInt(m), 0);
    }
    payload.scheduleCheckoutDate = pipe(checkoutDate);
  }

  // 3. Recurrence Logic (Matching Angular m1.isAfter logic)
  if (values.recurrenceType && values.recurrenceType !== 'NONE') {
    // Angular transforms specific properties for recurring visits
    payload.scheduleCheckinDateOnly = format(new Date(values.scheduleCheckinDate), 'yyyy-MM-dd');
    payload.checkinTimeOnly = values.scheduleCheckinTimeOnly; // Expects HH:mm
    
    if (values.recurrenceEndDateOnly) {
      payload.recurrenceEndDateOnly = format(new Date(values.recurrenceEndDateOnly), 'yyyy-MM-dd');
    }

    // Use the checkout time as defined in step 1 schema
    payload.checkoutTimeOnly = values.scheduleCheckoutTimeOnly;

    // IMPORTANT: Angular deletes scheduleCheckinDate for recurring visits
    delete payload.scheduleCheckinDate;
    delete payload.scheduleCheckoutDate;
  }

  return payload;
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