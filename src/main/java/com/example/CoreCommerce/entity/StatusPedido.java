package com.example.CoreCommerce.entity;

public enum StatusPedido {
    AGUARDANDO("AGUARDANDO"),
    PAGOS("PAGOS"),
    CANCELADO("CANCELADO");

    private String statusPedido;

    StatusPedido(String statusPedido){
    this.statusPedido = statusPedido;
    }

    public static StatusPedido fromString(String text) {
        for (StatusPedido statusPedido: StatusPedido.values()) {
            if (statusPedido.statusPedido.equalsIgnoreCase(text)) {
                return statusPedido;
            }
        }
        throw new IllegalArgumentException("Status não suportado! " + text);
    }
}
