import { Button } from '@visitly/ui';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type MFEErrorFallbackProps = {
  title?: string;
  description?: string;
  showRetry?: boolean;
};

const MAX_RELOAD_ATTEMPTS = 3;
const STORAGE_KEY = 'mfe_reload_attempts';

 const MFEErrorFallback: React.FC<MFEErrorFallbackProps> = ({
  title = 'Unable to load this section',
  description = 'Something went wrong while loading this module. Please try again or return to the previous page.',
  showRetry = true,
}) => {
 const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    const storedAttempts = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
    setAttempts(storedAttempts);
  }, []);

  const handleRetry = () => {
    if (attempts >= MAX_RELOAD_ATTEMPTS) return;

    const nextAttempts = attempts + 1;
    sessionStorage.setItem(STORAGE_KEY, String(nextAttempts));
    setAttempts(nextAttempts);

    window.location.reload();
  };

  const isLimitReached = attempts >= MAX_RELOAD_ATTEMPTS;

  return (
    <div
      className="
        tw:min-h-[60vh] tw:h-[100vh] tw:w-full
        tw:flex tw:items-center tw:justify-center
        tw:bg-white
        tw:px-6
      "
      role="alert"
    >
      <div
        className="
          tw:max-w-md
          tw:w-full
          tw:text-center
          tw:flex tw:flex-col tw:items-center
        "
      >
        {/* Error Icon */}
        <div
          className="
            tw:mb-6
            tw:flex tw:h-14 tw:w-14
            tw:items-center tw:justify-center
            tw:rounded-full
            tw:bg-red-50
          "
        >
          <svg
            className="tw:h-7 tw:w-7 tw:text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="tw:text-sm tw:text-gray-600 tw:mb-6">
          {description}
        </p>

        {/* Actions */}
        <div className="tw:flex tw:flex-col sm:tw:flex-row tw:gap-3 tw:w-full sm:tw:justify-center">
          {showRetry  && (
            <button
              onClick={handleRetry}
              className={`
              tw:w-full sm:tw:w-auto
              tw:px-4 tw:py-2
              tw:text-sm tw:font-medium
              tw:rounded tw:transition-colors
              ${
                isLimitReached
                  ? 'tw:bg-gray-300 tw:text-gray-500 tw:cursor-not-allowed'
                  : 'tw:bg-primary-100 tw:text-white hover:tw:bg-blue-700'
              }
            `}
            >
              Try again
            </button>
          )}

            <Link
            to="/"
            className="
              tw:w-full sm:tw:w-auto
              tw:px-4 tw:py-2
              tw:text-sm tw:font-medium
              tw:text-gray-700
              tw:bg-gray-100
              hover:tw:bg-gray-200
              tw:rounded
              tw:transition-colors
              tw:text-center
            "
          >
            Go to home
          </Link>
        </div>

        {/* Support hint */}
        <p className="tw:mt-6 tw:text-xs tw:text-gray-400">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default MFEErrorFallback;
