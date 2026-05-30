package com.example.CoreCommerce.exception;

public class EmailExistente extends RuntimeException {

    private EmailExistente emailExistente;

    public EmailExistente() {
        super("E-mail existente, cadastre um novo ou tente recuperar sua conta!");
    }
}
