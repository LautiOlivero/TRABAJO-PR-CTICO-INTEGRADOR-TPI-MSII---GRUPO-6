import { obtenerPedidos, obtenerReclamos, crearReclamo, actualizarEstadoPedido } from '../api/index.js';

// ─── Elementos del DOM ───────────────────────────────────────────────────────
const listaPedidos       = document.getElementById('lista-pedidos');
const loader             = document.getElementById('loader-pedidos');
const btnRegistrarReclamo = document.getElementById('btn-registrar-reclamo');
const inputPedidoId      = document.getElementById('reclamo-pedido-id');
const inputDescripcion   = document.getElementById('reclamo-descripcion');
const errorReclamo       = document.getElementById('reclamo-error');

// ─── Configuración de badges ─────────────────────────────────────────────────
const ESTADOS_BADGE = {
    pendiente:  { clase: 'bg-warning text-dark', texto: 'Pendiente' },
    confirmado: { clase: 'bg-info text-dark',    texto: 'Confirmado' },
    en_camino:  { clase: 'bg-primary',           texto: 'En camino' },
    Entregado:  { clase: 'bg-success',           texto: 'Entregado' },
    entregado:  { clase: 'bg-success',           texto: 'Entregado' },
    finalizado: { clase: 'bg-secondary',         texto: 'Finalizado' },
    Finalizado: { clase: 'bg-secondary',         texto: 'Finalizado' },
    reclamado:  { clase: 'bg-danger',            texto: 'Reclamado' },
};

// ─── RUM-44: Lógica de días hábiles con feriados argentinos 2026 ─────────────
const FERIADOS_ARG = new Set([
    '2026-01-01', // Año Nuevo
    '2026-02-16', // Carnaval
    '2026-02-17', // Carnaval
    '2026-03-24', // Día de la Memoria
    '2026-04-02', // Malvinas
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Día del Trabajador
    '2026-05-25', // Revolución de Mayo
    '2026-06-15', // Día de Güemes
    '2026-06-20', // Día de la Bandera
    '2026-07-09', // Independencia
    '2026-08-17', // Gral. San Martín
    '2026-10-12', // Diversidad Cultural
    '2026-11-20', // Soberanía Nacional
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25', // Navidad
]);

/**
 * Devuelve true si la fecha (Date) cae en fin de semana o feriado nacional.
 */
function esDiaHabil(fecha) {
    const dia = fecha.getDay(); // 0=domingo, 6=sábado
    if (dia === 0 || dia === 6) return false;
    const clave = fecha.toISOString().substring(0, 10);
    return !FERIADOS_ARG.has(clave);
}

/**
 * Calcula cuántos días hábiles transcurrieron desde la fecha de entrega hasta hoy.
 * Devuelve null si no hay fechaEntrega.
 */
function calcularDiasHabilesTranscurridos(fechaEntregaISO) {
    if (!fechaEntregaISO) return null;

    const inicio = new Date(fechaEntregaISO);
    inicio.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (hoy <= inicio) return 0;

    let diasHabiles = 0;
    const cursor = new Date(inicio);
    cursor.setDate(cursor.getDate() + 1); // el día de entrega no cuenta

    while (cursor <= hoy) {
        if (esDiaHabil(cursor)) diasHabiles++;
        cursor.setDate(cursor.getDate() + 1);
    }

    return diasHabiles;
}

const LIMITE_DIAS_HABILES = 5;

// ─── Helpers de formato ───────────────────────────────────────────────────────
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor || 0);
}

