import { URL_BASE_CATALOGO_Y_USUARIOS } from './config.js';

export async function obtenerProductos() {
    try {
        const response = await fetch(`${URL_BASE_CATALOGO_Y_USUARIOS}/Productos`);
        if (!response.ok) throw new Error('Error al obtener los productos');
        return await response.json();
    } catch (error) {
        console.error('API Error (Productos):', error);
        throw error;
    }
}

export async function obtenerProductoPorId(idProducto) {
    try {
        const response = await fetch(`${URL_BASE_CATALOGO_Y_USUARIOS}/Productos/${idProducto}`);
        if (!response.ok) throw new Error(`Error al obtener el producto con ID ${idProducto}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error (Producto ${idProducto}):`, error);
        throw error;
    }
}

export async function actualizarStockProducto(idProducto, nuevoStock) {
    try {
        const response = await fetch(`${URL_BASE_CATALOGO_Y_USUARIOS}/Productos/${idProducto}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: nuevoStock })
        });
        if (!response.ok) throw new Error('Error al actualizar el stock del producto');
        return await response.json();
    } catch (error) {
        console.error('API Error (Actualizar Stock):', error);
        throw error;
    }
}
