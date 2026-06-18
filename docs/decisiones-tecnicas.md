# Decisiones tecnicas

Este documento registra por que el proyecto esta tomando ciertas decisiones. La meta es poder explicar la evolucion del sistema y no depender de frases vagas como "lo hizo la IA".

## 1. Mantener un stack fijo

Stack elegido:

```txt
TypeScript
React
Express
Prisma
PostgreSQL
Zod
```

Motivo:

Este stack permite construir una aplicacion full stack real con tipado, API, base de datos relacional, validacion y despliegue. Cambiar de stack constantemente reduciria el aprendizaje profundo.

Tradeoff:

No se exploran frameworks mas completos como Next.js ni backends mas estructurados como NestJS. La ventaja es que se aprende mejor que hace cada capa.

## 2. Usar GDP.v2 como reconstruccion mejorada

GDP.v2 nace despues de versiones previas como `order-manager-app`.

La version anterior sirvio para descubrir el flujo real:

- proveedores
- productos
- rondas
- pedidos
- historial
- ajustes moviles
- reduccion de esfuerzo mental

GDP.v2 intenta reconstruir ese aprendizaje con un modelo de dominio mas claro.

Decision:

Usar GDP.v2 como proyecto principal y tratar las versiones anteriores como laboratorio de aprendizaje.

## 3. Usar RequiredProduct en vez de Product generico

Decision:

Modelar los productos habituales del restaurante como `RequiredProduct`.

Motivo:

En este dominio, el producto importante no es solo un item de catalogo. Es algo que el restaurante suele revisar durante una ronda.

Esto permite distinguir:

- producto que debe revisarse
- producto que se decide pedir
- producto que se revisa y no se pide

Tradeoff:

El nombre `RequiredProduct` puede sonar fuerte porque no todos los productos son obligatorios en cada ronda. Aun asi, comunica que pertenecen a la lista habitual/requerida del restaurante.

Posible evolucion:

Si el concepto crece, podria evaluarse un nombre como `ChecklistProduct`, `RoundProduct` o `RestaurantProduct`. Por ahora se mantiene `RequiredProduct` para no dispersar el modelo.

## 4. Guardar snapshots en OrderLine

Decision:

Guardar en cada linea:

- `nameSnapshot`
- `unitSnapshot`
- `supplierSnapshot`

Motivo:

Un pedido historico debe conservar lo que se pidio en ese momento. Si manana cambia el nombre del producto, la unidad habitual o el proveedor, el pedido antiguo no deberia reescribirse semanticamente.

Tradeoff:

Se duplica informacion. Esa duplicacion es intencional porque protege la trazabilidad historica.

## 5. Compartir esquemas Zod entre frontend y backend

Decision:

Usar la carpeta `shared` para esquemas Zod y tipos compartidos.

Motivo:

Evita duplicar contratos entre frontend y backend. Si cambia la forma de crear un pedido, ambos lados pueden enterarse desde el mismo esquema.

Tradeoff:

Hay que cuidar que `shared` no se convierta en una carpeta mezclada con logica de UI, infraestructura o reglas demasiado especificas.

## 6. Mantener borrador de ronda en localStorage

Decision:

El frontend guarda el borrador actual de pedido en `localStorage`.

Motivo:

Durante una ronda real, perder el borrador por refrescar la pagina o cerrar el movil seria muy frustrante. Persistir localmente protege el trabajo en curso.

Tradeoff:

El borrador local no es una fuente definitiva de verdad. Si hay varios dispositivos o usuarios, haria falta sincronizacion backend.

Posible evolucion:

Crear una entidad de ronda en backend para persistir:

- productos pedidos
- productos omitidos
- productos pospuestos
- progreso por proveedor

## 7. Empezar sin autenticacion completa

Decision:

Usar restaurante y usuario temporales durante desarrollo.

Motivo:

Permite avanzar en el flujo principal sin bloquearse con login, sesiones y permisos desde el principio.

Tradeoff:

No es suficiente para produccion ni para una demo final de empleabilidad.

Evolucion esperada:

- login basico
- usuario real
- restaurante real
- roles simples: admin y worker

## 8. Priorizar flujo de ronda sobre CRUD generico

Decision:

El centro del producto debe ser la ronda guiada, no solo pantallas de gestion.

Motivo:

El valor del sistema esta en reducir olvidos y esfuerzo mental durante un proceso real de trabajo. Un CRUD de productos/proveedores es necesario, pero no diferencia la aplicacion.

Tradeoff:

La ronda guiada exige mas pensamiento de dominio y mas cuidado de UX que una lista CRUD simple.

## 9. Usar IA como copiloto supervisado

Decision:

Usar IA para acelerar implementacion, comparar opciones, revisar codigo y generar casos borde, pero no delegar el criterio final.

Uso correcto:

- pedir revision tipo pull request
- pedir casos borde
- pedir tests faltantes
- pedir explicacion de riesgos
- comparar alternativas

Uso peligroso:

- aceptar codigo sin entenderlo
- crear features completas sin revisar responsabilidades
- saltar de arquitectura cada vez que la IA proponga otra opcion

Criterio profesional:

El objetivo no es escribir cada linea manualmente. El objetivo es poder explicar, verificar, corregir y defender el sistema.

## 10. Proximas decisiones a cerrar

- Definir si `UNDER_REVIEW` es necesario o si basta con `DRAFT` y `SENT`.
- Decidir si los productos omitidos deben persistirse en backend.
- Definir entidad explicita de ronda.
- Definir estados por proveedor dentro de una ronda.
- Decidir estrategia de testing inicial.
- Decidir autenticacion minima para portfolio.
