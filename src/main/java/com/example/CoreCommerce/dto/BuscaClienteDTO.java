package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Cliente;

public record BuscaClienteDTO(Long id, String cnpj, String nome, String email, String cpf) {

    public BuscaClienteDTO(Cliente cliente) {
        this(cliente.getId(), cliente.getCnpj(),cliente.getNome(), cliente.getEmail(), cliente.getCpf());
    }
}