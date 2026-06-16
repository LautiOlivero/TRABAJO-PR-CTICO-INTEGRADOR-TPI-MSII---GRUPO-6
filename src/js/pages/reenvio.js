import { obtenerPedidoPorId, obtenerReclamos, crearReenvio } from '../api/pedidos.js';
import { obtenerProductoPorId } from '../api/productos.js';
import { SolicitudReenvio } from '../models/Reenvio.js';

// --- Elementos del DOM ---
const loader             = document.getElementById('loader-reenvio');
const errorAcceso        = document.getElementById('error-acceso');
const errorMensaje       = document.getElementById('error-acceso-mensaje');
const contenido          = document.getElementById('contenido-reenvio');
const infoPedidoId       = document.getElementById('info-pedido-id');
const infoPedidoEstado   = document.getElementById('info-pedido-estado');
const infoReclamoId      = document.getElementById('info-reclamo-id');
const tablaItems         = document.getElementById('tabla-items-reenvio');
const thSeleccion        = document.getElementById('th-seleccion');
const checkTodos         = document.getElementById('check-todos');
const alertaStock        = document.getElementById('alerta-stock');
const listaSinStock      = document.getElementById('lista-sin-stock');
const btnEnviar          = document.getElementById('btn-enviar-reenvio');

// --- Estado ---
let pedidoActual = null;
let reclamoId    = null;
let esAlcanceParcial = false;
let stockMap     = {};  // idProducto -> stockDisponible

// --- Helpers ---
function mostrarError(mensaje) {
    loader.classList.add('d-none');
    errorMensaje.textContent = mensaje;
    errorAcceso.classList.remove('d-none');
}

// CP-18: alerta de bloqueo por falta de stock (aparece sobre la tabla, no oculta el contenido)
function mostrarAlertaBloqueo(mensaje) {
    let alerta = document.getElementById('alerta-bloqueo-stock');
    if (!alerta) {
        alerta = document.createElement('div');
        alerta.id = 'alerta-bloqueo-stock';
        alerta.className = 'alert alert-danger fw-bold mt-3';
        alerta.setAttribute('role', 'alert');
        document.getElementById('contenedor-items').insertAdjacentElement('afterend', alerta);
    }
    alerta.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-circle-fill me-2" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
        </svg>
        Operación rechazada: ${mensaje}`;
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function estaEntregado(estado) {
    return estado === 'Entregado' || estado === 'entregado';
}

function obtenerItemsSeleccionados() {
    if (!esAlcanceParcial) return pedidoActual.items;

    const checks = tablaItems.querySelectorAll('input[type="checkbox"]:checked');
    const idsSeleccionados = new Set([...checks].map(c => c.dataset.itemIdx));
    return pedidoActual.items.filter((_, idx) => idsSeleccionados.has(String(idx)));
}

// --- Renderizar tabla de items ---
function renderizarItems() {
    tablaItems.innerHTML = '';

    pedidoActual.items.forEach((item, idx) => {
        const stockProducto = stockMap[item.idProducto] ?? null;
        const sinStock = stockProducto !== null && stockProducto === 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="align-middle d-none check-col">
                <input class="form-check-input" type="checkbox" data-item-idx="${idx}"
                    ${esAlcanceParcial ? '' : 'disabled checked'}>
            </td>
            <td class="align-middle fw-bold text-dark">${item.nombre}</td>
            <td class="align-middle text-center">${item.cantidad || 1}</td>
            <td class="align-middle text-center">
                ${stockProducto === null
                    ? '<span class="text-muted small">N/D</span>'
                    : sinStock
                        ? '<span class="badge bg-danger">Sin stock</span>'
                        : `<span class="badge bg-success">${stockProducto} disponibles</span>`
                }
            </td>
        `;
        tablaItems.appendChild(tr);
    });

    actualizarAlertaStock(pedidoActual.items);
}

function actualizarAlertaStock(items) {
    const sinStockItems = items.filter(item => {
        const stock = stockMap[item.idProducto];
        return stock !== undefined && stock === 0;
    });

    if (sinStockItems.length > 0) {
        listaSinStock.innerHTML = sinStockItems.map(i => `<li>${i.nombre}</li>`).join('');
        alertaStock.classList.remove('d-none');
    } else {
        alertaStock.classList.add('d-none');
    }
}

// --- Cambio de alcance (total / parcial) ---
document.querySelectorAll('input[name="alcance-reenvio"]').forEach(radio => {
    radio.addEventListener('change', function () {
        esAlcanceParcial = this.value === 'parcial';

        // Mostrar/ocultar columna de checkboxes
        thSeleccion.classList.toggle('d-none', !esAlcanceParcial);
        tablaItems.querySelectorAll('.check-col').forEach(td => {
            td.classList.toggle('d-none', !esAlcanceParcial);
        });

        // En modo total: todos los checks marcados y deshabilitados
        tablaItems.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.disabled = !esAlcanceParcial;
            cb.checked = !esAlcanceParcial || cb.checked;
        });

        checkTodos.checked = !esAlcanceParcial;

        // Recalcular alerta de stock según selección
        actualizarAlertaStock(obtenerItemsSeleccionados());
    });
});

