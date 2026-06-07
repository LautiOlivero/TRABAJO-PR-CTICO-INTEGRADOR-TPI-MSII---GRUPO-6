import { URL_BASE_CARRITO_Y_PEDIDOS, URL_BASE_ADICIONAL } from './config.js';

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
        const response = await fetch(`${URL_BASE_ADICIONAL}/cupones`);
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
        const response = await fetch(`${URL_BASE_ADICIONAL}/reclamos`, {
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

export async function crearReenvio(datosReenvio) {
    try {
        const response = await fetch(`${URL_BASE_ADICIONAL}/reenvios`, {
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
