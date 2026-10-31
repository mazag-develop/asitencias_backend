# Endpoints requeridos por el frontend

Este documento describe el contrato HTTP que consume actualmente la interfaz
Angular y que el backend debe implementar o adaptar para integrarse con ella.
No implica que todas estas rutas ya existan en el backend.

## Configuración

- Prefijo utilizado: `/api`.
- URL de desarrollo: `http://localhost:3000/api`.
- URL de producción configurada actualmente: `https://localhost:3000/api`.
- El frontend no agrega automáticamente credenciales de autenticación a las solicitudes.
- Los campos opcionales vacíos no se envían como parámetros de consulta.

Las rutas de las tablas se muestran con el prefijo `/api`.

## Resumen de rutas

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/dashboard` | Datos y métricas para el tablero. |
| `GET` | `/api/personas` | Listar y filtrar personas. |
| `GET` | `/api/personas/:id` | Consultar una persona por ID. |
| `GET` | `/api/personas/codigo/:codigo` | Consultar persona por código; disponible en el servicio del frontend. |
| `POST` | `/api/personas` | Crear una persona. |
| `PATCH` | `/api/personas/:id` | Actualizar datos de una persona. |
| `PATCH` | `/api/personas/:id/estado` | Activar o desactivar una persona. |
| `POST` | `/api/asistencias/scan` | Registrar una asistencia mediante código. |
| `GET` | `/api/asistencias` | Consultar historial de asistencias. |
| `GET` | `/api/asistencias/diaria` | Consultar el resumen de asistencia del día. |
| `GET` | `/api/reportes/asistencias` | Consultar filas del reporte de asistencias. |
| `GET` | `/api/reportes/asistencias/excel` | Descargar el reporte como archivo Excel. |

## Formatos compartidos

### Persona

```json
{
  "id": 1,
  "codigo": "EST-00001",
  "documento": "12345678",
  "nombres": "Ana",
  "apellidos": "Pérez",
  "tipo": "ESTUDIANTE",
  "activo": true,
  "createdAt": "2026-10-30T12:00:00.000Z",
  "updatedAt": "2026-10-30T12:00:00.000Z"
}
```

- `tipo`: `ESTUDIANTE` o `PROFESOR`.
- `documento` puede ser `null` u omitirse si no existe.
- El frontend espera fechas serializadas como cadenas.

### Respuesta paginada

Los endpoints `GET /personas` y `GET /asistencias` deben responder con:

```json
{
  "data": [],
  "paginacion": {
    "total": 0,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 0
  }
}
```

## Tablero

### `GET /api/dashboard`

Devuelve los contadores del tablero y las últimas asistencias.

```json
{
  "totalPersonas": 0,
  "totalEstudiantes": 0,
  "totalProfesores": 0,
  "asistenciasHoy": 0,
  "puntuales": 0,
  "tardanzas": 0,
  "ausentes": 0,
  "porcentajePuntualidad": 0,
  "fechaConsulta": "2026-10-30",
  "ultimasAsistencias": [
    {
      "id": "1",
      "persona": "Ana Pérez",
      "tipo": "ESTUDIANTE",
      "estado": "PUNTUAL",
      "hora": "07:30:00"
    }
  ]
}
```

`estado` admite `PUNTUAL`, `TARDANZA` o `FALTA`. Los contadores son números y
`fechaConsulta` usa el formato `YYYY-MM-DD`.

## Personas

### `GET /api/personas`

Lista personas en el formato paginado compartido.

Parámetros de consulta utilizados:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `codigo` | string | Texto de búsqueda enviado por el filtro de personas. |
| `tipo` | string | Filtro de Gestión: `ESTUDIANTE` o `PROFESOR`. |

### `GET /api/personas/:id`

Devuelve un objeto `Persona`. `id` es el identificador de la persona.

### `GET /api/personas/codigo/:codigo`

Devuelve un objeto `Persona` encontrado por su código. Esta operación está
declarada en el servicio API del frontend, aunque no se invoca desde las
pantallas actuales.

### `POST /api/personas`

Crea una persona y devuelve el objeto `Persona` creado.

```json
{
  "codigo": "EST-00001",
  "documento": "12345678",
  "nombres": "Ana",
  "apellidos": "Pérez",
  "tipo": "ESTUDIANTE"
}
```

| Campo | Tipo | Requerido |
|---|---|---:|
| `codigo` | string | Sí |
| `documento` | string | No |
| `nombres` | string | Sí |
| `apellidos` | string | Sí |
| `tipo` | `ESTUDIANTE` o `PROFESOR` | Sí |

El frontend no envía `activo` al crear; el backend debe aplicar un valor
predeterminado apropiado.

### `PATCH /api/personas/:id`

Actualiza uno o más campos de la persona y devuelve el objeto `Persona`
actualizado. El cuerpo admite los mismos campos que la creación, todos
opcionales.

### `PATCH /api/personas/:id/estado`

Actualiza el estado activo y devuelve el objeto `Persona` actualizado.

```json
{
  "activo": false
}
```

## Asistencias

### `POST /api/asistencias/scan`

Registra la asistencia de la persona asociada al código y devuelve:

```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "data": {
    "persona": "Ana Pérez",
    "tipo": "ESTUDIANTE",
    "hora": "07:30:00",
    "estado": "PUNTUAL"
  }
}
```

Solicitud:

```json
{
  "codigo": "EST-00001"
}
```

El frontend solo envía `codigo`; fecha, hora y estado deben ser determinados
por el backend.

### `GET /api/asistencias`

Devuelve registros de asistencia en el formato paginado compartido. Cada
registro debe incluir `id`, `personaId`, `fechaEscolar`, `fechaHora`, `estado`
y, cuando esté disponible, `codigoLeido` y la persona relacionada (`persona`).
El objeto `persona` utiliza el formato Persona.

Parámetros de consulta enviados por la pantalla de historial:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `fechaInicio` | `YYYY-MM-DD` | Fecha inicial del filtro. |
| `fechaFin` | `YYYY-MM-DD` | Fecha final del filtro. |
| `codigo` | string | Código de la persona o código leído. |
| `persona` | string | Texto para filtrar por persona. |
| `tipo` | string | `ESTUDIANTE` o `PROFESOR`. |
| `estado` | string | `PUNTUAL`, `TARDANZA` o `FALTA`. |

### `GET /api/asistencias/diaria`

Devuelve el resumen diario:

```json
{
  "totalEstudiantes": 0,
  "totalProfesores": 0,
  "puntualidades": 0,
  "tardanzas": 0,
  "faltas": 0,
  "pendientes": 0
}
```

Admite el parámetro opcional `tipo` (`ESTUDIANTE` o `PROFESOR`). Sin este
parámetro, el frontend espera los totales de ambos tipos.

## Reportes

Los dos endpoints reciben los mismos parámetros opcionales:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `fechaInicio` | `YYYY-MM-DD` | Fecha inicial. |
| `fechaFin` | `YYYY-MM-DD` | Fecha final. |
| `tipo` | string | `ESTUDIANTE` o `PROFESOR`. |
| `estado` | string | `PUNTUAL`, `TARDANZA` o `FALTA`. |
| `persona` | string | Texto para filtrar por persona. |

### `GET /api/reportes/asistencias`

Devuelve un arreglo JSON. Cada elemento debe incluir los campos que muestra
la tabla:

```json
[
  {
    "fecha": "2026-10-30",
    "persona": "Ana Pérez",
    "tipo": "ESTUDIANTE",
    "estado": "PUNTUAL"
  }
]
```

### `GET /api/reportes/asistencias/excel`

Devuelve el contenido binario del archivo Excel (`.xlsx`), no un objeto JSON.
El frontend descarga la respuesta con el nombre `reporte-asistencias.xlsx`.

## Compatibilidad con la documentación existente

El archivo `API.md` del proyecto describe un contrato de backend distinto en
algunos puntos. Antes de integrar, acordar con el backend especialmente estas
rutas y formatos:

- El frontend llama `GET /asistencias/diaria`; `API.md` documenta
  `GET /asistencias/resumen`.
- El frontend espera paginación en `GET /personas` y `GET /asistencias`.
- El frontend usa `GET /personas/codigo/:codigo`.
- El frontend espera `GET /dashboard`.
- Los reportes del frontend esperan un arreglo JSON y un archivo Excel binario.

Si se conservan las rutas del backend actual, habrá que adaptar el frontend o
agregar rutas compatibles en el backend.
