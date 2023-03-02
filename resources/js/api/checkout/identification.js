import {_alert, _confirm} from '../../functions/message';
import { validarEmail } from "../../functions/validate";
import { generateRecaptcha } from "../../ui/modules/recaptcha";

$(function () {
    window.onload = function () {
        $(document).on("click", "#checkLogin", function (e) {
            e.preventDefault();
            checkLogin();
        });

        $(document).on("keyup", "#login", function (e) {
            e.preventDefault();
            if (e.keyCode === 32) return false;
            
            const elem = document.getElementById('#login');

            if (elem === document.activeElement) {
                if (e.which === 13) {
                    checkLogin();
                }
            }            
            
        });
    }();
});

function checkLogin() {
    let btn =  $("#checkLogin");   
    let strLogin = $("#login").val();
    let googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";

    let isValidEmail = validarEmail(strLogin);
    let isValidCpf = $.fn["jetCheckout"].validateCPF(strLogin);
    let isValidCnpj = $.fn["jetCheckout"].validateCNPJ(strLogin);

    let form = $("#identificationForm");
    
    btn.addClass("loading");

    // condição
    if (strLogin === "") {
        _alert("", "Informe um E-mail, CPF ou CNPJ", "warning");
        btn.removeClass("loading");
    }
    else if (!isValidEmail && !isValidCpf && !isValidCnpj) {
        _alert("", "Informe um E-mail, CPF ou CNPJ válido.", "error");
        btn.removeClass("loading");
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
                                        if (response.recoveredCart) {
                                            _confirm({
                                                title: "Carrinho Recuperado!",
                                                text: "Alguns produtos que estavam em seu carrinho, foram recuperados no momento do login. Verifique já!",
                                                type: "info",
                                                confirm: { text: "OK"},
                                                cancel: {},
                                                callback: function () {
                                                    window.location.href = '/checkout/' + response.action.toLowerCase();
                                                }
                                            }, false);
                                            return false;
                                        }
                                        window.location.href = '/checkout/' + response.action.toLowerCase();
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
                    }
                    else {
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
                                if (response.recoveredCart) {
                                    _confirm({
                                        title: "Carrinho Recuperado!",
                                        text: "Alguns produtos que estavam em seu carrinho, foram recuperados no momento do login. Verifique já!",
                                        type: "info",
                                        confirm: { text: "OK" },
                                        cancel: {},
                                        callback: function () {
                                            window.location.href = '/checkout/' + response.action.toLowerCase();
                                        }
                                    }, false);
                                    return false;
                                }
                                window.location.href = '/checkout/' + response.action.toLowerCase();
                            });
                        } else {
                            if (response.recoveredCart) {
                                _confirm({
                                    title: "Carrinho Recuperado!",
                                    text: "Alguns produtos que estavam em seu carrinho, foram recuperados no momento do login. Verifique já!",
                                    type: "info",
                                    confirm: { text: "OK" },
                                    cancel: {},
                                    callback: function () {
                                        window.location.href = '/checkout/' + response.action.toLowerCase();
                                    }
                                }, false);
                                return false;
                            }
                            window.location.href = '/checkout/' + response.action;
                        }
                    }


                }
                else
                {
                    if (response.msg === "") {
                        if (isValidEmail) {
                            $("#email", form).val(strLogin);
                            $("#cpfCnpj", form).val("");
                        }
                        else {
                            $("#email", form).val("");
                            $("#cpfCnpj", form).val(strLogin);
                        }

                        form.attr("action", "/checkout/" + response.action);
                        form.submit();
                    } else {
                        swal('', response.msg, 'error');
                        btn.removeClass("loading");
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

}