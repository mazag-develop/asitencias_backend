# CORRECCIONES Y MEJORAS DEL SISTEMA DE ASISTENCIA ESCOLAR

**Proyecto:** Sistema de Asistencia Escolar  
**Frontend:** Angular 21 Standalone  
**Backend:** NestJS  
**Base de datos:** PostgreSQL 17  
**ORM:** Prisma 6  
**Estilos:** Tailwind CSS 4 + CSS  
**Entorno:** Windows 64 bits  

---

# 1. OBJETIVO

Corregir los errores y advertencias actuales del proyecto Angular 21 y mejorar completamente el módulo de registro de asistencia.

El sistema debe contar con una pantalla exclusiva de asistencia, diseñada para funcionar como un kiosco de marcación escolar.

La pantalla debe permitir registrar asistencias mediante un lector USB de códigos de barras o QR, reproducir sonidos de confirmación y detectar cuando una persona intenta registrar su asistencia más de una vez durante el mismo día.

No crear un proyecto nuevo. Trabajar sobre el proyecto existente.

Antes de modificar archivos, inspeccionar su estructura y respetar las implementaciones actuales.

# 2. CORRECCIÓN DEL ERROR NG0955

## Problema

Angular muestra:

```text
NG0955: The provided track expression resulted in duplicated keys for a given collection.

Duplicated keys:
key "/personas" at index "0" and "1"
key "/personas" at index "1" and "2"

key "/reportes" at index "0" and "1"
key "/reportes" at index "1" and "2"
```

## Causa

El menú contiene varias opciones que utilizan la misma ruta.

Por ejemplo:

```typescript
{
  nombre: 'Personas',
  ruta: '/personas'
},
{
  nombre: 'Estudiantes',
  ruta: '/personas'
},
{
  nombre: 'Profesores',
  ruta: '/personas'
}
```

Angular no puede utilizar `opcion.ruta` como identificador único.

## Solución

Agregar una propiedad `id` única a cada opción del menú.

Ejemplo:

```typescript
menu = [
  {
    titulo: 'GENERAL',
    opciones: [
      {
        id: 'dashboard',
        nombre: 'Dashboard',
        ruta: '/dashboard',
        icono: '▦'
      }
    ]
  },
  {
    titulo: 'GESTIÓN',
    opciones: [
      {
        id: 'personas',
        nombre: 'Personas',
        ruta: '/personas',
        icono: '♙'
      },
      {
        id: 'estudiantes',
        nombre: 'Estudiantes',
        ruta: '/personas',
        icono: '♧'
      },
      {
        id: 'profesores',
        nombre: 'Profesores',
        ruta: '/personas',
        icono: '♙'
      }
    ]
  },
  {
    titulo: 'ASISTENCIA',
    opciones: [
      {
        id: 'registrar-asistencia',
        nombre: 'Registrar asistencia',
        ruta: '/asistencias',
        icono: '✓'
      },
      {
        id: 'historial-asistencia',
        nombre: 'Historial',
        ruta: '/historial',
        icono: '◷'
      }
    ]
  },
  {
    titulo: 'ANÁLISIS',
    opciones: [
      {
        id: 'reportes',
        nombre: 'Reportes',
        ruta: '/reportes',
        icono: '▤'
      },
      {
        id: 'reporte-tardanzas',
        nombre: 'Tardanzas',
        ruta: '/reportes',
        icono: '◷'
      },
      {
        id: 'reporte-faltas',
        nombre: 'Faltas',
        ruta: '/reportes',
        icono: '!'
      }
    ]
  }
];
```

En el HTML utilizar:

```html
@for (grupo of menu; track grupo.titulo) {
  @for (opcion of grupo.opciones; track opcion.id) {
    <a [routerLink]="opcion.ruta">
      {{ opcion.nombre }}
    </a>
  }
}
```

No utilizar `track opcion.ruta` porque las rutas pueden repetirse.

# 3. CORRECCIÓN DEL AVISO NG02801

## Problema

Angular muestra:

```text
NG02801: Angular detected that HttpClient is not configured to use fetch APIs.

It's strongly recommended to enable fetch for applications that use Server-Side Rendering.
```

## Solución

Modificar `src/app/app.config.ts`.

Utilizar:

```typescript
import { ApplicationConfig } from '@angular/core';

import {
  provideHttpClient,
  withFetch
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};
```

Si existen interceptores HTTP, conservarlos y registrarlos correctamente mediante `withInterceptors()`.

No registrar múltiples configuraciones HTTP innecesarias.

