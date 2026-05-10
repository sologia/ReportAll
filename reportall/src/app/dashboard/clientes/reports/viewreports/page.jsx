'use client'

import dynamic from 'next/dynamic'
import ButtonBack from '@/app/components/ButtonBack'

const MyMap = dynamic(() => import('@/app/components/MyMapClient'), { ssr: false })

const ViewReportClient = () => {
  return (
    <div className='rounded-2xl'>
      <ButtonBack />

      <div className='rounded-2xl h-screen w-full'>
        <MyMap />
      </div>

    </div>
  )
}

export default ViewReportClient