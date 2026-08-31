"use client"

import ButtonGroup from '@/app/components/ButtonGroup '
import PageHeaderCard from '@/app/components/PageHeaderCard'
import React from 'react'
import { getSession } from '@/lib/auth'
import { normalizeRole } from '@/lib/rbac'

const TowExample = () => {
  const role = normalizeRole(getSession()?.role)

  const buttonsByRole = {
    administrador: [
      { label: "Ver todos los reportes", href: "/dashboard/enacal/reports/viewreports" },
      { label: "Ver resumen IT", href: "/dashboard/enacal/reports/summary" },
      { label: "Ver estadisticas", href: "/dashboard/enacal/reports/statistics" },
      { label: "Ver resumen por cuadrilla", href: "/dashboard/enacal/craw/report-summary" },
      { label: "Gestionar cuadrillas", href: "/dashboard/enacal/craw" },
      { label: "Gestionar asignaciones", href: "/dashboard/enacal/assignments" },
      { label: "Gestionar matriculas", href: "/dashboard/enacal/vehicles" },
      { label: "Ver mapa de reportes", href: "/dashboard/enacal/reports/summary/map" },
      // { label: "Gestionar accesos de cuadrillas", href: "/dashboard/enacal/craw/accounts" },
      // { label: "Pruebas RNF", href: "/dashboard/enacal/security-tests" },
    ],
    director_it: [
      { label: "Ver mapa de reportes", href: "/dashboard/enacal/reports/summary/map" },
      { label: "Ver resumen IT", href: "/dashboard/enacal/reports/summary" },
      { label: "Ver estadisticas", href: "/dashboard/enacal/reports/statistics" },
      { label: "Ver resumen por cuadrilla", href: "/dashboard/enacal/craw/report-summary" },
      { label: "Gestionar matriculas", href: "/dashboard/enacal/vehicles" },
      { label: "Gestionar accesos de cuadrillas", href: "/dashboard/enacal/craw/accounts" },
      // { label: "Pruebas RNF", href: "/dashboard/enacal/security-tests" },
    ],
    cuadrilla: [
      { label: "Ver mis reportes asignados", href: "/dashboard/enacal/crew/reports" },
    ],
    lider_cuadrilla: [
      { label: "Ver asignaciones", href: "/dashboard/enacal/assignments" },
      { label: "Crear una asignacion", href: "/dashboard/enacal/assignments/createassignments" },
      { label: "Actualizar estado de asignacion", href: "/dashboard/enacal/assignments/updateassignments" },
      { label: "Gestionar matriculas", href: "/dashboard/enacal/vehicles" },
      { label: "Gestionar accesos de cuadrillas", href: "/dashboard/enacal/craw/accounts" },
    ],
  }

  const buttons = buttonsByRole[role] || buttonsByRole.administrador

  return (
    <div className='space-y-6'>
      <PageHeaderCard
        title='Menú Principal'
        description='Selecciona una opción para continuar. Las rutas disponibles dependen de tu rol.'
      />

      <ButtonGroup
        containerClass="md:grid-cols-2"
        buttonClass="min-h-16"
        buttons={buttons}
      />
    </div>
  )
}
export default TowExample
