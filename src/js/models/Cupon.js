export class Cupon {
    id;
    codigo;
    valor;
    tipo;
    usado;

    constructor(id = null, codigo = "", valor = 0, tipo = "porcentaje", usado = false) {
        this.id = id;
        this.codigo = codigo;
        this.valor = valor;
        this.tipo = tipo;
        this.usado = usado;
    }

    calcularDescuento(montoBase) {
        if (this.usado) return 0;
        if (this.tipo === "porcentaje") {
            return (montoBase * this.valor) / 100;
        } else if (this.tipo === "fijo") {
            return this.valor > montoBase ? montoBase : this.valor;
        }
        return 0;
    }
}