// Checkbox "seleccionar todos"
checkTodos.addEventListener('change', function () {
    tablaItems.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = this.checked;
    });
    actualizarAlertaStock(obtenerItemsSeleccionados());
});

// Actualizar alerta al cambiar selección individual
tablaItems.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox' && e.target !== checkTodos) {
        actualizarAlertaStock(obtenerItemsSeleccionados());
    }
});

// --- Enviar solicitud ---
btnEnviar.addEventListener('click', async function () {
    const itemsSeleccionados = obtenerItemsSeleccionados();

    if (esAlcanceParcial && itemsSeleccionados.length === 0) {
        alert('Seleccioná al menos un producto para el reenvío.');
        return;
    }

    // CP-18: Bloquear si algún item seleccionado no tiene stock disponible
    const sinStock = itemsSeleccionados.filter(item =>
        stockMap[item.idProducto] !== undefined && stockMap[item.idProducto] === 0
    );
    if (sinStock.length > 0) {
        const nombres = sinStock.map(i => i.nombre).join(', ');
        mostrarAlertaBloqueo(`No hay stock disponible para el reenvío inmediato de: ${nombres}. La operación no puede procesarse.`);
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Enviando...`;

    const solicitud = new SolicitudReenvio(
        null,
        reclamoId,
        pedidoActual.id,
        itemsSeleccionados.map(i => ({
            idProducto: i.idProducto,
            nombre:     i.nombre,
            cantidad:   i.cantidad || 1
        })),
        'Pendiente_Analisis',
        new Date().toISOString()
    );

    try {
        const respuesta = await crearReenvio(solicitud);
        document.getElementById('numero-reenvio-modal').textContent = respuesta.id;
        const modal = new window.bootstrap.Modal(document.getElementById('modalExitoReenvio'));
        modal.show();
    } catch (error) {
        console.error('Error al crear reenvío:', error);
        alert('No se pudo registrar la solicitud. Intentá de nuevo.');
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = 'Enviar Solicitud de Reenvío';
    }
});

// --- Inicialización ---
async function inicializar() {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedidoId');
    reclamoId = params.get('reclamoId');

    if (!pedidoId || !reclamoId) {
        mostrarError('Faltan parámetros en la URL. Accedé desde "Mis Pedidos".');
        return;
    }

    try {
        // 1. Cargar pedido
        pedidoActual = await obtenerPedidoPorId(pedidoId);

        // 2. Validar estado "Entregado"
        if (!estaEntregado(pedidoActual.estado)) {
            mostrarError(`El pedido #${pedidoId} tiene estado "${pedidoActual.estado}". Solo se pueden pedir reenvíos de pedidos entregados.`);
            return;
        }

        // 3. Validar que el reclamo exista y esté en estado válido
        const reclamos = await obtenerReclamos();
        const reclamoValido = reclamos.find(r =>
            String(r.id) === String(reclamoId) &&
            (r.estado === 'En_Analisis' || r.estado === 'Aprobado' || r.estado === 'en_analisis' || r.estado === 'aprobado')
        );
        if (!reclamoValido) {
            mostrarError('No se encontró un reclamo válido (aprobado o en análisis) asociado a este pedido. Iniciá un reclamo primero desde "Mis Pedidos".');
            return;
        }

        // 4. Verificar stock de cada producto contra MockAPI
        if (Array.isArray(pedidoActual.items)) {
            const checks = pedidoActual.items.map(async item => {
                if (!item.idProducto) return;
                try {
                    const producto = await obtenerProductoPorId(item.idProducto);
                    stockMap[item.idProducto] = producto.stock ?? 0;
                } catch {
                    // Si no se puede obtener el producto, dejamos sin info
                }
            });
            await Promise.all(checks);
        }

        // 5. Mostrar info
        infoPedidoId.textContent = `#${pedidoActual.id}`;
        infoPedidoEstado.innerHTML = `<span class="badge bg-success fs-6">Entregado</span>`;
        infoReclamoId.textContent = `#${reclamoId}`;

        // 6. Renderizar tabla
        renderizarItems();

        // 7. Mostrar contenido
        loader.classList.add('d-none');
        contenido.classList.remove('d-none');

    } catch (error) {
        console.error('Error al inicializar reenvío:', error);
        mostrarError('No se pudo cargar la información del pedido. Verificá tu conexión e intentá de nuevo.');
    }
}

document.addEventListener('DOMContentLoaded', inicializar);
