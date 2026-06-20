package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Cliente;

public record ClienteDTOEmail(Long id, String email) {

    ClienteDTOEmail(Cliente cliente){
        this(cliente.getId(), cliente.getEmail());
    }
}
