import { URL_BASE_CARRITO_Y_PEDIDOS, URL_BASE_ADICIONAL, URL_BASE_CUPONES_Y_RECLAMOS, URL_BASE_REENVIOS } from './config.js';

export async function obtenerPedidos() {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/pedidos`);
        if (!response.ok) throw new Error('Error al obtener los pedidos');
        return await response.json();
    } catch (error) {
        console.error('API Error (Pedidos):', error);
        throw error;
    }
}

export async function crearPedido(datosPedido) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });
        if (!response.ok) throw new Error('Error al crear el pedido');
        return await response.json();
    } catch (error) {
        console.error('API Error (Crear Pedido):', error);
        throw error;
    }
}

export async function obtenerCupones() {
    try {
        const response = await fetch(`${URL_BASE_CUPONES_Y_RECLAMOS}/cupones`);
        if (!response.ok) throw new Error('Error al obtener los cupones');
        return await response.json();
    } catch (error) {
        console.warn('API Warning (Cupones no configurados):', error);
        return [
            { id: "1", codigo: "DESCUENTO10", valor: 10, tipo: "porcentaje", usado: false },
            { id: "2", codigo: "EFECTIVO500", valor: 500, tipo: "fijo", usado: false }
        ];
    }
}

export async function crearReclamo(datosReclamo) {
    try {
        const response = await fetch(`${URL_BASE_CUPONES_Y_RECLAMOS}/reclamos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReclamo)
        });
        if (!response.ok) throw new Error('Error al registrar el reclamo');
        return await response.json();
    } catch (error) {
        console.error('API Error (Reclamos):', error);
        throw error;
    }
}

export async function obtenerPedidoPorId(idPedido) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/pedidos/${idPedido}`);
        if (!response.ok) throw new Error(`Error al obtener el pedido con ID ${idPedido}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error (Pedido ${idPedido}):`, error);
        throw error;
    }
}

export async function obtenerReclamos() {
    try {
        const response = await fetch(`${URL_BASE_CUPONES_Y_RECLAMOS}/reclamos`);
        if (!response.ok) throw new Error('Error al obtener los reclamos');
        return await response.json();
    } catch (error) {
        console.error('API Error (Reclamos GET):', error);
        return [];
    }
}

export async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    try {
        const response = await fetch(`${URL_BASE_CARRITO_Y_PEDIDOS}/pedidos/${idPedido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!response.ok) throw new Error('Error al actualizar el estado del pedido');
        return await response.json();
    } catch (error) {
        console.error('API Error (Actualizar Pedido):', error);
        throw error;
    }
}

export async function crearReenvio(datosReenvio) {
    try {
        const response = await fetch(`${URL_BASE_REENVIOS}/reenvios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReenvio)
        });
        if (!response.ok) throw new Error('Error al registrar el reenvío');
        return await response.json();
    } catch (error) {
        console.error('API Error (Reenvíos):', error);
        throw error;
    }
}
