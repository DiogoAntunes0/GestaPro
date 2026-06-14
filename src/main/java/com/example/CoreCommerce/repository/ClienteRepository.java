package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository <Cliente, Long> {

    boolean existsClienteByEmail(String email);

    boolean existsClienteByCpf(String cpf);
}
