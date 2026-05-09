# Documentación Evolutiva del Proyecto: Body Paint

*Este documento sirve como base para generar el PDF único por equipo que debe actualizarse y presentarse en cada Sprint Review.*

## 1. Enlaces del Proyecto
- **Repositorio en GitHub:** [https://github.com/LautiOlivero/TRABAJO-PR-CTICO-INTEGRADOR-TPI-MSII---GRUPO-6.git](https://github.com/LautiOlivero/TRABAJO-PR-CTICO-INTEGRADOR-TPI-MSII---GRUPO-6.git)
- **Proyecto en Jira:** https://grupo6msll.atlassian.net/jira/software/projects/SCRUM/boards/1?atlOrigin=eyJpIjoiMjllODRlZGExZjVjNGUxODhlMjcwMTU5N2YwMjI2MDgiLCJwIjoiaiJ9 

## 2. Integrantes del Grupo
| Nombre y Apellido | Mail | Legajo | Rol Interno (Opcional) |
| :--- | :--- | :--- | :--- |
| Lautaro Olviero | [Completar Mail] | [Completar Legajo] | Scrum Master / Developer |
| Mauricio Encina | [Completar Mail] | [Completar Legajo] | Developer |
| Luciana Sassia |sassialiuciana@gmail.com | 17475| Developer |

## 3. Roles del Sistema y Responsabilidades
- **Cliente:** Usuario que navega el catálogo, arma carros de compras y confirma pedidos con pago contra entrega.
- **Vendedor:** Usuario interno de Body Paint que visualiza y gestiona los estados de los pedidos de los clientes.
- **Administrador de Productos:** Usuario interno encargado de mantener actualizado el catálogo de productos, gestionar el stock, cargar nuevos productos y visualizar las alertas de inventario.
- *(Nota: El rol del **Product Owner (PO)** es ejercido por los docentes de la cátedra).*

---

## 4. Registro de Sprints

### SPRINT 1

**1. Objetivo del Sprint:**
Realizar el análisis funcional y técnico del dominio 'Body Paint', configurar las herramientas de gestión (Jira y GitHub) y definir los criterios de aceptación y estimaciones para las User Stories del cliente y el MVP

**2. User Stories seleccionadas para el Sprint Backlog:**
- US-01: Cupón de Descuento 
- US-02: Gestión de Reclamos
- US-03: Solicitud de Reenvío

**3. Detalle de cada User Story:**

**US-01: Cupón de Descuento**
•	Descripción: Como cliente, quiero ingresar un cupón de descuento para obtener beneficios en mi compra.
•	Criterios de Aceptación:
    1.	El sistema debe permitir el ingreso de un código de cupón en el carro de compras. 
    2.	El descuento solo se aplica si el monto del pedido es mayor al descuento obtenido. 
    3.	Al confirmar el pago, el cupón debe marcarse como usado y quedar asociado al pedido. 
•	Estimación: Requiere validación de reglas de negocio y actualización de montos en tiempo real. 
    o	Esfuerzo: 5 (Escala Fibonacci).
    o	Complejidad: Media.
    o	Incertidumbre: Baja. 
    
**US-02: Gestión de Reclamos**
•	Descripción: Como cliente, quiero realizar reclamos dentro de los 5 días posteriores a la entrega para solucionar problemas.
•	Criterios de Aceptación:
    1.	El sistema debe habilitar la opción de reclamo solo hasta 5 días hábiles después de la entrega. 
    2.	Si no hay reclamo en ese plazo, el pedido se marca como finalizado automáticamente. 
•	Estimación: Esfuerzo bajo ya que se reutilizará la lógica de validación de fechas de proyectos anteriores, aunque con incertidumbre media por la integración de feriados.
    o	Esfuerzo: 3.
    o	Complejidad: Baja.
    o	Incertidumbre: Media (por el cálculo de días hábiles).
    
**US-03: Solicitud de Reenvío**
•	Descripción: Como cliente, quiero solicitar el reenvío de productos para recibir lo faltante o defectuoso.
•	Criterios de Aceptación:
    1.	El cliente puede elegir si el reenvío es por la totalidad o una parte del pedido. 
    2.	La solicitud debe quedar sujeta a un análisis previo del vendedor. 
•	Estimación: Se considera de esfuerzo alto no solo por la lógica de selección de productos, sino por la incertidumbre crítica respecto a la disponibilidad de stock. Si el producto a reenviar no está disponible, el sistema debe contemplar un flujo alternativo (como nota de crédito o espera de reposición), lo que aumenta el riesgo técnico y de negocio.
    o	Esfuerzo: 8.
    o	Complejidad: Alta (implica lógica de logística y nuevos estados de pedido).
    o Incertidumbre: Alta.

**4. Resultado del Sprint:**
**Funcionalidades implementadas:**
- Configuración del entorno de gestión: Setup de Jira Software con tablero Scrum y creación del repositorio organizacional en GitHub.
-	Análisis funcional y técnico: Definición de Criterios de Aceptación y estimaciones Fibonacci para las historias de usuario asignadas.
-	Definición de Stack Tecnológico: Selección de HTML/JS/Bootstrap y MockAPI como arquitectura base.

**Funcionalidades pendientes o replanificadas:** 
- El desarrollo del código fuente de las User Stories (US-01, US-02, US-03) se traslada al Sprint 2, priorizando en esta etapa la base estructural y técnica del MVP.

**5. Decisiones relevantes tomadas por el equipo:**
**Decisiones técnicas:**
    1.	Actualización de Stock en tiempo real (Persistencia): Se optó por una arquitectura basada en servicios externos mediante MockAPI, que permite la actualización automática de las cantidades de productos cada vez que se confirme un pedido. Esto garantiza que el Administrador visualice datos reales y actualizados, cumpliendo con el requisito de visibilidad del stock de forma inmediata.
    2.	Tecnología: Se utilizará un stack basado en HTML, CSS (Bootstrap) y JavaScript. Esta decisión se fundamenta en la experiencia previa del equipo con estas herramientas, lo que garantiza agilidad en el desarrollo del Frontend y asegura la entrega del MVP en los plazos establecidos, minimizando el riesgo técnico.


### SPRINT 2
*(El formato se repite para los próximos Sprints)*
