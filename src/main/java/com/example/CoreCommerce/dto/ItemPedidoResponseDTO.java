package com.example.CoreCommerce.dto;

public record ItemPedidoResponseDTO(
        String nomeProduto,
        Integer quantidade,
        Double precoVenda
){}