package com.example.CoreCommerce.dto;

import java.util.List;

public record PedidoDTO(Long clienteId, List<ItemPedidoDTO> itens) {

}
