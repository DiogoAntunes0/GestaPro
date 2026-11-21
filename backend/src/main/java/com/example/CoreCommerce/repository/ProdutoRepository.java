package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProdutoRepository extends JpaRepository <Produto, Long> {
    Produto deleteProdutosById(Long id);
    Page<Produto> findAllByOrderByNomeAsc(Pageable pageable);

    @Query("""
    SELECT p FROM Produto p
    WHERE (:nome IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%')))
       OR (:sku IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :sku, '%')))
    """)
    Page<Produto> buscarPorNomeOuSku(@Param("nome") String nome, @Param("sku") String sku, Pageable pageable);

}
