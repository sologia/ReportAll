# Analisis y adaptacion de requerimientos UI para ReportALL

Fecha: 2026-04-16

## 1. Relacion de la tabla original con el proyecto

El proyecto ReportALL no corresponde a un catalogo de vehiculos. Su interfaz actual esta centrada en:

- autenticacion y acceso por roles
- consulta de reportes y estados
- filtros de reportes
- creacion de reportes con mapa, direccion, sector y adjuntos
- actualizacion de urgencia para perfiles autorizados

Pantallas y componentes donde hoy aplica esta evaluacion:

- `src/app/components/ButtonGroup .jsx`
- `src/app/components/SearchBar.jsx`
- `src/app/components/SimpleTable.jsx`
- `src/app/components/MultiFileUpload.jsx`
- `src/app/dashboard/clientes/reports/createreports/page.jsx`
- `src/app/dashboard/clientes/reports/viewreports/page.jsx`
- `src/app/dashboard/enacal/reports/viewreports/page.jsx`
- `src/app/dashboard/enacal/security-tests/page.jsx`

## 2. Evaluacion de pertinencia de los requerimientos originales

| ID | Estado en ReportALL | Relacion real con el proyecto | Sugerencia |
|---|---|---|---|
| R-UI-01 | Aplica | Los CTAs principales existen en menus, formularios y acciones de guardado. | Mantener un solo patron para botones primarios en `ButtonGroup`, formularios y tablas. |
| R-UI-02 | Aplica con ajuste | No existen campos criticos "Precio" y "Modelo"; aqui los datos clave son Problema, Urgencia, Estado y Direccion. | Sustituir "Precio/Modelo" por los datos criticos del reporte y exigir contraste AA. |
| R-UI-03 | Aplica con ajuste | El flujo de filtros existe en vista de reportes ENACAL, pero no como boton sticky en movil. | Reformularlo para filtros de reportes y acciones frecuentes accesibles en movil. |
| R-UI-04 | No aplica como esta escrito | No hay tarjeta de vehiculo. La UI actual usa tablas y formularios. | Cambiarlo por jerarquia visual de Urgencia, Estado y Fecha del reporte. |
| R-UI-05 | Aplica | Ya hay feedback con SweetAlert y estados como `Enviando...` o `Guardando...`. | Formalizar tiempos de respuesta visual y persistencia del estado recargado desde API. |
| R-UI-06 | Aplica | Hay vistas con tablas, filtros, mapa y formularios que deben responder bien en movil y desktop. | Definir breakpoints para tablas, formularios y mapa sin solapamientos. |
| R-UI-07 | Aplica | Hay botones, selects, links y acciones tactiles en varias pantallas. | Exigir minimo 44x44 px para controles interactivos. |
| R-UI-08 | Aplica con ajuste | Tiene sentido para listados, mapa y carga de evidencias, no para galerias de vehiculos. | Usar skeletons para tablas y lazy loading donde haya mapa, adjuntos o imagenes. |
| R-UI-09 | No aplica como esta escrito | Hoy no hay campo Precio ni un flujo fuerte de entrada numerica manual. | Cambiarlo por validacion y tipo correcto de inputs del formulario de reporte. |
| R-UI-10 | Aplica | Existen iconos en busqueda, filtro, carga de archivos y mapas. | Unificar iconografia por accion y evitar duplicidad semantica. |

## 3. Observaciones de diseno detectadas en la implementacion actual

| Area | Hallazgo | Impacto |
|---|---|---|
| Botones | Se repite el patron azul de CTA, pero no esta tokenizado en una capa de sistema de diseno. | Riesgo de inconsistencia futura. |
| Filtros | La vista `enacal/reports/viewreports` tiene filtros funcionales, pero sin comportamiento sticky ni optimizacion movil. | Uso mas dificil en pantallas pequenas. |
| Tablas | `SimpleTable` resuelve consistencia basica, pero no hay version responsive definida para movil. | Posible overflow horizontal y perdida de jerarquia. |
| Formularios | `createreports/page.jsx` ya valida campos y muestra feedback, pero la distribucion actual prioriza desktop. | Friccion de uso en movil. |
| Carga percibida | Se usan mensajes de carga simples, no skeletons. | Percepcion visual menos fluida. |
| Tokens visuales | `globals.css` tiene variables minimas, pero no hay tokens claros para CTA, radios, espaciado o estados. | Dificulta auditoria de consistencia. |

