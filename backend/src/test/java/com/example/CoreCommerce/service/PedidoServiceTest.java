package com.example.CoreCommerce.service;

import com.example.CoreCommerce.dto.ItemPedidoDTO;
import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.entity.Cliente;
import com.example.CoreCommerce.entity.Pedido;
import com.example.CoreCommerce.entity.Produto;
import com.example.CoreCommerce.entity.StatusPedido;
import com.example.CoreCommerce.repository.ClienteRepository;
import com.example.CoreCommerce.repository.PedidoRepository;
import com.example.CoreCommerce.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {


        @Mock
        private ClienteRepository clienteRepository;

        @Mock
        private ProdutoRepository produtoRepository;

        @Mock
        private PedidoRepository pedidoRepository;

        @Mock
        private EmailService emailService;

        @InjectMocks
        private PedidoService pedidoService;

        private Cliente cliente;
        private Produto produto;

        @BeforeEach
        void setUp() {
            cliente = new Cliente();
            cliente.setNome("diogo");
            cliente.setEmail("diogoantunes892@gmail.com");

            produto = new Produto();
            produto.setNome("Teclado");
            produto.setPreco(100.0);
            produto.setQuantidadeEstoque(10);
        }

        @Test
        @DisplayName("Deve cadastrar pedido com sucesso")
        void CadastrarPedido() {
            // Arrange
            PedidoDTO dto = new PedidoDTO(1L, List.of(new ItemPedidoDTO(1L, 3)));

            when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
            when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

            // Act
            Pedido resultado = pedidoService.cadastrarPedido(dto);

            // Assert
            assertThat(resultado.getCliente()).isEqualTo(cliente);
            assertThat(resultado.getStatusPedido()).isEqualTo(StatusPedido.AGUARDANDO);
            assertThat(resultado.getValorTotal()).isEqualTo(300.0);
            assertThat(resultado.getItens()).hasSize(1);

            // estoque foi decrementado
            assertThat(produto.getQuantidadeEstoque()).isEqualTo(7);

            verify(produtoRepository).save(produto);
            verify(pedidoRepository).save(any(Pedido.class));
            verify(emailService).enviarEmail(
                    eq("diogoantunes892@gmail.com"),
                    anyString(),
                    anyString(),
                    anyList(),
                    eq(300.0)
            );
        }

        @Test
        @DisplayName("lançar exceção quando cliente não existir")
        void ClienteNaoExiste() {
            PedidoDTO dto = new PedidoDTO(99L, List.of());

            when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> pedidoService.cadastrarPedido(dto))
                    .isInstanceOf(RuntimeException.class)
                            .hasMessage("Cliente não encontrado");


            verifyNoInteractions(produtoRepository, pedidoRepository, emailService);
        }

        @Test
        @DisplayName("Lançar exceção quando produto não existir")
        void ProdutoNaoExiste() {
            PedidoDTO dto = new PedidoDTO(1L, List.of(new ItemPedidoDTO(99L, 1)));

            when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
            when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> pedidoService.cadastrarPedido(dto))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Produto não encontrado");

            verify(pedidoRepository, never()).save(any());
            verifyNoInteractions(emailService);
        }
}