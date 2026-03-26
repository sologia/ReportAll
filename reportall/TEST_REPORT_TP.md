# Reporte de pruebas TP-01 a TP-11

Fecha: 2026-03-26
Entorno: local (Windows), ejecución con `npm test` en raíz del proyecto.

## Resultado de ejecución automática

- Comando: `npm test`
- Resultado: **PASS**
- Suites: **5/5**
- Tests: **9/9**

## Matriz de estado por TP

| ID | Estado | Resultado actual | Evidencia en repo | Observación |
|---|---|---|---|---|
| TP-01 | Parcial | ✅ rutas por rol validadas en frontend (5 roles + fallback). ❌ no se validó token real de backend. | `src/__test__/lib/rbac.roles.test.js` | Falta prueba integración login real contra BD/API y validación de token porque hoy no se emite token JWT en backend. |
| TP-02 | Bloqueada (entorno) | ❌ no ejecutada automáticamente | N/A | Requiere flujo E2E con carga real de foto/video y coordenadas; depende de API+BD+almacenamiento y datos. |
| TP-03 | Bloqueada (entorno) | ❌ no ejecutada automáticamente | N/A | No hay test automatizado de límite de archivo ni fixture de archivos grandes en suite actual. |
| TP-04 | Bloqueada (entorno) | ❌ no ejecutada automáticamente | N/A | Requiere cadena de negocio completa (crear→asignar→actualizar estado) con datos en BD. |
| TP-05 | Parcial | ✅ se verifica interacción de inputs login. ❌ no hay paridad completa de validaciones FE/BE para todos los formularios. | `src/__test__/app/auth/login/login.page.test.jsx` | Falta batería de casos inválidos por endpoint y por formulario, comparando mensajes exactos. |
| TP-06 | No aplicable por ahora | ❌ no ejecutada | N/A | No se encontró flujo implementado de recuperación de contraseña (solicitud/email/reset). |
| TP-07 | Parcial-alto | ✅ verificados estados de acceso sin rol y con rol incorrecto (403), y acceso permitido. | `backend/src/__tests__/require-roles.test.js` | No existe validación por token JWT, solo headers/rol en middleware actual. |
| TP-08 | Bloqueada (entorno) | ❌ no ejecutada automáticamente | N/A | Falta instrumentación de logging estructurado y aserciones sobre formato/contexto del log. |
| TP-09 | Bloqueada (performance/E2E) | ❌ no ejecutada automáticamente | N/A | Requiere dataset >50 reportes y medición de filtros en UI/mapa. |
| TP-10 | Bloqueada (infra) | ❌ no ejecutada automáticamente | `backend/sql/*.sql` | Requiere SQL Server limpio para ejecutar scripts y validar esquema/SPs. |
| TP-11 | Bloqueada (E2E integral) | ❌ no ejecutada automáticamente | N/A | Requiere entorno integrado completo y datos semilla para regresión de punta a punta. |

## Pruebas automatizadas ejecutadas

1. `src/__test__/home-page.test.jsx`
   - Verifica redirección inicial a `/auth/login`.

2. `src/__test__/app/auth/login/login.page.test.jsx`
   - Render del formulario de login.
   - Cambio de estado en email/password/rol.

3. `src/__test__/lib/rbac.roles.test.js`
   - Rutas por defecto para 5 roles del negocio.
   - Fallback para rol no reconocido.

4. `backend/src/__tests__/rbac.test.js`
   - Parseo de headers en `attachAuthContext`.

5. `backend/src/__tests__/require-roles.test.js`
   - 403 sin rol.
   - 403 con rol incorrecto.
   - 200 con rol permitido.

## Conclusión

- Se dejó una base de pruebas unitarias/integración ligera funcionando (**9 tests PASS**).
- La mayoría de TPs de negocio de alto nivel requieren pruebas de integración/E2E con infraestructura disponible (API + BD + datos + correo + archivos).
- Para cerrar TP-02, TP-03, TP-04, TP-09, TP-10, TP-11 se recomienda incorporar Playwright + entorno de pruebas controlado + seed de datos.
