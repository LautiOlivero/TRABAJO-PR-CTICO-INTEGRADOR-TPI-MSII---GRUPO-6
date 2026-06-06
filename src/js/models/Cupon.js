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
}
