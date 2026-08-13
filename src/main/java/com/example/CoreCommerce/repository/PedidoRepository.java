package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.dto.PedidoDTO;
import com.example.CoreCommerce.entity.Pedido;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository <Pedido, Long>  {
    Page<Pedido> findAllByOrderByDataPedidoDesc(Pageable pageable);



}
