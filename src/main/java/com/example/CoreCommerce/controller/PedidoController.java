package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.ItemPedidoResponseDTO;
import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.dto.PedidoResponseDTO;
import com.example.CoreCommerce.entity.Pedido;
import com.example.CoreCommerce.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api")
public class PedidoController {

    @Autowired
    PedidoService pedidoService;

    @PostMapping("/pedidos")
    public Pedido cadastrarPedido(@RequestBody PedidoDTO pedidoDTO){
        return pedidoService.cadastrarPedido(pedidoDTO);
    }

    @GetMapping("/pedidos/{id}/itens")
    public List<ItemPedidoResponseDTO> listarPedidos(@PathVariable Long id) {
        return pedidoService.listarItemPedido(id);
    }

    @GetMapping("pedidos/listar")
    public List<PedidoResponseDTO> listarPedidos() {
        return pedidoService.listarTodosPedidos();
    }
}
