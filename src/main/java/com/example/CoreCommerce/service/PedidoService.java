package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.*;
import com.example.CoreCommerce.entity.*;
import com.example.CoreCommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private EmailService emailService;


    @Transactional
    public Pedido cadastrarPedido(PedidoDTO dto) {

        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setStatusPedido(StatusPedido.AGUARDANDO);

        List<ItemPedido> itensPedido = new ArrayList<>();
        double valorTotal = 0.0;

        for (ItemPedidoDTO itemPedidoDTO : dto.itens()) {
            Produto produto = produtoRepository.findById(itemPedidoDTO.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - itemPedidoDTO.quantidade());
            produtoRepository.save(produto);

            Double precoVenda = produto.getPreco();

            ItemPedido item = new ItemPedido(pedido, precoVenda, produto, itemPedidoDTO.quantidade());

            valorTotal += precoVenda * itemPedidoDTO.quantidade();
            itensPedido.add(item);
        }

        pedido.setValorTotal(valorTotal);
        pedido.setItens(itensPedido);
        pedidoRepository.save(pedido);

        List<ItemPedidoResponseDTO> detalhesPedido = itensPedido.stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getProduto().getNome(),
                        item.getQuantidade(),
                        item.getPrecoVenda()
                ))
                .toList();

        final String ASSUNTO = "Pedido Confirmado! 🛒 Resumo da sua compra #" + pedido.getId();

        final String CONTEUDO = "Olá, <b>" + cliente.getNome() + "</b>!<br><br>"
                + "Obrigado por comprar conosco. É um prazer ter você como cliente! "
                + "Recebemos o seu pedido <b>#" + pedido.getId() + "</b> com sucesso e ele já está "
                + "registrado em nosso sistema.<br><br>"
                + "Confira abaixo o resumo dos itens que você escolheu:";

        emailService.enviarEmail(cliente.getEmail(), ASSUNTO, CONTEUDO, detalhesPedido, pedido.getValorTotal());
        return pedido;
    }

    public List<ItemPedidoResponseDTO> listarItemPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        return pedido.getItens().stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getProduto().getNome(),
                        item.getQuantidade(),
                        item.getPrecoVenda()
                ))
                .toList();
    }

    public Page<PedidoResponseDTO> listarTodosPedidos(Pageable pageable) {
        
        Page<Pedido> paginaEncontradas = pedidoRepository.findAllByOrderByDataPedidoDesc(pageable);
        return paginaEncontradas.map(this::toPedidoResponseDTO);
    }

    private PedidoResponseDTO toPedidoResponseDTO(Pedido pedido) {
        List<ItemPedidoResponseDTO> itensDTO = pedido.getItens().stream()
                .map(item -> new ItemPedidoResponseDTO(
                        item.getProduto().getNome(),
                        item.getQuantidade(),
                        item.getPrecoVenda()
                ))
                .toList();

        Double valorTotal = itensDTO.stream()
                .map(i -> i.precoVenda() * i.quantidade())
                .reduce(0.0, Double::sum);

        return new PedidoResponseDTO(
                pedido.getId(),
                pedido.getCliente().getNome(),
                pedido.getDataPedido(),
                itensDTO,
                valorTotal,
                pedido.getStatusPedido()
        );
    }

   public StatusPedidoDTO atualizarStatusPedido(Long id, StatusPedidoDTO statusPedidoDTO){
       Pedido pedido = pedidoRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        pedido.setStatusPedido(statusPedidoDTO.statusPedido());
        pedidoRepository.save(pedido);

       return new StatusPedidoDTO(
               pedido.getId(),
               pedido.getStatusPedido()
       );
    }
}