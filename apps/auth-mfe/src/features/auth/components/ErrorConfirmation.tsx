import React from 'react';
import appLogo from '@/assets/images/logo.png';

const ErrorConfirmation = () => {
   return (
     <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:items-center tw:justify-center tw:p-2">
                <div className="tw:max-w-3xl tw:w-full tw:bg-[#fff] tw:p-4 tw:rounded-lg">
                    <div className="tw:mb-8 tw:px-4 tw:mt-2">
                        <img src={appLogo} alt="Visitly Logo" className="tw:h-9 tw:w-auto" />
                    </div>
                    <div className="tw:px-4">
                        <h2 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:mb-6">Verify Registration</h2>
                        <div className=" tw:rounded-md  tw:mb-4">
                            <div className="tw:flex">
                                <p className="tw:text-gray-600 tw:text-[16px]">
                                    The link you are trying to access is invalid or has expired, please contact{' '}
                                    <a href="mailto:help@visitly.io" className="tw:text-blue-600 tw:hover:tw:underline tw:font-medium">help@visitly.io</a> for assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
   )
}   

export default ErrorConfirmation; 