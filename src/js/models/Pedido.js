export class Pedido {
    id;
    usuarioId;
    items;
    cuponAplicado;
    estado;
    fechaCreacion;
    fechaEntrega;
    montoSubtotal;
    montoDescuento;
    montoTotal;

    constructor(id = null, usuarioId = "", items = [], cuponAplicado = null, estado = "pendiente", fechaCreacion = new Date().toISOString(), fechaEntrega = null) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.items = items;
        this.cuponAplicado = cuponAplicado;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.fechaEntrega = fechaEntrega;

        // El cálculo de totales se implementará en la US-01
        this.montoSubtotal = 0;
        this.montoDescuento = 0;
        this.montoTotal = 0;
    }
}
