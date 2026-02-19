import React from 'react';

interface AvatarProps {
    name: string;
    src?: string;
    size?: number;
}

const COLORS = [
    '#4F46E5', '#7C3AED', '#2563EB', '#0891B2',
    '#059669', '#D97706', '#DC2626', '#DB2777',
];

function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getInitials(name: string) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 40 }) => {
    const initials = getInitials(name);
    const bg = COLORS[hashCode(name || '') % COLORS.length];

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className="tw:rounded-full tw:object-cover tw:flex-shrink-0"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className="tw:rounded-full tw:text-white tw:flex tw:items-center tw:justify-center tw:font-semibold tw:flex-shrink-0 tw:tracking-wider"
            style={{
                width: size,
                height: size,
                backgroundColor: bg,
                fontSize: size * 0.38,
            }}
        >
            {initials}
        </div>
    );
};
