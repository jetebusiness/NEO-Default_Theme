import {_alert, _confirm} from '../../functions/message';
import { validarEmail } from "../../functions/validate";

$(document).ready(function () {
    //checkEmail();
    //ConfirmaEmail();

    checkLogin();
});

function checkLogin() {

    $("#checkLogin").on("click", function () {
        $(this).addClass("loading");
        var strLogin = $("#login").val();

        var isValidEmail = validarEmail(strLogin);
        var isValidCpf = $.fn["jetCheckout"].validateCPF(strLogin);
        var isValidCnpj = $.fn["jetCheckout"].validateCNPJ(strLogin);

        // condição
        if (strLogin === "") {
            _alert("", "Informe um E-mail, CPF ou CNPJ", "warning");
            $("#checkLogin").removeClass("loading");
        }
        else if (!isValidEmail && !isValidCpf && !isValidCnpj) {
            _alert("", "Informe um E-mail, CPF ou CNPJ válido.", "error");
            $("#checkLogin").removeClass("loading");
        } else {
            $.ajax({
                method: "POST",
                url: "/checkout/CheckLogin",
                data: {
                    email: isValidEmail ? strLogin : "",
                    cpfCnpj: (isValidCpf || isValidCnpj) ? strLogin : ""
                },
                success: function (response) {
                    if (response.success) {
                        window.location.href = response.action;
                    }
                    else
                    {
                        if (response.msg === "") {
                            if (isValidEmail) {
                                $("#identificationForm #email").val(strLogin);
                                $("#identificationForm #cpfCnpj").val("");
                            }
                            else {
                                $("#identificationForm #email").val("");
                                $("#identificationForm #cpfCnpj").val(strLogin);
                            }

                            $("#identificationForm").attr("action", "/checkout/" + response.action);
                            $("#identificationForm").submit();
                        } else {
                            swal('', response.msg, 'error');
                            $("#checkEmail").removeClass("loading");
                        }
                    }
                }
            });
        }
        return false;
    });

    $("#login").unbind().keyup(function (e) {
        if (e.keyCode == 32) return false;

        if (e.which == 13) {
            $("#checkLogin").click()
        }
    });
}