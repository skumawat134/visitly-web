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
          showToast({ message: 'preregister created successfully.' })
        } else if (visitId) {
          await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
          showToast({ message: 'preregister updated successfully.' })
          queryClient.invalidateQueries({
            queryKey: ['preregistration', visitId],
          });
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
  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData } = useHosts(hostSearch, form.siteId);

  const parkingDate = form.scheduleCheckinDate && isValid(new Date(form.scheduleCheckinDate))
    ? format(new Date(form.scheduleCheckinDate), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const { data: poeData } = usePointOfEntry(form.siteId, entitlements.isAdvancedMegaLocationEntitled);
  const { data: parkingData } = useParkingLot(form.siteId, entitlements.isAdvancedMegaLocationEntitled, parkingDate);
  const { data: destData } = useDestination(form.siteId, entitlements.isAdvancedMegaLocationEntitled);

  const isFieldDisabled = useCallback((fieldName: string) => {

    // Angular logic: Disable if in edit mode AND (is recurring OR is part of a group/parent visit OR is prefilled)
    const isEditMode = status === 'Update';
    const isRecurring = form.recurrenceType && form.recurrenceType !== 'NONE';
    const isParentVisit = !!form.parentVisitId;
    const isPrefilledVisit = !!existingVisit?.visitInfoModel?.id || !!existingVisit?.id;
    console.log("checking disable the field", isPrefilledVisit, { isEditMode, isRecurring, isParentVisit, isPreScreening, existingVisit })
    if (isEditMode) {
      if (isRecurring || isParentVisit || isPrefilledVisit) {
        return ['siteId', 'visitorTypeId', 'scheduleCheckinDate', 'scheduleCheckinTimeOnly', 'recurrenceType', 'scheduleCheckoutDate', 'recurrenceEndDateOnly', 'scheduleCheckoutTimeOnly'].includes(fieldName);
      }
    }
    return false;
  }, [status, form.recurrenceType, form.parentVisitId, existingVisit, form.siteId, form.visitorTypeId, form.scheduleCheckinDate, form.scheduleCheckinTimeOnly]);


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

    // Filter out advanced location fields from the custom fields array sent to the backend
    const filteredCustomFields = processedCustomFields.filter(f =>
      f.isPreregistrationOnly && !advancedLocationFields.includes(f.name)
    );

    // Lookup Host details
    const selectedHost = hostOptions.find(opt => opt.value === values.hostUserId);

    // Construct base payload according to PreregisteredVisitInfoModel DTO
    let payload: any = {
      id: values.id || visitId,
      fullName: getFieldValue('Full Name'),
      email: getFieldValue('Email'),
      companyName: getFieldValue('Company Name'),
      phoneNumber: String(getFieldValue('Phone Number') || ''),
      hostUserId: values.hostUserId,
      hostEmail: selectedHost?.email || values.hostEmail,
      hostName: selectedHost?.label?.split(' - ')[0] || '',
      visitorTypeId: values.visitorTypeId,
      siteId: values.siteId,
      notifyHostFlag: !!values.notifyHostFlag,
      notifyVisitFlag: !!values.notifyVisitFlag,
      shouldPrefill: !!values.shouldPrefill,
      groupName: values.groupName,
      internalNote: values.internalNote,
      recurrenceType: values.recurrenceType || 'NONE',
      preregisterVisitCustomFieldModels: filteredCustomFields,
      poeId: extractedPoeId,
      buildingId: extractedBuildingId,
      parkingLotId: extractedParkingLotId,
      cohosts: (values.cohostUserIds || []).map(cid => {
        const cohostOpt = coHostOptions.find(opt => opt.value === cid);
        return {
          cohostUserId: cid,
          cohostEmail: cohostOpt?.email || '',
          cohostName: cohostOpt?.label?.split(' - ')[0] || ''
        };
      })
    };

    // Handle Dates
    if (values.recurrenceType && values.recurrenceType !== 'NONE') {
      // Recurring Visit Structure
      if (values.scheduleCheckinDate) {
        const d = new Date(values.scheduleCheckinDate);
        if (isValid(d)) payload.scheduleCheckinDateOnly = format(d, 'yyyy-MM-dd');
      }
      payload.checkinTimeOnly = values.scheduleCheckinTimeOnly ? `${values.scheduleCheckinTimeOnly}:00` : null;
      payload.checkoutTimeOnly = values.scheduleCheckoutTimeOnly ? `${values.scheduleCheckoutTimeOnly}:00` : null;

      if (values.recurrenceEndDateOnly) {
        const d = new Date(values.recurrenceEndDateOnly);
        if (isValid(d)) payload.recurrenceEndDateOnly = format(d, 'yyyy-MM-dd');
      }
    } else {
      // Single Visit Structure
      if (values.scheduleCheckinDate) {
        const checkinDate = new Date(values.scheduleCheckinDate);
        if (isValid(checkinDate)) {
          if (values.scheduleCheckinTimeOnly) {
            const [h, m] = values.scheduleCheckinTimeOnly.split(':');
            checkinDate.setHours(parseInt(h || '0'), parseInt(m || '0'), 0, 0);
          }
          payload.scheduleCheckinDate = pipe(checkinDate);
        }
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
        isMandatoryForPreregistration: false,
        type: cf.type,
        options: cf.options,
        displayText: cf.displayText
      })) || [];

      // Extract Advanced Location Values from Custom Fields (with multiple name variations)
      const findCFValue = (names: string[]) => mappedCustomFields.find((f: any) => names.includes(f.name) || names.includes(f.orgCustomFieldId))?.value;


      const prefilledPoeId = findCFValue(['POINT_OF_ENTRY', 'Point of Entry', 'poeId']) || existingVisit.poeId;
      const prefilledBuildingId = findCFValue(['DESTINATION', 'Building', 'buildingId']) || existingVisit.buildingId;
      const prefilledParkingLotId = findCFValue(['PARKING_LOT', 'Parking Lot', 'parkingLotId']) || existingVisit.parkingLotId;

      // Ensure TOP_LEVEL fields are present in the custom field models for the UI to render them
      const TOP_LEVEL_FIELDS_MAP: Record<string, any> = {
        'Full Name': existingVisit.fullName,
        'Email': existingVisit.email,
        'Company Name': existingVisit.companyName,
        'Phone Number': existingVisit.phoneNumber,
        'POINT_OF_ENTRY': prefilledPoeId,
        'DESTINATION': prefilledBuildingId,
        'PARKING_LOT': prefilledParkingLotId
      };

      Object.entries(TOP_LEVEL_FIELDS_MAP).forEach(([name, value]) => {
        if (value !== undefined && value !== null) {
          const existingIdx = mappedCustomFields.findIndex((f: any) => f.name === name || f.fid === name);
          if (existingIdx >= 0) {
            mappedCustomFields[existingIdx].value = value;
          } else {
            mappedCustomFields.push({
              name: name,
              value: value,
              orgCustomFieldId: name,
              visitTypeFieldId: name
            });
          }
        }
      });

      // Recurrent/Date Prefill logic (Angular parity)
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
        recurrenceEndDateOnly: existingVisit.recurrenceEndDateOnly ? new Date(existingVisit.recurrenceEndDateOnly) : null,
        checkoutTimeOnly: existingVisit.checkoutTimeOnly || checkoutTime || null,
        notifyVisitFlag: existingVisit.notifyVisitFlag !== false && existingVisit.notifyVisitFlag !== 'false',
        notifyHostFlag: existingVisit.notifyHostFlag !== false && existingVisit.notifyHostFlag !== 'false',
        cohostUserIds: existingVisit.cohosts?.map((c: any) => c.cohostUserId) || [],
        preregisterVisitCustomFieldModels: mappedCustomFields,
        poeId: prefilledPoeId || '',
        buildingId: prefilledBuildingId || '',
        parkingLotId: prefilledParkingLotId || '',
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
    const options = hostsData?.results?.map((user: any) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.email}`,
      email: user.email,
      emailValue: user.email
    })) ?? [];

    // If in update mode and we have existing host data, ensure it's in the options
    if (status === 'Update' && existingVisit?.hostUserId) {
      const exists = options.some(opt => opt.value === existingVisit.hostUserId);
      if (!exists) {
        options.unshift({
          value: existingVisit.hostUserId,
          label: `${existingVisit.hostName || ''} - ${existingVisit.hostEmail || ''}`,
          email: existingVisit.hostEmail,
          emailValue: existingVisit.hostEmail
        });
      }
    }
    return options;
  }, [hostsData, existingVisit, status]);

  const [coHostSearch, setCoHostSearch] = React.useState('');
  const { data: coHostsData } = useCoHosts(coHostSearch, form.siteId);
  const coHostOptions = React.useMemo(() => {
    const options = coHostsData?.results?.map((user: any) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.email}`,
      email: user.email,
    })) ?? [];

    // If in update mode and we have existing co-hosts, ensure they are in the options
    if (status === 'Update' && existingVisit?.cohosts) {
      existingVisit.cohosts.forEach((ch: any) => {
        const exists = options.some(opt => opt.value === ch.cohostUserId);
        if (!exists) {
          options.push({
            value: ch.cohostUserId,
            label: `${ch.cohostName || ''} - ${ch.cohostEmail || ''}`,
            email: ch.cohostEmail
          });
        }
      });
    }
    return options;
  }, [coHostsData, existingVisit, status]);


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
    setWizardStep,
    isFieldDisabled
  };
};
