# SISTEMA DE ASISTENCIA ESCOLAR
# ESPECIFICACIÓN MAESTRA DEL FRONTEND

**Versión:** 1.0.0  
**Frontend:** Angular 21 Standalone  
**Backend:** NestJS REST API  
**Base de datos:** PostgreSQL 17  
**ORM:** Prisma 6  
**Estilos:** Tailwind CSS 4 + SCSS  
**Entorno:** Windows 64 bits  
**Node.js:** 24.11.1  
**Angular CLI:** 21.2.29  
**Angular:** 21.2.25  

---

# 1. OBJETIVO GENERAL

Construir un sistema web completo de gestión de asistencia escolar, utilizando Angular 21 con arquitectura Standalone.

El sistema debe permitir:

- Gestionar estudiantes.
- Gestionar profesores.
- Registrar asistencia mediante lector USB de códigos de barras o QR.
- Identificar automáticamente a la persona.
- Determinar puntualidad o tardanza.
- Evitar registros duplicados.
- Consultar asistencia diaria.
- Consultar historial.
- Visualizar estadísticas.
- Generar reportes.
- Exportar reportes a Excel.
- Administrar el estado de las personas.

El frontend debe comunicarse exclusivamente con el backend NestJS mediante servicios REST.

No implementar acceso directo a PostgreSQL desde Angular.

# 2. ENTORNO TECNOLÓGICO

## 2.1 Versiones instaladas

El proyecto ya cuenta con:

| Tecnología | Versión |
|---|---|
| Angular CLI | 21.2.29 |
| Angular | 21.2.25 |
| Node.js | 24.11.1 |
| npm | 11.6.2 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.1 |
| RxJS | 7.8 |
| Express | 5.1 |
| Angular SSR | 21 |

No actualizar ni degradar versiones sin una razón técnica.

No crear otro proyecto si ya existe `asistencia-frontend`.

## 2.2 Arquitectura obligatoria

- Angular Standalone.
- Componentes independientes.
- Angular Router.
- Lazy Loading.
- Signals para estados locales.
- Reactive Forms.
- HttpClient.
- Servicios reutilizables.
- Interceptores HTTP funcionales.
- Tailwind CSS 4.
- SCSS para estilos específicos.
- Angular SSR compatible.
- Tipado estricto de TypeScript.

No utilizar:

- NgModules tradicionales.
- jQuery.
- Manipulación directa del DOM.
- Datos simulados en la versión final.
- Conexiones directas desde Angular a PostgreSQL.
- Componentes monolíticos.
- Código duplicado.

# 3. DISEÑO VISUAL

Desarrollar una interfaz profesional, moderna, intuitiva y responsive.

## 3.1 Paleta de colores

| Elemento | Color |
|---|---|
| Sidebar | #0F172A |
| Primario | #2563EB |
| Secundario | #64748B |
| Fondo | #F8FAFC |
| Superficie | #FFFFFF |
| Texto principal | #1E293B |
| Texto secundario | #64748B |
| Puntual | #16A34A |
| Tardanza | #F59E0B |
| Falta | #DC2626 |
| Bordes | #E2E8F0 |

Definir variables CSS reutilizables.

## 3.2 Distribución principal

La interfaz tendrá:

1. Sidebar lateral.
2. Navbar superior.
3. Área principal de contenido.
4. Breadcrumbs.
5. Títulos y descripciones.
6. Tarjetas estadísticas.
7. Tablas reutilizables.
8. Formularios.
9. Ventanas modales.
10. Notificaciones.

El diseño debe adaptarse a escritorio, tablet y móvil.

## 3.3 Sidebar

Opciones:

GENERAL
- Dashboard.

GESTIÓN
- Personas.
- Estudiantes.
- Profesores.

ASISTENCIA
- Registrar asistencia.
- Historial.
- Resumen diario.

REPORTES
- Reporte de asistencia.
- Reporte de tardanzas.
- Reporte de faltas.
- Exportación Excel.

