# Roadmap desde order-manager-app hacia GDP.v2

Este documento recoge funcionalidades y aprendizajes que ya existen en `order-manager-app` y que todavia no estan completos en `GDP.v2`.

La idea no es copiar codigo sin pensar. `order-manager-app` fue el laboratorio donde se descubrieron muchos flujos reales. `GDP.v2` debe tomar esas ideas y reimplementarlas con una arquitectura mas clara basada en `RequiredProduct`, snapshots y ronda guiada.

## Escala de utilidad / potencial

```txt
0 = No merece implementarse ahora.
1 = Poco util o muy especifico.
2 = Util, pero secundario.
3 = Buena mejora funcional.
4 = Muy util para el producto y para portfolio.
5 = Critico o muy diferenciador.
```

## Orden recomendado de implementacion

| Orden | Feature pendiente en GDP.v2 | Utilidad | Potencial | Estado en order-manager-app | Motivo |
|---:|---|---:|---:|---|---|
| 1 | Pedido actual persistido en backend | 5 | 5 | Existe | Permite que la ronda no viva solo en localStorage y que el pedido actual sea consultable desde otra vista. |
| 2 | Pantalla de pedido actual | 5 | 5 | Existe | Hace que la app tenga ciclo completo: pedir, revisar, ajustar y preparar envio. |
| 3 | Historial de pedidos por ronda | 5 | 5 | Existe | Es clave para trazabilidad, demo profesional y futuras sugerencias. |
| 4 | Agrupacion de pedidos por proveedor | 5 | 5 | Existe | Refleja como trabaja el restaurante y permite preparar mensajes separados. |
| 5 | Edicion de cantidades despues de crear lineas | 4 | 5 | Existe | Reduce miedo a equivocarse y convierte la app en herramienta flexible. |
| 6 | Quitar linea del pedido y devolver producto a la ronda | 4 | 5 | Existe | Cierra un flujo real: deshacer una decision sin romper el pedido. |
| 7 | Generar/copiar mensaje por proveedor | 5 | 4 | Existe | Tiene mucho valor practico inmediato para WhatsApp u otros canales. |
| 8 | Dia operacional / ronda actual por ventana horaria | 4 | 5 | Existe | Evita mezclar pedidos antes/despues de medianoche y modela mejor restaurantes. |
| 9 | Entidad explicita de ronda o batch | 5 | 5 | Existe como OrderBatch | GDP.v2 tiene mejor dominio, pero aun necesita persistir la ronda como concepto. |
| 10 | Estados por pedido mas accionables | 4 | 4 | Parcial | Ayuda a distinguir borrador, revision, enviado y recibido. |
| 11 | Pantalla de catalogo unificada | 4 | 4 | Existe | Facilita gestionar productos y proveedores sin saltar entre pantallas aisladas. |
| 12 | Busqueda de productos | 4 | 4 | Existe | Muy util cuando la lista crece. Debe buscar por producto, proveedor y unidad. |
| 13 | Filtros/chips por proveedor en catalogo | 4 | 4 | Existe | Reduce scroll y ayuda a revisar productos por proveedor. |
| 14 | Conteo de productos por proveedor | 3 | 4 | Existe | Mejora orientacion y control visual. |
| 15 | Colores por proveedor | 3 | 3 | Existe | Ayuda visual, pero no debe dominar la arquitectura. |
| 16 | Modos de ronda: inteligente, proveedor, frecuentes, todos, pendientes | 4 | 5 | Existe parcialmente | Diferencia mucho el producto, pero necesita datos historicos para ser realmente inteligente. |
| 17 | Selector persistente de modo/proveedor de ronda | 3 | 4 | Existe | Mejora continuidad de uso diario. |
| 18 | Panel lateral de pedido en desktop | 4 | 4 | Existe | Permite ver lo pedido mientras se decide el siguiente producto. |
| 19 | Barra movil de pedido | 4 | 4 | Existe | Importante si la app se usa en movil durante una ronda real. |
| 20 | Indicador de progreso de ronda | 4 | 4 | Existe | Reduce incertidumbre y ayuda a terminar rondas grandes. |
| 21 | Reintegrar productos omitidos o pedidos al flujo | 4 | 4 | Existe | Evita callejones sin salida cuando el usuario se equivoca. |
| 22 | Sincronizar pedido actual al abrir ronda | 4 | 4 | Existe | Evita duplicar productos que ya estaban en el pedido actual. |
| 23 | Validacion frontend de respuestas API con Zod | 3 | 4 | Existe | Aumenta robustez y demuestra criterio tecnico. |
| 24 | Manejo de errores HTTP mas especifico | 4 | 4 | Existe mejor que GDP.v2 | Evita responder todo como 500 y mejora calidad backend. |
| 25 | Endpoints GET current/history/batches | 5 | 5 | Existe | Base necesaria para pedido actual, historial y demo. |
| 26 | PATCH de cantidad de linea | 4 | 4 | Existe | Necesario para corregir pedidos antes de envio. |
| 27 | DELETE de linea de pedido | 4 | 4 | Existe | Necesario para deshacer productos pedidos por error. |
| 28 | Formularios desplegables para crear producto/proveedor | 3 | 3 | Existe | Util para gestion, pero no es lo mas diferenciador. |
| 29 | Seed mas rico para demo | 4 | 4 | Existe parcialmente | Permite demostrar la app sin cargar datos manualmente. |
| 30 | PWA y manifest | 3 | 4 | GDP.v2 ya tiene base | GDP.v2 ya avanzo aqui; faltaria verificar instalacion y experiencia movil. |

