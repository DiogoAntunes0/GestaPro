package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.ClienteDTO;
import com.example.CoreCommerce.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ClienteController {

    @Autowired
    ClienteService clienteService;

    @GetMapping("/clientes/listar")
        public List<ClienteDTO> listarClientes(ClienteDTO clienteDTO){
            return clienteService.listarClientes(clienteDTO);
        }

    @PostMapping("/clientes/cadastrar")
    public ClienteDTO cadastrarCliente(@RequestBody ClienteDTO clienteDTO){
        return clienteService.cadastrarCliente(clienteDTO);
    }
}