function formatearFecha(isoString) {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function estaEntregado(estado) {
    return estado === 'Entregado' || estado === 'entregado';
}

// ─── RUM-47: Cierre automático de pedidos vencidos ───────────────────────────
/**
 * Detecta pedidos "Entregado" sin reclamo cuyo plazo venció y los marca como "Finalizado" en MockAPI.
 * Devuelve la lista de IDs finalizados para que el render muestre el estado correcto.
 */
async function finalizarPedidosVencidos(pedidos, reclamos) {
    const finalizados = new Set();

    const promesas = pedidos
        .filter(pedido => {
            if (!estaEntregado(pedido.estado)) return false;
            const tieneReclamo = reclamos.some(
                r => r.pedidoId === pedido.id || r.pedidoId === String(pedido.id)
            );
            if (tieneReclamo) return false;
            const dias = calcularDiasHabilesTranscurridos(pedido.fechaEntrega);
            return dias !== null && dias > LIMITE_DIAS_HABILES;
        })
        .map(async pedido => {
            try {
                await actualizarEstadoPedido(pedido.id, 'Finalizado');
                pedido.estado = 'Finalizado'; // actualizar en memoria
                finalizados.add(String(pedido.id));
                console.log(`Pedido #${pedido.id} marcado como Finalizado (plazo de reclamo vencido).`);
            } catch (err) {
                console.warn(`No se pudo finalizar el pedido #${pedido.id}:`, err);
            }
        });

    await Promise.all(promesas);
    return finalizados;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderizarPedidos(pedidos, reclamos) {
    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <div class="text-center py-5">
                <p class="lead text-muted">No tenés pedidos aún.</p>
                <a href="index.html" class="btn btn-primary">Ir al catálogo</a>
            </div>`;
        return;
    }

    listaPedidos.innerHTML = '';

    const pedidosOrdenados = [...pedidos].sort((a, b) =>
        new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
    );

    pedidosOrdenados.forEach(pedido => {
        const badgeInfo = ESTADOS_BADGE[pedido.estado] || { clase: 'bg-secondary', texto: pedido.estado };
        const entregado = estaEntregado(pedido.estado);

        const reclamoPedido = reclamos.find(
            r => r.pedidoId === pedido.id || r.pedidoId === String(pedido.id)
        );
        const tieneReclamo = !!reclamoPedido;

        // RUM-44: calcular días hábiles desde entrega
        const diasHabiles = calcularDiasHabilesTranscurridos(pedido.fechaEntrega);
        const sinFechaEntrega = diasHabiles === null;
        const dentroDePlazo = sinFechaEntrega || diasHabiles <= LIMITE_DIAS_HABILES;
        const plazoVencido  = !sinFechaEntrega && diasHabiles > LIMITE_DIAS_HABILES;

        const items = Array.isArray(pedido.items) ? pedido.items : [];
        const itemsHtml = items.length > 0
            ? items.map(i => `
                <li class="list-group-item d-flex justify-content-between py-1 px-0 border-0">
                    <span class="text-muted">${i.nombre} x${i.cantidad || 1}</span>
                    <span class="fw-bold">${formatearMoneda(i.precio * (i.cantidad || 1))}</span>
                </li>`).join('')
            : '<li class="list-group-item text-muted border-0 px-0">Sin detalle de productos</li>';

        // Construir bloque de acción según combinación de estados
        let bloqueAccion = '';

        if (entregado && !tieneReclamo && dentroDePlazo) {
            // ✅ Dentro del plazo: mostrar botón de reclamo + días restantes
            const diasRestantes = sinFechaEntrega
                ? null
                : LIMITE_DIAS_HABILES - diasHabiles;

            const infoPlazo = sinFechaEntrega
                ? ''
                : `<div class="text-muted small mt-1">
                       Plazo: <strong>${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} hábil${diasRestantes !== 1 ? 'es' : ''}</strong> restante${diasRestantes !== 1 ? 's' : ''}
                   </div>`;

            bloqueAccion = `
                <button class="btn btn-warning btn-sm fw-bold btn-iniciar-reclamo"
                        data-pedido-id="${pedido.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                         class="bi bi-exclamation-circle me-1" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                    Realizar Reclamo
                </button>
                ${infoPlazo}`;

        } else if (entregado && !tieneReclamo && plazoVencido) {
            // ❌ Plazo vencido sin reclamo (el pedido ya fue marcado Finalizado antes del render)
            bloqueAccion = `
                <div class="text-muted small fst-italic">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                         class="bi bi-clock-history me-1" viewBox="0 0 16 16">
                        <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a6.99 6.99 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.49-.908l.914.405q-.247.539-.58 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
                        <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
                        <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                    Plazo de reclamo vencido (${diasHabiles} días hábiles)
                </div>`;

        } else if (entregado && tieneReclamo) {
            // ✅ Tiene reclamo: mostrar botón de reenvío
            bloqueAccion = `
                <a href="reenvio.html?pedidoId=${pedido.id}&reclamoId=${reclamoPedido.id}"
                   class="btn btn-danger btn-sm fw-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"
                         class="bi bi-arrow-repeat me-1" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 7.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
                    </svg>
                    Solicitar Reenvío
                </a>
                <div class="mt-2 small text-danger fw-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor"
                         class="bi bi-flag-fill me-1" viewBox="0 0 16 16">
                        <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476z"/>
                    </svg>
                    Reclamo registrado
                </div>`;
        }

        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-4';
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center bg-light">
                <div>
                    <span class="fw-bold text-dark">Pedido #${pedido.id}</span>
                    <span class="text-muted small ms-2">${formatearFecha(pedido.fechaCreacion)}</span>
                    ${pedido.fechaEntrega
                        ? `<span class="text-muted small ms-2">· Entregado: ${formatearFecha(pedido.fechaEntrega)}</span>`
                        : ''}
                </div>
                <span class="badge ${badgeInfo.clase} fs-6">${badgeInfo.texto}</span>
            </div>
            <div class="card-body">
                <div class="row align-items-start">
                    <div class="col-md-8">
                        <h6 class="fw-bold text-muted mb-2 small text-uppercase">Productos</h6>
                        <ul class="list-group list-group-flush">${itemsHtml}</ul>
                    </div>
                    <div class="col-md-4 text-md-end mt-3 mt-md-0">
                        <div class="mb-3">
                            <div class="text-muted small">Total pagado</div>
                            <div class="fs-5 fw-bold text-primary">
                                ${formatearMoneda(pedido.montoTotal || pedido.montoSubtotal)}
                            </div>
                            ${pedido.montoDescuento > 0
                                ? `<div class="text-success small">Descuento: ${formatearMoneda(pedido.montoDescuento)}</div>`
                                : ''}
                        </div>
                        ${bloqueAccion}
                    </div>
                </div>
            </div>
        `;
        listaPedidos.appendChild(card);
    });

    // Eventos de botones "Realizar Reclamo"
    listaPedidos.querySelectorAll('.btn-iniciar-reclamo').forEach(btn => {
        btn.addEventListener('click', function () {
            inputPedidoId.value = this.dataset.pedidoId;
            inputDescripcion.value = '';
            errorReclamo.classList.add('d-none');
            new window.bootstrap.Modal(document.getElementById('modalReclamo')).show();
        });
    });
}

