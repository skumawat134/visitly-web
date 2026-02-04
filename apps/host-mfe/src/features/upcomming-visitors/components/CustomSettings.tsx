import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomFields } from '../api/upcomming-visitors.api';
import { Button, Checkbox, cn, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@visitly/ui';
import Section from './Section';
import { useToastStore } from '@visitly/app-store';
export const STORAGE_KEY = 'columnSettingsForUpcomingVisitors';
const ColumnSettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<any[]>([]);
  const showToast = useToastStore((state) => state.showToast);
  // 1. Fetch Custom Fields via React Query
  const { data: customFieldsRaw } = useQuery({
    queryKey: ['orgCustomFields'],
    queryFn: getCustomFields,
    enabled: isOpen
  });

  // 2. Process Entitlements and Standard Fields
  const allStandardFields = useMemo(() => {
    let fields = [
      { columnTitle: 'Name', prop: 'fullName', isSelected: true, isDisabled: true, type: 'Standard' },
      { columnTitle: 'Type', prop: 'visitorType', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Host', prop: 'hostName', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Location', prop: 'siteName', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Company', prop: 'companyName', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Group Name', prop: 'groupName', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Phone', prop: 'phoneNumber', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Pre-fill Status', prop: 'id', isSelected: true, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Internal Note', prop: 'internalNote', isSelected: false, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Email', prop: 'email', isSelected: false, isDisabled: false, type: 'Standard' },
      { columnTitle: 'Scheduled Check-In Date', prop: 'scheduleCheckinDate', isSelected: true, isDisabled: true, type: 'Standard' },
      { columnTitle: 'Action', prop: 'id', isSelected: true, isDisabled: true, type: 'Standard' },
    ];

    const entitlement = JSON.parse(sessionStorage.getItem('entitlement') || '{}');
    const hasMegaLocation = entitlement?.products?.[0]?.entitlements?.some(
      (e: any) => e.key === 'ADVANCED_MEGA_LOCATION' && e.value === 'true'
    );

    if (hasMegaLocation) {
      const megaFields = [
        { columnTitle: 'Parking Lot', prop: 'parkingLotName', isSelected: false, isDisabled: false, type: 'Standard' },
        { columnTitle: 'Point of Entry', prop: 'poeName', isSelected: false, isDisabled: false, type: 'Standard' },
        { columnTitle: 'Building', prop: 'buildingName', isSelected: false, isDisabled: false, type: 'Standard' }
      ];
      fields.splice(10, 0, ...megaFields); // Insert at index 10
    }
    return fields;
  }, []);

  // 3. Sort Custom Fields Alphabetically
  const processedCustomFields = useMemo(() => {
    if (!customFieldsRaw) return [];
    return [...customFieldsRaw]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cf => ({
        columnTitle: cf.name,
        prop: cf.name,
        isSelected: false,
        isDisabled: false,
        type: 'Custom'
      }));
  }, [customFieldsRaw]);

  // 4. Initialize from LocalStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedFields(JSON.parse(saved));
      } else {
        // Default: only enabled & selected standard fields
        setSelectedFields(allStandardFields.filter(f => f.isSelected && !f.isDisabled));
      }
    }
  }, [isOpen, allStandardFields]);

  const isFieldSelected = (title: string) => selectedFields.some(f => f.columnTitle === title);

  const toggleField = (field: any) => {
    if (field.isDisabled) return;

    setSelectedFields(prev => {
      const exists = prev.some(f => f.columnTitle === field.columnTitle);
      if (exists) return prev.filter(f => f.columnTitle !== field.columnTitle);
      return [...prev, field];
    });
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFields));
    showToast({
      message: 'Column settings saved successfully.',
      type: 'success'
    });
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onClose={onClose}
        className="tw:max-w-5xl tw:p-0  tw:overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="tw:flex-row tw:items-center tw:justify-between tw:px-8 tw:py-5 tw:border-b tw:border-gray-400">
          <DialogTitle className="tw:text-xl">Column Settings</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="tw:flex-1 tw:overflow-y-auto tw:px-8 tw:py-3">
          <div className="tw:grid tw:grid-cols-2 tw:gap-12">
            <Section
              title="Standard Columns"
              fields={allStandardFields}
              isSelected={isFieldSelected}
              onToggle={toggleField}
            />

            <Section
              title="Custom Field Columns"
              fields={processedCustomFields}
              isSelected={isFieldSelected}
              onToggle={toggleField}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="tw:px-8 tw:py-6 tw:border-t  tw:border-gray-400 ">
          <div className="tw:flex tw:justify-end tw:items-center tw:gap-4  ">
            <Button onClick={onClose}
              className="tw:px-6 tw:py-2.5 tw:text-sm tw:font-bold tw:text-slate-500 tw:rounded-lg"
              variant='outline'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="tw:px-10 tw:py-2.5 tw:text-white tw:text-sm tw:font-bold tw:rounded-lg"
            >
              Save
            </Button>
          </div>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default ColumnSettingsModal;
