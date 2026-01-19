import { Link } from "react-router-dom";
import React from "react";
import appLogo from '@/assets/images/logo.png';



const IdleConfirmation : React.FC<{}> = () => {
   return (
            <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:items-center tw:justify-center tw:px-4">
                <div className="tw:max-w-3xl tw:w-full tw:bg-white tw:p-6 tw:rounded-lg tw:shadow-sm">
                    <div className="tw:mb-5 tw:px-2">
                        <img src={appLogo} alt="Visitly Logo" className="tw:h-9 tw:w-auto" />
                    </div>
                    <div className="tw:px-1">
                        <h2 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:mb-2 font-inter">You're Almost There!</h2>
                        <div className="tw:rounded-md">
                            <p className="tw:text-gray-600 tw:flex tw:items-start tw:gap-2">
                                <span>Check your email to verify your account and login to the Visitly dashboard.</span>
                            </p>
                        </div>
                        <p className="tw:text-gray-600 tw:mb-6 tw:text-sm">
                            <span className="tw:font-bold tw:text-gray-900">Need help getting started?</span> <span className="tw:px-1">Visit our </span>
                            <span  className="tw:text-[#5E2CED] tw:hover:tw:underline">Help Center</span> for setup guides and support.
                        </p>
                        <Link to="/visitly/login" className="tw:block tw:w-full tw:bg-[#5E2CED] tw:text-[14px] tw:text-white tw:text-center tw:font-medium tw:py-2 tw:rounded-md tw:transition-colors">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
}

export default IdleConfirmation;    