package com.example.CoreCommerce.controller;

import com.example.CoreCommerce.dto.ItemPedidoDTO;
import com.example.CoreCommerce.dto.ItemPedidoResponseDTO;
import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.dto.StatusPedidoDTO;
import com.example.CoreCommerce.entity.Pedido;
import com.example.CoreCommerce.entity.StatusPedido;
import com.example.CoreCommerce.security.JwtService;
import com.example.CoreCommerce.security.UserDetailsServiceImpl;
import com.example.CoreCommerce.service.PedidoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PedidoController.class)
class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PedidoService pedidoService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @DisplayName("Deve cadastrar pedido")
    @WithMockUser(roles = "ADMIN")
    void CadastrarPedido() throws Exception {
        PedidoDTO dto = new PedidoDTO(1L, List.of(new ItemPedidoDTO(1L, 3)));

        Pedido pedido = new Pedido();
        pedido.setValorTotal(300.0);
        pedido.setStatusPedido(StatusPedido.AGUARDANDO);

        when(pedidoService.cadastrarPedido(any(PedidoDTO.class))).thenReturn(pedido);

        mockMvc.perform(post("/api/pedidos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valorTotal").value(300.0))
                .andExpect(jsonPath("$.statusPedido").value("AGUARDANDO"));

        verify(pedidoService).cadastrarPedido(any(PedidoDTO.class));
    }

    @Test
    @DisplayName("Deve listar todos os itens daquele pedido")
    @WithMockUser(roles = "ADMIN")
    void ListarItensDoPedido() throws Exception {
        when(pedidoService.listarItemPedido(1L))
                .thenReturn(List.of(new ItemPedidoResponseDTO("Teclado", 3, 100.0)));

        mockMvc.perform(get("/api/pedidos/1/itens"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nomeProduto").value("Teclado"))
                .andExpect(jsonPath("$[0].quantidade").value(3));
    }

    @Test
    void deveListarPedidosComPaginacaoPadrao() throws Exception {
        when(pedidoService.listarTodosPedidos(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/pedidos/listar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // confere que page=0 e size=10 (os defaults) chegaram ao service
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(pedidoService).listarTodosPedidos(captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(0);
        assertThat(captor.getValue().getPageSize()).isEqualTo(10);
    }

    @Test
    void deveAtualizarStatusDoPedido() throws Exception {
        StatusPedidoDTO dto = new StatusPedidoDTO(1L, StatusPedido.PAGO); // ajuste ao seu enum

        when(pedidoService.atualizarStatusPedido(eq(1L), any(StatusPedidoDTO.class)))
                .thenReturn(dto);

        mockMvc.perform(patch("/api/pedidos/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusPedido").value("PAGO"));
    }

    @Test
    void deveBuscarPedidosPorNome() throws Exception {
        when(pedidoService.buscarPedidos(eq("Maria"), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/pedidos/buscar").param("nome", "Maria"))
                .andExpect(status().isOk());

        verify(pedidoService).buscarPedidos(eq("Maria"), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void deveRetornar400QuandoJsonInvalido() throws Exception {
        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ json quebrado"))
                .andExpect(status().isBadRequest());
    }
}