# 4. ADVERTENCIA DEP0169 DE NODE.JS

Mensaje:

```text
[DEP0169] DeprecationWarning: url.parse() behavior is not standardized.
```

Investigar qué dependencia está utilizando `url.parse()`.

Ejecutar:

```powershell
npm ls
```

Y:

```powershell
node --trace-deprecation node_modules/@angular/cli/bin/ng.js serve
```

Identificar la dependencia responsable.

No modificar directamente archivos dentro de `node_modules`.

Actualizar la dependencia responsable solamente si existe una versión compatible con Angular 21 y Node.js 24.

Esta advertencia no debe confundirse con los errores NG0955 o NG02801.

# 5. NUEVA PANTALLA DE REGISTRO DE ASISTENCIA

Crear una pantalla exclusiva para registrar asistencia.

Ruta:

```text
/asistencias
```

La pantalla debe ocupar toda la ventana disponible.

No debe mostrar:

- Sidebar.
- Navbar administrativa.
- Menús de navegación.
- Elementos innecesarios.

Debe mostrar:

- Nombre del sistema.
- Fecha actual.
- Reloj digital.
- Campo de lectura.
- Estado del lector.
- Mensajes de confirmación.
- Nombre de la persona.
- Tipo de persona.
- Hora de registro.
- Historial de últimas lecturas.
- Indicador de conexión con el backend.

## Diseño visual

Utilizar un diseño moderno de kiosco:

- Fondo azul oscuro.
- Tarjeta central.
- Campo de lectura grande.
- Tipografía legible.
- Confirmación verde para registros exitosos.
- Advertencia amarilla o naranja para duplicados.
- Mensajes rojos para errores.
- Animaciones suaves.

La pantalla debe ser responsive.

# 6. FUNCIONAMIENTO DEL LECTOR USB

El lector USB funciona como teclado.

Flujo:

1. El lector permanece preparado.
2. Una persona acerca su código.
3. El lector escribe el código.
4. El lector envía Enter.
5. Angular captura el código.
6. Angular envía la petición al backend.
7. NestJS identifica a la persona.
8. NestJS verifica si está activa.
9. NestJS verifica si ya existe una asistencia para ese día.
10. NestJS determina la hora oficial.
11. NestJS determina puntualidad o tardanza.
12. NestJS registra la asistencia o devuelve un conflicto.
13. Angular muestra el resultado.
14. Angular reproduce el sonido correspondiente.
15. Angular queda preparado para otra lectura.

El lector debe permitir lecturas consecutivas sin necesidad de hacer clic.

Preferir configurar el lector USB con sufijo Enter.

No depender exclusivamente de debounce para detectar el final de una lectura.

# 7. COMPORTAMIENTO DE LOS SONIDOS

Implementar sonidos mediante Web Audio API.

Los sonidos deben ser generados por el propio sistema, sin depender de archivos externos.

## Registro exitoso

Cuando la asistencia se registre por primera vez:

- Reproducir dos tonos ascendentes.
- Mostrar confirmación verde.
- Mostrar nombre de la persona.
- Mostrar tipo de persona.
- Mostrar hora oficial.
- Mostrar mensaje:

```text
¡ASISTENCIA REGISTRADA!
Tu ingreso fue registrado correctamente.
```

## Registro duplicado

Cuando una persona intente registrar nuevamente su asistencia:

- Reproducir dos tonos descendentes.
- Mostrar una tarjeta amarilla o naranja.
- Mostrar el nombre de la persona.
- Mostrar la hora de su primera marcación.
- Mostrar mensaje:

```text
¡YA REGISTRASTE TU ASISTENCIA!
Tu asistencia ya fue registrada el día de hoy.
```

## Código no encontrado

Mostrar:

```text
CÓDIGO NO ENCONTRADO
Verifique que su código esté registrado.
```

Reproducir un sonido de error.

## Persona inactiva

Mostrar:

```text
PERSONA INACTIVA
No se puede registrar su asistencia.
```

## Error de conexión

Mostrar:

```text
SIN CONEXIÓN CON EL SERVIDOR
No se pudo verificar tu asistencia.
```

Nunca afirmar que se registró una asistencia cuando el servidor no confirmó la operación.

# 8. CONTROL DE LECTURAS CONSECUTIVAS

Implementar una cola de lecturas.

Requisitos:

- No perder códigos consecutivos.
- Procesar una solicitud a la vez.
- No enviar códigos vacíos.
- Eliminar espacios innecesarios.
- Evitar doble envío accidental.
- Mantener el campo preparado para la siguiente lectura.
- Liberar la cola tanto en respuestas exitosas como en errores.
- Mostrar el estado de procesamiento.

No utilizar un bloqueo global que descarte las lecturas realizadas mientras existe otra petición HTTP.

El backend debe protegerse de duplicados mediante una restricción única en la base de datos.

# 9. REGLAS DE NEGOCIO

El backend es la autoridad para determinar la hora y el estado.

## Estudiantes

| Hora de ingreso | Estado |
|---|---|
| Hasta 07:45:00 inclusive | PUNTUAL |
| Después de 07:45:00 | TARDANZA |

## Profesores

| Hora de ingreso | Estado |
|---|---|
| Hasta 07:40:00 inclusive | PUNTUAL |
| Después de 07:40:00 | TARDANZA |

## Restricciones

- Una asistencia por persona y fecha escolar.
- No registrar salidas.
- No marcar faltas inmediatamente al inicio del día.
- No permitir asistencia a personas inactivas.
- No confiar en la hora del navegador.
- No permitir modificar el estado desde Angular.
- Utilizar la zona horaria `America/Lima`.
- Las faltas se generan mediante el proceso de cierre diario.

# 10. ENDPOINT DE REGISTRO

Utilizar:

```http
POST /api/asistencias/scan
```

Body:

```json
{
  "codigo": "EST-00001"
}
```

## Respuesta exitosa

HTTP 201:

```json
{
  "success": true,
  "message": "Asistencia registrada correctamente",
  "code": "ASISTENCIA_REGISTRADA",
  "data": {
    "persona": "Juan Pérez",
    "tipo": "ESTUDIANTE",
    "hora": "07:42:15",
    "estado": "PUNTUAL"
  }
}
```

## Respuesta duplicada

HTTP 409:

```json
{
  "statusCode": 409,
  "success": false,
  "code": "ASISTENCIA_DUPLICADA",
  "message": "Ya registraste tu asistencia el día de hoy.",
  "data": {
    "persona": "Juan Pérez",
    "tipo": "ESTUDIANTE",
    "hora": "07:42:15",
    "estado": "PUNTUAL"
  }
}
```

El backend debe devolver la información de la primera asistencia existente para mostrarla al usuario.

# 11. MANEJO DE DUPLICADOS EN NESTJS

La base de datos ya cuenta con una restricción única:

```prisma
@@unique([personaId, fechaEscolar])
```

El backend debe consultar la asistencia existente y devolver HTTP 409 cuando corresponda.

Ejemplo:

```typescript
throw new ConflictException({
  success: false,
  code: 'ASISTENCIA_DUPLICADA',
  message: 'Ya registraste tu asistencia el día de hoy.',
  data: {
    persona: `${asistencia.persona.nombres} ${asistencia.persona.apellidos}`,
    tipo: asistencia.persona.tipo,
    hora: asistencia.fechaHora,
    estado: asistencia.estado
  }
});
```

Adaptar el ejemplo a la estructura real del servicio.

No realizar solamente una consulta previa sin contemplar concurrencia.

La restricción única de PostgreSQL debe seguir siendo la protección definitiva contra duplicados.

# 12. SERVICIO ANGULAR

Crear o adaptar:

```text
src/app/features/asistencias/services/asistencias.service.ts
```

El servicio debe:

- Utilizar HttpClient.
- Utilizar environment.apiUrl.
- Enviar el código al backend.
- Manejar respuestas exitosas.
- Permitir interpretar HTTP 409.
- Mantener los tipos de respuesta.
- No implementar reglas de puntualidad.
- No simular registros.

No duplicar la lógica de asistencia dentro del componente.

# 13. COMPATIBILIDAD CON SSR

El proyecto tiene Angular SSR.

Proteger las operaciones del navegador utilizando:

```typescript
import {
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';
```

No acceder directamente durante SSR a:

- window.
- document.
- localStorage.
- sessionStorage.
- navigator.
- APIs de audio.
- APIs de dispositivos.

El lector USB se procesa en el navegador.

La Web Audio API debe inicializarse después de una interacción del usuario, porque los navegadores bloquean la reproducción automática de audio en determinadas circunstancias.

# 14. RUTA INDEPENDIENTE DEL LAYOUT

La ruta `/asistencias` debe estar fuera del MainLayout.

Ejemplo:

```typescript
{
  path: 'asistencias',
  loadComponent: () =>
    import('./features/asistencias/pages/asistencia-scan/asistencia-scan')
      .then(m => m.AsistenciaScan)
}
```

