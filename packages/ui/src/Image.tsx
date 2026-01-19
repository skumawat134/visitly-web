import React from 'react';

export interface ImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image source
   */
  src: string;

  /**
   * Alternate text for accessibility
   */
  alt: string;

  /**
   * Optional wrapper class (useful for layout control)
   */
  wrapperClassName?: string;

  /**
   * Enable rounded image
   */
  rounded?: boolean;

  /**
   * Enable full width image
   */
  fullWidth?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  rounded = false,
  fullWidth = false,
  loading = 'lazy',
  ...rest
}) => {
  return (
    <div className={wrapperClassName}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={[
          'tw-block tw-max-w-full',
          rounded ? 'tw-rounded-lg' : '',
          fullWidth ? 'tw-w-full' : '',
          className,
        ].join(' ')}
        {...rest}
      />
    </div>
  );
};

