package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.ProdutoDTO;
import com.example.CoreCommerce.model.Produto;
import com.example.CoreCommerce.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.support.SessionStatus;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProdutoController {

    @Autowired
    ProdutoService produtoService;

    @GetMapping("/produtos/listar")
    public List<ProdutoDTO> listarProdutos(){
        return produtoService.listarTodos();
    }

    @PostMapping("/produtos/cadastrar")
    public ProdutoDTO cadastrarProduto(@RequestBody ProdutoDTO produtoDTO){
        return produtoService.cadastrarProdutos(produtoDTO);
    }

    @DeleteMapping("/produtos/{id}")
    public Produto deletarProduto(@PathVariable Long id) {
        return produtoService.deletarProduto(id);
    }
}
