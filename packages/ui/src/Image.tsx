import React from 'react';
import { cn } from './utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source */
  src: string;
  /** Alternate text for accessibility */
  alt: string;
  /** Optional wrapper class – only renders a wrapper div when provided */
  wrapperClassName?: string;
  /** Enable rounded corners */
  rounded?: boolean;
  /** Make image full width */
  fullWidth?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  wrapperClassName,
  rounded = false,
  fullWidth = false,
  loading = 'lazy',
  width,
  height,
  ...rest
}) => {
  const imgEl = (
    <img
      src={src}
      alt={alt}
      loading={loading}
      width={width}
      height={height}
      className={cn(
        'tw:block tw:max-w-full',
        rounded && 'tw:rounded-lg',
        fullWidth && 'tw:w-full',
        className
      )}
      {...rest}
    />
  );

  // Only wrap in a div when wrapperClassName is explicitly provided
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{imgEl}</div>;
  }

  return imgEl;
};
