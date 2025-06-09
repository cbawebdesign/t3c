
import React from 'react';

const LogoImage: React.FC<{
  className?: string;
}> = ({ className }) => {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/dalpha01-24590.appspot.com/o/t3.jpeg?alt=media&token=9fef1acb-d2c0-44e6-b87d-ddeca1a92a7d'; // Replace with your actual image URL

  return (
    <img
      className={`${className ?? 'w-[95px] sm:w-[105px]'}`}
      src={logoUrl}
      alt="Logo"
    />
  );
};

export default LogoImage;