## 4. Nueva tabla de requerimientos UI adaptada a ReportALL

| ID | Tipo | Requerimiento | Razonamiento | Criterio de Aceptacion (Exito) |
|---|---|---|---|---|
| R-UI-RP-01 | No funcional (Consistencia) | Todos los CTAs primarios de ReportALL usan el mismo color, radio, altura y estado hover/disabled. | Evita inconsistencias entre menus, formularios y acciones de tabla. | Auditoria visual: botones primarios de navegacion, filtrado, envio y guardado coinciden al 100%. |
| R-UI-RP-02 | No funcional (Legibilidad) | Los datos criticos del reporte (Problema, Urgencia, Estado, Direccion) deben ser legibles sin zoom y con contraste WCAG AA. | Son los datos principales para seguimiento y toma de decision. | Revision en movil y desktop: contraste AA y lectura sin zoom. |
| R-UI-RP-03 | Funcional (Accesibilidad de acciones) | La accion principal de filtrado o consulta debe permanecer facilmente accesible en movil. | Reduce friccion durante la exploracion de reportes extensos. | En pruebas moviles el usuario puede aplicar filtros sin perder acceso a la accion principal. |
| R-UI-RP-04 | Funcional (Jerarquia visual) | La urgencia y el estado del reporte deben destacar visualmente por encima de metadatos secundarios. | Permite identificar mas rapido reportes criticos. | Urgencia y Estado se distinguen con peso visual, color o posicion consistente. |
| R-UI-RP-05 | No funcional (Feedback) | Acciones como crear reporte, actualizar urgencia y cargar datos muestran feedback inmediato y estado visible durante el proceso. | El usuario debe saber que la accion fue recibida y completada. | Mensaje o cambio de estado visible en menos de 200 ms y control deshabilitado mientras procesa. |
| R-UI-RP-06 | No funcional (Responsividad) | Formularios, tablas, mapa y acciones deben adaptarse a movil, tablet y escritorio sin solapamientos ni cortes. | La app se usa en contextos operativos y administrativos con dispositivos distintos. | Pruebas en 3 breakpoints sin overlap, corte de texto critico ni desbordes no controlados. |
| R-UI-RP-07 | No funcional (Tap targets) | Todos los controles interactivos en movil deben medir al menos 44x44 px. | Reduce errores tactiles. | Validacion DOM/CSS y prueba manual satisfactoria. |
| R-UI-RP-08 | No funcional (Carga percibida) | Los listados, tablas y secciones dependientes de API deben mostrar skeletons o placeholders de carga consistentes. | Mejora la percepcion de rendimiento y reduce incertidumbre. | Durante carga se muestran placeholders visibles y desaparecen al recibir datos. |
| R-UI-RP-09 | Funcional (Formularios) | El formulario de creacion de reporte debe usar controles adecuados por tipo de dato y validar campos obligatorios antes del envio. | Reduce errores de captura y reprocesos. | Problema, sector, direccion, fecha y ubicacion se validan antes de enviar; el envio incompleto no procede. |
| R-UI-RP-10 | No funcional (Iconografia) | Los iconos de busqueda, filtro, carga y mapa deben ser unicos, semanticos y consistentes. | Evita ambiguedad operativa. | Revisión del set de iconos sin duplicidad semantica y con uso coherente por accion. |
| R-UI-RP-11 | Funcional (Navegacion por rol) | Las acciones visibles en dashboard y vistas operativas deben corresponder al rol autenticado y mantener etiquetas claras. | Reduce errores de navegacion y expectativas falsas. | Cada rol solo ve acciones permitidas y comprensibles en pruebas funcionales. |

## 5. Casos de prueba adaptados a ReportALL

