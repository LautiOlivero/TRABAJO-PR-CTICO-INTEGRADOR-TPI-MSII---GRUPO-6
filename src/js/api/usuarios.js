import { URL_BASE_CATALOGO_Y_USUARIOS } from './config.js';

export async function obtenerUsuarios() {
    try {
        const response = await fetch(`${URL_BASE_CATALOGO_Y_USUARIOS}/users`);
        if (!response.ok) throw new Error('Error al obtener los usuarios');
        return await response.json();
    } catch (error) {
        console.error('API Error (Usuarios):', error);
        throw error;
    }
}

export async function registrarUsuario(datosUsuario) {
    try {
        const response = await fetch(`${URL_BASE_CATALOGO_Y_USUARIOS}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        if (!response.ok) throw new Error('Error al registrar el usuario');
        return await response.json();
    } catch (error) {
        console.error('API Error (Registrar Usuario):', error);
        throw error;
    }
}
