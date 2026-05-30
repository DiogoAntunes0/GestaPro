package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ProdutoDTO;
import com.example.CoreCommerce.model.Produto;
import com.example.CoreCommerce.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<ProdutoDTO> listarTodos(){
        List<Produto> produtos = produtoRepository.findAll();

        return produtos.stream()
                .map(p -> new ProdutoDTO(
                        p.getSku(),
                        p.getNomeProduto(),
                        p.getCategoria(),
                        p.getMarca(),
                        p.getPrecoProduto(),
                        p.getQuantidadeEstoque()
                ))
                .toList();
    }
}
