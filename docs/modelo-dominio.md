# Modelo de dominio

## Problema que modela la aplicacion

En un restaurante, pedir productos no es simplemente crear lineas en una tabla. La persona encargada revisa productos habituales, decide que hace falta, ajusta cantidades y agrupa mentalmente por proveedor. El sistema debe ayudar a no olvidar productos, mantener trazabilidad y reducir trabajo repetitivo.

GDP.v2 modela ese flujo alrededor de una ronda de pedido.

## Entidades principales

### Restaurant

Representa el restaurante que usa la aplicacion. Es la raiz de muchos datos del sistema:

- usuarios
- proveedores
- productos requeridos
- pedidos

Actualmente se usa un restaurante temporal durante el desarrollo, pero la entidad permite evolucionar hacia multi-restaurante.

### User

Representa una persona que crea o gestiona pedidos dentro de un restaurante.

Relaciones principales:

- pertenece a un restaurante
- puede crear pedidos

En la version actual todavia no hay autenticacion completa, pero el modelo ya deja espacio para identificar quien crea un pedido.

### Supplier

Representa un proveedor real del restaurante.

Datos principales:

- nombre
- telefono opcional
- estado activo/inactivo
- productos requeridos asociados

Reglas importantes:

- un proveedor pertenece a un restaurante
- el nombre del proveedor debe ser unico dentro del restaurante
- un proveedor inactivo no deberia usarse para nuevas rondas

### RequiredProduct

Representa un producto que el restaurante suele revisar o pedir. No es simplemente un producto de catalogo: es un producto requerido por el restaurante dentro de su flujo habitual.

Datos principales:

- nombre
- cantidad habitual
- unidad habitual
- estado activo/inactivo
- proveedor asociado
- restaurante asociado

Esta entidad es clave en GDP.v2. Permite que la ronda trabaje sobre productos esperados, no solo sobre productos pedidos.

Reglas importantes:

- un producto requerido pertenece a un restaurante
- un producto requerido pertenece a un proveedor
- el nombre debe ser unico dentro del restaurante
- un producto inactivo no debe aparecer en nuevas rondas

### Order

Representa un pedido creado durante una ronda.

Datos principales:

- fecha de creacion
- estado del pedido
- restaurante
- usuario creador
- lineas de pedido

Estados actuales:

- DRAFT
- UNDER_REVIEW
- SENT

La idea del estado `UNDER_REVIEW` es expresar que el pedido se ha generado desde la ronda, pero todavia puede necesitar revision antes de enviarse.

### OrderLine

Representa una linea concreta dentro de un pedido.

Datos principales:

- producto requerido original
- cantidad pedida
- snapshot del nombre
- snapshot de la unidad
- snapshot del proveedor
- estado de entrega basico

Los snapshots son importantes porque el pedido debe conservar lo que se pidio en ese momento, aunque despues cambie el nombre del producto, la unidad habitual o el proveedor.

## Conceptos de negocio

### Producto requerido vs linea de pedido

Un `RequiredProduct` existe antes de la ronda. Es algo que el restaurante suele revisar.

Una `OrderLine` existe solo cuando durante una ronda se decide pedir ese producto.

Esta separacion evita confundir "productos que existen en la lista habitual" con "productos que se pidieron hoy".

### Ronda guiada

La ronda guiada transforma una lista grande de productos en una secuencia de decisiones pequeñas.

Para cada producto, el usuario decide:

- pedir
- no pedir
- revisar despues

Esto reduce scroll, busqueda manual y olvidos. Tambien abre la puerta a futuras mejoras como sugerencias, productos frecuentes y deteccion de anomalías.

### Productos omitidos

Un producto no pedido no significa necesariamente un producto olvidado. Puede haber sido revisado y descartado.

Por eso el frontend mantiene productos saltados durante la ronda. Esta idea es importante porque distingue entre:

- no revisado
- revisado y no pedido
- revisado y pedido

## Reglas de negocio actuales

- Un pedido debe tener al menos una linea.
- Cada linea debe apuntar a un producto requerido existente del restaurante.
- La cantidad pedida debe venir del usuario, normalmente basada en la cantidad habitual.
- Al crear una linea, se guardan snapshots del producto, unidad y proveedor.
- El pedido se crea asociado al restaurante temporal y a un usuario del restaurante.
- Si no existe usuario para el restaurante, no se puede crear el pedido.

## Reglas pendientes de formalizar

- No permitir enviar pedidos vacios.
- No permitir editar pedidos enviados.
- Definir diferencia exacta entre DRAFT y UNDER_REVIEW.
- Registrar productos revisados pero no pedidos en backend, no solo en frontend.
- Definir estados por proveedor dentro de una ronda.
- Definir que ocurre con productos o proveedores desactivados en pedidos historicos.
