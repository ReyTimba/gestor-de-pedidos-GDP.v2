# Arquitectura

## Vision general

GDP.v2 es una aplicacion full stack organizada como monorepo con dos workspaces principales:

```txt
GDP.v2/
  frontend/
  backend/
  shared/
  docs/
```

La aplicacion usa React en frontend, Express en backend, Prisma para acceso a PostgreSQL y Zod para validar datos externos.

## Responsabilidades por capa

### Frontend

Ubicacion principal:

```txt
frontend/src/
```

Responsabilidades:

- mostrar la ronda de pedido
- cargar productos requeridos y proveedores
- mantener el borrador local de la ronda
- permitir pedir, omitir o posponer productos
- mostrar resumen del pedido actual
- enviar el pedido al backend
- manejar estados de carga y error

Archivos relevantes:

```txt
frontend/src/pages/RoundPage.tsx
frontend/src/hooks/useOrderDraft.ts
frontend/src/services/orders.services.ts
frontend/src/components/round/
```

El frontend contiene logica de experiencia de usuario, especialmente en la ronda guiada. Parte de esa logica puede evolucionar a funciones puras testeables.

### Backend

Ubicacion principal:

```txt
backend/src/
```

Responsabilidades:

- exponer endpoints HTTP
- validar requests
- ejecutar casos de uso
- consultar y escribir en PostgreSQL mediante Prisma
- devolver respuestas consistentes al frontend

Estructura actual:

```txt
backend/src/controllers/
backend/src/routes/
backend/src/services/
backend/src/db/
backend/src/config/
```

La separacion actual sigue este criterio:

- rutas: definen URLs y metodos HTTP
- controllers: adaptan request/response
- services: contienen logica de aplicacion y acceso coordinado a datos
- db: configura Prisma
- config: carga variables de entorno

### Shared

Ubicacion:

```txt
shared/
```

Responsabilidades:

- compartir esquemas Zod entre frontend y backend
- compartir tipos inferidos desde esos esquemas
- reducir duplicacion de contratos

Ejemplo actual:

```txt
shared/order.schemas.ts
shared/product.schemas.ts
shared/supplier.schemas.ts
```

Esta capa ayuda a que frontend y backend hablen el mismo idioma, pero hay que evitar convertirla en una carpeta de todo. Debe contener contratos compartidos, no logica especifica de UI o infraestructura.

### Base de datos

Ubicacion:

```txt
backend/prisma/schema.prisma
```

Responsabilidades:

- persistir entidades del dominio
- definir relaciones entre entidades
- proteger algunas reglas con restricciones e indices
- mantener migraciones de estructura

Entidades principales:

- Restaurant
- User
- Supplier
- RequiredProduct
- Order
- OrderLine

La base de datos protege unicidad de nombres por restaurante y relaciones entre pedidos, productos y proveedores.

## Flujo de creacion de pedido

1. El usuario abre la ronda en frontend.
2. El frontend carga productos requeridos.
3. `useOrderDraft` mantiene el estado local del pedido.
4. El usuario decide pedir, no pedir o revisar despues cada producto.
5. Al archivar/crear pedido, el frontend envia `orderLines` al backend.
6. El controller valida el body con Zod.
7. El service busca usuario y productos requeridos del restaurante.
8. El service crea el pedido y sus lineas.
9. Cada linea guarda snapshots de nombre, unidad y proveedor.
10. El frontend limpia el borrador si la creacion fue correcta.

## Validacion

### TypeScript

TypeScript ayuda a detectar errores dentro del codigo durante desarrollo.

No valida datos reales que vienen de fuera en runtime.

### Zod

Zod valida datos externos:

- body de requests
- contratos compartidos
- estructuras que cruzan frontera frontend/backend

Ejemplo: `CreateOrderSchema` valida que el body tenga `orderLines` con `requiredProductId` y `quantityOrdered`.

### Prisma

Prisma valida estructura de queries y relaciones con la base de datos. Tambien aplica restricciones definidas en el schema y en PostgreSQL.

### Dominio

El dominio decide reglas de negocio. Algunas ya existen en services, pero conviene hacerlas cada vez mas explicitas y testeables.

Ejemplos:

- un pedido no deberia estar vacio
- un producto inactivo no deberia aparecer en nuevas rondas
- una linea debe conservar snapshots historicos

## Riesgos actuales de arquitectura

- Hay logica de ronda importante dentro del frontend que aun no tiene tests.
- El manejo de errores del backend es basico y podria devolver demasiados errores como 500.
- Los productos omitidos se guardan localmente, pero todavia no quedan trazados en backend.
- El restaurante temporal simplifica el desarrollo, pero debe reemplazarse por autenticacion o seleccion real de restaurante.
- Falta una politica clara para estados de pedido y estados por proveedor.

## Direccion recomendada

- Mantener GDP.v2 como base principal.
- Extraer logica pura de ronda a funciones testeables.
- Mejorar errores del backend con errores de dominio controlados.
- Anadir tests de servicios y funciones de ronda.
- Documentar decisiones importantes antes de seguir agregando features grandes.
