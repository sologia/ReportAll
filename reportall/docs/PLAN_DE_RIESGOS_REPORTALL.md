# Plan de Riesgos del Proyecto ReportALL

Fecha: 2026-05-28

## 1. Objetivo y alcance

Este documento consolida el plan de riesgos del proyecto ReportALL a partir del análisis del repositorio, la documentación técnica disponible, el estado de pruebas y la estructura observada en el documento de referencia compartido por el equipo.

El alcance cubre:

- Frontend web en Next.js y React.
- Backend API en Express.
- Integración con SQL Server.
- Módulo de autenticación y autorización por roles.
- Creación, consulta y seguimiento de reportes operativos.
- Carga de evidencias multimedia.
- Operación, mantenimiento, pruebas y despliegue local documentado.

## 2. Contexto del sistema

ReportALL es una aplicación web para registrar, consultar y gestionar reportes operativos. La arquitectura observada en el repositorio está compuesta por:

- Frontend en Next.js 15 y React 19, con proxy de llamadas API definido en [next.config.mjs](../next.config.mjs).
- Backend en Express 5 con autenticación JWT, cookies y middleware RBAC en [backend/server.js](../backend/server.js), [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js) y [backend/src/middlewares/rbac.js](../backend/src/middlewares/rbac.js).
- Persistencia en SQL Server mediante [backend/src/config/db.js](../backend/src/config/db.js) y procedimientos almacenados documentados en [backend/README.md](../backend/README.md) y la carpeta [backend/sql](../backend/sql).
- Carga de archivos por memoria con Multer en [backend/src/Routes/Report.js](../backend/src/Routes/Report.js) y UI de archivos en [src/app/components/MultiFileUpload.jsx](../src/app/components/MultiFileUpload.jsx).

## 3. Metodología de evaluación

Se usa una matriz cualitativa con escala de 1 a 5 para probabilidad e impacto.

- 1: Muy bajo
- 2: Bajo
- 3: Medio
- 4: Alto
- 5: Muy alto

El nivel del riesgo se obtiene con la exposición Probabilidad x Impacto.

- 1 a 5: Bajo
- 6 a 10: Medio
- 11 a 15: Alto
- 16 a 25: Crítico

## 4. Análisis FODA del proyecto

### Fortalezas

- Existe una base funcional de frontend y backend ya integrada para desarrollo local, descrita en [README.md](../README.md).
- El backend cuenta con autenticación JWT, refresh token y RBAC inicial en [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js) y [backend/src/middlewares/rbac.js](../backend/src/middlewares/rbac.js).
- El sistema tiene scripts SQL y semillas para apoyar pruebas funcionales y de datos en [backend/sql](../backend/sql).
- Hay evidencia de pruebas automatizadas y trazabilidad funcional en [TEST_REPORT_TP.md](../TEST_REPORT_TP.md), [docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md](../docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md) y [docs/testing-evidence/ANALISIS_TRAZABILIDAD_UI_REPORTALL.md](../docs/testing-evidence/ANALISIS_TRAZABILIDAD_UI_REPORTALL.md).

### Debilidades

- Existen endpoints críticos sin protección RBAC en rutas de reportes, clientes y cuadrillas.
- La seguridad depende de secretos por defecto y compatibilidad legacy que amplían la superficie de ataque.
- La carga de archivos se procesa en memoria y no tiene límites de tamaño ni validación efectiva de tipo en backend.
- La cobertura automática actual es parcial respecto a los casos de negocio de mayor riesgo.
- Se observaron inconsistencias entre documentación, scripts y configuración real del sistema.

### Oportunidades

- El proyecto ya dispone de una base suficiente para formalizar endurecimiento de seguridad, pruebas E2E y pipeline de validación.
- La existencia de seeds, scripts de concurrencia y endpoints de health facilita crear controles operativos y de regresión.
- La separación frontend y backend permite mejorar despliegue, observabilidad y seguridad de forma incremental.

### Amenazas

- Acceso no autorizado o alteración de datos por rutas expuestas.
- Denegación de servicio por carga de archivos grandes o payloads masivos.
- Pérdida de sesiones o comportamiento inconsistente al escalar el backend.
- Incidentes de datos por conexiones de base de datos sin cifrado robusto.
- Retrasos en entrega o defectos en producción por baja cobertura integral de pruebas.

