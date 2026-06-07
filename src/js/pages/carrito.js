import { obtenerCarrito, vaciarCarrito, crearPedido, obtenerCupones } from '../api/index.js';
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
                <td colspan="4" class="text-center py-4 text-muted">
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
            <td class="align-middle">${item.cantidad}</td>
            <td class="align-middle fw-bold text-primary">${formatearMoneda(subtotalItem)}</td>
        `;
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
        const cuponEncontrado = cuponesDisponibles.find(c => c.codigo.toUpperCase() === codigoIngresado);

        if (cuponEncontrado && !cuponEncontrado.usado) {
            cuponActivo = new Cupon(
                cuponEncontrado.id,
                cuponEncontrado.codigo,
                cuponEncontrado.valor,
                cuponEncontrado.tipo,
                cuponEncontrado.usado
            );

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
        tablaCarrito.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error al cargar el carrito.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', inicializarCarrito);
