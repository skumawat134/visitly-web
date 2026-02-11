import React, { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useLoaderStore } from '@visitly/app-store';

export const GlobalLoader: React.FC = () => {
  const showLoader = useLoaderStore((s) => s.showLoader);
  const stopLoader = useLoaderStore((s) => s.stopLoader);

  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.showLoader !== false,
  });

  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.showLoader !== false,
  });

  useEffect(() => {
    if (isFetching + isMutating > 0) {
      showLoader();
    } else {
      stopLoader();
    }
  }, [isFetching, isMutating, showLoader, stopLoader]);

  return null; // Loader renders via FullScreenLoader
};

