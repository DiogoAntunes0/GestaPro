package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Produto;

public record BuscaProdutoDTO(Long id, String nome, String sku) {
    public BuscaProdutoDTO(Produto produto){
        this(produto.getId(), produto.getNome(), produto.getSku());
    }
}
