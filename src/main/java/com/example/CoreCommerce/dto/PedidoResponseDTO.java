package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.Cliente;
import com.example.CoreCommerce.entity.Pedido;
import com.example.CoreCommerce.entity.StatusPedido;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(
        Long id,
        String nomeCliente,
        LocalDateTime dataPedido,
        List<ItemPedidoResponseDTO> itens,
        Double valorTotal,
        StatusPedido status) {

    public PedidoResponseDTO(Pedido pedido) {
        this(
                pedido.getId(),
                pedido.getCliente().getNome(),
                pedido.getDataPedido(),
                pedido.getItens().stream().map(ItemPedidoResponseDTO::new).toList(), // Converte a lista de itens da entidade para DTO
                pedido.getValorTotal(),
                pedido.getStatus()
        );
    }
}
