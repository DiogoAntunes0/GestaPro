package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Endereco;
import com.example.CoreCommerce.entity.TipoPessoa;

public record ClienteDTO(Long id, String nome, String email, TipoPessoa tipoPessoa, String cpf, String cnpj, Endereco endereco) {
}
