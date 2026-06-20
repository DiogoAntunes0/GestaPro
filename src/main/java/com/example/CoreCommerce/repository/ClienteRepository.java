package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository <Cliente, Long> {

    boolean existsClienteByEmail(String email);

    boolean existsClienteByCpf(String cpf);

    Cliente deleteClienteById(Long id);
}
