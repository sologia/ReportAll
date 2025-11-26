import ButtonBack from '@/app/components/ButtonBack'
import MyMap from '@/app/page'

const ViewReportClient = () => {
  return (
    <div className='rounded-2xl '>
        <ButtonBack/>
        
        <div className=''>
        {/* <div className='rounded-2xl h-screen w-full'> */}
            <MyMap/>
        </div>

    </div>
  )
}

export default ViewReportClient