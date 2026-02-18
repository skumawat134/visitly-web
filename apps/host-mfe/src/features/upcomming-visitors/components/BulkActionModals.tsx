import React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Checkbox,
    Select,
    SearchUserSelect,
} from '@visitly/ui';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkUpdatePreRegistrations, bulkCancelPreRegistrations } from '../api/upcomming-visitors.api';
import { useSites, useVisitorTypes, useHosts } from '../hooks/use-preregistration.queries';
import { useState } from 'react';

interface BulkCancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: string[];
    onSuccess: () => void;
}

export const BulkCancelModal: React.FC<BulkCancelModalProps> = ({
    isOpen,
    onClose,
    selectedIds,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [notifyVisitFlag, setNotifyVisitFlag] = useState(true);
    const [notifyHostFlag, setNotifyHostFlag] = useState(true);

    const mutation = useMutation({
        mutationFn: bulkCancelPreRegistrations,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upcomming-visitors'] });
            onSuccess();
            onClose();
        },
    });

    const handleCancel = () => {
        mutation.mutate({
            ids: selectedIds,
            notifyVisitFlag,
            notifyHostFlag,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="tw:max-w-md tw:rounded-2xl tw:p-0 tw:overflow-hidden">

                {/* Header */}
                <DialogHeader className="tw:px-6 tw:pt-6">
                    <DialogTitle className="tw:text-xl tw:font-semibold tw:text-gray-900">
                        Cancel Visits
                    </DialogTitle>
                </DialogHeader>

                {/* Body */}
                <div className="tw:px-6 tw:py-5 tw:space-y-5">

                    {/* Warning Box */}
                    <div className="tw:bg-red-50 tw:border tw:border-red-100 tw:rounded-xl tw:p-4">
                        <p className="tw:text-sm tw:text-red-700 tw:leading-relaxed">
                            You are about to cancel{" "}
                            <span className="tw:font-semibold">
                                {selectedIds.length} visit(s)
                            </span>.
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Notification Options */}
                    <div className="tw:bg-gray-50 tw:rounded-xl tw:p-4 tw:space-y-3">
                        <p className="tw:text-sm tw:font-medium tw:text-gray-700">
                            Notification Settings
                        </p>

                        <div className="tw:flex tw:flex-col tw:gap-3">
                            <label className="tw:flex tw:items-center tw:gap-3 tw:text-sm tw:text-gray-700">
                                <Checkbox
                                    checked={notifyVisitFlag}
                                    onChange={(e: any) =>
                                        setNotifyVisitFlag(e.target.checked)
                                    }
                                />
                                Notify Visitor
                            </label>

                            <label className="tw:flex tw:items-center tw:gap-3 tw:text-sm tw:text-gray-700">
                                <Checkbox
                                    checked={notifyHostFlag}
                                    onChange={(e: any) =>
                                        setNotifyHostFlag(e.target.checked)
                                    }
                                />
                                Notify Host
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:flex tw:justify-end tw:gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="tw:px-5"
                    >
                        Keep Visits
                    </Button>

                    <Button
                        variant="danger"
                        onClick={handleCancel}
                        isLoading={mutation.isPending}
                        className="tw:px-5"
                    >
                        Cancel Visits
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface BulkUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: string[];
    onSuccess: () => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ isOpen, onClose, selectedIds, onSuccess }) => {
    const queryClient = useQueryClient();
    const { data: sitesData } = useSites();
    const siteOptions = (sitesData as any)?.results?.map((s: any) => ({ label: s.name, value: s.id })) || [];

    const [hostSearch, setHostSearch] = useState('');
    const { data: hostsData } = useHosts(hostSearch);
    const hostOptions = (hostsData as any)?.results?.map((h: any) => ({ label: `${h.firstName} ${h.lastName}`, value: h.id, email: h.email })) || [];

    const [coHostSearch, setCoHostSearch] = useState('');
    const { data: coHostsData } = useHosts(coHostSearch); // useHosts can be used for co-hosts as well
    const coHostOptions = (coHostsData as any)?.results?.map((h: any) => ({ label: `${h.firstName} ${h.lastName}`, value: h.id, email: h.email })) || [];

    const mutation = useMutation({
        mutationFn: bulkUpdatePreRegistrations,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upcomming-visitors'] });
            onSuccess();
            onClose();
        },
    });

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
    const payload: any = { ids: selectedIds };

    const formatWithSeconds = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
    };

    if (values.siteId) payload.siteId = values.siteId;
    if (values.visitorTypeId) payload.visitorTypeId = values.visitorTypeId;
    if (values.groupName) payload.groupName = values.groupName;
    if (values.hostUserId) payload.hostUserId = values.hostUserId;
    if (values.cohostUserIds.length > 0) payload.cohostUserIds = values.cohostUserIds;

    if (values.scheduleCheckinDate)
        payload.scheduleCheckinDate = formatWithSeconds(values.scheduleCheckinDate);

    if (values.scheduleCheckoutDate)
        payload.scheduleCheckoutDate = formatWithSeconds(values.scheduleCheckoutDate);

    mutation.mutate(payload);
},

    });

    const { data: vtData } = useVisitorTypes(formik.values.siteId);
    const visitorTypeOptions = (vtData as any)?.results?.map((v: any) => ({ label: v.visitorType, value: v.id })) || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="tw:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update {selectedIds.length} Selected Visit(s)</DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="tw:py-4 tw:space-y-4">
                    <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                        <div className="tw:space-y-1.5">
                            <Label>Location</Label>
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
                            <Label>Visitor Type</Label>
                            <Select
                                name="visitorTypeId"
                                value={formik.values.visitorTypeId}
                                options={visitorTypeOptions}
                                disabled={!formik.values.siteId}
                                onChange={formik.handleChange}
                            />
                        </div>
                    </div>

                    <div className="tw:space-y-1.5">
                        <Label>Group Name</Label>
                        <Input
                            name="groupName"
                            value={formik.values.groupName}
                            onChange={formik.handleChange}
                            placeholder="Enter group name"
                        />
                    </div>

                    <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                        <div className="tw:space-y-1.5">
                            <Label>Host</Label>
                            <SearchUserSelect
                                options={hostOptions}
                                onSearch={setHostSearch}
                                onChange={(opt) => {
                                    const val = Array.isArray(opt) ? opt[0]?.value : opt?.value;
                                    formik.setFieldValue('hostUserId', val || '');
                                }}
                                placeholder="Search Host"
                            />
                        </div>

                        <div className="tw:space-y-1.5">
                            <Label>Co-Host(s)</Label>
                            <SearchUserSelect
                                options={coHostOptions}
                                onSearch={setCoHostSearch}
                                multi={true}
                                onChange={(opts) => {
                                    const values = Array.isArray(opts) ? opts.map((o: any) => o.value) : [];
                                    formik.setFieldValue('cohostUserIds', values);
                                }}
                                placeholder="Search Co-Hosts"
                            />
                        </div>
                    </div>

                    <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                        <div className="tw:space-y-1.5">
                            <Label>Scheduled Check-in</Label>
                            <Input
                                type="datetime-local"
                                name="scheduleCheckinDate"
                                value={formik.values.scheduleCheckinDate}
                                onChange={formik.handleChange}
                            />
                        </div>

                        <div className="tw:space-y-1.5">
                            <Label>Scheduled Check-out</Label>
                            <Input
                                type="datetime-local"
                                name="scheduleCheckoutDate"
                                value={formik.values.scheduleCheckoutDate}
                                onChange={formik.handleChange}
                            />
                        </div>
                    </div>

                    <DialogFooter className="tw:pt-4">
                        <Button variant="outline" type="button" onClick={onClose} disabled={mutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={mutation.isPending}>
                            Update Visits
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    );
};
