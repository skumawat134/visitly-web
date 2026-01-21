import React from 'react';
import { Link } from 'react-router-dom';
import appLogo from '@/assets/images/logo.png';
import Company1 from '@/assets/images/companies1.png';
import Company2 from '@/assets/images/companies2.png';
import Company3 from '@/assets/images/companies3.png';
import Company4 from '@/assets/images/companies4.png';
import Company5 from '@/assets/images/companies5.png';
import Company6 from '@/assets/images/companies6.png';
import HitachiLogo from '@/assets/images/Hitachi.svg';
import HyundaiLogo from '@/assets/images/Hyundai.svg';

const COMPANY_LOGOS = [
    Company1,
    Company2,
    Company3,
    Company4,
    Company5,
    Company6,
    HitachiLogo,
    HyundaiLogo
];
import '../css/confirm.css'
const SuccessConfirmation : React.FC<{viewState: string | null}> = ({viewState}) => {
    return (
         <div className="tw:min-h-screen tw:bg-white tw:flex tw:flex-col tw:min-[992px]:flex-row">
            {/* Left Panel */}
            <div className="tw:w-full tw:min-[992px]:w-2/3 tw:flex tw:flex-col tw:justify-center tw:p-1 tw:lg:p-8 tw:min-[992px]:border-r tw:border-gray-100 tw:bg-white tw:z-10 tw:min-h-[50vh] tw:min-[992px]:min-h-screen tw:min-[992px]:w-1/2 tw:max-w-lg tw:mx-auto">
                <div className="tw:w-full tw:max-w-md tw:flex tw:p-6 tw:flex-col tw:items-start">
                    {/* Logo */}
                    <div className="tw:w-full tw:mb-6 tw:pt-1 tw:px-2">
                        <img src={appLogo} alt="Visitly Logo" className="tw:h-9 tw:w-auto" />
                    </div>
                    {/* Content */}
                    <div className="tw:w-full tw:mb-8 ">
                        <h3 className="tw:text-[20px] tw:font-bold tw:text-gray-900 tw:mb-3">Email Confirmation</h3>
                            <p className="gray tw:text-[14px] tw:leading-relaxed">
                                You've successfully registered with Visitly! Click the button below to log in and get started.
                            </p>
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