| ID | Caso de Prueba | Pasos (resumido) | Resultado Esperado | Req. Relacionado |
|---|---|---|---|---|
| TC-RP-01 | Verificar consistencia de CTAs | Navegar menu principal, formularios y tablas con accion de guardado | Todos los CTAs primarios coinciden en estilo base | R-UI-RP-01 |
| TC-RP-02 | Validar legibilidad de datos criticos | Abrir listados y tabla de reportes en movil y desktop | Problema, Urgencia, Estado y Direccion se leen sin zoom y con contraste adecuado | R-UI-RP-02 |
| TC-RP-03 | Accesibilidad del filtrado en movil | Hacer scroll en la vista de reportes y aplicar filtros desde movil | La accion principal de filtrado sigue siendo facil de alcanzar | R-UI-RP-03; R-UI-RP-07 |
| TC-RP-04 | Jerarquia visual de urgencia y estado | Revisar tabla/listado de reportes | Urgencia y Estado destacan frente a datos secundarios | R-UI-RP-04 |
| TC-RP-05 | Feedback al crear reporte | Completar formulario y enviar | Boton cambia a estado de proceso, aparece mensaje de exito o error y se evita doble envio | R-UI-RP-05; R-UI-RP-09 |
| TC-RP-06 | Feedback al actualizar urgencia | Cambiar urgencia en vista ENACAL y guardar | El boton muestra estado de guardado y el cambio se confirma visualmente | R-UI-RP-05 |
| TC-RP-07 | Responsividad de formulario y tabla | Probar en movil, tablet y escritorio | No hay solapamientos, cortes graves ni controles inaccesibles | R-UI-RP-06 |
| TC-RP-08 | Tamano de tap targets | Medir botones, links y selects en movil | Todos los elementos tactiles cumplen el minimo esperado | R-UI-RP-07 |
| TC-RP-09 | Placeholders de carga | Abrir vistas con API lenta o simulada | Se muestran skeletons o placeholders consistentes mientras llegan los datos | R-UI-RP-08 |
| TC-RP-10 | Validacion del formulario de reporte | Intentar enviar sin problema, sector, direccion, fecha o ubicacion | El formulario bloquea el envio y muestra feedback claro | R-UI-RP-09 |
| TC-RP-11 | Iconografia semantica | Revisar componentes de busqueda, filtro, carga y mapa | No existen iconos ambiguos para acciones distintas | R-UI-RP-10 |
| TC-RP-12 | Navegacion por rol | Iniciar sesion con roles distintos y abrir dashboards | Cada rol ve solo sus acciones permitidas con etiquetas claras | R-UI-RP-11 |

## 6. Matriz de trazabilidad mejorada

| Requerimiento | Descripcion corta | Casos de Prueba Asociados |
|---|---|---|
| R-UI-RP-01 | CTAs unificados | TC-RP-01 |
| R-UI-RP-02 | Datos criticos legibles | TC-RP-02 |
| R-UI-RP-03 | Filtros accesibles en movil | TC-RP-03 |
| R-UI-RP-04 | Urgencia y estado destacados | TC-RP-04 |
| R-UI-RP-05 | Feedback inmediato de acciones | TC-RP-05; TC-RP-06 |
| R-UI-RP-06 | Layout responsive estable | TC-RP-07 |
| R-UI-RP-07 | Controles tactiles suficientes | TC-RP-03; TC-RP-08 |
| R-UI-RP-08 | Carga visual guiada | TC-RP-09 |
| R-UI-RP-09 | Formulario validado por tipo | TC-RP-05; TC-RP-10 |
| R-UI-RP-10 | Iconografia consistente | TC-RP-11 |
| R-UI-RP-11 | Navegacion coherente por rol | TC-RP-12 |

## 7. Recomendaciones puntuales para evolucionar la UI del proyecto

1. Centralizar el CTA primario en un componente o tokens reutilizables, porque hoy el patron existe pero esta repetido.
2. Crear una variante responsive de tabla o tarjetas para movil en listados de reportes.
3. Sustituir textos de carga planos por skeletons en vistas de consulta.
4. Definir tokens visuales minimos en `globals.css`: color primario, radio, altura de control, foco, disabled y espaciado.
5. Convertir los requisitos heredados de "vehiculos" a lenguaje del dominio real: reportes, urgencia, estado, evidencias y roles.