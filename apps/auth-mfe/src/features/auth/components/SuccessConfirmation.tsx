import React from 'react';
import { Link } from 'react-router-dom';
 const LOGO_URL = '/assets/images/logo.png';
const COMPANY_LOGOS = [
    'assets/images/companies1.png', 'assets/images/companies2.png',
    'assets/images/companies3.png', 'assets/images/companies4.png',
    'assets/images/companies5.png', 'assets/images/companies6.png',
    'assets/images/Hitachi.svg', 'assets/images/Hyundai.svg'
];

const SuccessConfirmation : React.FC<{viewState: string | null}> = ({viewState}) => {
    return (
         <div className="tw:min-h-screen tw:bg-white tw:flex  min-[992px]:tw:flex-row">
            {/* Left Panel */}
            <div className="tw:w-full min-[992px]:tw:w-2/3 tw:flex tw:flex-col tw:justify-center tw:p-8 lg:tw:p-12 min-[992px]:tw:border-r tw:border-gray-100 tw:bg-white tw:z-10 tw:min-h-[50vh] min-[992px]:tw:min-h-screen min-[992px]:tw:w-1/2 tw:max-w-lg tw:mx-auto">
                <div className="tw:w-full tw:max-w-md tw:flex tw:p-6 tw:flex-col tw:items-start">
                    {/* Logo */}
                    <div className="tw:w-full tw:mb-6 tw:pt-1 tw:px-2">
                        <img src={LOGO_URL} alt="Visitly Logo" className="tw:h-9 tw:w-auto" />
                    </div>
                    {/* Content */}
                    <div className="tw:w-full tw:mb-8 ">
                        <h3 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:mb-3">Email Confirmation</h3>
                        {viewState === 'verifying' ? (
                            <p className="tw:text-gray-500 tw:animate-pulse">Verifying your email...</p>
                        ) : (
                            <p className="tw:text-[rgba(50, 53, 55, 0.7)] tw:text-[14px] tw:leading-relaxed">
                                You've successfully registered with Visitly! Click the button below to log in and get started.
                            </p>
                        )}
                    </div>
                    {/* Action Button */}
                    <div className="tw:w-full tw:mb-10">
                        <Link to="/visitly/login" className="tw:flex tw:items-center tw:justify-center tw:w-full tw:bg-[#5E2CED] tw:hover:tw:bg-[#3b27b8] tw:text-white tw:font-medium tw:py-1 tw:rounded-sm tw:transition-colors tw:shadow-sm">
                            Return to log in
                        </Link>
                    </div>
                    {/* Company Logos Carousel */}
                    <div className="tw:w-full tw:mt-auto tw:bg-[linear-gradient(135deg,#f8f9fb_0%,#e9ecef_100%)] tw:rounded-xl tw:p-6">
                        <p className="tw:text-center tw:text-sm tw:font-medium tw:text-gray-900 tw:mb-6">Trusted by leading companies worldwide</p>
                        <div className="tw:w-full tw:overflow-hidden tw:relative tw:mask-gradient">
                            {/* CSS for infinite scroll matching original logic */}
                            <style>{`
                                @keyframes scroll-logos {
                                    0% { transform: translateX(0); }
                                    100% { transform: translateX(-50%); }
                                }
                                .animate-scroll-logos {
                                    animation: scroll-logos 30s linear infinite;
                                }
                                .animate-scroll-logos:hover {
                                    animation-play-state: paused;
                                }
                             `}</style>
                            <div className="tw:flex tw:w-max animate-scroll-logos tw:items-center">
                                {/* Original Set */}
                                {COMPANY_LOGOS.map((logo, i) => (
                                    <img key={`l1-${i}`} src={logo} alt="Company Logo" className="tw:h-8 tw:w-auto tw:mx-6 tw:opacity-60 tw:grayscale tw:hover:tw:grayscale-0 tw:hover:tw:opacity-100 tw:transition-all tw:duration-300" />
                                ))}
                                {/* Duplicate Set */}
                                {COMPANY_LOGOS.map((logo, i) => (
                                    <img key={`l2-${i}`} src={logo} alt="Company Logo" className="tw:h-8 tw:w-auto tw:mx-6 tw:opacity-60 tw:grayscale tw:hover:tw:grayscale-0 tw:hover:tw:opacity-100 tw:transition-all tw:duration-300" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Panel - Calendly */}
            <div className="tw:w-full min-[992px]:tw:w-2/3 tw:bg-[#E5E9FF] tw:flex tw:flex-col tw:relative tw:min-h-[50vh] min-[992px]:tw:min-h-screen">
                {/* Calendly Widget Container */}
                <div id="calendly-id" className="tw:w-full tw:h-full tw:min-h-full tw:flex-1"></div>
            </div>
        </div>
    )
}

export default SuccessConfirmation;