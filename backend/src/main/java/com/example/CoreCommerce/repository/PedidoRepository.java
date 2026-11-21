package com.example.CoreCommerce.repository;


import com.example.CoreCommerce.entity.Pedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface PedidoRepository extends JpaRepository <Pedido, Long> {
    Page<Pedido> findAllByOrderByDataPedidoDesc(Pageable pageable);

    @Query(value = """
    SELECT p FROM Pedido p
    JOIN p.cliente c
    WHERE (:cnpj IS NULL AND :nome IS NULL AND :cpf IS NULL)
       OR (:cnpj IS NOT NULL AND LOWER(c.cnpj) LIKE LOWER(CONCAT('%', CAST(:cnpj AS string), '%')))
       OR (:nome IS NOT NULL AND LOWER(c.nome) LIKE LOWER(CONCAT('%', CAST(:nome AS string), '%')))
       OR (:cpf IS NOT NULL AND LOWER(c.cpf) LIKE LOWER(CONCAT('%', CAST(:cpf AS string), '%')))
""")
    Page<Pedido> buscarPedidos(@Param("nome") String nome,
                               @Param("cnpj") String cnpj,
                               @Param("cpf") String cpf,
                               Pageable pageable);
}
