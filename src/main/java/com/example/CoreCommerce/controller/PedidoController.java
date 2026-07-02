package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.entity.Pedido;
import com.example.CoreCommerce.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api")
public class PedidoController {

    @Autowired
    PedidoService pedidoService;

    @PostMapping("/pedidos")
    public Pedido cadastrarPedido(@RequestBody PedidoDTO pedidoDTO){
        return pedidoService.cadastrarPedido(pedidoDTO);
    }
}
