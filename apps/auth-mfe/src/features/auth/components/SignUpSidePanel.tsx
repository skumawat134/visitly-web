import React from "react";
import { Image } from "@visitly/ui";

const SignUpSidePanel: React.FC = () => {
  return (
    <div
      className="tw:w-full tw:md:w-2/3   tw:bg-[#F5F1FF] tw:p-4 md:tw:p-8 tw:pt-8 flex-1"
      data-testid="branding-panel"
    >
      <div data-testid="step1-branding">
        <h1
          className="tw:text-4xl tw:mt-4 tw:font-bold tw:mb-8 tw:text-gray-900"
          data-testid="step1-title"
        >
          Get Started With Visitly
        </h1>

        <p
          className="tw:text-gray-700 tw:mb-6 tw:leading-relaxed"
          data-testid="step1-description"
        >
          Free 14-day trial – No credit card required <br />
          Secure, compliant, and reliable <br />
          Easy setup, ready in minutes
        </p>

        {/* Brand Logos */}
        <div
          className="tw:flex tw:justify-center tw:mt-10"
          data-testid="step1-logos"
        >
          <Image
            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge1.png"
            alt="Brand Logo 1"
            width={80}
            height={90}
            className="tw:mx-2"
            data-testid="badge1"
          />

          <Image
            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge2.png"
            alt="Brand Logo 2"
            width={80}
            height={90}
            className="tw:mx-2"
            data-testid="badge2"
          />

          <Image
            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge3.png"
            alt="Brand Logo 3"
            width={70}
            height={90}
            className="tw:mx-2"
            data-testid="badge3"
          />
        </div>
      </div>
    </div>
  );
};
export default SignUpSidePanel;
