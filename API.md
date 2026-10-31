# API del Sistema de Asistencia

Inventario de lo implementado actualmente en este backend. Las rutas de esta
documentación usan el prefijo global `/api`. La documentación interactiva de
Swagger está disponible en `/api/docs` cuando el servidor está iniciado.

> Este archivo describe el código actual, no las funcionalidades planeadas en
> otros documentos. En particular, no todos los endpoints de reportes y
> auditoría están implementados por completo.

## Resumen

- **Framework:** NestJS 11 con TypeScript.
- **Base de datos:** PostgreSQL, accedida mediante Prisma 6.
- **Zona horaria para el registro de asistencia:** `America/Lima`.
- **Puerto:** variable `PORT`; si no se define, `3000`.
- **Prefijo HTTP:** `/api`.
- **Validación global:** `ValidationPipe` elimina propiedades desconocidas,
  rechaza propiedades no declaradas y transforma tipos implícitamente.
- **CORS:** permite el origen `http://localhost:4200`, con credenciales, y los
  métodos `GET`, `POST`, `PUT`, `PATCH` y `DELETE`.

## Endpoints

| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| `GET` | `/api` | Implementado | Devuelve el texto `Hello World!`. |
| `GET` | `/api/personas` | Implementado | Lista personas, ordenadas por fecha de creación descendente. |
| `GET` | `/api/personas/:id` | Implementado | Busca una persona por su ID. |
| `POST` | `/api/personas` | Implementado | Registra una persona. |
| `PATCH` | `/api/personas/:id` | Implementado | Actualiza campos de una persona. |
| `PATCH` | `/api/personas/:id/estado` | Implementado | Actualiza el estado activo de una persona. |
| `POST` | `/api/asistencias/scan` | Implementado | Registra el escaneo de una persona activa. |
| `GET` | `/api/asistencias` | Implementado | Lista asistencias con los datos de la persona, más recientes primero. |
| `GET` | `/api/asistencias/resumen` | Implementado | Calcula contadores sobre todas las asistencias almacenadas. |
| `GET` | `/api/reportes/asistencias` | Parcial | Devuelve un mensaje de pendiente y una lista vacía. |
| `GET` | `/api/reportes/asistencias/excel` | Pendiente | Devuelve un mensaje de pendiente y `data: null`; todavía no genera un archivo. |
| `GET` | `/api/auditoria` | Pendiente | Devuelve un mensaje de pendiente y una lista vacía. |

No están implementadas, entre otras, las rutas `GET /api/asistencias/:id`,
filtros de consulta, generación de faltas, ni descarga real de Excel.

### Formato de errores

Las excepciones de NestJS responden con el código HTTP correspondiente y un
objeto de error. Entre las validaciones de negocio existentes están:

- Persona inexistente: `404`.
- Código de escaneo desconocido: `404`.
- Código o documento duplicado al crear/actualizar: `400`.
- Escaneo de persona inactiva: `400`.
- Asistencia duplicada para la persona y fecha escolar: `409`.
- DTO inválido o con propiedades no permitidas: `400`.

## Personas

### Crear una persona

`POST /api/personas`

```json
{
  "codigo": "EST-00001",
  "documento": "12345678",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "tipo": "ESTUDIANTE",
  "activo": true
}
```

Campos:

| Campo | Tipo | Requerido | Restricciones |
|---|---|---:|---|
| `codigo` | string | Sí | 3–50 caracteres; único. |
| `documento` | string | No | 8–20 caracteres si se envía; único. |
| `nombres` | string | Sí | 2–100 caracteres. |
| `apellidos` | string | Sí | 2–100 caracteres. |
| `tipo` | string | Sí | `ESTUDIANTE` o `PROFESOR`. |
| `activo` | boolean | No | Por defecto `true`. |

El servicio recorta espacios al inicio y al final de código, documento, nombres
y apellidos. La respuesta contiene el registro creado, incluidos su `id`,
`createdAt` y `updatedAt`.

### Consultar personas

- `GET /api/personas` devuelve todos los registros; no acepta filtros ni
  paginación.
- `GET /api/personas/:id` devuelve el registro o un error `404`.

### Actualizar una persona

`PATCH /api/personas/:id` acepta uno o más de los campos de creación; todos son
opcionales. Si no se envía ningún campo, responde con error `400`. Se mantienen
las reglas de unicidad para `codigo` y `documento`. Enviar `documento` como
cadena vacía lo guarda como `null`.

Para cambiar solamente el estado:

`PATCH /api/personas/:id/estado`

```json
{
  "activo": false
}
```

## Asistencias

### Registrar un escaneo

`POST /api/asistencias/scan`

```json
{
  "codigo": "EST-00001"
}
```

El campo `codigo` es obligatorio y debe ser una cadena no vacía. El backend:

1. Busca la persona por el código, recortando espacios.
2. Rechaza códigos inexistentes y personas inactivas.
3. Obtiene la hora actual en `America/Lima`; el cliente no envía la hora ni el
   estado de puntualidad.
4. Usa la fecha local como `fechaEscolar`.
5. Rechaza un segundo registro para la misma persona y fecha escolar.
6. Calcula el estado según el tipo de persona:
   - `ESTUDIANTE`: `PUNTUAL` hasta las 07:45 inclusive.
   - `PROFESOR`: `PUNTUAL` hasta las 07:40 inclusive.
   - Después del límite: `TARDANZA`.

