import { obtenerCarrito, vaciarCarrito, crearPedido, obtenerCupones, eliminarDelCarrito, actualizarCupon, obtenerProductoPorId, actualizarStockProducto, actualizarCantidadCarrito } from '../api/index.js';
import { Pedido } from '../models/Pedido.js';
import { Cupon } from '../models/Cupon.js';

const tablaCarrito = document.getElementById('tabla-carrito');
const resumenSubtotal = document.getElementById('resumen-subtotal');
const contenedorDescuento = document.getElementById('contenedor-descuento');
const resumenDescuento = document.getElementById('resumen-descuento');
const resumenTotal = document.getElementById('resumen-total');
const btnConfirmarCompra = document.getElementById('btn-confirmar-compra');
const btnAplicarCupon = document.getElementById('btn-aplicar-cupon');
const inputCupon = document.getElementById('input-cupon');
const mensajeCupon = document.getElementById('mensaje-cupon');

let itemsCarrito = [];
let cuponActivo = null;

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(valor);
}

function calcularSubtotalBruto() {
    return itemsCarrito.reduce((total, item) => total + ((item.precio || 0) * (item.cantidad || 1)), 0);
}

function actualizarTotales() {
    const subtotal = calcularSubtotalBruto();
    resumenSubtotal.textContent = formatearMoneda(subtotal);

    if (cuponActivo) {
        const descuento = cuponActivo.calcularDescuento(subtotal);
        const total = subtotal - descuento;

        contenedorDescuento.classList.remove('d-none');
        resumenDescuento.textContent = `- ${formatearMoneda(descuento)}`;
        resumenTotal.textContent = formatearMoneda(total);
    } else {
        contenedorDescuento.classList.add('d-none');
        resumenTotal.textContent = formatearMoneda(subtotal);
    }

    btnConfirmarCompra.disabled = itemsCarrito.length === 0;
}

