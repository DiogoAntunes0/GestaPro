package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Produto;

public record BuscaProdutoDTO(Long id, String nome, String sku, Double preco, String marca, Integer quantidadeEstoque) {
    public BuscaProdutoDTO(Produto produto){
        this(produto.getId(), produto.getNome(), produto.getSku(), produto.getPreco(), produto.getMarca(), produto.getQuantidadeEstoque());
    }
}
