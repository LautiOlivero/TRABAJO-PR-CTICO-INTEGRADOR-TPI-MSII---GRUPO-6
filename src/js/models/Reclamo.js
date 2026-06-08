export class Reclamo {
    id;
    pedidoId;
    descripcion;
    estado;
    fechaCreacion;

    constructor(id = null, pedidoId = "", descripcion = "", estado = "Abierto", fechaCreacion = new Date().toISOString()) {

        this.id = id;
        this.pedidoId = pedidoId;
        this.descripcion = descripcion;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
    }
}
