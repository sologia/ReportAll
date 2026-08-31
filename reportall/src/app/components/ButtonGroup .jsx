'use client'
import Link from "next/link";

const ButtonGroup = ({ buttons, containerClass = "", buttonClass = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-stretch mt-4 gap-3 sm:gap-4 mb-6 px-1 sm:px-2 ${containerClass}`}>
      {buttons.map((btn, index) => (
        <Link
          key={index}
          href={btn.href}
          className={`w-full min-h-14 max-w-full text-center bg-white border border-slate-200 text-slate-800 py-3.5 px-4 rounded-xl hover:bg-sky-50 hover:border-sky-200 hover:-translate-y-0.5 shadow-sm transition text-sm sm:text-base font-semibold flex items-center justify-center ${buttonClass}`}
        >
          {btn.label}
        </Link>
      ))}
    </div>
  );
};
export default ButtonGroup 