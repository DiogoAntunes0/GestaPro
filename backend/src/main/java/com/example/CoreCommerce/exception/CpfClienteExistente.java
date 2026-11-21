package com.example.CoreCommerce.exception;

public class CpfClienteExistente extends RuntimeException {

    private CpfClienteExistente cpfClienteExistente;

    public CpfClienteExistente() {
        super("CPF do cliente já cadastrado!");
    }
}