// ─── Modal: registrar reclamo ─────────────────────────────────────────────────
btnRegistrarReclamo.addEventListener('click', async function () {
    const descripcion = inputDescripcion.value.trim();
    const pedidoId    = inputPedidoId.value;

    if (!descripcion) {
        errorReclamo.classList.remove('d-none');
        return;
    }
    errorReclamo.classList.add('d-none');
    btnRegistrarReclamo.disabled = true;
    btnRegistrarReclamo.textContent = 'Registrando...';

    try {
        const reclamo = await crearReclamo({
            pedidoId:      pedidoId,
            descripcion:   descripcion,
            estado:        'En_Analisis',
            fechaCreacion: new Date().toISOString()
        });

        window.location.href = `reenvio.html?pedidoId=${pedidoId}&reclamoId=${reclamo.id}`;
    } catch (error) {
        console.error('Error al crear reclamo:', error);
        alert('No se pudo registrar el reclamo. Intentá de nuevo.');
        btnRegistrarReclamo.disabled = false;
        btnRegistrarReclamo.textContent = 'Registrar Reclamo y Continuar';
    }
});

// ─── Inicialización ───────────────────────────────────────────────────────────
async function inicializar() {
    try {
        const [pedidos, reclamos] = await Promise.all([obtenerPedidos(), obtenerReclamos()]);

        // RUM-47: finalizar automáticamente los pedidos con plazo vencido
        await finalizarPedidosVencidos(pedidos, reclamos);

        loader.classList.add('d-none');
        listaPedidos.classList.remove('d-none');
        renderizarPedidos(pedidos, reclamos);
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        loader.innerHTML = `
            <div class="alert alert-danger text-center w-100">
                <strong>Error al cargar los pedidos.</strong>
                <button class="btn btn-outline-danger btn-sm ms-3" onclick="window.location.reload()">Reintentar</button>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', inicializar);
