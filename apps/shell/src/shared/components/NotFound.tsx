import React from "react";
import ErrorBackgroundLogo from '@/assets/images/error-bg.jpg';

const NotFound: React.FC = () => {
  return (
    <section
      className="
        tw:min-h-screen
        tw:flex
        tw:items-center
        tw:justify-center
        tw:bg-center
        tw:bg-cover
        tw:bg-no-repeat
      "
      style={{
        backgroundImage: `url(${ErrorBackgroundLogo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="tw:text-center tw:px-4">
        <h1 className="tw:text-primary-100 tw:text-[120px] tw:font-extrabold tw:leading-none">
          404
        </h1>

        <h3 className="tw:text-xl tw:uppercase tw:font-semibold tw:mt-4">
          Page Not Found !
        </h3>

        <p className="tw:text-gray-500 tw:mt-4 tw:mb-4 tw:tracking-wide">
          YOU SEEM TO BE TRYING TO FIND HIS WAY HOME
        </p>
      </div>
    </section>
  );
};

export default NotFound;
