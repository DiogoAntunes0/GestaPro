package com.example.CoreCommerce.dto;

public record BuscaCepDTO(String cep, String localidade, String logradouro, String bairro, String complemento, String estado, String uf, String regiao) {
}
