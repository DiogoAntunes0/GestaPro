package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ClienteDTO;
import com.example.CoreCommerce.dto.ProdutoDTO;
import com.example.CoreCommerce.exception.CpfClienteExistente;
import com.example.CoreCommerce.exception.EmailClienteExistente;
import com.example.CoreCommerce.model.Cliente;
import com.example.CoreCommerce.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public ClienteDTO cadastrarCliente(ClienteDTO clienteDTO){
        Cliente cliente = new Cliente();

        if(clienteRepository.existsClienteByEmail(clienteDTO.email())){
            throw new EmailClienteExistente();
        }

        if(clienteRepository.existsClienteByCpf(clienteDTO.cpf())){
            throw new CpfClienteExistente();
        }

        cliente.setNome(clienteDTO.nome());
        cliente.setEmail(clienteDTO.email());
        cliente.setCpf(clienteDTO.cpf());

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return new ClienteDTO(clienteSalvo.getId(),
                clienteSalvo.getNome(),
                clienteSalvo.getEmail(),
                clienteSalvo.getCpf());
    }

    public List<ClienteDTO> listarClientes(ClienteDTO clienteDTO){
        List<Cliente> clientes = clienteRepository.findAll();

        return clientes.stream()
                .map(c -> new ClienteDTO(
                        c.getId(),
                        c.getNome(),
                        c.getEmail(),
                        c.getCpf()
                ))
                .toList();
    }
}
