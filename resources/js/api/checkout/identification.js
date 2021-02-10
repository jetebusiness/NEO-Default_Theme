import {_alert, _confirm} from '../../functions/message';
import { validarEmail } from "../../functions/validate";
import { generateRecaptcha } from "../../ui/modules/recaptcha";
import { openModalPolicy } from "../../ui/modules/policy";

$(document).ready(function () {
    //checkEmail();
    //ConfirmaEmail();

    checkLogin();
});

function checkLogin() {

    $("#checkLogin").unbind().on("click", function () {
        $(this).addClass("loading");
        var strLogin = $("#login").val();
        var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";

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
                cache: false,
                async:false,
                data: {
                    email: isValidEmail ? strLogin : "",
                    cpfCnpj: (isValidCpf || isValidCnpj) ? strLogin : "",
                    googleResponse: googleResponse
                },
                success: function (response) {
                    if (response.success) {
                        
                        if(response.modalPrivacyType !== "") {
                            $(".modal-policy").modal({
                                closable  : false,
                                onHidden : function() {
                                    $.ajax({
                                        method: "POST",
                                        url: "/Customer/PrivacyPolicyAcceptUser",
                                        success: function () {
                                            window.location.href = '/Checkout/' + response.action;
                                        }
                                    });
                                },
                                onVisible: function() {
                                    $(".check-policy-modal").checkbox({
                                        onChecked: function () {                                            
                                            $("#btn-payment-go").removeClass("disabled")
                                        },
                                        onUnchecked: function () {
                                            $("#btn-payment-go").addClass("disabled")
                                        }
                                    });
                                }
                            }).modal('show')
                        } else {
                            if ($('#payPalCheckoutInCart').val() === "true") {
                                swal({
                                    title: '',
                                    html: "Identificamos que você já possui uma conta em nossa loja e lhe redirecionaremos para a página de pagamento. Por gentileza, revise seu pedido antes de concluí-lo!",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    window.location.href = '/Checkout/' + response.action;
                                });
                            } else {
                                window.location.href = '/Checkout/' + response.action;
                            }
                        }

                        
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