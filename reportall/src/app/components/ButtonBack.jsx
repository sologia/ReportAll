'use client';

import { useRouter } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";

const ButtonBack = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="mt-4 ml-4 mb-6 w-24">
      <div
        className="flex items-center bg-[#b0b0b0] rounded-full px-3 py-2 shadow-sm cursor-pointer hover:bg-[#E0D8E5] transition-colors"
        onClick={handleGoBack}
      >
        <IoMdArrowRoundBack className="text-gray-600 mr-2 text-lg" />

        <label className="cursor-pointer text-sm">Atrás</label>
      </div>
    </div>
  );
}
export default ButtonBack;