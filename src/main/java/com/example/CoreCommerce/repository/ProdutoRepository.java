package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.dto.ProdutoDTO;
import com.example.CoreCommerce.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository <Produto, Long> {
    Produto deleteProdutosById(Long id);
}
