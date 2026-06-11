package com.example.CoreCommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

@Entity
@Table(name = "Produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SKU", unique = true)
    private String sku;

    @NotBlank
    @Column(name = "Nome")
    private String nome;

    @Column(name = "Categoria")
    private String categoria;

    @NotNull
    @Column(name = "Marca")
    private String marca;

    @NotNull
    @Positive
    @Column(name = "Preco")
    private BigDecimal preco;

    @NotNull
    @PositiveOrZero
    @Column(name = "quantidadeEstoque")
    private Integer quantidadeEstoque;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeProduto() {
        return nome;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nome = nomeProduto;
    }

    public BigDecimal getPrecoProduto() {
        return preco;
    }

    public void setPrecoProduto(BigDecimal precoProduto) {
        this.preco = precoProduto;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}
