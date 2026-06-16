import { obtenerProductos } from '../api/index.js';
import { agregarAlCarrito, obtenerCarrito, actualizarCantidadCarrito } from '../api/carrito.js';

const contenedorCatalogo = document.getElementById('catalogo-productos');
const cargador = document.getElementById('loader-productos');
const contadorTotalProductos = document.getElementById('total-productos-count');

let productosCatalogo = [];

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(valor);
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

async function agregarProductoSeleccionado(producto, boton) {
    boton.disabled = true;
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Agregando...`;

    try {
        const carrito = await obtenerCarrito();
        const productoEnCarrito = carrito.find(item => item.idProducto === producto.id);

        if (productoEnCarrito) {
            await actualizarCantidadCarrito(productoEnCarrito.id, Number(productoEnCarrito.cantidad) + 1);
        } else {
            await agregarAlCarrito({
                idProducto: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }

        boton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg> Agregado`;
        boton.classList.remove('btn-primary');
        boton.classList.add('btn-success');

        await actualizarBadgeCarrito();

        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.classList.remove('btn-success');
            boton.classList.add('btn-primary');
            boton.disabled = false;
        }, 1500);

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('No se pudo agregar el producto al carrito.');
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

contenedorCatalogo.addEventListener('click', function (event) {
    const boton = event.target.closest('.add-to-cart-btn');
    if (!boton) return;

    const idProducto = boton.dataset.id;
    const producto = productosCatalogo.find(function (item) {
        return item.id === idProducto;
    });

    if (!producto) return;
    agregarProductoSeleccionado(producto, boton);
});

async function inicializarCatalogo() {
    try {
        const listaProductos = await obtenerProductos();
        productosCatalogo = listaProductos;

        contadorTotalProductos.textContent = `${listaProductos.length} productos encontrados`;

        renderizarCatalogo(listaProductos);

        cargador.classList.add('d-none');
        contenedorCatalogo.classList.remove('d-none');
        
        await actualizarBadgeCarrito();
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

async function actualizarBadgeCarrito() {
    try {
        const carrito = await obtenerCarrito();
        const totalItems = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
        const badge = document.getElementById('badge-carrito');
        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }
    } catch (error) {
        console.error('Error al actualizar badge:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarCatalogo);
