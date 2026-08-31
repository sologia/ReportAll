'use client';

import { useRouter } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";

const ButtonBack = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="mt-2 ml-1 sm:ml-2 mb-5 w-28 max-w-full">
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 shadow-sm cursor-pointer hover:bg-sky-50 hover:border-sky-200"
        onClick={handleGoBack}
        aria-label="Volver a la vista anterior"
      >
        <IoMdArrowRoundBack className="text-slate-600 text-lg" />
        <span className="text-sm font-medium">Volver</span>
      </button>
    </div>
  );
}
export default ButtonBack;