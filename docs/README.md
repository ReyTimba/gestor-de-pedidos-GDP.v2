# Documentacion tecnica - GDP.v2

Esta carpeta recoge las decisiones importantes del proyecto. La idea no es documentar cada linea de codigo, sino poder explicar el sistema como lo explicaria un desarrollador junior serio en una entrevista o revision tecnica.

## Documentos

- [Modelo de dominio](./modelo-dominio.md): entidades principales, reglas de negocio y conceptos del restaurante.
- [Arquitectura](./arquitectura.md): responsabilidades de frontend, backend, base de datos y esquemas compartidos.
- [Decisiones tecnicas](./decisiones-tecnicas.md): razones detras de las decisiones actuales y aprendizajes desde versiones anteriores.
- [Roadmap desde order-manager-app](./roadmap-desde-order-manager-app.md): funcionalidades de la version anterior que conviene migrar a GDP.v2, priorizadas por utilidad y potencial.

## Objetivo del proyecto

GDP.v2 es una aplicacion full stack para gestionar rondas de pedido en restaurantes. Busca reducir olvidos, escritura manual y esfuerzo mental al revisar productos, decidir cantidades y preparar pedidos por proveedor.

El foco principal no es hacer un CRUD generico, sino modelar un flujo real de trabajo: una persona revisa productos requeridos, decide si pedir o no pedir, ajusta cantidades y genera un pedido trazable.

