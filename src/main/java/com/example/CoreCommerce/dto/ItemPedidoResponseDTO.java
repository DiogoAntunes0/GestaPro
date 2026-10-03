package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.ItemPedido;

public record ItemPedidoResponseDTO(
        String nomeProduto,
        Integer quantidade,
        Double precoVenda
) {

    public ItemPedidoResponseDTO(ItemPedido item) {
        this(
                item.getProduto().getNome(),
                item.getQuantidade(),
                item.getPrecoVenda()
        );
    }
}