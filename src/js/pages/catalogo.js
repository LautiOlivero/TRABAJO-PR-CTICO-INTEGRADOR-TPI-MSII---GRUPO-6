import { obtenerProductos, crearPedido } from '../api/index.js';
import { Pedido } from '../models/Pedido.js';

const contenedorCatalogo = document.getElementById('catalogo-productos');
const cargador = document.getElementById('loader-productos');
const contadorTotalProductos = document.getElementById('total-productos-count');
const btnConfirmarCompra = document.getElementById('btn-confirmar-compra');

const productosSeleccionados = [];
let productosCatalogo = [];

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(valor);
}

const totalSeleccion = document.getElementById('total-seleccion');

function calcularTotalSeleccionados() {
    return productosSeleccionados.reduce(function (total, producto) {
        return total + (producto.precio || 0) * (producto.cantidad || 1);
    }, 0);
}

function actualizarTotalSeleccionado() {
    if (!totalSeleccion) return;
    const total = calcularTotalSeleccionados();
    totalSeleccion.textContent = `Total seleccionado: ${formatearMoneda(total)}`;
}

function actualizarBotonConfirmar() {
    if (!btnConfirmarCompra) return;
    btnConfirmarCompra.disabled = productosSeleccionados.length === 0;
}

async function confirmarCompra() {
    if (productosSeleccionados.length === 0) return;

    const itemsDelPedido = productosSeleccionados.map(function (producto) {
        return {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad
        };
    });

    // Instanciamos el modelo Pedido con los datos básicos
    const pedido = new Pedido(
        null,           // id (MockAPI lo genera)
        '1',            // usuarioId fijo por ahora
        itemsDelPedido  // los items que armamos arriba
    );

    // Asignamos el total calculado por ahora (hasta que apliquemos cupones en la US-01)
    pedido.montoSubtotal = calcularTotalSeleccionados();
    pedido.montoTotal = calcularTotalSeleccionados();

    try {
        const respuesta = await crearPedido(pedido);
        console.log('Pedido creado:', respuesta);

        // Mostrar el modal de éxito en lugar del alert
        document.getElementById('numero-pedido-modal').textContent = respuesta.id;
        const modalElement = document.getElementById('modalExitoPedido');
        const modalExito = new window.bootstrap.Modal(modalElement);
        modalExito.show();

        productosSeleccionados.length = 0;
        actualizarTotalSeleccionado();
        actualizarBotonConfirmar();
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        alert('No se pudo enviar el pedido. Intenta nuevamente.');
    }
}

function renderizarCatalogo(productos) {
    contenedorCatalogo.innerHTML = '';

    if (productos.length === 0) {
        contenedorCatalogo.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="lead text-muted">No hay productos disponibles en el catálogo en este momento.</p>
            </div>
        `;
        return;
    }

    productos.forEach(function (producto) {
        const columnaTarjeta = document.createElement('div');
        columnaTarjeta.className = 'col';

        const esBajoStock = producto.stock <= (producto.stockMinimo || 3);
        const claseEtiquetaStock = esBajoStock ? 'bg-danger' : 'bg-success';
        const textoStock = producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin Stock';
        const imagenPorDefecto = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80';

        columnaTarjeta.innerHTML = `
            <div class="card h-100 shadow-sm product-card">
                <div class="position-relative">
                    <img src="${producto.imagen || imagenPorDefecto}" 
                         class="card-img-top" 
                         alt="${producto.nombre}"
                         onerror="this.onerror=null; this.src='${imagenPorDefecto}';">
                    <span class="badge ${claseEtiquetaStock} position-absolute top-0 end-0 m-3 product-stock">
                        ${textoStock}
                    </span>
                </div>
                
                <div class="card-body d-flex flex-column">
                    <span class="product-brand">${producto.marca || 'Genérica'}</span>
                    <h5 class="card-title fw-bold text-dark mt-1">${producto.nombre}</h5>
                    
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="product-price">${formatearMoneda(producto.precio)}</span>
                        </div>
                        
                        <button class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 add-to-cart-btn" 
                                data-id="${producto.id}" 
                                ${producto.stock === 0 ? 'disabled' : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart-plus" viewBox="0 0 16 16">
                                <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
                                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                            </svg>
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedorCatalogo.appendChild(columnaTarjeta);
    });
}

function agregarProductoSeleccionado(producto) {
    const productoGuardado = productosSeleccionados.find(function (item) {
        return item.id === producto.id;
    });

    if (productoGuardado) {
        productoGuardado.cantidad = (productoGuardado.cantidad || 1) + 1;
    } else {
        productosSeleccionados.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            cantidad: 1
        });
    }

    console.log('Productos seleccionados:', productosSeleccionados);
    actualizarTotalSeleccionado();
    actualizarBotonConfirmar();
}

contenedorCatalogo.addEventListener('click', function (event) {
    const boton = event.target.closest('.add-to-cart-btn');
    if (!boton) return;

    const idProducto = boton.dataset.id;
    const producto = productosCatalogo.find(function (item) {
        return item.id === idProducto;
    });

    if (!producto) return;
    agregarProductoSeleccionado(producto);
});

if (btnConfirmarCompra) {
    btnConfirmarCompra.addEventListener('click', function () {
        confirmarCompra();
    });
}

async function inicializarCatalogo() {
    try {
        const listaProductos = await obtenerProductos();
        productosCatalogo = listaProductos;

        contadorTotalProductos.textContent = `${listaProductos.length} productos encontrados`;

        renderizarCatalogo(listaProductos);
        actualizarTotalSeleccionado();
        actualizarBotonConfirmar();

        cargador.classList.add('d-none');
        contenedorCatalogo.classList.remove('d-none');
    } catch (error) {
        console.error('Error cargando el catálogo:', error);
        contadorTotalProductos.textContent = 'Error al cargar catálogo';
        cargador.innerHTML = `
            <div class="alert alert-danger w-100 text-center shadow-sm" role="alert">
                <h4 class="alert-heading fw-bold">¡Ups! Algo salió mal</h4>
                <p>No pudimos conectar con el servidor para traer los productos. Por favor, reintenta en unos instantes.</p>
                <hr>
                <button class="btn btn-outline-danger btn-sm" onclick="window.location.reload()">Reintentar</button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', inicializarCatalogo);
