"use client"

import ButtonGroup from '@/app/components/ButtonGroup '
import React from 'react'
import { getSession } from '@/lib/auth'
import { normalizeRole } from '@/lib/rbac'

const TowExample = () => {
  const role = normalizeRole(getSession()?.role)

  const buttonsByRole = {
    administrador: [
      { label: "Reportes", href: "/dashboard/enacal/reports/viewreports" },
      { label: "Resumen IT", href: "/dashboard/enacal/reports/summary" },
      { label: "Estadísticas", href: "/dashboard/enacal/reports/statistics" },
      { label: "Cuadrillas", href: "/dashboard/enacal/craw" },
      { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
      { label: "Pruebas RNF", href: "/dashboard/enacal/security-tests" },
    ],
    director_it: [
      { label: "Resumen IT", href: "/dashboard/enacal/reports/summary" },
      { label: "Resumen cuadrillas", href: "/dashboard/enacal/craw/report-summary" },
      { label: "Mapa de Reportes", href: "/dashboard/enacal/reports/summary/map" },
      { label: "Estadísticas", href: "/dashboard/enacal/reports/statistics" },
      { label: "Pruebas RNF", href: "/dashboard/enacal/security-tests" },
    ],
    cuadrilla: [
      { label: "Mis reportes asignados", href: "/dashboard/enacal/crew/reports" },
    ],
    lider_cuadrilla: [
      { label: "Asignaciones", href: "/dashboard/enacal/assignments" },
      { label: "Crear asignación", href: "/dashboard/enacal/assignments/createassignments" },
      { label: "Modificar estado", href: "/dashboard/enacal/assignments/updateassignments" },
    ],
  }

  const buttons = buttonsByRole[role] || buttonsByRole.administrador

  return (
    <>
      <ButtonGroup
        containerClass="flex flex-col items-center justify-center mt-12 gap-12"
        buttonClass="w-80 m-auto mt-3"
        buttons={buttons}
      />
    </>
  )
}
export default TowExample
