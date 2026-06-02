import { URL_BASE_CARRITO_Y_PEDIDOS } from './config.js';

export async function obtenerCarrito() {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/carrito`);
        if (!response.ok) throw new Error('Error al obtener el carrito');
        return await response.json();
    } catch (error) {
        console.error('API Error (Carrito):', error);
        throw error;
    }
}

export async function agregarAlCarrito(elementoCarrito) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(elementoCarrito)
        });
        if (!response.ok) throw new Error('Error al agregar producto al carrito');
        return await response.json();
    } catch (error) {
        console.error('API Error (Agregar al Carrito):', error);
        throw error;
    }
}

export async function actualizarCantidadCarrito(idElemento, nuevaCantidad) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/carrito/${idElemento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        if (!response.ok) throw new Error('Error al actualizar la cantidad en el carrito');
        return await response.json();
    } catch (error) {
        console.error('API Error (Actualizar Carrito):', error);
        throw error;
    }
}

export async function eliminarDelCarrito(idElemento) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/carrito/${idElemento}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el producto del carrito');
        return await response.json();
    } catch (error) {
        console.error('API Error (Eliminar del Carrito):', error);
        throw error;
    }
}

export async function vaciarCarrito() {
    try {
        const elementos = await obtenerCarrito();
        const promesasDeEliminacion = elementos.map(function(elemento) {
            return eliminarDelCarrito(elemento.id);
        });
        await Promise.all(promesasDeEliminacion);
        return { exito: true, mensaje: 'Carrito vaciado' };
    } catch (error) {
        console.error('API Error (Vaciar Carrito):', error);
        throw error;
    }
}
