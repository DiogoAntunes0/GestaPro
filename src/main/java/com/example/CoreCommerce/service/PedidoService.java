package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ItemPedidoDTO;
import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.entity.*;
import com.example.CoreCommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private ProdutoRepository produtoRepository;


    @Transactional
    public Pedido cadastrarPedido(PedidoDTO dto) {

        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setStatusPedido(StatusPedido.AGUARDANDO);

        List<ItemPedido> itensPedido = new ArrayList<>();
        double valorTotal = 0.0;

        // 3. Processa os itens do DTO
        for (ItemPedidoDTO itemPedidoDTO : dto.itens()) {
            Produto produto = produtoRepository.findById(itemPedidoDTO.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            Double precoVenda = produto.getPreco();

            ItemPedido item = new ItemPedido(pedido, precoVenda, produto, itemPedidoDTO.quantidade());

            itensPedido.add(item);
            valorTotal += precoVenda * itemPedidoDTO.quantidade();
        }

        pedido.setItens(itensPedido);
        pedido.setValorTotal(valorTotal);

        return pedidoRepository.save(pedido);
    }
}
