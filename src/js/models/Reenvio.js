export class SolicitudReenvio {
    id;
    reclamoId;
    pedidoId;
    itemsReenviar;
    estado;
    fechaCreacion;

    constructor(id = null, reclamoId = "", pedidoId = "", itemsReenviar = [], estado = "Pendiente_Analisis", fechaCreacion = new Date().toISOString()) {

        this.id = id;
        this.reclamoId = reclamoId;
        this.pedidoId = pedidoId;
        this.itemsReenviar = itemsReenviar;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
    }
}
