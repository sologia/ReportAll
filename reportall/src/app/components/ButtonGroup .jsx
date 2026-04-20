'use client'
import Link from "next/link";

const ButtonGroup = ({ buttons, containerClass = "", buttonClass = "" }) => {
  return (
    <div className={`flex flex-wrap items-center justify-center mt-6 gap-3 sm:gap-6 mb-10 px-3 ${containerClass}`}>
      {buttons.map((btn, index) => (
        <Link
          key={index}
          href={btn.href}
          className={`w-full sm:w-auto sm:min-w-56 max-w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base ${buttonClass}`}
        >
          {btn.label}
        </Link>
      ))}
    </div>
  );
};
export default ButtonGroup 