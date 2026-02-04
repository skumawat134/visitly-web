// features/pre-registration/hooks/usePreRegistrationForm.ts
import { useState, useCallback } from 'react';

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
  // Add any additional fields you need
}

export const usePreRegistrationForm = (initialData?: Partial<PreRegistrationForm>) => {
  const [form, setForm] = useState<PreRegistrationForm>({
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
    ...initialData,
  });

  const setFormField = useCallback(
    <K extends keyof PreRegistrationForm>(field: K, value: PreRegistrationForm[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const setCustomField = useCallback((fieldId: string, value: any) => {
    setForm((prev) => {
      const existing = prev.preregisterVisitCustomFieldModels.find(
        (f) => f.orgCustomFieldId === fieldId
      );

      let updatedModels = [...prev.preregisterVisitCustomFieldModels];

      if (existing) {
        updatedModels = updatedModels.map((f) =>
          f.orgCustomFieldId === fieldId ? { ...f, value } : f
        );
      } else {
        updatedModels.push({
          name: '',
          orgCustomFieldId: fieldId,
          visitTypeFieldId: '',
          value,
        });
      }

      return {
        ...prev,
        preregisterVisitCustomFieldModels: updatedModels,
      };
    });
  }, []);

  const resetForm = useCallback(() => {
    setForm({
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
    });
  }, []);

  return {
    form,
    setFormField,
    setCustomField,
    resetForm,
  };
};