Respuesta satisfactoria:

```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "data": {
    "persona": "Juan Pérez",
    "tipo": "ESTUDIANTE",
    "hora": "07:30:00",
    "estado": "PUNTUAL",
    "fechaEscolar": "2026-10-30",
    "asistenciaId": 1
  }
}
```

La hora y fecha del ejemplo son ilustrativas. La fecha escolar se expresa como
`YYYY-MM-DD`.

### Consultar asistencias

- `GET /api/asistencias` devuelve todos los registros, cada uno con su persona
  relacionada, ordenados por `fechaHora` descendente.
- `GET /api/asistencias/resumen` devuelve `total`, `puntual`, `tardanza`,
  `faltas`, `estudiantes` y `profesores`. Los contadores se calculan sobre toda
  la tabla, sin filtrar por día. `estudiantes` y `profesores` cuentan registros
  de asistencia por tipo de persona, no personas únicas.

El enum de estado admite `PUNTUAL`, `TARDANZA` y `FALTA`, pero el endpoint de
escaneo solo registra `PUNTUAL` o `TARDANZA`. La creación automática de faltas
no está implementada; por ello, el contador `faltas` solo reflejaría registros
que ya existieran con ese estado.

## Modelo de datos

### `Persona` (`personas`)

| Campo | Tipo / regla |
|---|---|
| `id` | Entero autoincremental; clave primaria. |
| `codigo` | Cadena única, máximo 50 caracteres. |
| `documento` | Cadena opcional, única, máximo 20 caracteres. |
| `nombres` | Cadena, máximo 100 caracteres. |
| `apellidos` | Cadena, máximo 100 caracteres. |
| `tipo` | `ESTUDIANTE` o `PROFESOR`. |
| `activo` | Booleano; por defecto `true`. |
| `createdAt` | Fecha de creación; por defecto la hora de inserción. |
| `updatedAt` | Fecha de actualización; mantenida por Prisma. |

Tiene un índice por `tipo` y `activo`, y una relación de uno a muchos con
`Asistencia`.

### `Asistencia` (`asistencias`)

| Campo | Tipo / regla |
|---|---|
| `id` | Entero autoincremental; clave primaria. |
| `personaId` | ID de la persona relacionada. |
| `fechaEscolar` | Cadena de fecha, máximo 10 caracteres. |
| `fechaHora` | Fecha y hora con zona horaria. |
| `estado` | `PUNTUAL`, `TARDANZA` o `FALTA`. |
| `codigoLeido` | Código escaneado, opcional, máximo 50 caracteres. |
| `createdAt` | Fecha de creación; por defecto la hora de inserción. |

Existe una restricción única compuesta por `personaId` y `fechaEscolar`, además
de índices por fecha/estado y por persona/fecha.

## Configuración y ejecución

Configurar las variables de entorno en `.env` (no guardar credenciales en este
documento ni subirlas al repositorio):

```dotenv
PORT=3000
DATABASE_URL="<URL de conexión PostgreSQL>"
TZ=America/Lima
```

Comandos disponibles:

| Comando | Función |
|---|---|
| `npm run start:dev` | Ejecuta NestJS en modo desarrollo con recarga. |
| `npm run build` | Compila el proyecto. |
| `npm run start:prod` | Ejecuta la versión compilada desde `dist/main`. |
| `npm test -- --runInBand` | Ejecuta pruebas unitarias. |
| `npm run test:e2e` | Ejecuta pruebas end-to-end. |
| `npx prisma migrate dev` | Crea y aplica migraciones en desarrollo. |
| `npx prisma generate` | Genera el cliente Prisma. |

## Módulos y componentes

- `PersonasModule`: controladores y reglas de personas.
- `AsistenciasModule`: registro por escaneo, listado y resumen.
- `ReportesModule`: rutas de reporte, actualmente con respuestas de marcador de
  posición.
- `AuditoriaModule`: ruta de auditoría, actualmente con respuesta de marcador
  de posición.
- `PrismaModule`: cliente Prisma compartido; abre la conexión al iniciar y la
  cierra al detener la aplicación.
- `ConfigModule`: carga `.env` globalmente.

## Seguridad y alcance actual

- Swagger declara autenticación Bearer, pero no hay una estrategia de
  autenticación, guardas ni control de permisos aplicados a estas rutas. La
  declaración de Swagger por sí sola no protege los endpoints.
- La configuración CORS está limitada a `http://localhost:4200`; debe revisarse
  para otros orígenes antes de desplegar.
- Los datos sensibles de conexión pertenecen a la configuración local y no a
  la documentación versionada.
- El control contra duplicados también está respaldado por una restricción
  única en la base de datos.
- No existe todavía registro persistente de auditoría, corrección de
  asistencias, paginación, filtros, ni proceso de cierre diario.

## Archivos de referencia

- Esquema y enums de Prisma: `prisma/schema.prisma`.
- Configuración de aplicación, prefijo, validación, CORS y Swagger: `src/main.ts`.
- DTO y reglas de personas: `src/personas/`.
- Escaneo y consulta de asistencia: `src/asistencias/`.
- Reportes: `src/reportes/`.
- Auditoría: `src/auditoria/`.
