import React, { useMemo } from "react";
import { cn } from './utils' // adjust import path

export interface AvatarProps {
  name?: string;
  url?: string | null | undefined;
  size?: number; // px
  className?: string;
}

/** Generate initials */
function getInitials(name?: string): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  const first = parts[0];
  const second = parts[1];

  if (!first) return "?";
  if (!second) return first.charAt(0).toUpperCase();

  return (first.charAt(0) + second.charAt(0)).toUpperCase();
}



/** Generate deterministic random color based on name */
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export const NamedAvatar: React.FC<AvatarProps> = ({
  name = "",
  url,
  size = 40,
  className,
}) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => stringToColor(name || "default"), [name]);

  return (
    <div
      className={cn(
        "tw:flex tw:items-center tw:justify-center tw:font-semibold tw:text-white tw:rounded-full tw:overflow-hidden tw:select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: url ? undefined : bgColor,
        fontSize: size * 0.42,
      }}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="tw:w-full tw:h-full tw:object-cover"
          loading="lazy"
        />
      ) : (
        initials
      )}
    </div>
  );
};
