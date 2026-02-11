import React from 'react';
import { useLoaderStore } from '@visitly/app-store';

type FullScreenLoaderProps = {
    forceShow?: boolean
} 

 const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({forceShow}) => {
  const isLoadingFromStore = useLoaderStore((state) => state.isLoading);
  const isVisible = typeof forceShow === 'boolean' ? forceShow : isLoadingFromStore;
  if (!isVisible) return null;
  return (
    <div
      className="
        tw:fixed tw:inset-0 tw:z-[9999]
        tw:flex tw:items-center tw:justify-center
        tw:bg-white/70 tw:backdrop-blur-[2px]
      "
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="tw:flex tw:flex-col tw:items-center tw:gap-4">
        {/* Spinner */}
        <div
          className="
            tw:h-12 tw:w-12
            tw:rounded-full
            tw:border-4
            tw:border-primary-100/30
            tw:border-t-primary-100
            tw:animate-spin
          "
        />

        {/* Text */}
        {/* <p className="tw:text-sm tw:text-gray-600 tw:font-medium">
          Loading, please wait…
        </p> */}
      </div>
    </div>
  );
};


export default FullScreenLoader;