## 5. Registro de riesgos del proyecto

| ID | Riesgo | Categoría | Prob. | Impacto | Exposición | Nivel |
|---|---|---|---:|---:|---:|---|
| R01 | Acceso o modificación no autorizada por endpoints sin protección de roles | Seguridad | 5 | 5 | 25 | Crítico |
| R02 | Compromiso de autenticación por secretos por defecto, compatibilidad legacy y exposición del token | Seguridad | 4 | 5 | 20 | Crítico |
| R03 | Caída o degradación del backend por carga de archivos y payloads sin límites | Disponibilidad | 4 | 5 | 20 | Crítico |
| R04 | Exposición de datos o tráfico interceptable hacia SQL Server por cifrado/configuración débil | Seguridad / Infraestructura | 4 | 5 | 20 | Crítico |
| R05 | Gestión inconsistente de sesiones por refresh tokens almacenados solo en memoria | Arquitectura | 4 | 4 | 16 | Crítico |
| R06 | Defectos críticos no detectados por cobertura parcial y pruebas bloqueadas por entorno | Calidad | 5 | 4 | 20 | Crítico |
| R07 | Incidentes funcionales en el flujo de evidencias y sesión del frontend | Funcional | 4 | 4 | 16 | Crítico |
| R08 | Errores operativos por documentación y configuración inconsistente entre entorno y código real | Operación | 4 | 3 | 12 | Alto |
| R09 | Baja capacidad de respuesta ante incidentes por observabilidad limitada | Operación | 3 | 4 | 12 | Alto |
| R10 | Deuda técnica y ambigüedad de mantenimiento por código obsoleto y estructuras duplicadas | Mantenimiento | 3 | 3 | 9 | Medio |

## 6. Evaluación y evidencias por riesgo

### R01. Acceso o modificación no autorizada por endpoints sin protección de roles

Evidencia observada:

- [backend/src/Routes/Report.js](../backend/src/Routes/Report.js) expone operaciones GET, POST, PUT y DELETE sin requireRoles, salvo la actualización de urgencia.
- [backend/src/Routes/Crew.js](../backend/src/Routes/Crew.js) deja crear, editar y eliminar cuadrillas sin middleware de autorización.
- [backend/src/Routes/Client.js](../backend/src/Routes/Client.js) deja crear, editar y eliminar clientes sin middleware de autorización.

Consecuencia:

- Un usuario no autenticado o con contexto manipulado podría consultar, crear, modificar o eliminar información sensible del negocio.

Respuesta propuesta:

- Aplicar RBAC explícito a todas las rutas sensibles.
- Revisar permisos por rol según caso de uso real del negocio.
- Incorporar pruebas de autorización por endpoint y por token real.

Responsable sugerido: Líder backend.

### R02. Compromiso de autenticación por secretos por defecto, compatibilidad legacy y exposición del token

Evidencia observada:

- [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js) define JWT_SECRET y REFRESH_TOKEN_SECRET con valores por defecto inseguros.
- [backend/src/middlewares/rbac.js](../backend/src/middlewares/rbac.js) mantiene compatibilidad con headers legacy x-user-role, x-client-id, x-leader-crew-id y x-crew-id.
- [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js) expone el access token en la respuesta cuando el entorno no es production.
- [src/lib/auth.js](../src/lib/auth.js) guarda sesión y token en cookies accesibles desde JavaScript, lo que aumenta la exposición ante XSS.

Consecuencia:

- El control de acceso puede ser suplantado o debilitado si se despliega sin endurecer secretos, si un cliente abusa del modo legacy o si el frontend queda expuesto a robo de token.

Respuesta propuesta:

- Obligar secretos sin defaults en ambientes no locales.
- Deshabilitar el modo legacy una vez completada la migración.
- Evitar exponer el access token en el body cuando ya existe cookie HttpOnly en backend.
- Mover la sesión sensible al backend y reducir datos autenticados persistidos del lado del cliente.

Responsable sugerido: Líder backend y responsable de seguridad.

### R03. Caída o degradación del backend por carga de archivos y payloads sin límites

Evidencia observada:

- [backend/src/Routes/Report.js](../backend/src/Routes/Report.js) usa Multer con memoryStorage y sin límites de tamaño.
- [backend/server.js](../backend/server.js) usa express.json y express.urlencoded sin límites explícitos.
- [backend/scripts/concurrency-test.js](../backend/scripts/concurrency-test.js) evidencia que existe preocupación por concurrencia, pero no hay control de rate limit en el servidor.

