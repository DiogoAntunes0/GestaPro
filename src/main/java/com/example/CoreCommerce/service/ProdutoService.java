package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ProdutoDTO;
import com.example.CoreCommerce.entity.Produto;
import com.example.CoreCommerce.repository.ProdutoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.PropertyResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private PropertyResolver propertyResolver;

    public Page<ProdutoDTO> listarTodos(Pageable pageable){

        Page<Produto> paginaDeEntidades = produtoRepository.findAllByOrderByNomeAsc(pageable);

        return paginaDeEntidades.map(p -> new ProdutoDTO(
                        p.getId(),
                        p.getSku(),
                        p.getNomeProduto(),
                        p.getCategoria(),
                        p.getMarca(),
                        p.getPrecoProduto(),
                        p.getQuantidadeEstoque()
                ));
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

        return new ProdutoDTO(
                produtoSalvo.getId(),
                produtoSalvo.getSku(),
                produtoSalvo.getNomeProduto(),
                produtoSalvo.getCategoria(),
                produtoSalvo.getMarca(),
                produtoSalvo.getPrecoProduto(),
                produtoSalvo.getQuantidadeEstoque());
    }

    @Transactional
    public Produto deletarProduto(Long id){
        if(!produtoRepository.existsById(id)){
            System.out.println("Produto não encontrado, tente novamente!");
        }
        return produtoRepository.deleteProdutosById(id);
    }

    @Transactional
    public ProdutoDTO editarProduto(Long id, ProdutoDTO produtoDTO) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

                produto.setNomeProduto(produtoDTO.nome());
                produto.setSku(produtoDTO.sku());
                produto.setPrecoProduto(produtoDTO.preco());
                produto.setMarca(produtoDTO.marca());
                produto.setQuantidadeEstoque(produtoDTO.quantidadeEstoque());
                produto.setCategoria(produtoDTO.categoria());

        return new ProdutoDTO(
                produto.getId(),
                produto.getSku(),
                produto.getNomeProduto(),
                produto.getCategoria(),
                produto.getMarca(),
                produto.getPrecoProduto(),
                produto.getQuantidadeEstoque());

    }
}

