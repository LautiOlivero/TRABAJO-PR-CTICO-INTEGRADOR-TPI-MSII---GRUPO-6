# Product Backlog - MVP Body Paint

Este documento contiene el detalle de las User Stories (US) obligatorias para el MVP del sistema Body Paint, formateadas de acuerdo a la plantilla requerida por la cátedra.

---

## Épica 1: Gestión de Clientes

### US-01: Registro de Cliente
**Descripción:**  
Como cliente visitante  
Quiero poder registrarme en el sistema ingresando mis datos personales, email de contacto y dirección de envío por defecto (país, provincia/estado, localidad, calle, número, piso y departamento)  
Para poder confirmar pedidos de compra en el futuro.

**Criterios de Aceptación:**
- El sistema debe requerir obligatoriamente: Nombre, Apellido, Email, y los campos mínimos de la dirección (país, provincia, localidad, calle, número).
- El sistema debe validar que el formato del email ingresado sea correcto.
- El sistema debe validar que el email ingresado no esté registrado previamente.
- Una vez registrado exitosamente, el cliente debe poder iniciar sesión en el sistema.

**Estimación:**
- **Justificación de estimación US 01:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

---

## Épica 2: Catálogo y Carro de Compras

### US-02: Visualización del Catálogo
**Descripción:**  
Como cliente  
Quiero ver un listado con los productos disponibles que ofrece Body Paint  
Para poder seleccionar y comprar los que necesito.

**Criterios de Aceptación:**
- El cliente debe poder visualizar todos los productos y kits activos en el sistema.
- Por cada producto se debe mostrar al menos: Nombre, Marca, Precio e Imagen.
- El catálogo debe estar accesible sin necesidad de estar logueado.

**Estimación:**
- **Justificación de estimación US 02:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

### US-03: Armar Carro de Compras
**Descripción:**  
Como cliente  
Quiero poder agregar o quitar productos a un "carro de compras" y visualizar el monto total  
Para gestionar mi pedido antes de confirmar la compra.

**Criterios de Aceptación:**
- El sistema debe permitir agregar cualquier producto del catálogo al carro.
- El sistema debe permitir modificar la cantidad de un producto o eliminarlo del carro.
- El sistema debe mostrar en todo momento el listado de productos agregados, la cantidad de cada uno, el subtotal por producto y el monto total acumulado.

**Estimación:**
- **Justificación de estimación US 03:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

---

## Épica 3: Checkout y Pagos

### US-04: Confirmar Pedido (Efectivo)
**Descripción:**  
Como cliente registrado  
Quiero confirmar mi pedido seleccionando mi domicilio de envío y seleccionando la forma de pago "Efectivo contra entrega"  
Para finalizar mi compra.

**Criterios de Aceptación:**
- El cliente debe estar logueado para poder acceder a la confirmación de la compra.
- El sistema debe permitir elegir entre la dirección por defecto registrada o ingresar un nuevo domicilio para ese pedido particular.
- El sistema debe permitir seleccionar "Efectivo contra entrega" como medio de pago único (según MVP).
- Al confirmar, el pedido debe quedar registrado en estado "Pendiente de Entrega".
- El sistema debe vaciar el carro de compras una vez finalizado el pedido.

**Estimación:**
- **Justificación de estimación US 04:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

---

## Épica 4: Panel de Administración de Productos

### US-05: Visualizar Productos (Administrador)
**Descripción:**  
Como Administrador de Productos  
Quiero visualizar el catálogo completo de productos incluyendo el stock disponible de cada uno  
Para controlar la disponibilidad de los artículos.

**Criterios de Aceptación:**
- El usuario debe autenticarse con rol de Administrador de Productos.
- El panel debe listar todos los productos mostrando: Nombre, Marca, Precio y **Stock Actual**.
- El sistema debe resaltar en color rojo y con un ícono descriptivo aquellos productos cuyo stock actual sea igual o menor al valor mínimo configurable.

**Estimación:**
- **Justificación de estimación US 05:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

### US-06: Crear Producto (Administrador)
**Descripción:**  
Como Administrador de Productos  
Quiero dar de alta un nuevo producto simple (nombre, marca, stock, precio e imagen) en el sistema  
Para que esté disponible para la venta.

**Criterios de Aceptación:**
- El administrador debe poder ingresar todos los datos obligatorios del producto.
- El sistema debe permitir configurar el valor mínimo de stock para ese producto (para futuras alertas).
- El sistema debe permitir adjuntar una imagen del producto (png o jpg).
- Tras el guardado exitoso, el producto debe quedar disponible en el catálogo de los clientes.

**Estimación:**
- **Justificación de estimación US 06:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]

---

## Épica 5: Gestión de Ventas

### US-07: Visualizar Estado de Pedidos (Vendedor)
**Descripción:**  
Como Vendedor  
Quiero visualizar un listado con los pedidos pendientes de entrega  
Para saber qué productos debo preparar y despachar.

**Criterios de Aceptación:**
- El usuario debe autenticarse con rol de Vendedor.
- El panel debe mostrar todos los pedidos realizados por los clientes.
- Por cada pedido se debe visualizar: Datos del cliente, Dirección de envío, Listado de productos, Monto Total y Estado actual.

**Estimación:**
- **Justificación de estimación US 07:** [A completar por el equipo]
- **Esfuerzo:** [?]
- **Complejidad:** [?]
- **Incertidumbre:** [?]