El resto de las páginas administrativas debe conservar el layout normal.

# 15. EXPERIENCIA DE USUARIO

La pantalla debe mostrar tres estados principales.

## Estado inicial

```text
CONTROL DE ASISTENCIA

BIENVENIDO

Registra tu asistencia.

[ ESCANEA TU CÓDIGO ]

Lector preparado.

Esperando lectura...
```

## Estado exitoso

```text
✓

¡ASISTENCIA REGISTRADA!

Juan Pérez

ESTUDIANTE

Hora: 07:42:15

Tu ingreso fue registrado correctamente.
```

## Estado duplicado

```text
!

¡YA REGISTRASTE TU ASISTENCIA!

Juan Pérez

ESTUDIANTE

Primera marcación: 07:42:15

Tu asistencia ya fue registrada el día de hoy.
```

Los resultados deben permanecer visibles durante unos segundos y regresar automáticamente al estado inicial.

Si llega una nueva lectura, esta debe procesarse sin perderse.

# 16. HISTORIAL DE LECTURAS

Mostrar las últimas cinco lecturas de la sesión.

Columnas:

- Nombre.
- Código.
- Hora.
- Resultado.

Distinguir:

- Registro exitoso.
- Registro duplicado.
- Error.

El historial visual de la sesión no reemplaza el historial persistente del backend.

# 17. SEGURIDAD Y CONFIABILIDAD

- El backend determina la identidad asociada al código.
- El backend determina la fecha oficial.
- El backend determina la hora oficial.
- El backend determina puntualidad y tardanza.
- El backend verifica el estado activo.
- El backend evita duplicados.
- Angular solo presenta resultados.
- No guardar información sensible innecesaria.
- No descartar lecturas silenciosamente.
- No registrar localmente como exitosas operaciones no confirmadas.

# 18. PRUEBAS OBLIGATORIAS

| Prueba | Resultado esperado |
|---|---|
| Primera lectura | Registro exitoso y sonido ascendente |
| Segunda lectura del mismo código | Aviso duplicado y sonido descendente |
| Código inexistente | Error de código |
| Persona inactiva | Error de persona inactiva |
| Backend desconectado | Mensaje de desconexión |
| Cinco lecturas consecutivas | Todas se procesan |
| Dos solicitudes simultáneas | Solo una asistencia registrada |
| Recargar la pantalla | Lector preparado nuevamente |
| Acceso a /asistencias | Pantalla completa sin sidebar |
| SSR | Sin errores de APIs del navegador |

# 19. INSTRUCCIONES PARA EL AGENTE DE PROGRAMACIÓN

Actúa como desarrollador senior especializado en Angular 21, NestJS, TypeScript y PostgreSQL.

Implementa estas correcciones y mejoras en el proyecto existente.

Antes de modificar archivos:

1. Inspecciona la estructura real.
2. Revisa los componentes existentes.
3. Revisa los servicios de asistencia.
4. Revisa el controlador y servicio NestJS.
5. Revisa el contrato de respuesta HTTP.
6. Identifica las rutas actuales.
7. Comprueba la configuración SSR.

No inventes estructuras que ya existan.

No dupliques servicios ni componentes.

No elimines funcionalidades existentes.

Implementa todos los archivos completos que sean necesarios.

Verifica que:

- NG0955 desaparezca.
- NG02801 desaparezca.
- La pantalla de asistencia funcione independientemente del layout.
- El lector USB procese códigos consecutivos.
- Los sonidos funcionen después de activar el audio.
- Los duplicados se detecten correctamente.
- El backend sea responsable de la validación.
- Angular compile correctamente.
- SSR continúe funcionando.

Ejecuta:

```powershell
npm run build
```

Corrige los errores encontrados antes de finalizar.

# 20. RESULTADO FINAL ESPERADO

El sistema debe contar con una pantalla profesional de asistencia escolar que funcione como un kiosco automático.

Cuando un estudiante o profesor escanee su código:

- Si es su primera marcación, se registra su asistencia, se muestra su nombre y se reproduce un sonido de confirmación.
- Si vuelve a escanear, el sistema informa que ya registró su asistencia y reproduce un sonido diferente.
- Si el código no existe o la persona está inactiva, muestra el error correspondiente.
- Si el servidor no responde, informa que no pudo verificar el registro.

La pantalla debe quedar preparada permanentemente para recibir nuevas lecturas.

**FIN DEL DOCUMENTO**