Consecuencia:

- Un archivo grande o muchas solicitudes simultáneas pueden agotar memoria, degradar tiempos de respuesta o interrumpir la disponibilidad del servicio.

Respuesta propuesta:

- Establecer límites de tamaño, cantidad y tipo de archivo.
- Definir límites de payload JSON y formularios.
- Incorporar rate limiting y controles de abuso por IP y usuario.
- Evaluar almacenamiento temporal en disco o almacenamiento externo en vez de memoria para cargas pesadas.

Responsable sugerido: Líder backend e infraestructura.

### R04. Exposición de datos o tráfico interceptable hacia SQL Server por cifrado/configuración débil

Evidencia observada:

- [backend/src/config/db.js](../backend/src/config/db.js) usa trustServerCertificate: true.
- [backend/src/config/db.js](../backend/src/config/db.js) solo activa encrypt cuando DB_ENCRYPT es exactamente true.

Consecuencia:

- La conexión a base de datos puede operar sin cifrado efectivo o con validación laxa del certificado, elevando riesgo de interceptación o mala configuración persistente.

Respuesta propuesta:

- Activar cifrado por defecto para ambientes no locales.
- Eliminar trustServerCertificate en entornos productivos.
- Validar configuración crítica de base de datos al arranque y fallar temprano si es insegura.

Responsable sugerido: Backend e infraestructura.

### R05. Gestión inconsistente de sesiones por refresh tokens almacenados solo en memoria

Evidencia observada:

- [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js) conserva activeRefreshTokenByUserId en un Map en memoria del proceso.

Consecuencia:

- Reinicios del backend invalidan sesiones activas.
- Un despliegue con múltiples instancias no compartiría el estado de revocación y rotación de refresh token.

Respuesta propuesta:

- Persistir refresh tokens o identificadores de sesión en base de datos o caché centralizada.
- Definir política de revocación, expiración y cierre de sesión consistente entre nodos.

Responsable sugerido: Arquitecto técnico o líder backend.

### R06. Defectos críticos no detectados por cobertura parcial y pruebas bloqueadas por entorno

Evidencia observada:

- [TEST_REPORT_TP.md](../TEST_REPORT_TP.md) marca como bloqueadas o pendientes la mayoría de las pruebas de negocio de alto impacto.
- [docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md](../docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md) confirma que TP-02, TP-03, TP-04, TP-06, TP-08, TP-09, TP-10 y TP-11 siguen pendientes o bloqueadas.
- [jest.config.mjs](../jest.config.mjs) muestra una configuración básica, pero no cubre por sí sola pruebas E2E, de carga o de infraestructura.

Consecuencia:

- El sistema puede pasar pruebas unitarias ligeras y aun así fallar en carga de archivos, flujos completos, base de datos, rendimiento o seguridad.

Respuesta propuesta:

- Crear entorno controlado para pruebas integrales con SQL Server y datos semilla.
- Añadir pruebas E2E del flujo completo crear-asignar-actualizar-cerrar.
- Añadir pruebas de seguridad y de tamaño límite para archivos.
- Incorporar ejecución automatizada de smoke tests antes de despliegues.

Responsable sugerido: QA y líderes frontend/backend.

### R07. Incidentes funcionales en el flujo de evidencias y sesión del frontend

Evidencia observada:

- [src/app/components/MultiFileUpload.jsx](../src/app/components/MultiFileUpload.jsx) elimina archivos de la lista visual local, pero removeFile no vuelve a informar al componente padre mediante onFilesSelect.
- [src/app/dashboard/clientes/reports/createreports/page.jsx](../src/app/dashboard/clientes/reports/createreports/page.jsx) envía el primer archivo presente en el estado del padre, por lo que puede persistir una evidencia que el usuario cree haber quitado.
- [src/lib/auth.js](../src/lib/auth.js) combina cookies propias accesibles por JavaScript con compatibilidad legacy en headers.

Consecuencia:

- Puede existir inconsistencia entre lo que el usuario ve y lo que realmente se envía al backend.
- Se incrementa el riesgo de errores operativos y de privacidad en evidencias adjuntas.

Respuesta propuesta:

