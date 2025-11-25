import ButtonGroup from '@/app/components/ButtonGroup '
import SearchBar from '@/app/components/SearchBar'

const ViewReports = () => {
  return (
    <>
        <div>
            <ButtonGroup
            buttons={[
              { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
              { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
              { label: "Menu", href: "/dashboard/enacal" },
            ]}
            />

        </div>
        

        <div>

            <SearchBar/>
            
        </div>
    </>
  )
}

export default ViewReports