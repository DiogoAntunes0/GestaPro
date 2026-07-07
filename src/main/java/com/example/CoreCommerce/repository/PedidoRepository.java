package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository <Pedido, Long>  {
}