- Sincronizar la eliminación de archivos con el estado del padre.
- Validar en backend y frontend tipo, cantidad y tamaño de evidencias.
- Simplificar el manejo de sesión del cliente para evitar dobles mecanismos innecesarios.

Responsable sugerido: Líder frontend.

### R08. Errores operativos por documentación y configuración inconsistente entre entorno y código real

Evidencia observada:

- [README.md](../README.md) indica frontend en puerto 3000, mientras [package.json](../package.json) ejecuta Next.js en 3002.
- [backend/README.md](../backend/README.md) documenta variables parciales y muestra prácticas que no deberían trasladarse a producción sin endurecimiento.

Consecuencia:

- Los miembros del equipo pueden configurar mal el entorno, fallar validaciones o perder tiempo en incidencias evitables.

Respuesta propuesta:

- Unificar documentación, puertos, variables requeridas y valores seguros por ambiente.
- Añadir checklist de puesta en marcha y checklist de despliegue.

Responsable sugerido: Líder técnico.

### R09. Baja capacidad de respuesta ante incidentes por observabilidad limitada

Evidencia observada:

- [backend/src/config/logger.js](../backend/src/config/logger.js) escribe logs estructurados a consola, pero no define persistencia, rotación, alertamiento ni integración externa.
- [backend/src/Routes/System.js](../backend/src/Routes/System.js) incluye health y error controlado, lo que abre la posibilidad de instrumentación, pero aún no se observa una estrategia operativa integral.

Consecuencia:

- Los incidentes pueden detectarse tarde, con poca trazabilidad histórica y sin indicadores de degradación temprana.

Respuesta propuesta:

- Definir destino centralizado de logs, retención y alertas mínimas.
- Instrumentar métricas de disponibilidad, latencia, tasa de error y tamaño de payload.
- Registrar eventos clave de autenticación, errores de archivos y fallos de base de datos.

Responsable sugerido: Infraestructura y backend.

### R10. Deuda técnica y ambigüedad de mantenimiento por código obsoleto y estructuras duplicadas

Evidencia observada:

- [backend/src/app.js](../backend/src/app.js) contiene una configuración antigua con CORS abierto, distinta del servidor real en [backend/server.js](../backend/server.js).
- El proyecto mezcla carpetas y convenciones distintas entre backend y frontend, lo que incrementa la ambigüedad para nuevos cambios.

Consecuencia:

- Puede reutilizarse accidentalmente código antiguo o tomarse como referencia una configuración que no representa el comportamiento actual.

Respuesta propuesta:

- Eliminar o aislar código obsoleto.
- Normalizar convenciones de estructura y dejar clara la ruta de arranque oficial.

Responsable sugerido: Líder técnico.

## 7. Priorización visual de riesgos

### Riesgos críticos

- R01. Endpoints sin protección de roles.
- R02. Autenticación debilitada por defaults, modo legacy y exposición del token.
- R03. Carga de archivos y payloads sin límites.
- R04. Configuración insegura de conexión a base de datos.
- R05. Sesiones no escalables por refresh token en memoria.
- R06. Cobertura insuficiente en pruebas de negocio.
- R07. Inconsistencias funcionales en evidencias y sesión del frontend.

### Riesgos altos

- R08. Documentación y configuración inconsistente.
- R09. Observabilidad insuficiente.

### Riesgo medio

- R10. Deuda técnica y código obsoleto.

## 8. Plan de mitigación por riesgo

| ID | Acción preventiva | Medida de mitigación / contingencia | Responsable | Horizonte |
|---|---|---|---|---|
| R01 | Proteger todos los endpoints mutables y sensibles con requireRoles | Auditoría completa de permisos y pruebas de autorización por endpoint | Backend | Inmediato |
| R02 | Eliminar secretos por defecto, desactivar modo legacy y dejar de exponer token en body | Rotación de secretos y revisión de sesión lado cliente | Backend / Seguridad | Inmediato |
| R03 | Definir límites de archivos y payloads, más rate limiting | Bloqueo de cargas excesivas y respuesta controlada ante abuso | Backend / Infra | Inmediato |
| R04 | Forzar cifrado y validación correcta del certificado en SQL Server | Validación de variables críticas al arranque y endurecimiento por ambiente | Backend / Infra | Corto plazo |
| R05 | Persistir sesiones o refresh tokens en almacenamiento compartido | Invalidación controlada y soporte para escalado horizontal | Backend | Corto plazo |
| R06 | Implementar pruebas E2E, integración con BD y casos de archivos | Pipeline de smoke tests antes de liberar cambios | QA / Desarrollo | Corto plazo |
| R07 | Corregir sincronización de archivos y simplificar manejo de sesión en frontend | Pruebas funcionales sobre adjuntos y sesión | Frontend | Corto plazo |
| R08 | Actualizar README y variables requeridas por ambiente | Checklist operativo de arranque y despliegue | Líder técnico | Corto plazo |
| R09 | Centralizar logs y alertas mínimas | Monitoreo de errores, latencia y disponibilidad | Infra / Backend | Mediano plazo |
| R10 | Retirar código obsoleto y alinear convenciones | Menor ambigüedad de mantenimiento y onboarding | Líder técnico | Mediano plazo |

