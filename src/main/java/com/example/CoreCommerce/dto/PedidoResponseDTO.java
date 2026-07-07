package com.example.CoreCommerce.dto;

import com.example.CoreCommerce.entity.StatusPedido;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(
        Long id,
        String nomeCliente,
        LocalDateTime dataPedido,
        List<ItemPedidoResponseDTO> itens,
        Double valorTotal,
        String status
) {
}
