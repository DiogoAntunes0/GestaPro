package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Endereco;

public record ClienteListarDTO(Long id, String nome, String email, String cpf, String cnpj, Endereco endereco) {
}