CONFIGURACIÓN
- Configuración general.
- Información del sistema.

El menú debe mostrar la opción activa y permitir navegación entre módulos.

# 4. ESTRUCTURA DEL PROYECTO

Organizar el proyecto de la siguiente manera:

```text
src/
│
├── app/
│   │
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts
│   │   ├── models/
│   │   │   ├── persona.model.ts
│   │   │   ├── asistencia.model.ts
│   │   │   ├── dashboard.model.ts
│   │   │   └── api-response.model.ts
│   │   └── services/
│   │       ├── api.service.ts
│   │       └── notification.service.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   ├── navbar/
│   │   │   ├── page-header/
│   │   │   ├── data-table/
│   │   │   ├── loading/
│   │   │   ├── empty-state/
│   │   │   ├── confirm-dialog/
│   │   │   └── status-badge/
│   │   ├── directives/
│   │   └── pipes/
│   │
│   ├── layout/
│   │   └── main-layout/
│   │
│   ├── features/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.ts
│   │   │   ├── dashboard.html
│   │   │   └── dashboard.scss
│   │   │
│   │   ├── personas/
│   │   │   ├── pages/
│   │   │   │   ├── personas-list/
│   │   │   │   ├── persona-form/
│   │   │   │   └── persona-detail/
│   │   │   ├── components/
│   │   │   └── services/
│   │   │       └── personas.service.ts
│   │   │
│   │   ├── asistencias/
│   │   │   ├── pages/
│   │   │   │   ├── asistencia-scan/
│   │   │   │   ├── asistencia-historial/
│   │   │   │   └── asistencia-diaria/
│   │   │   ├── components/
│   │   │   └── services/
│   │   │       └── asistencias.service.ts
│   │   │
│   │   ├── reportes/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   │
│   │   └── configuracion/
│   │       └── pages/
│   │
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.ts
│   └── app.html
│
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
│
├── styles.scss
└── main.ts
```

Cada componente debe tener responsabilidades específicas.

# 5. CONFIGURACIÓN DEL BACKEND

La URL del backend se define mediante environments.

Archivo:

`src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

Archivo:

`src/environments/environment.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-DOMINIO/api',
};
```

Configurar los file replacements correspondientes en angular.json.

El backend debe estar disponible en el puerto 3000 durante desarrollo.

# 6. MODELOS DE DATOS

## 6.1 Persona

```typescript
export type TipoPersona = 'ESTUDIANTE' | 'PROFESOR';

