package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ItemPedidoDTO;
import com.example.CoreCommerce.dto.ItemPedidoResponseDTO;
import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.dto.PedidoResponseDTO;
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

    public List<ItemPedidoResponseDTO> listarItemPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        return pedido.getItens().stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getProduto().getNome(),
                        item.getQuantidade(),
                        item.getPrecoVenda()
                ))
                .toList();
    }

    public List<PedidoResponseDTO> listarTodosPedidos() {
        return pedidoRepository.findAll().stream()
                .map(this::toPedidoResponseDTO)
                .toList();
    }

    private PedidoResponseDTO toPedidoResponseDTO(Pedido pedido) {
        List<ItemPedidoResponseDTO> itensDTO = pedido.getItens().stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getProduto().getNome(),
                        item.getQuantidade(),
                        item.getPrecoVenda()
                ))
                .toList();

        Double valorTotal = itensDTO.stream()
                .map(i -> i.precoVenda() * i.quantidade())
                .reduce(0.0, Double::sum);

        return new PedidoResponseDTO(
                pedido.getId(),
                pedido.getCliente().getNome(),
                pedido.getDataPedido(),
                itensDTO,
                valorTotal,
                pedido.getStatusPedido().name() // ou getStatus() se já for String
        );
    }
}
