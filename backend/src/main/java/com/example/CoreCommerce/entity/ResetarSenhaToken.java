package com.example.CoreCommerce.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
public class ResetarSenhaToken {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true, length = 64)
        private String tokenHash;

        @ManyToOne(optional = false)
        private Usuario usuario;

        @Column(nullable = false)
        private Instant expiresAt;

        private boolean used = false;

        public Long getId() { return id; }

        public String getTokenHash() { return tokenHash; }
        public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }

        public Usuario getUsuario() { return usuario; }
        public void setUsuario(Usuario usuario) { this.usuario = usuario; }

        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

        public boolean isUsed() { return used; }
        public void setUsed(boolean used) { this.used = used; }
    }

