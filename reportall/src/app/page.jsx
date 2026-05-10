'use client'

import dynamic from 'next/dynamic'

const MyMapClient = dynamic(() => import('@/app/components/MyMapClient'), { ssr: false })

export default function MyMap() {
  return <MyMapClient />
}