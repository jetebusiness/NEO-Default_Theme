import { _alert, _confirm } from "../../functions/message";
import { validarEmail } from "../../functions/validate";

$(document).ready(function () {
    if ($("#login").val() == "") {
        $("#enviar").prop("disabled", true);
    }
    $("#login").keyup(function () {
        
        var $value = $(this).val();
        
        if (validarEmail($value) || $.fn["jetCheckout"].validateCPF($value) || $.fn["jetCheckout"].validateCNPJ($value)) {
            $("#enviar").prop("disabled", false);
        } else {
            $("#enviar").prop("disabled", true);
        }
    });

    $(document).on("click", "#Entrar", function () {
        var userName = $("#UserName").val();
        var password = $("#Password").val();

        if ($("#googleSiteKey").length > 0) {
            var googleSiteKey = $('#googleSiteKey').val();
            $("#googleResponse").val('');
            $.ajaxSetup({ async: false });
            $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
                grecaptcha.ready(function () {
                    grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
                        $("#googleResponse").val(tokenGoogleRecaptchaV3);
                        if (password != "")
                            customerLogin(userName, password, tokenGoogleRecaptchaV3);
                        else
                            _alert("", "Informe sua senha.", "warning")
                    });
                });
            });
        } else {
            if (password != "")
                customerLogin(userName, password);
            else
                _alert("", "Informe sua senha.", "warning")
        }
    });


    $(document).on('submit', '#form-accesskey', function () {

        let strLogin = $('#login').val();

        let isValidEmail = validarEmail(strLogin);
        let isValidCpf = $.fn["jetCheckout"].validateCPF(strLogin);
        let isValidCnpj = $.fn["jetCheckout"].validateCNPJ(strLogin);

        $.ajax({
            method: "POST",
            url: "/Customer/Accesskey",
            data: {
                __RequestVerificationToken: gettoken(),
                email: isValidEmail ? strLogin : "",
                cpfCnpj: (isValidCpf || isValidCnpj) ? strLogin : ""
            },
            success: function (data) {
                if (data.Success == true && data.Message == "Login") {
                    $("#UserName").val(strLogin);
                    $('.ui.modal').modal('show');
                } else if (data.Success == true && data.Message == "CadastrarSenha") {
                    window.location.href = "/Customer/CheckAccessKey?email=" + data.Email;
                } else if (data.Success == true && data.Message == "Cadastro") {
                    window.location.href = "/Customer/Register?email=" + (isValidEmail ? strLogin : "") + "&cpfCnpj=" + ((isValidCpf || isValidCnpj) ? strLogin : "");
                } else {
                    swal({
                        text: data.Message,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: '#16ab39',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    });
                }
            },
            error: function (data) {
                _alert("", data.message, "error");
            }
        });
        return false;
    });
});

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

function customerLogin(userName, password, tokenGoogleRecaptchaV3 = "") {
    $.ajax({
        method: "POST",
        url: "/Customer/Login",
        data: {
            __RequestVerificationToken: gettoken(),
            UserName: userName,
            Password: password,
            googleResponse: tokenGoogleRecaptchaV3
        },
        success: function (data) {
            if (data.success === true) {
                window.location = data.redirectUrl
            } else {
                _alert("", data.message, "error")
            }
        },
        error: function (data) {
            _alert("", data.message, "error")
        }
    });
}