package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ClienteDTO;
import com.example.CoreCommerce.dto.ClienteDTOEmail;
import com.example.CoreCommerce.exception.CpfClienteExistente;
import com.example.CoreCommerce.exception.EmailClienteExistente;
import com.example.CoreCommerce.entity.Cliente;
import com.example.CoreCommerce.repository.ClienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public Page<ClienteDTO> listarClientes(Pageable pageable){

        var paginasEncontradas = clienteRepository.findAllByOrderByNomeAsc(pageable);

        return paginasEncontradas.map(c -> new ClienteDTO(
                        c.getId(),
                        c.getNome(),
                        c.getEmail(),
                        c.getCpf()
                ));

    }

    @Transactional
    public Cliente deletarCliente(Long id){
       return clienteRepository.deleteClienteById(id);
    }

    @Transactional
    public ClienteDTOEmail editarCliente(ClienteDTOEmail clienteDTOEmail, Long id){
         Cliente cliente = clienteRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

         cliente.setEmail(clienteDTOEmail.email());

         return new ClienteDTOEmail(cliente.getId(), cliente.getEmail());
    }
}
