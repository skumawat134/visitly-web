// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields, usePreregistration, usePointOfEntry, useParkingLot, useDestination } from './use-preregistration.queries';
import { createPreregistration, updatePreregistration, preScreenSingle } from '../api/pre-registration.api';
import { useQueryClient } from '@tanstack/react-query';
import { format, isBefore, startOfDay, isValid } from 'date-fns';
import { useToastStore } from '@visitly/app-store';
import { useEntitlements } from '../../visitor-detail/hooks/useEntitlement';
import { useNavigate } from 'react-router-dom';


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
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
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
  hostUser?: { value: string; label: string; email?: string } | null;
  cohostUsers?: Array<{ value: string; label: string; email?: string }>;
}

export const usePreRegistrationForm = (visitId?: string, onClose?: () => void, status?: 'Create' | 'Update') => {
  const entitlements = useEntitlements();
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
    fullName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    cohostUserIds: [],
    preregisterVisitCustomFieldModels: [],
    shouldPrefill: true,
    poeId: '',
    buildingId: '',
    parkingLotId: '',
    hostUser: null,
    cohostUsers: [],
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
    const { scheduleCheckinDate, scheduleCheckinTimeOnly, scheduleCheckoutDate, scheduleCheckoutTimeOnly, recurrenceType, recurrenceEndDateOnly } = values;

    const combineDateTime = (date: Date | null | undefined, timeStr: string | null | undefined) => {
      if (!date || !timeStr) return null;
      const parts = timeStr.split(':');
      const hStr = parts[0];
      const mStr = parts[1];
      if (hStr === undefined || mStr === undefined) return null;
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const fullCheckin = combineDateTime(scheduleCheckinDate, scheduleCheckinTimeOnly);
    const fullCheckout = combineDateTime(scheduleCheckoutDate, scheduleCheckoutTimeOnly);

    // Single Visit: Check if combined Check-in is before combined Check-out
    if (fullCheckin && fullCheckout && fullCheckin > fullCheckout) {
      return this.createError({ path: 'scheduleCheckoutDate', message: 'Check-in time must be before check-out time' });
    }

    // Recurring Visit: Check if Check-in Date is before Recurrence End Date
    if (recurrenceType && recurrenceType !== 'NONE' && scheduleCheckinDate && recurrenceEndDateOnly) {
      if (startOfDay(scheduleCheckinDate) > startOfDay(recurrenceEndDateOnly)) {
        return this.createError({ path: 'recurrenceEndDateOnly', message: 'Check-in date must be before the recurrence end date' });
      }
    }

    return true;
  });

  const step2Schema = Yup.object({
    hostUserId: Yup.string().nullable().test('host-required', 'Host is required', function (value) {
      const hostField = visitorTypeFields?.fields?.find((f: any) => f.name === 'Host' || f.fid === 'HOST');
      if (hostField?.status === 'ACTIVE' && hostField?.isMandatoryForPreregistration && !value) {
        return false;
      }
      return true;
    }),
    fullName: Yup.string().test('fullname-required', 'Full Name is required', function (value) {
      const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Full Name' || f.fid === 'FULL_NAME');
      if (field?.status === 'ACTIVE' && field?.isMandatoryForPreregistration && !value) return false;
      return true;
    }),
    email: Yup.string().nullable()
    // test('email-required', 'Email is required', function (value) {
    //   const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Email' || f.fid === 'EMAIL');
    //   if (field?.status === 'ACTIVE' && field?.isMandatoryForPreregistration && !value) return false;
    //   return true;
    // }),
    .required("Email is required."),
    companyName: Yup.string().nullable()
    .required("Company Name is required."),
    // .test('company-required', 'Company Name is required', function (value) {
    //   const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Company Name' || f.fid === 'COMPANY_NAME');
    //   if (field?.status === 'ACTIVE' && field?.isMandatoryForPreregistration && !value) return false;
    //   return true;
    // }),

    phoneNumber: Yup.string().nullable()
    // .test('phone-required', 'Phone Number is required', function (value) {
    //   const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Phone Number' || f.fid === 'PHONE_NUMBER');
    //   if (field?.status === 'ACTIVE' && field?.isMandatoryForPreregistration && !value) return false;
    //   return true;
    // }),
    .required("Phone Number is required"),
    poeId: Yup.string().nullable().test('poe-required', 'Point of Entry is required', function (value) {
      const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Point of Entry' || f.fid === 'POINT_OF_ENTRY');
      if (field && field.isMandatoryForPreregistration && !value) return false;
      return true;
    }),
    buildingId: Yup.string().nullable().test('building-required', 'Building is required', function (value) {
      const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Building' || f.fid === 'DESTINATION');
      if (field && field.isMandatoryForPreregistration && !value) return false;
      return true;
    }),
    parkingLotId: Yup.string().nullable().test('parking-required', 'Parking Lot is required', function (value) {
      const field = visitorTypeFields?.fields?.find((f: any) => f.name === 'Parking Lot' || f.fid === 'PARKING_LOT');
      if (field && field.isMandatoryForPreregistration && !value) return false;
      return true;
    }),
    preregisterVisitCustomFieldModels: Yup.array().of(
      Yup.object().shape({
        fid: Yup.string(),
        name: Yup.string(),
        value: Yup.mixed().test('dynamic-validation', function (value) {
          const { isMandatoryForPreregistration, name, fid } = this.parent as any;

          // Skip validation for fields handled at top level
          if (['Host', 'CoHost', 'Building', 'Parking Lot', 'Point of Entry', 'Full Name', 'Email', 'Company Name', 'Phone Number', 'POINT_OF_ENTRY', 'DESTINATION', 'PARKING_LOT'].includes(name)) {
            return true;
          }

          // 1. Mandatory Check
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
  const  navigate = useNavigate();
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
          showToast({ message: 'preregister created successfully.' })
        } else if (visitId) {
          await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
          showToast({ message: 'preregister updated successfully.' })
          queryClient.invalidateQueries({
            queryKey: ['preregistration', visitId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-visitors'] });
        formik.resetForm();
        onClose && onClose();
        navigate(-1)
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const form = formik.values;
  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);
  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData } = useHosts(hostSearch, form.siteId);

  const parkingDate = form.scheduleCheckinDate && isValid(new Date(form.scheduleCheckinDate))
    ? format(new Date(form.scheduleCheckinDate), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const { data: poeData } = usePointOfEntry(form.siteId, entitlements.isAdvancedMegaLocationEntitled);
  const { data: parkingData } = useParkingLot(form.siteId, entitlements.isAdvancedMegaLocationEntitled, parkingDate);
  const { data: destData } = useDestination(form.siteId, entitlements.isAdvancedMegaLocationEntitled);

  const isPrefilledVisit = !!existingVisit?.visitInfoModel?.id;

  const isFieldDisabled = useCallback((fieldName: string) => {
    const isEditMode = status === 'Update';
    const isRecurring = form.recurrenceType && form.recurrenceType !== 'NONE';
    const isParentVisit = !!form.parentVisitId;

    // Condition shared by most fields in Angular
    const isLockedDown = (isEditMode && (isRecurring || isParentVisit)) || isPrefilledVisit;

    if (isEditMode) {
      // Location and Visitor Type are always disabled in update mode
      if (['siteId', 'visitorTypeId', 'shouldPrefill'].includes(fieldName)) {
        return true;
      }

      // Most other core visitor fields and custom fields are disabled if locked down
      return isLockedDown;
    }

    return false;
  }, [status, form.recurrenceType, form.parentVisitId, isPrefilledVisit]);


  // // side effect: clear location fields when date/time changes (parity with Angular) moved to onchange
  // useEffect(() => {
  //   if (form.scheduleCheckinDate || form.scheduleCheckinTimeOnly) {
  //     formik.setFieldValue('poeId', '');
  //     formik.setFieldValue('buildingId', '');
  //     formik.setFieldValue('parkingLotId', '');

  //     // Also clear them in custom fields if they exist there
  //     const currentCustomFields = [...formik.values.preregisterVisitCustomFieldModels];
  //     let changed = false;
  //     const updatedFields = currentCustomFields.map(f => {
  //       if (['POINT_OF_ENTRY', 'DESTINATION', 'PARKING_LOT', 'Point of Entry', 'Building', 'Parking Lot'].includes(f.name) ||
  //         ['poeId', 'buildingId', 'parkingLotId'].includes(f.orgCustomFieldId)) {
  //         changed = true;
  //         return { ...f, value: '' };
  //       }
  //       return f;
  //     });
  //     if (changed) {
  //       formik.setFieldValue('preregisterVisitCustomFieldModels', updatedFields);
  //     }
  //   }
  // }, [form.scheduleCheckinDate, form.scheduleCheckinTimeOnly]);

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
    const values = formik.values;
    const pipe = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");
    // Process custom fields
    const processedCustomFields = values.preregisterVisitCustomFieldModels.map((f: any) => {
      let val = f.value || '';
      if (f.type === 'DATEPICKER' && val) {
        const d = new Date(val);
        if (isValid(d)) val = pipe(d);
      }
      return { ...f, value: val };
    });

    const getFieldValue = (fieldName: string) => processedCustomFields.find(f => f.name === fieldName)?.value || '';

    // ADVANCED LOCATION EXTRACTION
    // We look for these fields in dynamic fields first, then fallback to top-level form values
    const advancedLocationFields = ['POINT_OF_ENTRY', 'DESTINATION', 'PARKING_LOT', 'Point of Entry', 'Building', 'Parking Lot'];

    const extractedPoeId = getFieldValue('POINT_OF_ENTRY') || getFieldValue('Point of Entry') || values.poeId || null;
    const extractedBuildingId = getFieldValue('DESTINATION') || getFieldValue('Building') || values.buildingId || null;
    const extractedParkingLotId = getFieldValue('PARKING_LOT') || getFieldValue('Parking Lot') || values.parkingLotId || null;
    const excludedFields = ['Full Name', 'Host', 'HOST', 'Email', 'Company Name', 'Phone Number', ...advancedLocationFields];
    // Filter out advanced location fields from the custom fields array sent to the backend
    const filteredCustomFields = processedCustomFields.filter(f =>
      f.isPreregistrationOnly && !excludedFields.includes(f.name)
    ).map((item) => {
      return {
        name: item.name,
        orgCustomFieldId: item.orgCustomFieldId,
        value: item.value,
        visitTypeFieldId: item.visitTypeFieldId,
      }
    })
    // Construct base payload according to PreregisteredVisitInfoModel DTO
    let payload: any = {
      id: values.id || visitId,
      fullName: values.fullName || getFieldValue('Full Name'),
      email: values.email || getFieldValue('Email'),
      companyName: values.companyName || getFieldValue('Company Name'),
      phoneNumber: values.phoneNumber || String(getFieldValue('Phone Number') || ''),
      hostUserId: values.hostUserId,
      hostEmail: values.hostUser?.email || values.hostEmail,
      hostName: values.hostUser?.label || '',
      visitorTypeId: values.visitorTypeId,
      siteId: values.siteId,
      groupName: values.groupName,
      internalNote: values.internalNote,
      recurrenceType: values.recurrenceType || 'NONE',
      preregisterVisitCustomFieldModels: filteredCustomFields,
      poeId: extractedPoeId,
      buildingId: extractedBuildingId,
      parkingLotId: extractedParkingLotId,
      checkinMethod: 'WEB',
      cohostUserIds: (values.cohostUserIds || [])
    };

    // Construct base flags as strings
    payload.notifyHostFlag = String(!!values.notifyHostFlag);
    payload.notifyVisitFlag = String(!!values.notifyVisitFlag);
    payload.shouldPrefill = String(!!values.shouldPrefill);

    const checkinDate = new Date(values.scheduleCheckinDate || new Date());

    // Handle Dates
    if (values.recurrenceType && values.recurrenceType !== 'NONE') {
      // Recurring Visit Structure
      payload.scheduleCheckinDateOnly = format(checkinDate, 'yyyy-MM-dd');
      payload.checkinTimeOnly = values.scheduleCheckinTimeOnly ? `${values.scheduleCheckinTimeOnly}:00` : null;
      payload.checkoutTimeOnly = values.scheduleCheckoutTimeOnly || null; // Match Angular's HH:mm
      payload.scheduleCheckinTimeOnly = values.scheduleCheckinTimeOnly || null; // Add missing field

      if (values.recurrenceEndDateOnly) {
        const d = new Date(values.recurrenceEndDateOnly);
        if (isValid(d)) payload.recurrenceEndDateOnly = format(d, 'yyyy-MM-dd');
      }
    } else {
      // Single Visit Structure
      if (isValid(checkinDate)) {
        if (values.scheduleCheckinTimeOnly) {
          const [h, m] = values.scheduleCheckinTimeOnly.split(':');
          checkinDate.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
        }
        payload.scheduleCheckinDate = pipe(checkinDate);
      }

      if (values.scheduleCheckoutDate) {
        const checkoutDate = new Date(values.scheduleCheckoutDate);
        if (isValid(checkoutDate)) {
          if (values.scheduleCheckoutTimeOnly) {
            const [h, m] = values.scheduleCheckoutTimeOnly.split(':');
            checkoutDate.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
          }
          payload.scheduleCheckoutDate = pipe(checkoutDate);
        }
      }
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
        .filter((f: any) => f.isPreregistrationOnly && f.status === 'ACTIVE')
        .map((f: any) => {
          const existing = currentFields.find(
            (curr) => (curr.orgCustomFieldId && curr.orgCustomFieldId === (f.orgCustomFieldId || f.id)) || curr.name === f.name
          );

          return {
            ...f,
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
      // Map existing fields to custom models for rendering
      let mappedCustomFields = (existingVisit.preregisterVisitCustomFieldModels || []).map((cf: any) => ({
        ...cf,
        fid: cf.orgCustomFieldId,
        isPreregistrationOnly: true
      }));

      // Top-level fields to exclude from dynamic rendering
      const EXCLUDED_FIELDS = ['Full Name', 'Email', 'Company Name', 'Phone Number', 'Building', 'Parking Lot', 'Point of Entry', 'Host', 'CoHost', 'POINT_OF_ENTRY', 'DESTINATION', 'PARKING_LOT'];

      // Filter out top-level fields from dynamic array to prevent duplication
      mappedCustomFields = mappedCustomFields.filter((f: any) => !EXCLUDED_FIELDS.includes(f.name));

      // Recurrent/Date Prefill logic
      const checkinDate = existingVisit.scheduleCheckinDate ? new Date(existingVisit.scheduleCheckinDate) :
        (existingVisit.scheduleCheckinDateOnly ? new Date(existingVisit.scheduleCheckinDateOnly) : new Date());

      let checkinTime = '';
      if (existingVisit.scheduleCheckinDate) {
        const d = new Date(existingVisit.scheduleCheckinDate);
        if (isValid(d)) checkinTime = format(d, 'HH:mm');
      } else if (existingVisit.checkinTimeOnly) {
        checkinTime = existingVisit.checkinTimeOnly.substring(0, 5);
      }

      let checkoutDate = existingVisit.scheduleCheckoutDate ? new Date(existingVisit.scheduleCheckoutDate) : null;
      let checkoutTime = '';
      if (existingVisit.scheduleCheckoutDate) {
        const d = new Date(existingVisit.scheduleCheckoutDate);
        if (isValid(d)) checkoutTime = format(d, 'HH:mm');
      } else if (existingVisit.checkoutTimeOnly) {
        checkoutTime = existingVisit.checkoutTimeOnly.substring(0, 5);
      }

      formik.setValues({
        ...initialValues,
        ...existingVisit,
        id: visitId,
        scheduleCheckinDate: checkinDate,
        scheduleCheckinTimeOnly: checkinTime,
        scheduleCheckoutDate: checkoutDate,
        scheduleCheckoutTimeOnly: checkoutTime || null,
        recurrenceType: existingVisit.recurrenceType || 'NONE',
        recurrenceEndDateOnly: (existingVisit.recurrenceEndDateOnly || existingVisit.recurrenceEndDate) ? new Date(existingVisit.recurrenceEndDateOnly || existingVisit.recurrenceEndDate) : null,
        fullName: existingVisit.fullName || '',
        email: existingVisit.email || '',
        companyName: existingVisit.companyName || '',
        phoneNumber: existingVisit.phoneNumber || '',
        checkoutTimeOnly: existingVisit.checkoutTimeOnly || checkoutTime || null,
        notifyVisitFlag: existingVisit.notifyVisitFlag !== false && String(existingVisit.notifyVisitFlag) !== 'false',
        notifyHostFlag: existingVisit.notifyHostFlag !== false && String(existingVisit.notifyHostFlag) !== 'false',
        cohostUserIds: existingVisit.cohosts?.map((c: any) => c.cohostUserId) || [],
        preregisterVisitCustomFieldModels: mappedCustomFields,
        poeId: existingVisit.poeId || '',
        buildingId: existingVisit.buildingId || '',
        parkingLotId: existingVisit.parkingLotId || '',
        hostUserId: existingVisit.hostUserId || null,
        hostUser: existingVisit.hostUserId ? {
          value: existingVisit.hostUserId,
          label: existingVisit.hostName || '',
          email: existingVisit.hostEmail || ''
        } : null,
        cohostUsers: existingVisit.cohosts?.map((c: any) => ({
          value: c.cohostUserId,
          label: c.cohostName || '',
          email: c.cohostEmail || ''
        })) || []
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

  const hostOptions = React.useMemo(() => {
    const options =
      hostsData?.results?.map((user: any) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        email: user.email,
      })) ?? [];

    // Ensure currently selected host is in the options
    if (form.hostUserId) {
      const exists = options.some((opt) => opt.value === form.hostUserId);
      if (!exists) {
        const hostName = existingVisit?.hostUserId === form.hostUserId ? (existingVisit.hostName || '') : (visitId ? '' : ''); // Fallback for name parsing if needed
        options.unshift({
          value: form.hostUserId,
          label: hostName || form.hostEmail || 'Selected Host',
          email: form.hostEmail || '',
        });
      }
    }
    return options;
  }, [hostsData, form.hostUserId, form.hostEmail, existingVisit, visitId]);

  const [coHostSearch, setCoHostSearch] = React.useState('');
  const { data: coHostsData } = useCoHosts(coHostSearch, form.siteId);
  const coHostOptions = React.useMemo(() => {
    const options =
      coHostsData?.results?.map((user: any) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        email: user.email,
      })) ?? [];

    // Ensure currently selected co-hosts are in the options
    if (form.cohostUserIds?.length) {
      form.cohostUserIds.forEach((cid) => {
        const exists = options.some((opt) => opt.value === cid);
        if (!exists) {
          const existingCoHost = existingVisit?.cohosts?.find((c: any) => c.cohostUserId === cid);
          options.push({
            value: cid,
            label: existingCoHost?.cohostName || cid,
            email: existingCoHost?.cohostEmail || '',
          });
        }
      });
    }
    return options;
  }, [coHostsData, form.cohostUserIds, existingVisit]);


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
      await schema.validate(formik.values, { abortEarly: false, context: { visitorTypeFields } });
      return { isValid: true, errors: {} };
    } catch (err: any) {
      const errors: Record<string, string> = {};
      if (err.inner && err.inner.length > 0) {
        err.inner.forEach((error: any) => {
          if (error.path) errors[error.path] = error.message;
        });
      } else if (err.path && err.message) {
        errors[err.path] = err.message;
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
    setWizardStep,
    isFieldDisabled,
    isPrefilledVisit,
    entitlements
  };
};
