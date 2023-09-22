import {_alert, _confirm} from "../../functions/message";
import { isValidEmail } from "../../functions/validate"
import { generateRecaptcha } from "../../ui/modules/recaptcha";

$(document).ready(function () {
    $("#recuperarSenha").click(function () {
        preLogin("password");
    });

    $("#recuperaEmail").click(function () {
        preLogin("email");
  });

});

function preLogin(recoverType) {
    var form = $('#formRecover');
    var googleRecaptchaStatus = !$("[id^=googleResponse]", form).length;
    var _googleResponse = $("[id^=googleResponse]").val()

    if (googleRecaptchaStatus) {
        if (recoverType == "password")
            forgotByEmail(googleRecaptchaStatus, _googleResponse);
        if (recoverType == "email")
            forgotByCpfPassword(googleRecaptchaStatus, _googleResponse);
    } else {
        if ($("[id^=googleVersion]", form).val() === "2") {
            if (generateRecaptcha($("[id^=googleModule]", form).val(), form)) {
                if (recoverType == "password")
                    forgotByEmail(googleRecaptchaStatus, _googleResponse);
                if (recoverType == "email")
                    forgotByCpfPassword(googleRecaptchaStatus, _googleResponse);
            }
        } else {
            if (recoverType == "password")
                forgotByEmail(googleRecaptchaStatus, _googleResponse);
            if (recoverType == "email")
                forgotByCpfPassword(googleRecaptchaStatus, _googleResponse);
        }
    }
}

function forgotByEmail(googleRecaptchaStatus, _googleResponse) {
    var form = $('#formRecover');
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
            data: { email: _email, googleResponse: _googleResponse },
            success: function (data) {
                if(data.Success)
                    _alert("", data.Message, "success")
                else
                    _alert("", data.Message, "error")
            },
            error: function (data) {
                if (!googleRecaptchaStatus)
                    (typeof grecaptcha !== "undefined" && $("[id^=googleVersion_]").eq(0).val() === "2" ? grecaptcha.reset() : "")

                _alert("", data.Message, "error")
            }
        });
    }
    else{
        _alert("", "Informe um e-mail válido.", "error")
    }
}


function forgotByCpfPassword(googleRecaptchaStatus, _googleResponse) {
    var form = $('#formRecover');
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
        data: { cpf: _cpf, password: _password, googleResponse: _googleResponse },
        success: function (result) {
            if (result.Success) {
                _alert("","O seu e-mail de cadastro é: " + result.Message, "success")
            }
            else {
                _alert("","Não foi possível encontrar o e-mail ou a senha é inválida.", "error")
            }
        },
        error: function (result) {
            if (!googleRecaptchaStatus)
                (typeof grecaptcha !== "undefined" && $("[id^=googleVersion_]").eq(0).val() === "2" ? grecaptcha.reset() : "")

            _alert("","Falha ao buscar o e-mail!", "error")
        }
    });
}