## Bloque 1 - Convertir el pedido en entidad de trabajo real

### 1. Pedido actual persistido en backend

Puntuacion: utilidad 5 / potencial 5.

En `order-manager-app`, la app puede consultar el pedido actual con:

```txt
GET /api/orders/current
```

Esto permite que el pedido no dependa solo del estado local del navegador.

En GDP.v2 hoy existe `useOrderDraft` con `localStorage`, lo cual es bueno para no perder trabajo, pero no sustituye una ronda persistida.

Implementacion recomendada en GDP.v2:

- crear una entidad o concepto persistente de ronda actual
- asociarla a `Restaurant`
- asociarla a `User`
- decidir si la ronda contiene productos omitidos, pedidos y pospuestos
- mantener snapshots en `OrderLine`

No copiar directamente `OrderBatch` sin pensarlo. GDP.v2 puede tener una entidad mejor nombrada, por ejemplo:

```txt
OrderRound
```

### 2. Pantalla de pedido actual

Puntuacion: utilidad 5 / potencial 5.

`order-manager-app` tiene `OrdersPage` con vista de pedido actual. GDP.v2 tiene `CurrentOrderView`, pero todavia esta mas ligada al borrador local.

Objetivo en GDP.v2:

- ver pedido actual desde backend
- agrupar por proveedor
- permitir ajustar cantidades
- permitir quitar lineas
- preparar envio

### 3. Historial de pedidos

Puntuacion: utilidad 5 / potencial 5.

El historial convierte la app en una herramienta seria. Sirve para:

- trazabilidad
- revisar pedidos anteriores
- preparar entrevistas y demo
- alimentar futuras sugerencias

Endpoints a migrar conceptualmente:

```txt
GET /api/orders/history
GET /api/orders/batches
```

Adaptacion a GDP.v2:

- usar `OrderRound` o equivalente
- conservar snapshots de lineas
- mostrar fecha, proveedor, productos y cantidades

## Bloque 2 - Mejorar el flujo de revision y correccion

### 4. Agrupacion por proveedor

Puntuacion: utilidad 5 / potencial 5.

En restaurantes, el pedido final se piensa por proveedor. GDP.v2 ya tiene proveedor en `RequiredProduct` y snapshots en `OrderLine`, asi que esta feature encaja muy bien.

Debe existir en:

- pedido actual
- historial
- resumen de ronda
- mensajes copiables

