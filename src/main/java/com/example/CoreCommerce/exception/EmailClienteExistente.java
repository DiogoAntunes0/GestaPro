package com.example.CoreCommerce.exception;

public class EmailClienteExistente extends RuntimeException {

    private EmailExistente emailExistente;

    public EmailClienteExistente() {
        super("Email do cliente já cadastrado!");
    }
}