export interface Persona {
  id: number;
  codigo: string;
  documento?: string | null;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 6.2 Crear persona

```typescript
export interface CrearPersona {
  codigo: string;
  documento?: string;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
}
```

## 6.3 Estados de asistencia

```typescript
export type EstadoAsistencia =
  | 'PUNTUAL'
  | 'TARDANZA'
  | 'FALTA';
```

## 6.4 Asistencia

```typescript
export interface Asistencia {
  id: string;
  personaId: number;
  fechaEscolar: string;
  fechaHora: string;
  estado: EstadoAsistencia;
  codigoLeido?: string;
  persona?: Persona;
}
```

El campo `id` puede ser BigInt en PostgreSQL y debe serializarse como string en las respuestas JSON.

## 6.5 Respuesta paginada

```typescript
export interface RespuestaPaginada<T> {
  data: T[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}
```

Los modelos deben coincidir con los DTO y las respuestas reales de NestJS. No asumir campos adicionales sin verificarlos.

# 7. MÓDULO DASHBOARD

Crear una página principal con indicadores:

- Total de personas.
- Total de estudiantes.
- Total de profesores.
- Asistencias de hoy.
- Puntuales.
- Tardanzas.
- Ausentes.

Agregar:

- Gráfico de asistencia.
- Distribución de estados.
- Últimas asistencias.
- Porcentaje de puntualidad.
- Fecha de consulta.
- Accesos rápidos.

Los indicadores deben obtenerse del backend.

No utilizar números estáticos en la versión final.

Si un endpoint todavía no existe, documentar el endpoint requerido y no inventar datos reales.

# 8. MÓDULO DE PERSONAS

## 8.1 Listado

Crear una tabla profesional con:

- Código.
- Documento.
- Nombres.
- Apellidos.
- Tipo.
- Estado.
- Fecha de registro.
- Acciones.

Acciones:

- Ver.
- Editar.
- Activar.
- Desactivar.

## 8.2 Filtros

Permitir:

- Buscar por código.
- Buscar por documento.
- Buscar por nombres.
- Buscar por apellidos.
- Filtrar por tipo.
- Filtrar por estado.

Incluir paginación desde el backend.

## 8.3 Registro

Formulario:

- Código.
- Documento.
- Nombres.
- Apellidos.
- Tipo de persona.

Validaciones:

- Código obligatorio.
- Documento opcional.
- Nombres obligatorios.
- Apellidos obligatorios.
- Tipo obligatorio.
- Evitar espacios innecesarios.
- Mostrar errores del backend.

## 8.4 Edición

Permitir modificar los datos personales.

No permitir eliminar físicamente personas que tengan historial de asistencia.

La desactivación será la operación normal para personas que ya no pertenezcan a la institución.

## 8.5 Endpoints

| Método | Endpoint |
|---|---|
| GET | /api/personas |
| GET | /api/personas/resumen |
| GET | /api/personas/:id |
| GET | /api/personas/codigo/:codigo |
| POST | /api/personas |
| PATCH | /api/personas/:id |
| PATCH | /api/personas/:id/estado |

# 9. MÓDULO DE REGISTRO DE ASISTENCIA

Este es el módulo más importante del sistema.

Crear una pantalla dedicada para registrar asistencia mediante lector USB.

## 9.1 Interfaz

Mostrar:

- Fecha actual.
- Hora actual.
- Estado de conexión con el backend.
- Campo de lectura.
- Instrucción para escanear.
- Última persona registrada.
- Tipo de persona.
- Estado de asistencia.
- Hora de registro.
- Mensajes de error.
- Historial de lecturas recientes.

## 9.2 Funcionamiento del lector

El lector USB funciona normalmente como teclado.

Al escanear un código:

1. El lector escribe el código.
2. Se detecta Enter como terminador preferido.
3. Se obtiene el código.
4. El frontend envía la lectura al backend.
5. El backend identifica a la persona.
6. El backend valida el estado activo.
7. El backend determina la fecha y hora oficial.
8. El backend determina puntualidad o tardanza.
9. El backend registra la asistencia.
10. El frontend presenta el resultado.

Endpoint:

`POST /api/asistencias/scan`

Body:

```json
{
  "codigo": "EST-00001"
}
```

## 9.3 Requisitos técnicos del escáner

Implementar:

- Campo de lectura enfocado automáticamente.
- Compatibilidad con lectores USB tipo teclado.
- Detección preferente de Enter.
- Alternativa configurable por debounce cuando el lector no envíe Enter.
- Cola para procesar lecturas consecutivas.
- No perder lecturas mientras otra petición está en curso.
- No enviar códigos vacíos.
- No enviar espacios innecesarios.
- Recuperar el foco cuando sea apropiado.
- Evitar doble envío accidental.
- Permitir lectura continua sin hacer clic.
- Protegerse de duplicados en backend.

El debounce debe ser configurable y no utilizarse como mecanismo principal si el lector admite sufijo Enter.

La cola debe procesar cada código de manera independiente.

El frontend no debe decidir si una persona llegó puntual o tarde.

## 9.4 Respuesta esperada

Ejemplo:

```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "data": {
    "persona": "Juan Pérez",
    "tipo": "ESTUDIANTE",
    "hora": "07:42:15",
    "estado": "PUNTUAL"
  }
}
```

Adaptar el modelo a la respuesta definitiva del backend.

## 9.5 Estados visuales

PUNTUAL:
- Verde.
- Icono de confirmación.
- Mensaje de registro exitoso.

TARDANZA:
- Naranja.
- Icono de advertencia.
- Mensaje de llegada tardía.

DUPLICADO:
- Amarillo o neutro.
- Informar que la asistencia ya existe.

NO ENCONTRADO:
- Rojo.
- Informar que el código no está registrado.

PERSONA INACTIVA:
- Rojo.
- Informar que no se puede registrar asistencia.

ERROR DE CONEXIÓN:
- Informar que el backend no responde.
- No afirmar que se registró una asistencia.
- No descartar silenciosamente la lectura.

# 10. REGLAS DE NEGOCIO

El frontend debe reflejar estas reglas, pero el backend es la autoridad.

## 10.1 Estudiantes

| Hora | Resultado |
|---|---|
| Hasta 07:45:00 | PUNTUAL |
| Desde 07:45:01 | TARDANZA |

## 10.2 Profesores

| Hora | Resultado |
|---|---|
| Hasta 07:40:00 | PUNTUAL |
| Desde 07:40:01 | TARDANZA |

## 10.3 Restricciones

- Una asistencia por persona y día escolar.
- No registrar salidas.
- No marcar ausencias al inicio del día.
- No permitir registrar personas inactivas.
- No confiar en la fecha del navegador.
- No permitir modificar el estado de asistencia desde el frontend.

Las ausencias se generarán mediante el proceso de cierre diario del backend.

# 11. MÓDULO DE HISTORIAL

Crear una tabla con:

- Fecha.
- Hora.
- Código.
- Persona.
- Tipo.
- Estado.

Filtros:

- Fecha inicial.
- Fecha final.
- Código.
- Persona.
- Tipo.
- Estado.

Incluir:

- Paginación.
- Ordenamiento.
- Mensaje cuando no existan registros.
- Indicadores de carga.
- Tratamiento de errores.

# 12. MÓDULO DE ASISTENCIA DIARIA

Mostrar el resumen de la jornada:

- Total de estudiantes.
- Total de profesores.
- Total de puntualidades.
- Total de tardanzas.
- Total de faltas.
- Personas pendientes de registro.

Permitir filtrar por tipo de persona.

La información debe proceder del backend.

# 13. MÓDULO DE REPORTES

Crear filtros:

- Fecha inicial.
- Fecha final.
- Tipo de persona.
- Estado.
- Persona.

Crear reportes:

1. Asistencia general.
2. Asistencia de estudiantes.
3. Asistencia de profesores.
4. Puntualidad.
5. Tardanzas.
6. Inasistencias.

Permitir descargar Excel mediante el endpoint:

`GET /api/reportes/asistencias/excel`

El backend genera el archivo ExcelJS.

El frontend debe recibir el archivo como Blob y descargarlo.

No generar un Excel independiente en Angular si el backend ya tiene esa responsabilidad.

# 14. SERVICIOS ANGULAR

Crear servicios separados:

- PersonasService.
- AsistenciasService.
- ReportesService.
- DashboardService.
- NotificationService.

Todos los servicios deben:

- Utilizar HttpClient.
- Utilizar environment.apiUrl.
- Tener tipado estricto.
- Manejar errores.
- No duplicar URLs.
- No contener lógica visual.
- No realizar llamadas HTTP desde componentes compartidos.

Utilizar RxJS para peticiones HTTP y Signals para estados de interfaz cuando sea conveniente.

# 15. MANEJO DE ERRORES

Crear un interceptor HTTP funcional.

Debe manejar:

- Error 400: solicitud incorrecta.
- Error 401: sesión no autorizada, cuando exista autenticación.
- Error 403: acceso denegado.
- Error 404: recurso no encontrado.
- Error 409: conflicto o duplicado.
- Error 422: validación.
- Error 500: error interno.
- Error de red: backend no disponible.

Mostrar mensajes amigables.

No mostrar trazas internas del backend al usuario.

# 16. SSR Y COMPATIBILIDAD CON EL NAVEGADOR

El proyecto tiene Angular SSR.

Todos los componentes deben ser compatibles con renderizado en servidor.

No utilizar directamente durante SSR:

- window.
- document.
- localStorage.
- sessionStorage.
- navigator.
- APIs USB.
- APIs específicas del navegador.

Cuando se necesiten, proteger el código con `isPlatformBrowser` y ejecutar las operaciones en el navegador.

El lector USB debe funcionar en el cliente.

No depender de que el SSR tenga la misma fecha u hora que el navegador.

La hora oficial de asistencia siempre procede del backend.

# 17. RESPONSIVE DESIGN

La aplicación debe adaptarse a:

- Escritorio.
- Laptop.
- Tablet.
- Móvil.

En escritorio:

- Sidebar fijo.
- Navbar horizontal.
- Tablas completas.

En tablet:

- Sidebar adaptable.
- Tablas con desplazamiento horizontal.

En móvil:

- Menú lateral desplegable.
- Tarjetas en una columna.
- Formularios de ancho completo.
- Tablas adaptadas o con scroll horizontal.

# 18. SEGURIDAD

- No guardar secretos en Angular.
- No colocar contraseñas de PostgreSQL en el frontend.
- No confiar en datos del navegador.
- Validar formularios.
- Sanitizar y validar entradas.
- No insertar HTML no confiable.
- No permitir que el frontend decida el estado de asistencia.
- Implementar autenticación y autorización cuando el backend esté preparado.
- Restringir las rutas privadas cuando exista autenticación.
- No simular seguridad mediante variables locales.

# 19. CONFIGURACIÓN DE RUTAS

Crear las rutas:

| Ruta | Componente |
|---|---|
| /dashboard | Dashboard |
| /personas | PersonasList |
| /personas/nuevo | PersonaForm |
| /personas/:id/editar | PersonaForm |
| /personas/:id | PersonaDetail |
| /asistencias | AsistenciaScan |
| /historial | AsistenciaHistorial |
| /asistencia-diaria | AsistenciaDiaria |
| /reportes | Reportes |

Utilizar Lazy Loading.

Todas las páginas funcionales deben utilizar el layout principal.

# 20. CALIDAD DEL CÓDIGO

El código debe:

- Tener tipado estricto.
- Seguir convenciones Angular.
- Utilizar componentes standalone.
- Separar lógica, servicios y presentación.
- Utilizar nombres descriptivos.
- Evitar `any`.
- Evitar código duplicado.
- Tener interfaces para las respuestas HTTP.
- Utilizar `@if`, `@for` y `@switch` de Angular.
- Utilizar `inject()` cuando mejore la claridad.
- Limpiar suscripciones cuando corresponda.
- Mantener compatibilidad SSR.
- Ser mantenible y escalable.

# 21. PRUEBAS

Implementar pruebas para:

- Creación de personas.
- Edición de personas.
- Filtros.
- Paginación.
- Comunicación con NestJS.
- Lectura del escáner.
- Procesamiento consecutivo de códigos.
- Duplicados.
- Errores de conexión.
- Visualización de estados.

Comprobar que:

- No se pierdan lecturas.
- No se dupliquen solicitudes accidentalmente.
- No se registre una asistencia dos veces.
- Los errores del backend se muestren correctamente.

# 22. INTEGRACIÓN CON EL BACKEND

Backend de desarrollo:

`http://localhost:3000/api`

Frontend de desarrollo:

`http://localhost:4200`

CORS debe permitir el origen del frontend.

El frontend debe respetar los endpoints existentes.

Si falta un endpoint:

1. Identificarlo.
2. Documentarlo.
3. Proponer su implementación en NestJS.
4. No inventar respuestas.
5. No ocultar errores utilizando datos falsos.

# 23. ORDEN DE DESARROLLO

Implementar el proyecto en las siguientes fases:

## FASE 1: Arquitectura y configuración

- Revisar package.json.
- Revisar angular.json.
- Revisar Tailwind CSS 4.
- Configurar environments.
- Configurar HttpClient.
- Configurar rutas.
- Crear modelos.
- Crear servicios base.

## FASE 2: Layout

- Sidebar.
- Navbar.
- MainLayout.
- Breadcrumbs.
- Componentes compartidos.
- Responsive design.

## FASE 3: Dashboard

- Indicadores.
- Estadísticas.
- Últimas asistencias.
- Gráficos.
- Conexión real con backend.

## FASE 4: Personas

- Listado.
- Filtros.
- Paginación.
- Registro.
- Edición.
- Detalle.
- Activación y desactivación.

## FASE 5: Asistencias

- Lector USB.
- Procesamiento de códigos.
- Cola de lecturas.
- Resultado visual.
- Historial reciente.
- Control de errores.

## FASE 6: Historial y asistencia diaria

- Filtros.
- Tablas.
- Resumen.
- Estados.

## FASE 7: Reportes

- Filtros.
- Reportes.
- Descarga Excel.

## FASE 8: Seguridad y pruebas

- Interceptores.
- Guards cuando exista autenticación.
- Pruebas unitarias.
- Pruebas de integración.
- Verificación SSR.
- Optimización.

# 24. INSTRUCCIONES PARA EL AGENTE DE DESARROLLO

Actúa como arquitecto de software y desarrollador senior especializado en Angular 21, TypeScript, Tailwind CSS 4 y sistemas empresariales.

Construye el frontend completo siguiendo esta especificación.

IMPORTANTE:

1. Antes de modificar archivos, inspecciona la estructura real del proyecto.
2. Revisa package.json, angular.json, tsconfig.json y archivos de configuración.
3. No crees un proyecto nuevo.
4. No cambies las versiones instaladas sin justificación.
5. Conserva Angular SSR.
6. No instales Angular Material salvo que sea necesario y se autorice.
7. Utiliza Tailwind CSS 4 que ya está instalado.
8. No generes componentes incompletos.
9. No dejes botones sin funcionalidad.
10. No utilices datos simulados en las funcionalidades finales.
11. Conecta los servicios al backend NestJS.
12. Si falta un endpoint, documenta el requerimiento.
13. Genera todos los archivos necesarios con su contenido completo.
14. Verifica los imports y rutas.
15. Corrige los errores de compilación.
16. Ejecuta `npm run build` y resuelve los errores.
17. Comprueba la compatibilidad con SSR.
18. No elimines funcionalidades existentes.

## Forma de trabajo

Desarrolla por fases.

Al finalizar cada fase:

- Indica los archivos creados.
- Indica los archivos modificados.
- Explica las funcionalidades implementadas.
- Ejecuta las verificaciones correspondientes.
- Documenta cualquier endpoint pendiente del backend.
- Espera la validación antes de realizar cambios estructurales adicionales.

No te limites a mostrar ejemplos de código: realiza la implementación completa en los archivos del proyecto cuando tengas acceso al entorno de desarrollo.

# 25. CRITERIOS DE ACEPTACIÓN

El proyecto se considerará terminado cuando:

- [ ] Angular compile correctamente.
- [ ] SSR funcione correctamente.
- [ ] El layout sea responsive.
- [ ] El menú navegue correctamente.
- [ ] El dashboard consuma datos reales.
- [ ] El módulo de personas funcione.
- [ ] El escáner USB registre lecturas.
- [ ] Se procesen lecturas consecutivas.
- [ ] Los duplicados se manejen correctamente.
- [ ] El historial funcione.
- [ ] Los filtros funcionen.
- [ ] Los reportes se puedan descargar.
- [ ] Los errores se muestren correctamente.
- [ ] No existan botones decorativos sin acción.
- [ ] No existan datos ficticios en producción.
- [ ] Se mantenga la compatibilidad con el backend NestJS.

---

**FIN DE LA ESPECIFICACIÓN DEL FRONTEND**