### 5. Editar cantidad despues de crear linea

Puntuacion: utilidad 4 / potencial 5.

En `order-manager-app` existe:

```txt
PATCH /api/orders/lines/:lineId
```

GDP.v2 deberia permitirlo antes de enviar el pedido.

Reglas sugeridas:

- se puede editar si el pedido esta en DRAFT o UNDER_REVIEW
- no se puede editar si esta SENT
- cantidad debe ser positiva

### 6. Quitar linea y devolver producto a la ronda

Puntuacion: utilidad 4 / potencial 5.

En `order-manager-app`, quitar una linea puede devolver el producto al flujo disponible. Esto es muy importante para UX: el usuario puede equivocarse sin quedarse atrapado.

En GDP.v2 conviene separar dos acciones:

- quitar linea del pedido
- marcar producto como pendiente otra vez

Si en el futuro se persisten productos revisados, esta regla debe quedar muy clara.

## Bloque 3 - Hacer que el pedido sea enviable

### 7. Mensaje por proveedor

Puntuacion: utilidad 5 / potencial 4.

`order-manager-app` construye mensajes copiables tipo:

```txt
Hola.

Para manana necesito:

- Tomate 2 cajas
- Lechuga 1 caja

Gracias.
```

En GDP.v2 esto deberia generarse desde datos persistidos, no solo desde el borrador.

Valor:

- feature muy entendible en demo
- utilidad diaria inmediata
- conecta la app con el flujo real de WhatsApp/proveedores

Pendiente de decidir:

- si el mensaje se guarda en backend
- si se regenera siempre desde lineas
- si se marca proveedor como enviado tras copiar/enviar

### 8. Estados de pedido y proveedor

Puntuacion: utilidad 4 / potencial 4.

GDP.v2 ya tiene:

```txt
DRAFT
UNDER_REVIEW
SENT
```

Pero falta cerrar el significado de cada estado.

Posible modelo inicial:

```txt
DRAFT = ronda en construccion
UNDER_REVIEW = pedido generado, pendiente de revision final
SENT = pedido enviado al proveedor
RECEIVED = pedido recibido, opcional mas adelante
```

Tambien conviene pensar en estado por proveedor:

```txt
pending
sent
```

Esto sirve cuando una ronda tiene varios proveedores y no todos se envian a la vez.

## Bloque 4 - Catalogo usable

### 9. Pantalla de catalogo unificada

Puntuacion: utilidad 4 / potencial 4.

`order-manager-app` une productos y proveedores en una vista de catalogo. GDP.v2 los tiene separados como `RequiredProductsPage` y `SuppliersPage`.

Recomendacion:

- mantener rutas/vistas separadas internamente si ayuda
- pero ofrecer una experiencia de catalogo mas integrada
- permitir crear proveedor desde flujo de producto

### 10. Busqueda de productos

Puntuacion: utilidad 4 / potencial 4.

Debe buscar por:

- nombre de producto
- proveedor
- unidad

Esto es mas util que solo buscar por nombre cuando la lista crece.

### 11. Filtros por proveedor y conteos

Puntuacion: utilidad 4 / potencial 4.

En `order-manager-app`, los filtros por proveedor muestran cuantos productos tiene cada proveedor. Esto ayuda a orientarse.

En GDP.v2 encaja bien porque `RequiredProduct` siempre tiene proveedor.

### 12. Colores por proveedor

Puntuacion: utilidad 3 / potencial 3.

Es una mejora visual util, pero no debe ir antes que historial, pedido actual o edicion de lineas.

Si se implementa, debe vivir como atributo visual de proveedor, no como logica de dominio critica.

## Bloque 5 - Ronda guiada avanzada

### 13. Modos de ronda

Puntuacion: utilidad 4 / potencial 5.

`order-manager-app` ya experimento con modos:

```txt
smart
supplier
frequent
all
stale
```

En GDP.v2 ahora conviene implementarlos por fases:

