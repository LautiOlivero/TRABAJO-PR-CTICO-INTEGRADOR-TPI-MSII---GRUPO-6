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

        // El cálculo de totales se hace dinámicamente
        this.montoSubtotal = this.calcularSubtotal();
        this.montoDescuento = this.calcularMontoDescuento();
        this.montoTotal = this.montoSubtotal - this.montoDescuento;
    }

    calcularSubtotal() {
        return this.items.reduce((total, item) => total + ((item.precio || 0) * (item.cantidad || 1)), 0);
    }

    calcularMontoDescuento() {
        if (this.cuponAplicado && typeof this.cuponAplicado.calcularDescuento === 'function') {
            return this.cuponAplicado.calcularDescuento(this.montoSubtotal);
        }
        return 0;
    }
}