function renderizarTabla() {
    tablaCarrito.innerHTML = '';

    if (itemsCarrito.length === 0) {
        tablaCarrito.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    El carrito está vacío. <a href="index.html">Volver al catálogo</a>
                </td>
            </tr>
        `;
        return;
    }

    itemsCarrito.forEach(item => {
        const tr = document.createElement('tr');
        const subtotalItem = (item.precio || 0) * (item.cantidad || 1);

        tr.innerHTML = `
            <td class="align-middle fw-bold text-dark">${item.nombre}</td>
            <td class="align-middle text-muted">${formatearMoneda(item.precio)}</td>
            <td class="align-middle">
                <div class="input-group input-group-sm" style="width: 100px;">
                    <button class="btn btn-outline-secondary btn-restar" type="button" data-id="${item.id}">-</button>
                    <input type="text" class="form-control text-center bg-white" value="${item.cantidad}" readonly>
                    <button class="btn btn-outline-secondary btn-sumar" type="button" data-id="${item.id}">+</button>
                </div>
            </td>
            <td class="align-middle fw-bold text-primary">${formatearMoneda(subtotalItem)}</td>
            <td class="align-middle text-end">
                <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id}" title="Eliminar producto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                </button>
            </td>
        `;

        const btnSumar = tr.querySelector('.btn-sumar');
        const btnRestar = tr.querySelector('.btn-restar');
        const btnEliminar = tr.querySelector('.btn-eliminar');

        btnSumar.addEventListener('click', async () => {
            btnSumar.disabled = true;
            try {
                await actualizarCantidadCarrito(item.id, Number(item.cantidad) + 1);
                await inicializarCarrito();
            } catch (error) {
                console.error('Error al sumar cantidad', error);
                btnSumar.disabled = false;
            }
        });

        btnRestar.addEventListener('click', async () => {
            btnRestar.disabled = true;
            try {
                if (Number(item.cantidad) > 1) {
                    await actualizarCantidadCarrito(item.id, Number(item.cantidad) - 1);
                    await inicializarCarrito();
                } else {
                    await eliminarDelCarrito(item.id);
                    await inicializarCarrito();
                }
            } catch (error) {
                console.error('Error al restar cantidad', error);
                btnRestar.disabled = false;
            }
        });

        btnEliminar.addEventListener('click', async () => {
            btnEliminar.disabled = true;
            try {
                await eliminarDelCarrito(item.id);
                await inicializarCarrito();
            } catch (error) {
                console.error('Error al eliminar', error);
                alert('No se pudo eliminar el producto del carrito.');
                btnEliminar.disabled = false;
            }
        });

        tablaCarrito.appendChild(tr);
    });
}

// Lógica del Cupón
btnAplicarCupon.addEventListener('click', async function () {
    const codigoIngresado = inputCupon.value.trim().toUpperCase();
    if (!codigoIngresado) return;

    mensajeCupon.textContent = "Verificando...";
    mensajeCupon.className = "small text-info mb-4";
    mensajeCupon.classList.remove('d-none');

    try {
        const cuponesDisponibles = await obtenerCupones();
        const cuponEncontrado = cuponesDisponibles.find(c =>
            c.codigo.toUpperCase() === codigoIngresado &&
            !c.usado &&
            c.estado === "activo"
        );

        if (cuponEncontrado) {
            cuponActivo = new Cupon(
                cuponEncontrado.id,
                cuponEncontrado.codigo,
                cuponEncontrado.valor,
                cuponEncontrado.tipo,
                cuponEncontrado.usado
            );
            cuponActivo.datosOriginales = cuponEncontrado;

            mensajeCupon.textContent = "¡Cupón aplicado correctamente!";
            mensajeCupon.className = "small text-success mb-4 fw-bold";
            actualizarTotales();
        } else {
            cuponActivo = null;
            mensajeCupon.textContent = "Cupón inválido o ya utilizado.";
            mensajeCupon.className = "small text-danger mb-4 fw-bold";
            actualizarTotales();
        }
    } catch (error) {
        mensajeCupon.textContent = "Error al verificar el cupón.";
        mensajeCupon.className = "small text-danger mb-4";
    }
});

// Lógica Confirmar Compra
btnConfirmarCompra.addEventListener('click', async function () {
    btnConfirmarCompra.disabled = true;
    btnConfirmarCompra.textContent = "Procesando...";

    const pedido = new Pedido(
        null,           // id
        '1',            // usuarioId fijo por ahora
        itemsCarrito,   // items extraídos de MockAPI
        cuponActivo     // Cupón aplicado
    );

    try {
        const respuesta = await crearPedido(pedido);
        console.log('Pedido creado:', respuesta);

        // Marcar cupón como usado en MockAPI si existe
        if (cuponActivo) {
            const cuponActualizado = {
                ...cuponActivo.datosOriginales,
                usado: true,
                estado: "inactivo"
            };
            await actualizarCupon(cuponActivo.id, cuponActualizado);
            console.log('Cupón marcado como usado en la API.');
        }

        // --- NUEVA FUNCIONALIDAD: Descontar stock ---
        for (const item of itemsCarrito) {
            try {
                const productoCatalogo = await obtenerProductoPorId(item.idProducto);
                if (productoCatalogo && productoCatalogo.stock >= item.cantidad) {
                    const nuevoStock = productoCatalogo.stock - item.cantidad;
                    await actualizarStockProducto(item.idProducto, nuevoStock);
                    console.log(`Stock actualizado para ${item.nombre}: ahora quedan ${nuevoStock}`);
                }
            } catch (error) {
                console.error(`Error al descontar stock del producto ${item.nombre}:`, error);
            }
        }

        // Vaciar el carrito en MockAPI
        await vaciarCarrito();

        // Mostrar Modal
        document.getElementById('numero-pedido-modal').textContent = respuesta.id;
        const modalElement = document.getElementById('modalExitoPedido');
        const modalExito = new window.bootstrap.Modal(modalElement);
        modalExito.show();

        // Redirigir al catálogo al cerrar el modal
        document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Error al confirmar compra:', error);
        alert('No se pudo enviar el pedido. Intenta nuevamente.');
        btnConfirmarCompra.disabled = false;
        btnConfirmarCompra.textContent = "Confirmar Compra";
    }
});

async function inicializarCarrito() {
    try {
        itemsCarrito = await obtenerCarrito();
        renderizarTabla();
        actualizarTotales();
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        tablaCarrito.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar el carrito.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', inicializarCarrito);