1. `all`: todos los productos activos.
2. `supplier`: productos de un proveedor.
3. `frequent`: solo cuando haya historial real.
4. `stale`: productos no pedidos desde hace X dias.
5. `smart`: combinacion de historial, frecuencia y prioridad.

No implementar `smart` de verdad sin datos historicos. Primero hay que crear historial bueno.

### 14. Selector persistente de modo y proveedor

Puntuacion: utilidad 3 / potencial 4.

Guardar el ultimo modo en `localStorage` es util, pero secundario. Primero debe funcionar bien la ronda persistida.

### 15. Progreso de ronda

Puntuacion: utilidad 4 / potencial 4.

GDP.v2 ya muestra productos pendientes, pero puede mejorar con:

```txt
12 / 84 revisados
72 pendientes
3 proveedores con productos pedidos
```

Si se persisten omitidos y pedidos en backend, el progreso sera mas confiable.

## Bloque 6 - Robustez tecnica

### 16. Validar respuestas del frontend con Zod

Puntuacion: utilidad 3 / potencial 4.

`order-manager-app` valida respuestas de API en servicios frontend. GDP.v2 usa shared schemas, pero debe revisar si todas las respuestas importantes se parsean.

Beneficio:

- detectar contratos rotos
- hacer el frontend mas confiable
- demostrar criterio tecnico

### 17. Manejo de errores HTTP mas especifico

Puntuacion: utilidad 4 / potencial 4.

`order-manager-app` ya distingue algunos errores:

- ZodError -> 400
- P2003 -> 400
- P2025 -> 404

GDP.v2 deberia evolucionar hacia errores controlados:

```txt
400 invalid_payload
404 required_product_not_found
409 order_already_sent
500 unexpected_error
```

### 18. Tests iniciales

Puntuacion: utilidad 5 / potencial 5.

Aunque `order-manager-app` tampoco tiene tests, esta es una deuda que GDP.v2 debe resolver pronto.

Primeros tests recomendados:

- no crear pedido sin lineas
- no crear pedido con producto inexistente
- crear lineas con snapshots correctos
- agrupar lineas por proveedor
- editar cantidad antes de enviar
- no editar pedido enviado
- construir mensaje por proveedor
- build de cola de ronda guiada

## Lo que no migraria todavia

### Copiar la arquitectura exacta de OrderBatch

Puntuacion: utilidad 2 / potencial 3.

`OrderBatch` resolvio un problema real, pero GDP.v2 puede nombrarlo y modelarlo mejor como `OrderRound`.

### Copiar UI exacta

Puntuacion: utilidad 2 / potencial 2.

La UI anterior fue util para aprender, pero GDP.v2 deberia tomar ideas, no copiar pantallas sin revisar.

### Implementar inteligencia avanzada sin historial

Puntuacion: utilidad 1 / potencial 5.

La idea tiene mucho potencial, pero antes hacen falta datos historicos fiables. Sin eso, `smart` seria una etiqueta bonita pero poco real.

## Prioridad resumida

### Ahora

1. Pedido/ronda actual persistida.
2. Pantalla de pedido actual desde backend.
3. Historial de rondas/pedidos.
4. Agrupacion por proveedor.
5. Editar y quitar lineas.

### Despues

6. Mensajes por proveedor.
7. Catalogo con busqueda y filtros.
8. Estados mas claros.
9. Errores HTTP mejores.
10. Tests de dominio/API.

### Mas adelante

11. Modos de ronda avanzados.
12. Frecuentes y sugerencias basadas en historial.
13. Deteccion de productos no pedidos en mucho tiempo.
14. Estado por proveedor.
15. Autenticacion y roles.

## Recomendacion de enfoque

Para cada feature migrada desde `order-manager-app`, responder antes de programar:

```txt
Que problema real resuelve?
Pertenece al frontend, backend, dominio o base de datos?
Que datos necesita persistir?
Que regla de negocio introduce?
Que caso borde puede romperla?
Como se probaria?
```

Esa es la diferencia entre copiar una app anterior y convertir GDP.v2 en una version arquitectonicamente mas madura.
