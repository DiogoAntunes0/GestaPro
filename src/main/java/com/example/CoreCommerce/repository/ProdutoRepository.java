package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository <Produto, Long> {
    Produto deleteProdutosById(Long id);
    Page<Produto> findAllByOrderByNomeAsc(Pageable pageable);

}