## 9. Monitoreo y control de riesgos

Se recomienda manejar este plan como documento vivo, revisado al menos una vez por sprint o cada quincena operativa.

Indicadores sugeridos:

- Número de endpoints protegidos frente al total de endpoints críticos.
- Número de variables sensibles sin configuración segura por ambiente.
- Porcentaje de TPs críticos automatizados y ejecutados con éxito.
- Tasa de errores 5xx por endpoint.
- Tiempo medio de respuesta de endpoints sensibles.
- Tamaño promedio y máximo de archivos cargados.
- Frecuencia de reinicios del backend con pérdida de sesión.

Eventos que deben disparar revisión del plan:

- Publicación a un entorno compartido o productivo.
- Cambio en autenticación o roles.
- Incorporación de nuevas rutas de reporte, archivos o analytics.
- Incidencia de seguridad, caída de servicio o corrupción de datos.

## 10. Resumen ejecutivo

El análisis del proyecto muestra que ReportALL tiene una base funcional valiosa, pero su riesgo principal no está en la ausencia de funcionalidades sino en la madurez incompleta de sus controles. Los riesgos más altos se concentran en seguridad de acceso, endurecimiento de autenticación, protección de archivos, configuración de base de datos y falta de pruebas integrales.

La prioridad inmediata debe centrarse en cerrar exposición de endpoints, endurecer autenticación, imponer límites de carga y ejecutar pruebas de extremo a extremo sobre los flujos críticos del negocio. Una vez contenido ese frente, el siguiente foco debe ser estabilizar operación y mantenimiento mediante mejor documentación, observabilidad y reducción de deuda técnica.

## 11. Anexo de fuentes revisadas

- [README.md](../README.md)
- [package.json](../package.json)
- [next.config.mjs](../next.config.mjs)
- [TEST_REPORT_TP.md](../TEST_REPORT_TP.md)
- [docs/testing-evidence/ANALISIS_TRAZABILIDAD_UI_REPORTALL.md](../docs/testing-evidence/ANALISIS_TRAZABILIDAD_UI_REPORTALL.md)
- [docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md](../docs/testing-evidence/RESUMEN_PRUEBAS_CON_CAPTURAS.md)
- [backend/README.md](../backend/README.md)
- [backend/server.js](../backend/server.js)
- [backend/src/app.js](../backend/src/app.js)
- [backend/src/config/db.js](../backend/src/config/db.js)
- [backend/src/config/logger.js](../backend/src/config/logger.js)
- [backend/src/Controllers/AuthController.js](../backend/src/Controllers/AuthController.js)
- [backend/src/middlewares/rbac.js](../backend/src/middlewares/rbac.js)
- [backend/src/Routes/Report.js](../backend/src/Routes/Report.js)
- [backend/src/Routes/Crew.js](../backend/src/Routes/Crew.js)
- [backend/src/Routes/Client.js](../backend/src/Routes/Client.js)
- [backend/src/Routes/Assigment.js](../backend/src/Routes/Assigment.js)
- [backend/src/Routes/System.js](../backend/src/Routes/System.js)
- [backend/scripts/concurrency-test.js](../backend/scripts/concurrency-test.js)
- [src/lib/auth.js](../src/lib/auth.js)
- [src/lib/rbac.js](../src/lib/rbac.js)
- [src/app/components/MultiFileUpload.jsx](../src/app/components/MultiFileUpload.jsx)
- [src/app/dashboard/clientes/reports/createreports/page.jsx](../src/app/dashboard/clientes/reports/createreports/page.jsx)