import React, { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SearchUserSelect,
} from '@visitly/ui';
import { useFormik } from 'formik';
import { useSites, useVisitorTypes, useHosts } from '../hooks/use-preregistration.queries';
import { useBulkUpdatePreRegistrations } from '../hooks/useBulkUpdatePreRegistrations';
import { useEntitlements } from "@/features/visitor-detail/hooks/useEntitlement";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onSuccess,
}) => {
  const { isCoHostsEntitled } = useEntitlements()

  /* -------------------- Custom Hook -------------------- */
  const { submitBulkUpdate, isLoading } = useBulkUpdatePreRegistrations({
    selectedIds,
    onClose,
    onSuccess,
  });

  /* -------------------- Sites -------------------- */
  const { data: sitesData } = useSites();
  const siteOptions =
    (sitesData as any)?.results?.map((s: any) => ({
      label: s.name,
      value: s.id,
    })) || [];

  /* -------------------- Hosts -------------------- */
  const [hostSearch, setHostSearch] = useState('');
  const { data: hostsData } = useHosts(hostSearch);
  const hostOptions =
    (hostsData as any)?.results?.map((h: any) => ({
      label: `${h.firstName} ${h.lastName}`,
      value: h.id,
      email: h.email,
    })) || [];

  /* -------------------- Co-Hosts -------------------- */
  const [coHostSearch, setCoHostSearch] = useState('');
  const { data: coHostsData } = useHosts(coHostSearch);
  const coHostOptions =
    (coHostsData as any)?.results?.map((h: any) => ({
      label: `${h.firstName} ${h.lastName}`,
      value: h.id,
      email: h.email,
    })) || [];

  /* -------------------- Formik -------------------- */
  const formik = useFormik({
    initialValues: {
      siteId: '',
      visitorTypeId: '',
      groupName: '',
      hostUserId: '',
      cohostUserIds: [] as string[],
      scheduleCheckinDate: '',
      scheduleCheckoutDate: '',
    },
    onSubmit: (values) => {
      submitBulkUpdate(values);
    },
  });

  /* -------------------- Visitor Types -------------------- */
  const { data: vtData } = useVisitorTypes(formik.values.siteId);
  const visitorTypeOptions =
    (vtData as any)?.results?.map((v: any) => ({
      label: v.visitorType,
      value: v.id,
    })) || [];

  if (!isOpen) return null;

  return (
    <div
      className="
        tw:fixed tw:inset-0 tw:z-50
        tw:flex tw:items-center tw:justify-center
        tw:bg-black/40 tw:backdrop-blur-sm
        tw:p-4 tw:sm:p-6
      "
      onClick={onClose}
    >
      <div
        className="
          tw:relative tw:w-full tw:max-w-3xl
          tw:rounded-2xl tw:bg-white tw:shadow-2xl tw:shadow-black/25
          tw:border tw:border-gray-200/70
          tw:max-h-[92vh] tw:overflow-y-auto
          tw:transition-all tw:duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tw:sticky tw:top-0 tw:z-10 tw:bg-white tw:px-6 tw:pt-6 tw:pb-4 tw:border-b tw:border-gray-100">
          <div className="tw:flex tw:items-center tw:justify-between">
            <h2 className="tw:text-xl tw:font-semibold tw:text-gray-900 tw:tracking-tight">
              Bulk Update — {selectedIds.length} Visit
              {selectedIds.length !== 1 ? 's' : ''}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="tw:rounded-full tw:p-1.5 tw:hover:bg-gray-100 tw:transition-colors"
            >
              <span className="tw:text-xl tw:text-gray-500">×</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={formik.handleSubmit}
          className="tw:px-6 tw:pb-8 tw:pt-6 tw:space-y-7"
        >
          {/* Row 1 */}
          <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
            <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Location
              </Label>
              <Select
                name="siteId"
                value={formik.values.siteId}
                options={siteOptions}
                onChange={(e) => {
                  formik.setFieldValue('siteId', e.target.value);
                  formik.setFieldValue('visitorTypeId', '');
                }}
              />
            </div>

            <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Visitor Type
              </Label>
              <Select
                name="visitorTypeId"
                value={formik.values.visitorTypeId}
                options={visitorTypeOptions}
                disabled={!formik.values.siteId}
                onChange={formik.handleChange}
              />
            </div>
          </div>


          {/* Dates */}
          <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
            <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Scheduled Check-in
              </Label>
              <Input
                type="datetime-local"
                name="scheduleCheckinDate"
                value={formik.values.scheduleCheckinDate}
                onChange={formik.handleChange}
                className="tw:h-10"
              />
            </div>

            <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Scheduled Check-out
              </Label>
              <Input
                type="datetime-local"
                name="scheduleCheckoutDate"
                value={formik.values.scheduleCheckoutDate}
                onChange={formik.handleChange}
                className="tw:h-10"
              />
            </div>
          </div>

           {/* Hosts */}
          <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
            <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Host
              </Label>
              <SearchUserSelect
                options={hostOptions}
                onSearch={setHostSearch}
                onChange={(opt) => {
                  const val = Array.isArray(opt)
                    ? opt[0]?.value
                    : opt?.value;
                  formik.setFieldValue('hostUserId', val || '');
                }}
                placeholder="Search for host..."
              />
            </div>

            {isCoHostsEntitled && <div className="tw:space-y-1.5">
              <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
                Co-Host(s)
              </Label>
              <SearchUserSelect
                options={coHostOptions}
                onSearch={setCoHostSearch}
                multi={true}
                onChange={(opts) => {
                  const values = Array.isArray(opts)
                    ? opts.map((o: any) => o.value)
                    : [];
                  formik.setFieldValue('cohostUserIds', values);
                }}
                placeholder="Add one or more co-hosts..."
              />
            </div>}
          </div>

           {/* Group Name */}
          <div className="tw:space-y-1.5">
            <Label className="tw:text-sm tw:font-medium tw:text-gray-700">
              Group Name
            </Label>
            <Input
              name="groupName"
              value={formik.values.groupName}
              onChange={formik.handleChange}
              placeholder="Optional — e.g. Conference Group A"
              className="tw:h-10"
            />
          </div>

          {/* Buttons */}
          <div className="tw:flex tw:justify-end tw:gap-3 tw:pt-5">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="tw:min-w-28 tw:h-10"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={isLoading}
              className="tw:min-w-36 tw:h-10"
            >
              Apply Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
