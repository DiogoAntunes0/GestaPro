package com.example.CoreCommerce.repository;

import com.example.CoreCommerce.entity.ResetarSenhaToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResetarSenhaTokenRepository extends JpaRepository<ResetarSenhaToken, Long> {
        Optional<ResetarSenhaToken> findByTokenHash(String tokenHash);

    }


