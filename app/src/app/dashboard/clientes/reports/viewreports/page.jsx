import ButtonBack from '@/app/components/ButtonBack'
import MyMap from '@/app/page'

const ViewReportClient = () => {
  return (
    <div>
        <ButtonBack/>
        
        <div className='rounded-2xl h-screen w-full'>
            <MyMap/>
        </div>

    </div>
  )
}

export default ViewReportClient