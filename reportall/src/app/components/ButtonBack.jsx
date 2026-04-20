'use client';

import { useRouter } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";

const ButtonBack = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="mt-4 ml-4 mb-6 w-24 max-w-full">
      <button
        type="button"
        className="w-full flex items-center bg-[#b0b0b0] rounded-full px-3 py-2 shadow-sm cursor-pointer hover:bg-[#E0D8E5] transition-colors"
        onClick={handleGoBack}
        aria-label="Volver a la vista anterior"
      >
        <IoMdArrowRoundBack className="text-gray-600 mr-2 text-lg" />

        <span className="cursor-pointer text-sm">Atrás</span>
      </button>
    </div>
  );
}
export default ButtonBack;