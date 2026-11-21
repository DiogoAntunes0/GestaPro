package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ClienteRepository extends JpaRepository <Cliente, Long> {

    boolean existsClienteByEmail(String email);

    boolean existsClienteByCpf(String cpf);

    Cliente deleteClienteById(Long id);

    Page<Cliente> findAllByOrderByNomeAsc(Pageable pageable);

    boolean existsByCnpj(String cnpj);

    @Query(value = """
SELECT c FROM Cliente c
WHERE (:cnpj IS NULL AND :nome IS NULL AND :cpf IS NULL)
   OR (:cnpj IS NOT NULL AND LOWER(c.cnpj) LIKE LOWER(CONCAT('%', CAST(:cnpj AS string), '%')))
   OR (:nome IS NOT NULL AND LOWER(c.nome) LIKE LOWER(CONCAT('%', CAST(:nome AS string), '%')))
   OR (:cpf IS NOT NULL AND LOWER(c.cpf) LIKE LOWER(CONCAT('%', CAST(:cpf AS string), '%')))
""")
    Page<Cliente> buscarClientes(@Param("cnpj") String cnpj,
                         @Param("nome") String nome,
                         @Param("cpf") String cpf,
                         Pageable pageable);
}
