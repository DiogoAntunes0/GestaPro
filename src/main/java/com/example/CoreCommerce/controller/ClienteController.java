package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.ClienteDTO;
import com.example.CoreCommerce.dto.ClienteDTOEmail;
import com.example.CoreCommerce.entity.Cliente;
import com.example.CoreCommerce.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ClienteController {

    @Autowired
    ClienteService clienteService;

    @GetMapping("/clientes/listar")
        public List<ClienteDTO> listarClientes(){
            return clienteService.listarClientes();
        }

    @PostMapping("/clientes/cadastrar")
    public ClienteDTO cadastrarCliente(@Valid @RequestBody ClienteDTO clienteDTO){
        return clienteService.cadastrarCliente(clienteDTO);
    }

    @DeleteMapping("/clientes/{id}")
    public Cliente deletarCliente(@PathVariable Long id){
       return clienteService.deletarCliente(id);
    }

    @PatchMapping("/clientes/editar/email/{id}")
    public ClienteDTOEmail editarEmailCliente(@RequestBody ClienteDTOEmail clienteDTOEmail, @PathVariable Long id){
        return clienteService.editarCliente(clienteDTOEmail, id);
    }
}
