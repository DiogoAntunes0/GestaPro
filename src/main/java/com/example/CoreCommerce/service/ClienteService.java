package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ClienteDTO;
import com.example.CoreCommerce.dto.ClienteDTOEmail;
import com.example.CoreCommerce.dto.ClienteListarDTO;
import com.example.CoreCommerce.entity.TipoPessoa;
import com.example.CoreCommerce.exception.CpfClienteExistente;
import com.example.CoreCommerce.exception.EmailClienteExistente;
import com.example.CoreCommerce.entity.Cliente;
import com.example.CoreCommerce.repository.ClienteRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public ClienteDTO cadastrarCliente(ClienteDTO clienteDTO) {
        if (clienteRepository.existsClienteByEmail(clienteDTO.email())) {
            throw new EmailClienteExistente();
        }

        Cliente cliente = new Cliente();
        cliente.setNome(clienteDTO.nome());
        cliente.setEmail(clienteDTO.email());
        cliente.setTipoPessoa(clienteDTO.tipoPessoa());

        if (clienteDTO.tipoPessoa() == TipoPessoa.PESSOA_FISICA) {
            if (clienteDTO.cpf() == null || clienteDTO.cpf().isBlank()) {
                throw new RuntimeException("CPF é obrigatório para Pessoa Física");
            }
            if (clienteRepository.existsClienteByCpf(clienteDTO.cpf())) {
                throw new CpfClienteExistente();
            }

            cliente.setCpf(clienteDTO.cpf());

        } else if (clienteDTO.tipoPessoa() == TipoPessoa.PESSOA_JURIDICA) {
            if (clienteDTO.cnpj() == null || clienteDTO.cnpj().isBlank()) {
                throw new RuntimeException("CNPJ é obrigatório para Pessoa Jurídica");
            }
            if (clienteRepository.existsByCnpj(clienteDTO.cnpj())) {
                throw new RuntimeException("CNPJ já existente!");
            }

            cliente.setCnpj(clienteDTO.cnpj());
            cliente.setEndereco(clienteDTO.endereco());
        }

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return new ClienteDTO(
                clienteSalvo.getId(),
                clienteSalvo.getNome(),
                clienteSalvo.getEmail(),
                clienteSalvo.getTipoPessoa(),
                clienteSalvo.getCpf(),
                clienteSalvo.getCnpj(),
                clienteSalvo.getEndereco()
        );
    }

    public Page<ClienteListarDTO> listarClientes(Pageable pageable){

        var paginasEncontradas = clienteRepository.findAllByOrderByNomeAsc(pageable);

        return paginasEncontradas.map(c -> new ClienteListarDTO(
                        c.getId(),
                        c.getNome(),
                        c.getEmail(),
                        c.getCpf(),
                        c.getCnpj(),
                        c.getEndereco()
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
