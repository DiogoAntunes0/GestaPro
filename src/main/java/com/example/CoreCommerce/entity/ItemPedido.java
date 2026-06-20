package com.example.CoreCommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "ItemPedido")
public class ItemPedido {
    @Id
    private Long id;

    @ManyToOne
    @JoinColumn
    private Pedido pedido;

    @ManyToOne
    @JoinColumn
    private Produto produto;

    @NotNull
    @Positive
    private Integer quantidade;

    @NotNull
    @Positive
    private Double precoVenda;

    public ItemPedido(){}

    public ItemPedido(Long id, Pedido pedido, Double precoVenda, Produto produto, Integer quantidade) {
        this.id = id;
        this.pedido = pedido;
        this.precoVenda = precoVenda;
        this.produto = produto;
        this.quantidade = quantidade;
    }

    public Long getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public Double getPrecoVenda() {
        return precoVenda;
    }

    public Produto getProduto() {
        return produto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }
}
