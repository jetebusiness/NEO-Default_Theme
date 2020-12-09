import { _alert, _confirm } from "../../functions/message";
import { validarEmail } from "../../functions/validate";
import { generateRecaptcha } from "../../ui/modules/recaptcha";

$(document).ready(function () {
    if ($("#login").val() == "") {
        $("#enviar").prop("disabled", true);
    }
    $("#login").on('input', function () {
        
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
        var returnUrl = $('.ui.modal.key-login').data("url");
        var $this = $(this);

        var form = $('#formAccessKey');
        var googleRecaptchaStatus = !$("[id^=googleResponse]", form).length;


        if (userName.length > 0 && password.length > 0) {


            $this.addClass("loading");

            if (googleRecaptchaStatus) {
                customerLogin(userName, password, returnUrl);
            } else{

                if($("[id^=googleVersion]", form).val() === "2") {
                    if(generateRecaptcha($("[id^=googleModule]", form).val(), form))
                        customerLogin(userName, password, returnUrl);
                    else
                        $this.removeClass("loading");
                } else {
                    customerLogin(userName, password, returnUrl, $("[id^=googleResponse]").val());
                }


            }
        } else {
            if (!googleRecaptchaStatus)
                (typeof grecaptcha !== "undefined" && $("[id^=googleVersion_]").eq(0).val() === "2" ? grecaptcha.reset() : "")

            _alert("", "É necessário informar os dados de acesso.", "warning")

            $this.removeClass("loading");
        }
        
    });


    $(document).on('submit', '#form-accesskey', function () {

        let strLogin = $('#login').val();
        let googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";

        let isValidEmail = validarEmail(strLogin);
        let isValidCpf = $.fn["jetCheckout"].validateCPF(strLogin);
        let isValidCnpj = $.fn["jetCheckout"].validateCNPJ(strLogin);

        $.ajax({
            method: "POST",
            url: "/Customer/Accesskey",
            data: {
                __RequestVerificationToken: gettoken(),
                email: isValidEmail ? strLogin : "",
                cpfCnpj: (isValidCpf || isValidCnpj) ? strLogin : "",
                googleResponse: googleResponse
            },
            success: function (data) {
                if (data.Success == true && data.Message == "Login") {
                    $("#UserName").val(strLogin);
                    $('.ui.modal.key-login').modal('show');
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
            },
            complete: function () {
                if ($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                    if ($("[id^=googleVersion_]").eq(0).val() === "2") {
                        grecaptcha.reset();
                    } else {
                        generateRecaptcha($("[id^=googleModule]").val(), "body");
                    }
                }
            }
        });
        return false;
    });
});

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

function customerLogin(userName, password, returnUrl, tokenGoogleRecaptchaV3 = "") {

    var form = $('#formAccessKey');
    
    $.ajax({
        method: "POST",
        url: "/Customer/Login",
        data: {
            __RequestVerificationToken: gettoken(),
            UserName: userName,
            Password: password,
            returnUrl: returnUrl,
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
        },
        complete: function() {
            $("#Entrar").removeClass("loading")

            if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                if($("[id^=googleVersion_]").eq(0).val() === "2") {
                    (form.parents(".modal-login").length > 0 ? grecaptcha.reset(1) : grecaptcha.reset())
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), form);
                }
            }
        }
    });
}