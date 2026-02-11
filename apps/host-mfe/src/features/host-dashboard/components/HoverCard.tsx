import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, User, Clock, MapPin, Building } from 'lucide-react';
import { Avatar } from './Avatar';
import { Visitor } from '../types/host-dashboard.types';

interface HoverCardProps {
    visitor: Visitor;
    isUpcoming: boolean;
    anchorRect: { clientX: number; clientY: number } | null;
    containerRef: React.RefObject<HTMLDivElement>;
}

function formatTime(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
}

export const HoverCard: React.FC<HoverCardProps> = ({ visitor, isUpcoming, anchorRect, containerRef }) => {
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!anchorRect || !containerRef?.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const cursorY = anchorRect.clientY;
        const cursorX = anchorRect.clientX;

        let top = cursorY - containerRect.top + 12;
        const left = cursorX - containerRect.left + 16;

        if (cardRef.current) {
            const cardH = cardRef.current.offsetHeight;
            if (cursorY + cardH + 12 > window.innerHeight) {
                top = cursorY - containerRect.top - cardH - 12;
            }
        }
        setPos({ top, left: Math.min(left, containerRect.width - 280) });
    }, [anchorRect, containerRef]);

    const v = visitor;
    const photoUri = v.visitPhotoURI || '';
    const checkinLabel = isUpcoming ? 'Scheduled' : 'Checked in';
    const checkinValue = isUpcoming
        ? formatTime(v.scheduleCheckinDate)
        : formatTime(v.checkinTime);

    return (
        <div
            ref={cardRef}
            className="tw:absolute tw:z-50 tw:w-64 tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:shadow-xl tw:overflow-hidden tw:pointer-events-none"
            style={{ top: pos.top, left: pos.left }}
        >
            <div className="tw:w-full tw:h-40 tw:bg-gray-100 tw:flex tw:items-center tw:justify-center tw:overflow-hidden">
                {photoUri ? (
                    <img
                        src={photoUri}
                        alt={v.fullName}
                        className="tw:w-full tw:h-full tw:object-cover"
                    />
                ) : (
                    <Avatar name={v.fullName} size={90} />
                )}
            </div>

            <div className="tw:p-4">
                <div className="tw:text-sm tw:font-semibold tw:text-gray-900 tw:truncate">
                    {v.fullName}
                </div>
                {v.companyName && (
                    <div className="tw:text-xs tw:text-gray-500 tw:mt-1 tw:flex tw:items-center tw:gap-1.5">
                        <Building size={12} className="tw:text-gray-400 tw:flex-shrink-0" />
                        {v.companyName}
                    </div>
                )}

                <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-3 tw:pt-3 tw:border-t tw:border-gray-100">
                    {v.email && (
                        <div className="tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:text-gray-500">
                            <Mail size={12} className="tw:text-gray-400 tw:flex-shrink-0" />
                            <span className="tw:truncate">{v.email}</span>
                        </div>
                    )}
                    <div className="tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:text-gray-500">
                        <User size={12} className="tw:text-gray-400 tw:flex-shrink-0" />
                        Host: {v.hostName}
                    </div>
                    <div className="tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:text-gray-500">
                        <MapPin size={12} className="tw:text-gray-400 tw:flex-shrink-0" />
                        {v.siteName}
                    </div>
                    {checkinValue && (
                        <div className="tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:text-gray-500">
                            <Clock size={12} className="tw:text-gray-400 tw:flex-shrink-0" />
                            {checkinLabel}: {checkinValue}
                        </div>
                    )}
                </div>

                <div className="tw:mt-3 tw:text-[10px] tw:text-gray-400 tw:text-center">
                    Click to view full details
                </div>
            </div>
        </div>
    );
};
