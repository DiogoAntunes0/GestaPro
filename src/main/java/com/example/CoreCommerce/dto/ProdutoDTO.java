package com.example.CoreCommerce.dto;

import java.math.BigDecimal;

public record ProdutoDTO(String sku, String nome, String categoria, String marca, BigDecimal preco, Integer quantidadeEstoque) {
}
