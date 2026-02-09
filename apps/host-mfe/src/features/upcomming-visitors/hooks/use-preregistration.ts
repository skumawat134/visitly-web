// features/pre-registration/hooks/usePreRegistrationForm.ts
import React, { useEffect, useCallback, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCoHosts, useHosts, useSites, useVisitorTypes, useVisitorTypesFields, usePreregistration, usePointOfEntry, useParkingLot, useDestination } from './use-preregistration.queries';
import type { UserOption } from '@visitly/ui';
import { createPreregistration, updatePreregistration, preScreenSingle } from '../api/pre-registration.api';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

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

export const usePreRegistrationForm = (visitId?: string, onClose?: () => void, status?: 'Create' | 'Update') => {
  const { data: sites } = useSites();
  const siteOptions = sites?.results?.map((site) => ({
    label: site.name,
    value: site.id,
  })) || [];

  const { data: existingVisit } = usePreregistration(visitId || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const [isPreScreening, setIsPreScreening] = useState(false);
  const [preScreenStatus, setPreScreenStatus] = useState<'IDLE' | 'SAFE' | 'WATCHLIST_HIT'>('IDLE');
  const queryClient = useQueryClient();
  const [matchedRule, setMatchedRule] = useState('');

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
      try {
        const payload = preparePayload();
        if (status === 'Create') {
          await createPreregistration(payload);
        } else if (visitId) {
          await updatePreregistration(visitId, 'SELECTED_VISIT', payload);
        }
        queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
        resetForm();
        onClose && onClose();

      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
    enableReinitialize: true,
  });

  const form = formik.values;
  const { data: visitorTypeFields } = useVisitorTypesFields(form.visitorTypeId);

  // Data Fetching for Auto-Select fields
  const { data: poeData } = usePointOfEntry(form.siteId);
  const { data: parkingData } = useParkingLot(form.siteId);
  const { data: destData } = useDestination(form.siteId);

  const poeOptions = (poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [];
  const parkingOptions = (parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [];
  const destOptions = (destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || [];


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

    // Exclude fields sent as top-level from customFields
    const TOP_LEVEL_FIELDS = ['Full Name', 'Email', 'Company Name', 'Phone Number'];
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
      phoneNumber: getValueByFieldName('Phone Number'),
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
            (curr) => (curr.orgCustomFieldId && curr.orgCustomFieldId === (f.orgCustomFieldId || f.id)) || curr.name === f.name
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
        isMandatoryForPreregistration: false
      })) || [];
      // Inject top-level fields back into custom fields array
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


  // Auto-select Point of Entry
  useEffect(() => {
    if (poeData && (poeData as any).results && (poeData as any).results.length > 0) {
      const firstId = (poeData as any).results[0].id;
      if (!form.poeId) {
        formik.setFieldValue('poeId', firstId);
        // Also update custom field array if it exists there
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Point of Entry');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, firstId);
        }
      } else {
        // Always sync the custom field value to match the form field id
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Point of Entry');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, form.poeId);
        }
      }
    }
  }, [poeData, form.poeId, form.preregisterVisitCustomFieldModels]);

  // Auto-select Building
  useEffect(() => {

    if (destData && (destData as any).results && (destData as any).results.length > 0) {
      const firstId = (destData as any).results[0].id;
      if (!form.buildingId) {
        formik.setFieldValue('buildingId', firstId);
        // Also update custom field array if it exists there
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Building');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, firstId);
        }
      } else {
        // Always sync the custom field value to match the form field id
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Building');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, form.buildingId);
        }
      }
    }
  }, [destData, form.buildingId, form.preregisterVisitCustomFieldModels]);

  // Auto-select Parking Lot
  useEffect(() => {
    if (parkingData && (parkingData as any).results && (parkingData as any).results.length > 0) {
      const firstId = (parkingData as any).results[0].id;
      if (!form.parkingLotId) {
        formik.setFieldValue('parkingLotId', firstId);
        // Also update custom field array if it exists there
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Parking Lot');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, firstId);
        }
      } else {
        // Always sync the custom field value to match the form field id
        const existingIdx = form.preregisterVisitCustomFieldModels.findIndex((f: any) => f.name === 'Parking Lot');
        if (existingIdx >= 0) {
          formik.setFieldValue(`preregisterVisitCustomFieldModels[${existingIdx}].value`, form.parkingLotId);
        }
      }
    }
  }, [parkingData, form.parkingLotId, form.preregisterVisitCustomFieldModels]);

  const [hostSearch, setHostSearch] = React.useState('');
  const { data: hostsData } = useHosts(hostSearch, form.siteId);
  const hostOptions = hostsData?.results?.map((user: any) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName} - ${user.email}`,
    email: user.email,
    emailValue: user.email // Store email for setting helper field
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
    preScreenStatus,
    isPreScreening,
    handlePreScreen,
    matchedRule,
    isSaving,
    // Return options for consumption
    poeOptions,
    parkingOptions,
    destOptions,
    // Return data for consumption if needed
    poeData,
    parkingData,
    destData
  };
};