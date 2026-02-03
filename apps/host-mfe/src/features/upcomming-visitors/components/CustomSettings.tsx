import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { getCustomFields } from '../api/upcomming-visitors.api';

export const STORAGE_KEY = 'columnSettingsForUpcomingVisitors';

const ColumnSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<any[]>([]);

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
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="tw:fixed tw:inset-0 tw:z-[100] tw:flex tw:items-center tw:justify-center tw:bg-black/50 tw:backdrop-blur-sm tw:p-4">
      <div className="tw:w-full tw:max-w-4xl tw:bg-white tw:rounded-xl tw:shadow-2xl tw:flex tw:flex-col tw:max-h-[85vh]">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-8 tw:py-5 tw:border-b tw:border-gray-100">
          <h2 className="tw:text-xl tw:font-bold tw:text-slate-800">Column Settings</h2>
          <button onClick={onClose} className="tw:p-2 tw:rounded-full hover:tw:bg-gray-100 tw:transition-colors">
            <X size={20} className="tw:text-slate-400" />
          </button>
        </div>

        <div className="tw:flex-1 tw:overflow-y-auto tw:p-8">
          <div className="tw:grid tw:grid-cols-2 tw:gap-12">
            {/* Standard Columns Section */}
            <section>
              <h3 className="tw:text-xs tw:font-black tw:uppercase tw:tracking-widest tw:text-slate-400 tw:mb-6">Standard Columns</h3>
              <div className="tw:grid tw:gap-y-3">
                {allStandardFields.map(field => (
                  <FieldCheckbox 
                    key={field.columnTitle} 
                    field={field} 
                    checked={isFieldSelected(field.columnTitle) || field.isDisabled} 
                    onToggle={() => toggleField(field)} 
                  />
                ))}
              </div>
            </section>

            {/* Custom Columns Section */}
            <section>
              <h3 className="tw:text-xs tw:font-black tw:uppercase tw:tracking-widest tw:text-slate-400 tw:mb-6">Custom Field Columns</h3>
              <div className="tw:grid tw:gap-y-3">
                {processedCustomFields.map(field => (
                  <FieldCheckbox 
                    key={field.columnTitle} 
                    field={field} 
                    checked={isFieldSelected(field.columnTitle)} 
                    onToggle={() => toggleField(field)} 
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="tw:px-8 tw:py-6 tw:border-t tw:border-gray-100 tw:flex tw:justify-end tw:gap-4 tw:bg-slate-50/50">
          <button onClick={onClose} className="tw:px-6 tw:py-2.5 tw:text-sm tw:font-bold tw:text-slate-500 hover:tw:text-slate-700">Cancel</button>
          <button onClick={handleSave} className="tw:px-10 tw:py-2.5 tw:bg-indigo-600 tw:text-white tw:text-sm tw:font-bold tw:rounded-lg tw:shadow-lg tw:shadow-indigo-200 hover:tw:bg-indigo-700 tw:transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const FieldCheckbox = ({ field, checked, onToggle }: any) => (
  <label className={`tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors ${field.isDisabled ? 'tw:opacity-50 tw:cursor-not-allowed' : 'tw:cursor-pointer hover:tw:bg-slate-50'}`}>
    <div className={`tw:w-5 tw:h-5 tw:rounded tw:border tw:flex tw:items-center tw:justify-center tw:transition-all ${checked ? 'tw:bg-indigo-600 tw:border-indigo-600' : 'tw:border-slate-300 tw:bg-white'}`}>
      {checked && <Check size={14} className="tw:text-white" strokeWidth={4} />}
      <input type="checkbox" className="tw:hidden" checked={checked} disabled={field.isDisabled} onChange={onToggle} />
    </div>
    <span className={`tw:text-sm ${checked ? 'tw:font-semibold tw:text-slate-800' : 'tw:text-slate-600'}`}>{field.columnTitle}</span>
  </label>
);

export default ColumnSettingsModal;