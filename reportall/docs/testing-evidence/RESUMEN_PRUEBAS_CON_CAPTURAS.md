# Resumen de pruebas con capturas

Fecha: 2026-03-26
Proyecto: ReportALL
Evidencia de ejecución automática: [jest-run-20260326-151641.txt](logs/jest-run-20260326-151641.txt)
Evidencia de ejecución funcional actualizada: [jest-functional-20260326-153225.txt](logs/jest-functional-20260326-153225.txt)

## Convención de capturas

- Guardar imágenes en `docs/testing-evidence/screenshots/TP-XX/`
- Nombre recomendado:
  - `01-precondiciones.png`
  - `02-ejecucion.png`
  - `03-resultado.png`
  - `04-validacion.png`

## Estado general actual

- Suites automáticas: 8/8 PASS
- Tests automáticos: 20/20 PASS
- Casos TP con cobertura parcial: TP-01, TP-05, TP-07
- Casos TP pendientes/bloqueados por entorno: TP-02, TP-03, TP-04, TP-06, TP-08, TP-09, TP-10, TP-11

## Convención de archivos de prueba (ruta espejo de app)

- Se aplica estructura espejo bajo `src/__test__/app/**`.
- Ejemplos:
  - `src/app/auth/login/page.jsx` → `src/__test__/app/auth/login/login.page.test.jsx`
  - `src/app/auth/register/page.jsx` → `src/__test__/app/auth/register/register.page.test.jsx`
  - `src/app/dashboard/enacal/page.jsx` → `src/__test__/app/dashboard/enacal/enacal.page.test.jsx`

---

## TP-01 — Login exitoso por 5 roles + validación token/rol

- Estado: **Parcial**
- Resultado: Se validó ruta por defecto por rol (5 roles) en pruebas unitarias de frontend.
- Evidencia automática:
  - `src/__test__/lib/rbac.roles.test.js`
- Capturas sugeridas:
  - [ ] Precondiciones (usuarios de prueba por rol)
  - [ ] Ejecución login por rol (5 capturas o video)
  - [ ] Resultado redirección por rol
  - [ ] Validación token/claims (pendiente de implementación token)

## TP-02 — Cliente crea reporte completo (foto/video + coordenadas)

- Estado: **Pendiente (bloqueado por entorno E2E)**
- Capturas sugeridas:
  - [ ] Formulario completo
  - [ ] Carga de archivos
  - [ ] Coordenadas válidas en mapa
  - [ ] Confirmación de creación

## TP-03 — Archivo > límite → rechazo con mensaje claro

- Estado: **Pendiente**
- Capturas sugeridas:
  - [ ] Intento de carga sobre límite
  - [ ] Mensaje de error mostrado
  - [ ] Evidencia backend de rechazo

## TP-04 — Crear → asignar → actualizar estado

- Estado: **Pendiente**
- Capturas sugeridas:
  - [ ] Creación inicial
  - [ ] Asignación a cuadrilla
  - [ ] Cambio de estado
  - [ ] Estado final persistido

## TP-05 — Validaciones FE/BE consistentes

- Estado: **Parcial**
- Resultado: Validado cambio de inputs en login; falta matriz de inválidos FE/BE por endpoint.
- Evidencia automática:
  - `src/__test__/app/auth/login/login.page.test.jsx`
- Capturas sugeridas:
  - [ ] Caso inválido frontend
  - [ ] Respuesta inválida backend
  - [ ] Comparación de mensaje/regla

## TP-06 — Recuperación de contraseña

- Estado: **Pendiente (flujo no implementado/visible en código actual)**
- Capturas sugeridas:
  - [ ] Solicitud de recuperación
  - [ ] Recepción de correo
  - [ ] Formulario de reset
  - [ ] Confirmación de cambio

## TP-07 — Endpoint protegido sin token / rol incorrecto

- Estado: **Parcial-alto**
- Resultado: Validado 403 sin rol y 403 con rol incorrecto, 200 con rol permitido.
- Evidencia automática:
  - `backend/src/__tests__/require-roles.test.js`
  - `backend/src/__tests__/rbac.test.js`
- Capturas sugeridas:
  - [ ] Llamada sin credenciales
  - [ ] Llamada con rol incorrecto
  - [ ] Llamada con rol correcto

## TP-08 — Error controlado + log estructurado

- Estado: **Pendiente**
- Capturas sugeridas:
  - [ ] Error provocado
  - [ ] Log estructurado (timestamp, contexto, endpoint, usuario)

## TP-09 — Mapa con >50 reportes + filtros

- Estado: **Pendiente (prueba de carga/E2E)**
- Capturas sugeridas:
  - [ ] Dataset > 50 reportes cargado
  - [ ] Aplicación de filtros
  - [ ] Tiempo de respuesta percibido/medido

## TP-10 — Scripts de BD en entorno limpio

- Estado: **Pendiente (requiere SQL Server limpio)**
- Capturas sugeridas:
  - [ ] Ejecución script 2026-03-13-auth-users.sql
  - [ ] Ejecución script 2026-03-17-backend-stored-procedures.sql
  - [ ] Verificación de SPs y tablas creadas

## TP-11 — Regresión ciclo completo

- Estado: **Pendiente (E2E integral)**
- Capturas sugeridas:
  - [ ] Crear reporte
  - [ ] Asignar
  - [ ] Procesar
  - [ ] Cerrar
  - [ ] Visualizar en analítica

---

## Anexo: pruebas automáticas ejecutadas en esta fecha

- `backend/src/__tests__/rbac.test.js`
- `backend/src/__tests__/require-roles.test.js`
- `src/__test__/app/page.test.jsx`
- `src/__test__/lib/rbac.roles.test.js`
- `src/__test__/app/auth/login/login.page.test.jsx`
- `src/__test__/app/auth/register/register.page.test.jsx`
- `src/__test__/app/dashboard/clientes/clientes.page.test.jsx`
- `src/__test__/app/dashboard/enacal/enacal.page.test.jsx`
