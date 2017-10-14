import {_alert, _confirm} from "../../functions/message";

$(document).ready(function () {

    $("#recuperarSenha").click(function () {
        forgotByEmail();
    });

    $("#recuperaEmail").click(function () {
        forgotByCpfPassword();
    });

});

function forgotByEmail() {

    var _email = $("#email").val();
    var regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/u);

    if (regex.test(_email)) {
        var _url = "/customer/RecoverPasswordByEmail";

        $.ajax({
            method: "POST",
            dataType: "json",
            url: _url,
            data:{email:_email},
            success: function (data) {
                if(data.Success)
                    _alert("Mensagem", data.Message, "success")
                else
                    _alert("Mensagem", data.Message, "error")
            },
            error: function (data) {
                _alert("Informação", data.Message, "error")
            }
        });
    }
    else{
        _alert("Mensagem", "Por favor, informe um e-mail válido.", "error")
    }
}

function forgotByCpfPassword() {

    var _cpf = $("#cpf").val();
    var _password = $("#password").val();
    var _url = "/customer/RecoverEmailByCpfPassword";

    $.ajax({
        method: "POST",
        url: _url,
        data: { cpf: _cpf, password: _password},
        success: function (result) {
            if (result.Success) {
                _alert("Informação","O seu e-mail de cadastro é: " + result.Message, "success")
            }
            else {
                _alert("Informação","Por favor, informe os dados de acesso.", "warning")
            }
        },
        error: function (result) {
            _alert("Erro","Falha ao buscar o e-mail!", "warning")
        }
    });
}
