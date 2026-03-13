'use client'
import Link from "next/link";

const ButtonGroup = ({ buttons, containerClass = "", buttonClass = "" }) => {
  return (
    <div className={`flex items-center justify-center mt-6 gap-6 mb-10 ${containerClass}`}>
      {buttons.map((btn, index) => (
        <Link
          key={index}
          href={btn.href}
          className={`w-70 text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition ${buttonClass}`}
        >
          {btn.label}
        </Link>
      ))}
    </div>
  );
};
export default ButtonGroup 