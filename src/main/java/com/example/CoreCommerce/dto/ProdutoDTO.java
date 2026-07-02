package com.example.CoreCommerce.dto;

import java.math.BigDecimal;

public record ProdutoDTO(Long id, String sku, String nome, String categoria, String marca, Double preco, Integer quantidadeEstoque) {
}
