package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    Usuario findByEmail(String email);
}
