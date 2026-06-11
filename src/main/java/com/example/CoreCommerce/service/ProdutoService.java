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

    public ProdutoDTO cadastrarProdutos(ProdutoDTO produtoDTO){
        Produto produto = new Produto();

        produto.setSku(produtoDTO.sku());
        produto.setNomeProduto(produtoDTO.nome());
        produto.setCategoria(produtoDTO.categoria());
        produto.setMarca(produtoDTO.marca());
        produto.setPrecoProduto(produtoDTO.preco());
        produto.setQuantidadeEstoque(produtoDTO.quantidadeEstoque());;

        Produto produtoSalvo = produtoRepository.save(produto);

        return new ProdutoDTO(produtoSalvo.getSku(),
                produtoSalvo.getNomeProduto(),
                produtoSalvo.getCategoria(),
                produtoSalvo.getMarca(),
                produtoSalvo.getPrecoProduto(),
                produtoSalvo.getQuantidadeEstoque());
    }
}
