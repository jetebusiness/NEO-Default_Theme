import {_alert, _confirm} from "../../functions/message";
import {isValidEmail} from "../../functions/validate"

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
    if(_email == ""){
        _alert("", "Informe um e-mail.", "warning")
        return false
    }
        
    if (isValidEmail(_email)) {
        var _url = "/customer/RecoverPasswordByEmail";

        $.ajax({
            method: "POST",
            dataType: "json",
            url: _url,
            data:{email:_email},
            success: function (data) {
                if(data.Success)
                    _alert("", data.Message, "success")
                else
                    _alert("", data.Message, "error")
            },
            error: function (data) {
                _alert("", data.Message, "error")
            }
        });
    }
    else{
        _alert("", "Informe um e-mail válido.", "error")
    }
}

function forgotByCpfPassword() {

    var _cpf = $("#cpf").val();
    var _password = $("#password").val();
    var _url = "/customer/RecoverEmailByCpfPassword";
    if(_cpf == "" || _password == "")
    {
        _alert("", "É necessário informar os dados de acesso.", "warning")
        return false
    }

    $.ajax({
        method: "POST",
        url: _url,
        data: { cpf: _cpf, password: _password},
        success: function (result) {
            if (result.Success) {
                _alert("","O seu e-mail de cadastro é: " + result.Message, "success")
            }
            else {
                _alert("","Não foi possível encontrar o e-mail ou a senha é inválida.", "error")
            }
        },
        error: function (result) {
            _alert("","Falha ao buscar o e-mail!", "error")
        }
    });
}
