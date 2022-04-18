$(document).ready(function() {
    $(function(){
        //Grava o nome na sessão
        if(sessionStorage.nome) {
            $('#nome').val(sessionStorage.nome)
        }
        $('#nome').keyup(function(){
            sessionStorage.nome = $(this).val()
        })

        //Grava o E-Mail na sessão
        if(sessionStorage.email) {
            $('#email').val(sessionStorage.email)
        }
        $('#email').keyup(function(){
            sessionStorage.email = $(this).val()
        })

        //Grava o telefone na sessão
        if(sessionStorage.telefone) {
            $('#telefone').val(sessionStorage.telefone)
        }
        $('#telefone').keyup(function(){
            sessionStorage.telefone = $(this).val()
        })

        //Grava o assunto na sessão
        if(sessionStorage.assunto) {
            $('#assunto').val(sessionStorage.assunto)
        }
        $('#assunto').keyup(function(){
            sessionStorage.assunto = $(this).val()
        })

        //Grava a mensagem na sessão
        if(sessionStorage.msg) {
            $('#msg').val(sessionStorage.msg)
        }
        $('#msg').keyup(function(){
            sessionStorage.msg = $(this).val()
        })
    })
});