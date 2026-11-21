package com.example.CoreCommerce.exception;

public class EmailNaoEncontrado extends RuntimeException {

    private EmailNaoEncontrado emailNaoEncontrado;

    public EmailNaoEncontrado() {
        super("E-mail inexsistente, cadastre-se ou tente novamente!");
    }
}
