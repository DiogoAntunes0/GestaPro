package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository <Cliente, Long> {

    boolean existsClienteByEmail(String email);

    boolean existsClienteByCpf(String cpf);

    Cliente deleteClienteById(Long id);

    Page<Cliente> findAllByOrderByNomeAsc(Pageable pageable);

    boolean existsByCnpj(String cnpj);
}
