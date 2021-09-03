import { createModelExhausted } from "../../api/checkout/mini_cart";
import { generateRecaptcha } from "../../ui/modules/recaptcha";


var xhrPayPalReference = null;
var xhrPayPalInstallments  = null;
var xhrPayPalReferenceDelete = null;
var ppp;

function PayPalCheckout() {
    if ($('#paypal-button-container').length > 0) {
        if (window.paypal != undefined) {
            paypal.Buttons({
                env: $('#EnvPayPal').val(),
                style: {
                    layout: 'horizontal',
                    color: $('#ButtonColorPayPal').val(), // blue / silver
                    shape: $('#ButtonFormatPayPal').val(), // pill
                    label: 'pay', // no checkout: pay // no shortcut: buynow
                    height: 45,
                    size: 'responsive',
                    fundingicons: false,
                    tagline: false
                },
                locale: {
                    country: 'BR',
                    lang: 'pt_BR'
                },
                createOrder: function (data, actions) {
                    let token = "";

                    $.ajax({
                        method: 'POST',
                        url: '/Checkout/PayPalCreateOrder',
                        async: false,
                        data: {
                            IdAddress: $("#idAddress").val()
                        },
                        success: function (response) {
                            if (response.links.length > 0) {
                                for (var key in response.links) {
                                    if (response.links[key].rel == "approval_url") {
                                        token = response.links[key].href.match(/EC-\w+/)[0];
                                    }
                                }
                            }
                        }
                    });

                    return token;
                },
                onApprove: function (data, actions) {

                    var idCustomer = $("#idCustomer").val();
                    var idAddress = $("#idAddress").val();
                    var presente = $("#presente").val();
                    var mensagem = $("#mensagem").val();
                    var idPaymentBrand = $("#IdPaymentBrandPayPal").val();
                    var shippingMode = "";
                    if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");
                    var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
                    var deliveryTime = null;
                    var usefulDay = null;
                    if ($('input[name=radio]:checked').length > 0) {
                        deliveryTime = $('input[name=radio]:checked').data('deliverytime');
                        usefulDay = (($('input[name=radio]:checked').data('usefullday') == "1") ? true : false);
                    }

                    var payPalPaymentId = data.paymentID;
                    var payPalPayerId = data.payerID;
                    var payPalOrderId = data.orderID;

                    $("body").prepend('<div class="ui active dimmer loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

                    $.ajax({
                        method: 'POST',
                        url: '/Checkout/GerarPedidoCompleto',
                        data: {
                            idCustomer: idCustomer,
                            idAddress: idAddress,
                            presente: presente,
                            mensagem: mensagem,
                            idPaymentBrand: idPaymentBrand,
                            shippingMode: shippingMode,
                            googleResponse: googleResponse,
                            deliveryTime: deliveryTime,
                            usefulDay: usefulDay,
                            kind: "Checkout",
                            payPalPaymentId: payPalPaymentId,
                            payPalPayerId: payPalPayerId,
                            payPalOrderId: payPalOrderId
                        },
                        success: function (response) {
                            if (response.success === true) {
                                if (response.errorMsg != "") {
                                    swal({
                                        title: '',
                                        html: response.errorMsg,
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    });
                                    $(".loadingCheckout").remove();
                                }
                                else {
                                    if (response.urlRedirect != "") {
                                        if (response.typeRedirect == "1") {
                                            window.location.href = "Success?orderId=" + response.idPedido + "&d=" + response.urlRedirect;
                                        }
                                        else {
                                            window.location.href = response.urlRedirect;
                                        }
                                    }
                                    else {
                                        if (response.urlBoleto != "") {
                                            window.location.href = "Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                                            //window.location.href = "Success?orderId=" + response.idPedido;
                                        }
                                        else {
                                            if (response.msg != "") {
                                                window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                                            }
                                            else {
                                                window.location.href = "Success?orderId=" + response.idPedido;
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                                    swal({
                                        title: '',
                                        html: response.errorMsg,
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    }).then(function () {
                                        if (response.urlRedirect !== "")
                                            window.location.href = response.urlRedirect;
                                    });

                                    $(".loadingCheckout").remove();
                                }
                                else {
                                    window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
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
                            $(".loadingCheckout").remove();
                        }
                    });
                },
                onError: function (err) {
                    //console.log("Erro");
                    //console.log(err);
                    swal({
                        title: '',
                        html: 'Falha ao criar a pre-order no paypal',
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    });
                },
                onCancel: function (err) {
                    //console.log("Cancelado");
                    //console.log(err);
                }
            }).render('#paypal-button-container');
        }
    }

    return false;
}
function PayPalCheckoutInCart2() {
    if ($('#paypal-button-container-incart').length > 0) {
        if (window.paypal != undefined) {
            paypal.Buttons({
                env: $('#EnvPayPallCheckoutInCart').val(),
                style: {
                    layout: 'horizontal',
                    color: $('#ButtonColorPayPalCheckoutInCart').val(), // blue / silver
                    shape: $('#ButtonFormatPayPalCheckoutInCart').val(), // pill
                    label: 'pay', // no checkout: pay // no shortcut: buynow
                    height: 45,
                    size: 'responsive',
                    fundingicons: false,
                    tagline: false
                },
                locale: {
                    country: 'BR',
                    lang: 'pt_BR'
                },
                createOrder: function (data, actions) {
                    let token = "";

                    $.ajax({
                        method: 'POST',
                        url: '/Checkout/PayPalCreateOrder',
                        async: false,
                        data: {
                            IdAddress: ""
                        },
                        success: function (response) {
                            if (response.links != null && response.links.length > 0) {
                                for (var key in response.links) {
                                    if (response.links[key].rel == "approval_url") {
                                        token = response.links[key].href.match(/EC-\w+/)[0];
                                    }
                                }
                            }
                        }
                    });

                    return token;
                },
                onApprove: function (data, actions) {
                    $("body").prepend('<div class="ui active dimmer loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

                    $.ajax({
                        method: 'post',
                        url: '/Checkout/PayPalLoginOrder',
                        async: true,
                        data: {
                            PaymentId: data.paymentID
                        },
                        success: function (response) {
                            if (response.success === true) {
                                if (response.message === "") {
                                    $(".loadingCheckout").remove();
                                    swal({
                                        title: '',
                                        html: 'A partir do seu login no Paypal identificamos que você já possui uma conta em nossa loja e lhe redirecionaremos para a página de pagamento. Por gentileza, revise seu pedido antes de concluí-lo!',
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    }).then(function () {
                                        window.location.href = response.redirect;
                                    });
                                } else {
                                    $(".loadingCheckout").remove();
                                    swal({
                                        title: '',
                                        html: response.message,
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    }).then(function () {
                                        window.location.href = response.redirect;
                                    });
                                }
                            } else {
                                $(".loadingCheckout").remove();
                                swal({
                                    title: '',
                                    html: response.message,
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    if (response.redirect === "/checkout/Register") {
                                        let _html = '';
                                        _html += '<form id="frmRedirectRegister" action="' + response.redirect + '" method="post">';
                                        _html += '    <input type="hidden" name="login" value="' + response.order.payer.payer_info.email + '">';
                                        _html += '    <input type="hidden" name="email" value="' + response.order.payer.payer_info.email + '">';
                                        _html += '    <input type="hidden" name="cpfCnpj" value="' + response.order.payer.payer_info.tax_id + '">';
                                        _html += '</form>';
                                        $('body').append(_html);
                                        $('#frmRedirectRegister').submit();
                                    } else if (response.redirect !== "") {
                                        window.location.href = response.redirect;
                                    }
                                });
                            }
                        }
                    });
                },
                onError: function (err) {
                    //console.log("Erro");
                    //console.log(err);

                    swal({
                        title: '',
                        html: "Não foi possivel realizar a integração com PayPal.",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    })
                },
                onCancel: function (err) {
                    //console.log("Cancelado");
                    //console.log(err);
                }
            }).render('#paypal-button-container-incart');
        }
    }
}

export function PayPalCheckoutReference() {
    if ($('#paypal-button-reference').length > 0) {
        
        $('#paypal-button-reference').removeAttr("style").empty().append('<div class="ui active inverted dimmer padding top bottom large loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

        if (xhrPayPalReference !== null) {
            xhrPayPalReference.abort();
        }
        if (xhrPayPalInstallments !== null) {
            xhrPayPalInstallments.abort();
        }
        if (xhrPayPalReferenceDelete !== null) {
            xhrPayPalReferenceDelete.abort();
        }

        xhrPayPalReference = $.ajax({
            method: 'POST',
            url: '/Checkout/PayPalReference',
            data: {

            },
            success: function (responseReference) {
                if (responseReference.success === true) {
                    let _value = $('#total_checkout').html().trim().replace('R$', '').trim().replace('.', '').replace(',', '.').trim();

                    xhrPayPalInstallments = $.ajax({
                        method: 'POST',
                        url: '/Checkout/PayPalInstallments',
                        data: {
                            Value: _value
                        },
                        success: function (responseInstallments) {
                            if (responseInstallments.success === true) {
                                let _installmentsNeo = responseInstallments.installmentsNeo.ListInstallment;
                                let _installmentsPayPal = responseInstallments.installments.financing_options[0].qualifying_financing_options;
                                let _html = "<p><strong>Olá " + responseReference.reference.Name + "</strong></p>";
                                _html += "<p><i class=\"barcode alternative icon\"></i>" + responseReference.reference.Email + "</p>";
                                _html += "<p>Para trocar o cartão de crédito vinculado à sua conta PayPal, <a href=\"javascript:void(0);\" id=\"payPalDeleteReference\"><strong>clique aqui.</string></a></p>";
                                _html += "<form class=\"ui form\">";
                                _html += "<p><select id=\"installmentsReference\" class=\"fieldCheckPayment\">";
                                _html += "<option value=\"0\">Selecione o parcelamento</option>";

                                let _totalInstallments = 0;
                                if (_installmentsNeo.length > _installmentsPayPal.length) {
                                    _totalInstallments = _installmentsPayPal.length;
                                } else {
                                    _totalInstallments = _installmentsNeo.length;
                                }

                                for (let i = 0; i < _totalInstallments; i++) {
                                    let IdInstallment = _installmentsNeo[i].IdInstallment;
                                    let InstallmentNumber = _installmentsNeo[i].InstallmentNumber;
                                    let InstallmentValue = _installmentsNeo[i].Value;
                                    let InstallmentTotal = _installmentsNeo[i].Total;
                                    let Description = _installmentsNeo[i].Description;
                                    let Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(_installmentsNeo[i].Value);

                                    if (i === 0) {
                                        let DiscountAmount = 0;
                                        if (_installmentsPayPal[0].discount_amount !== null) DiscountAmount = _installmentsPayPal[0].discount_amount.value;
                                        let DiscountAmountPercent = 0;
                                        if (_installmentsPayPal[0].discount_percentage !== null) DiscountAmountPercent = _installmentsPayPal[0].discount_percentage;
                                        InstallmentValue = _installmentsPayPal[0].monthly_payment.value;
                                        InstallmentTotal = _installmentsPayPal[0].total_cost.value;
                                        if (parseFloat(DiscountAmount) > 0) {
                                            Description = "desconto de " + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(DiscountAmount);
                                        }
                                        Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(_installmentsPayPal[0].monthly_payment.value);
                                        _html += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "' data-InstallmentValue='" + InstallmentValue + "' data-InstallmentTotal='" + InstallmentTotal + "' data-InstallmentDiscount='" + DiscountAmount + "' data-InstallmentDiscountPercent='" + DiscountAmountPercent + "'>" + InstallmentNumber + "x de " + Value + " (" + Description + ")</option>";
                                    } else {
                                        _html += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "' data-InstallmentValue='" + InstallmentValue + "' data-InstallmentTotal='" + InstallmentTotal + "' data-InstallmentDiscount='0' data-InstallmentDiscountPercent='0'>" + InstallmentNumber + "x de " + Value + " (" + Description + ")</option>";
                                    }
                                }
                                _html += "</select></p>";
                                _html += "<button id=\"finalizarPedidoPayPalReference\" class=\"ui labeled icon action large fluid button\">Finalizar Pedido</button>";
                                _html += "</form>";

                                $('#paypal-button-reference').empty().append(_html);

                                $('#payPalReferenceDescription').hide();

                                $('#payPalDeleteReference').unbind().click(function () {
                                    if (xhrPayPalReference !== null) {
                                        xhrPayPalReference.abort();
                                    }
                                    if (xhrPayPalInstallments !== null) {
                                        xhrPayPalInstallments.abort();
                                    }
                                    if (xhrPayPalReferenceDelete !== null) {
                                        xhrPayPalReferenceDelete.abort();
                                    }

                                    xhrPayPalReferenceDelete = $.ajax({
                                        method: 'POST',
                                        url: '/Checkout/PayPalReferenceDelete',
                                        data: {

                                        },
                                        success: function (responseReferenceDelete) {
                                            PayPalCheckoutReference();
                                        }
                                    });

                                    return false;
                                });

                                $('#finalizarPedidoPayPalReference').unbind().click(function () {

                                    let _totalCarrinho = parseFloat($('#total_checkout').html().trim().replace('R$', '').trim().replace('.', '').replace(',', '.').trim());
                                    let _totalReference = parseFloat($('#installmentsReference > option:selected').data('installmenttotal')) + parseFloat($('#installmentsReference > option:selected').data('installmentdiscount'));
                                    if (_totalCarrinho !== _totalReference) {
                                        swal({
                                            title: 'Falha',
                                            html: "O parcelamento está desatualizar, tente novamente!",
                                            type: 'warning',
                                            showCancelButton: false,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'OK'
                                        }).then(function () {
                                            window.location.reload(true);
                                        });
                                        return false;
                                    }

                                    var idCustomer = $("#idCustomer").val();
                                    var idAddress = $("#idAddress").val();
                                    var presente = $("#presente").val();
                                    var mensagem = $("#mensagem").val();
                                    var idPaymentBrand = $("#IdPaymentBrandPayPalCheckoutReference").val();
                                    var shippingMode = "";
                                    if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");
                                    var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
                                    var deliveryTime = null;
                                    var usefulDay = null;
                                    if ($('input[name=radio]:checked').length > 0) {
                                        deliveryTime = $('input[name=radio]:checked').data('deliverytime');
                                        usefulDay = (($('input[name=radio]:checked').data('usefullday') === "1") ? true : false);
                                    }

                                    var idInstallment = $('#installmentsReference').val();
                                    var installmentNumber = $('#installmentsReference option:selected').attr('data-InstallmentNumber');
                                    var installmentValue = $('#installmentsReference option:selected').attr('data-InstallmentValue');
                                    var installmentTotal = $('#installmentsReference option:selected').attr('data-InstallmentTotal');
                                    var payPalInstallmentDiscount = $('#installmentsReference option:selected').attr('data-InstallmentDiscount');
                                    var payPalInstallmentPercentDiscount = $('#installmentsReference option:selected').attr('data-InstallmentDiscountPercent');

                                    var validaFrete = "N";
                                    $("#GetShippping .card .header").each(function (index, value) {
                                        var ponteiroCurrent = $(this);

                                        if ($(ponteiroCurrent).find(".checked").length > 0) {
                                            validaFrete = "S";
                                            return (false);
                                        }
                                        else {
                                            if ($(ponteiroCurrent).find(":checked").length > 0) {
                                                validaFrete = "S";
                                                return (false);
                                            }
                                        }
                                    });

                                    if ("" + idInstallment === "0") {
                                        swal({
                                            title: '',
                                            html: "Escolha o parcelamento.",
                                            type: 'warning',
                                            showCancelButton: false,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'OK'
                                        });

                                        return false;
                                    }

                                    if (validaFrete == "S") {

                                        $('#finalizarPedidoPayPalReference').addClass("loading");
                                        $('#finalizarPedidoPayPalReference').addClass("disabled");

                                        $.ajax({
                                            method: 'POST',
                                            url: '/Checkout/GerarPedidoCompleto',
                                            data: {
                                                idCustomer: idCustomer,
                                                idAddress: idAddress,
                                                presente: presente,
                                                mensagem: mensagem,
                                                idPaymentBrand: idPaymentBrand,
                                                shippingMode: shippingMode,
                                                googleResponse: googleResponse,
                                                deliveryTime: deliveryTime,
                                                usefulDay: usefulDay,
                                                kind: "CheckoutReference",
                                                idInstallment: idInstallment,
                                                installmentNumber: installmentNumber,
                                                installmentValue: installmentValue,
                                                installmentTotal: installmentTotal,
                                                payPalInstallmentDiscount: payPalInstallmentDiscount,
                                                payPalInstallmentPercentDiscount: payPalInstallmentPercentDiscount
                                            },
                                            success: function (response) {
                                                if (response.success === true) {
                                                    if (response.errorMsg !== "") {
                                                        swal({
                                                            title: '',
                                                            html: response.errorMsg,
                                                            type: 'warning',
                                                            showCancelButton: false,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'OK'
                                                        });

                                                    }
                                                    else {
                                                        if (response.urlRedirect != "") {
                                                            if (response.typeRedirect == "1") {
                                                                window.location.href = "Success?orderId=" + response.idPedido + "&d=" + response.urlRedirect;
                                                            }
                                                            else {
                                                                window.location.href = response.urlRedirect;
                                                            }
                                                        }
                                                        else {
                                                            if (response.urlBoleto != "") {
                                                                window.location.href = "Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                                                                //window.location.href = "Success?orderId=" + response.idPedido;
                                                            }
                                                            else {
                                                                if (response.msg != "") {
                                                                    window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                                                                }
                                                                else {
                                                                    window.location.href = "Success?orderId=" + response.idPedido;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                                                        swal({
                                                            title: '',
                                                            html: response.errorMsg,
                                                            type: 'warning',
                                                            showCancelButton: false,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'OK'
                                                        }).then(function () {
                                                            if (response.urlRedirect !== "")
                                                                window.location.href = response.urlRedirect;
                                                        });
                                                    }
                                                    else {
                                                        window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
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
                                                $('#finalizarPedidoPayPalReference').removeClass("loading");
                                                $('#finalizarPedidoPayPalReference').removeClass("disabled");
                                            }
                                        });
                                    }
                                    else {
                                        swal({
                                            title: '',
                                            html: "Escolha o frete antes de fechar o pedido!",
                                            type: 'warning',
                                            showCancelButton: false,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'OK'
                                        });


                                        $('#finalizarPedidoPayPalReference').removeClass("loading");
                                        $('#finalizarPedidoPayPalReference').removeClass("disabled");
                                    }

                                    return false;
                                });

                            }
                            else {
                                swal({
                                    title: '',
                                    html: "Não foi possível carregar o parcelamento!",
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                });

                                $('#paypal-button-reference').removeAttr("style").empty();
                                $('#finalizarPedidoPayPalReference').removeClass("loading");
                                $('#finalizarPedidoPayPalReference').removeClass("disabled");
                            }
                        }
                    });
                } else {
                    $('#payPalReferenceDescription').show();
                    $('#paypal-button-reference').empty();

                    paypal.Button.render({
                        env: $('#EnvPayPalCheckoutReference').val(), // Or 'production'
                        locale: 'pt_BR',
                        style: {
                            size: 'medium',
                            color: $('#ButtonColorPayPalCheckoutReference').val(), // gold & blue & silver & white & black
                            shape: $('#ButtonFormatPayPalCheckoutReference').val(),
                            label: 'pay', // checkout & pay & buynow & paypal
                            fundingicons: 'false',
                            tagline: 'false'
                        },
                        // 1. Creating the Billing Agreement Token
                        payment: function (data, actions) {
                            // 2. Jet endpoint to create the Billing Agreement Token
                            return actions.request.post('/Checkout/PayPalBillingToken')
                                .then(function (res) {
                                    // 3. Return Billing Agreement Token
                                    return res.billing_token;
                                });
                        },
                        // 1. Capturing the Payment
                        onAuthorize: function (data, actions) {
                            // 2. Jet endpoint to check installments and create the Billing Agreement ID
                            return actions.request.post('/Checkout/PayPalBillingId/', {
                                AgreementToken: data.billingToken
                            }).then(function (responseBillingId) {
                                // 3. Redirect user to order created page
                                if (responseBillingId.success === true) {
                                    //console.log(response);
                                    PayPalCheckoutReference();
                                } else {
                                    swal({
                                        title: '',
                                        html: "Falha ao autorizar o PayPal a realizar pedidos na loja.",
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    });
                                }
                            });

                        },
                        onError: function (data, actions) {
                            // Show generic error message to the customer and return him to the checkout page
                            swal({
                                title: '',
                                html: "Falha ao autorizar o PayPal a realizar pedidos na loja.",
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });
                        },
                        onCancel: function (data, actions) {
                            // Return the customer to the checkout page
                        }
                    }, '#paypal-button-reference');
                }
            }
        });


    }
}
export function PayPalCheckoutInCart() {
    if ($('#IsPayPalCheckoutInCart').length > 0) {
        if ($('#IsPayPalCheckoutInCart').val() === "1") {
            $('#finalizarPedidoPayPalCheckoutInCart').attr('disabled', true);
            $(".loadingCheckout").remove();
            $("body").prepend('<div class="ui active dimmer loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');
            $.ajax({
                method: 'post',
                url: '/Checkout/PayPalUpdateOrderValue',
                data: {
                    IdAddress: $('#idAddress').val(),
                    IdCustomer: $('#idCustomer').val()
                },
                success: function (response) {
                    //console.log(response);
                    $(".loadingCheckout").remove();
                    if (response.id !== null) {
                        if (response.credit_financing_offered !== null) {
                            let parcelamento = response.credit_financing_offered.term + " x de R$ " + response.credit_financing_offered.monthly_payment.value.replace(',', '').replace('.', ',');
                            $('.PayPalCheckoutInCartInstallment > strong').html(parcelamento);
                        } else {
                            let parcelamento = "1 x de R$ " + response.transactions[0].amount.total.replace(',', '').replace('.', ',');
                            $('.PayPalCheckoutInCartInstallment > strong').html(parcelamento);
                        }

                        $('#finalizarPedidoPayPalCheckoutInCart').removeAttr('disabled').unbind().click(function () {
                            var idCustomer = $("#idCustomer").val();
                            var idAddress = $("#idAddress").val();
                            var presente = $("#presente").val();
                            var mensagem = $("#mensagem").val();
                            var idPaymentBrand = $("#IdPaymentBrandPayPalCheckoutInCart").val();
                            var shippingMode = "";
                            if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");
                            var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
                            var deliveryTime = null;
                            var usefulDay = null;
                            if ($('input[name=radio]:checked').length > 0) {
                                deliveryTime = $('input[name=radio]:checked').data('deliverytime');
                                usefulDay = (($('input[name=radio]:checked').data('usefullday') === "1") ? true : false);
                            }

                            let payPalOrderId = "";
                            if (response.links.length > 0) {
                                for (var key in response.links) {
                                    if (response.links[key].rel == "approval_url") {
                                        payPalOrderId = response.links[key].href.match(/EC-\w+/)[0];
                                    }
                                }
                            }

                            var payPalPayerId = response.payer.payer_info.payer_id; //use it on executePayment API
                            var payPalPaymentId = response.id;

                            $("body").prepend('<div class="ui active dimmer loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

                            $.ajax({
                                method: 'POST',
                                url: '/Checkout/GerarPedidoCompleto',
                                data: {
                                    idCustomer: idCustomer,
                                    idAddress: idAddress,
                                    presente: presente,
                                    mensagem: mensagem,
                                    idPaymentBrand: idPaymentBrand,
                                    shippingMode: shippingMode,
                                    googleResponse: googleResponse,
                                    deliveryTime: deliveryTime,
                                    usefulDay: usefulDay,
                                    kind: "CheckoutInCart",
                                    payPalPaymentId: payPalPaymentId,
                                    payPalPayerId: payPalPayerId,
                                    payPalOrderId: payPalOrderId
                                },
                                success: function (response) {
                                    if (response.success === true) {
                                        if (response.errorMsg != "") {
                                            swal({
                                                title: '',
                                                html: response.errorMsg,
                                                type: 'warning',
                                                showCancelButton: false,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'OK'
                                            });
                                        }
                                        else {
                                            if (response.urlRedirect != "") {
                                                if (response.typeRedirect == "1") {
                                                    window.location.href = "Success?orderId=" + response.idPedido + "&d=" + response.urlRedirect;
                                                }
                                                else {
                                                    window.location.href = response.urlRedirect;
                                                }
                                            }
                                            else {
                                                if (response.urlBoleto != "") {
                                                    window.location.href = "Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                                                    //window.location.href = "Success?orderId=" + response.idPedido;
                                                }
                                                else {
                                                    if (response.msg != "") {
                                                        window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                                                    }
                                                    else {
                                                        window.location.href = "Success?orderId=" + response.idPedido;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                                            swal({
                                                title: '',
                                                html: response.errorMsg,
                                                type: 'warning',
                                                showCancelButton: false,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'OK'
                                            }).then(function () {
                                                if (response.urlRedirect !== "")
                                                    window.location.href = response.urlRedirect;
                                            });
                                        }
                                        else {
                                            window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
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
                                    $(".loadingCheckout").remove();
                                }
                            });

                        });
                    } else {
                        swal({
                            title: '',
                            html: 'Falha ao atualizar o valor do pedido no PayPal.',
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            });
        }
    }

    return false;
}
export function PayPalCheckoutTransparent() {

    if ($('#paypal-cc-form').length > 0) {
        $('#continueButton').hide();
        $("#installmentCheckoutTransparent").html("<option>Aguarde carregando.</option>");

        $.ajax({
            method: "POST",
            url: "LoadInstallment",
            data: {
                idPaymentBrand: 311,
                idPaymentMethod: 23,
                numberCard: "",
                value: ""
            },
            success: function (response) {
                var objParcelamento = 0;
                if (response.ListInstallment != null && response.ListInstallment != "")
                    objParcelamento = response.ListInstallment;

                if (objParcelamento.length > 0) {
                    let _hasInterest = false;
                    let _installmentTotal = 0;
                    let option = "<option value='0'>Selecione o parcelamento</option>";
                    for (let i = 0; i < objParcelamento.length; i++) {
                        let IdInstallment = objParcelamento[i].IdInstallment;
                        let InstallmentNumber = objParcelamento[i].InstallmentNumber;
                        let InstallmentValue = objParcelamento[i].Value;
                        let InstallmentTotal = objParcelamento[i].Total;
                        let Description = objParcelamento[i].Description;
                        let Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                        if (i === 0)
                            _installmentTotal = InstallmentTotal;

                        if (Description !== "Sem Juros")
                            _hasInterest = true;

                        option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "' data-InstallmentValue='" + InstallmentValue + "' data-InstallmentTotal='" + InstallmentTotal + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";

                    }
                    if (_hasInterest === true) {
                        $("#installmentCheckoutTransparent").html(option);
                        $("#installmentCheckoutTransparent").unbind().change(function () {
                            if ($(this).val() !== "0") {

                                $('#paypal-cc-form').removeAttr("style").empty().append('<div class="ui active inverted dimmer padding top bottom large loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

                                $.ajax({
                                    method: 'POST',
                                    url: '/Checkout/PayPalCreateOrderCheckoutTransparent',
                                    data: {
                                        IdAddress: $('#idAddress').val(),
                                        InstallmentTotal: $("#installmentCheckoutTransparent option:selected").attr("data-InstallmentTotal")
                                    },
                                    success: function (response) {

                                        if (response.success === true) {

                                            let order = response.order;
                                            let customer = response.customer;

                                            let approval_url = "";
                                            if (order.links.length > 0) {
                                                for (var key in order.links) {
                                                    if (order.links[key].rel === "approval_url") {
                                                        approval_url = order.links[key].href;
                                                    }
                                                }
                                            }

                                            $('#PaymentIdPayPalCheckoutTransparent').val(order.id);

                                            let _customerFirstName = customer.Name;
                                            let _customerLastName = "";
                                            _customerFirstName = _customerFirstName.trim();
                                            let arrCustomerName = _customerFirstName.split(' ');
                                            if (arrCustomerName.length > 1) {
                                                _customerFirstName = arrCustomerName[0];
                                                _customerLastName = arrCustomerName[arrCustomerName.length - 1];
                                            }
                                            let _customerPhone = customer.Phone.Phone1;
                                            let _customerTaxId = customer.Cpf_cnpj;
                                            let _customerEmail = customer.Email;
                                            let _oneclick = response.oneclick.replace(/\"/g, '');

                                            let objPayPal = {
                                                "approvalUrl": approval_url,
                                                "placeholder": "paypal-cc-form",
                                                "mode": $('#EnvPayPalCheckoutTransparent').val(),
                                                "payerFirstName": _customerFirstName,
                                                "payerLastName": _customerLastName,
                                                "payerEmail": _customerEmail,
                                                "payerPhone": _customerPhone,
                                                "payerTaxId": _customerTaxId,
                                                "payerTaxIdType": "BR_CPF",
                                                "language": "pt_BR",
                                                "country": "BR",
                                                "disableContinue": "continueButton",
                                                "enableContinue": "continueButton",
                                                "merchantInstallmentSelectionOptional": false,
                                                "merchantInstallmentSelection": $("#installmentCheckoutTransparent option:selected").attr("data-InstallmentNumber"),
                                                "rememberedCards": _oneclick
                                            };

                                            //console.log(objPayPal);

                                            ppp = PAYPAL.apps.PPP(objPayPal);
                                            //ppp.setIframeHeight(500);
                                            $('#continueButton').show().unbind().click(function () {
                                                ppp.doContinue();
                                                $("#installmentCheckoutTransparent").attr('disabled', true);
                                                return false;
                                            });
                                        } else {
                                            swal({
                                                title: '',
                                                html: "Falha ao gerar formulário do PayPal",
                                                type: 'warning',
                                                showCancelButton: false,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'OK'
                                            });
                                        }
                                    },
                                    error: function () {
                                        swal({
                                            title: '',
                                            html: "Falha ao gerar pré pedido no PayPal",
                                            type: 'warning',
                                            showCancelButton: false,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'OK'
                                        });
                                    },
                                    complete: function () {

                                    }
                                });
                            }
                            else {
                                $('#continueButton').hide();
                                $('#paypal-cc-form').empty();
                            }
                            return false;
                        });
                    }
                    else {
                        $("#installmentCheckoutTransparent").hide();
                        $('#paypal-cc-form').removeAttr("style").empty().append('<div class="ui active inverted dimmer padding top bottom large loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');
                        $.ajax({
                            method: 'POST',
                            url: '/Checkout/PayPalCreateOrderCheckoutTransparent',
                            data: {
                                IdAddress: $('#idAddress').val(),
                                InstallmentTotal: _installmentTotal
                            },
                            success: function (response) {

                                if (response.success === true) {

                                    let order = response.order;
                                    let customer = response.customer;

                                    let approval_url = "";
                                    if (order.links.length > 0) {
                                        for (var key in order.links) {
                                            if (order.links[key].rel === "approval_url") {
                                                approval_url = order.links[key].href;
                                            }
                                        }
                                    }

                                    $('#PaymentIdPayPalCheckoutTransparent').val(order.id);

                                    let _customerFirstName = customer.Name;
                                    let _customerLastName = "";
                                    let arrCustomerName = _customerFirstName.trim().split(' ');
                                    if (arrCustomerName.length > 1) {
                                        _customerFirstName = arrCustomerName[0];
                                        _customerLastName = arrCustomerName[arrCustomerName.length - 1];
                                    }
                                    let _customerPhone = customer.Phone.Phone1;
                                    let _customerTaxId = customer.Cpf_cnpj;
                                    let _customerEmail = customer.Email;
                                    let _oneclick = response.oneclick.replace(/\"/g, '');

                                    let objPayPal = {
                                        "approvalUrl": approval_url,
                                        "placeholder": "paypal-cc-form",
                                        "mode": $('#EnvPayPalCheckoutTransparent').val(),
                                        "payerFirstName": _customerFirstName,
                                        "payerLastName": _customerLastName,
                                        "payerEmail": _customerEmail,
                                        "payerPhone": _customerPhone,
                                        "payerTaxId": _customerTaxId,
                                        "payerTaxIdType": "BR_CPF",
                                        "language": "pt_BR",
                                        "country": "BR",
                                        "disableContinue": "continueButton",
                                        "enableContinue": "continueButton",
                                        "merchantInstallmentSelectionOptional": true,
                                        //"merchantInstallmentSelection": $("#installmentCheckoutTransparent option:selected").attr("data-InstallmentNumber"),
                                        "rememberedCards": _oneclick
                                    };

                                    //console.log(objPayPal);

                                    ppp = PAYPAL.apps.PPP(objPayPal);
                                    //ppp.setIframeHeight(500);
                                    $('#continueButton').show().unbind().click(function () {
                                        ppp.doContinue();
                                        $("#installmentCheckoutTransparent").attr('disabled', true);
                                        return false;
                                    });
                                } else {
                                    swal({
                                        title: '',
                                        html: "Falha ao gerar formulário do PayPal",
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    });

                                    $('#continueButton').hide();
                                    $('#paypal-cc-form').empty();
                                }
                            },
                            error: function () {
                                swal({
                                    title: '',
                                    html: "Falha ao gerar pré pedido no PayPal",
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                });

                                $('#continueButton').hide();
                                $('#paypal-cc-form').empty();
                            },
                            complete: function () {

                            }
                        });
                    }
                }
            }
        });
    }

    return false;
}

function messageListener(event) {
    try {
        //this is how we extract the message from the incoming events, data format should look like {"action":"inlineCheckout","checkoutSession":"error","result":"missing data in the credit card form"}
        let message = JSON.parse(event.data);

        if (typeof message.cause !== 'undefined') { //iFrame error handling

            let ppplusError = message.cause.replace(/['"]+/g, ""); //log & attach this error into the order if possible

            // <<Insert Code Here>>

            switch (ppplusError) {

                case "INTERNAL_SERVICE_ERROR": //javascript fallthrough
                case "SOCKET_HANG_UP": //javascript fallthrough
                case "socket hang up": //javascript fallthrough
                case "connect ECONNREFUSED": //javascript fallthrough
                case "connect ETIMEDOUT": //javascript fallthrough
                case "UNKNOWN_INTERNAL_ERROR": //javascript fallthrough
                case "fiWalletLifecycle_unknown_error": //javascript fallthrough
                case "Failed to decrypt term info": //javascript fallthrough
                case "RESOURCE_NOT_FOUND": //javascript fallthrough
                case "INTERNAL_SERVER_ERROR":
                    swal({
                        title: '',
                        html: "Ocorreu um erro inesperado, por favor tente novamente. (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });

                    //Generic error, inform the customer to try again; generate a new approval_url and reload the iFrame.
                    // <<Insert Code Here>>
                    break;

                case "RISK_N_DECLINE": //javascript fallthrough
                case "NO_VALID_FUNDING_SOURCE_OR_RISK_REFUSED": //javascript fallthrough
                case "TRY_ANOTHER_CARD": //javascript fallthrough
                case "NO_VALID_FUNDING_INSTRUMENT":
                    swal({
                        title: '',
                        html: "Seu pagamento não foi aprovado. Por favor utilize outro cartão, caso o problema persista entre em contato com o PayPal (0800-047-4482). (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });
                    //Risk denial, inform the customer to try again; generate a new approval_url and reload the iFrame.
                    // <<Insert Code Here>>
                    break;

                case "CARD_ATTEMPT_INVALID":
                    swal({
                        title: '',
                        html: "Ocorreu um erro inesperado, por favor tente novamente. (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });
                    //03 maximum payment attempts with error, inform the customer to try again; generate a new approval_url and reload the iFrame.
                    // <<Insert Code Here>>
                    break;

                case "INVALID_OR_EXPIRED_TOKEN":
                    swal({
                        title: '',
                        html: "A sua sessão expirou, por favor tente novamente. (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });
                    //User session is expired, inform the customer to try again; generate a new approval_url and reload the iFrame.
                    // <<Insert Code Here>>
                    break;

                case "CHECK_ENTRY":
                    swal({
                        title: '',
                        html: "Por favor revise os dados de Cartão de Crédito inseridos. (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });
                    //Missing or invalid credit card information, inform your customer to check the inputs.
                    // <<Insert Code Here>>
                    break;

                default:  //unknown error & reload payment flow
                    swal({
                        title: '',
                        html: "Ocorreu um erro inesperado, por favor tente novamente. (" + ppplusError + ")",
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        PayPalCheckoutTransparent();
                    });
                    //Generic error, inform the customer to try again; generate a new approval_url and reload the iFrame.
                    // <<Insert Code Here>>
            }

        }
        //insert logic here to handle success events or errors, if any
        if (message.action === 'checkout') {
            if (message.result.state.toLowerCase() === "approved") {
                var idCustomer = $("#idCustomer").val();
                var idAddress = $("#idAddress").val();
                var presente = $("#presente").val();
                var mensagem = $("#mensagem").val();
                var idPaymentBrand = $("#IdPaymentBrandPayPalCheckoutTransparent").val();
                var shippingMode = "";
                if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");
                var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
                var deliveryTime = null;
                var usefulDay = null;
                if ($('input[name=radio]:checked').length > 0) {
                    deliveryTime = $('input[name=radio]:checked').data('deliverytime');
                    usefulDay = (($('input[name=radio]:checked').data('usefullday') === "1") ? true : false);
                }


                var payPalRememberedCard = message.result.rememberedCards; //save on user BD record
                var payPalPayerId = message.result.payer.payer_info.payer_id; //use it on executePayment API
                var payPalOrderId = message.result.id;
                var payPalPaymentId = $('#PaymentIdPayPalCheckoutTransparent').val();
                var idInstallment = 0;
                var installmentNumber = 0;
                var installmentValue = 0;
                var installmentTotal = 0;

                if ($('#installmentCheckoutTransparent').is(':visible') === true) {

                    idInstallment = $('#installmentCheckoutTransparent').val();
                    installmentNumber = $('#installmentCheckoutTransparent option:selected').attr('data-InstallmentNumber');
                    installmentValue = $('#installmentCheckoutTransparent option:selected').attr('data-InstallmentValue');
                    installmentTotal = $('#installmentCheckoutTransparent option:selected').attr('data-InstallmentTotal');

                    if (parseInt(installmentNumber, 10) > 1) {
                        if (typeof (message.result.term) !== "undefined") {

                            if (parseInt(installmentNumber, 10) !== parseInt(message.result.term.term, 10)) {
                                swal({
                                    title: '',
                                    html: "O número de parcelas do PayPal é diferente do escolhido na loja, entre em contato com a Loja.",
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    $("#installmentCheckoutTransparent").removeAttr('disabled');
                                    window.location.reload(true);
                                });

                                return false;
                            }
                        } else {
                            swal({
                                title: '',
                                html: "O número de parcelas do PayPal é diferente do escolhido na loja, entre em contato com a Loja.",
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            }).then(function () {
                                $("#installmentCheckoutTransparent").removeAttr('disabled');
                                window.location.reload(true);
                            });

                            return false;
                        }
                    }

                    if (typeof (message.result.term) !== "undefined" && installmentNumber === "1") {
                        installmentValue = message.result.term.monthly_payment.value;
                        installmentTotal = message.result.term.monthly_payment.value;
                    }
                }
                else {
                    if (typeof (message.result.term) !== "undefined") {
                        installmentNumber = message.result.term.term;
                        installmentValue = message.result.term.monthly_payment.value;
                        installmentTotal = message.result.payer.funding_option.funding_sources[0].amount.value;
                    }
                    else {
                        installmentNumber = 1;
                        installmentValue = message.result.payer.funding_option.funding_sources[0].amount.value;
                        installmentTotal = message.result.payer.funding_option.funding_sources[0].amount.value;
                    }
                }

                

                //var installmentNumber = 1;
                //var installmentValue = '';
                //var installmentTotal = message.result.payer.funding_option.funding_sources[0].amount.value;

                //if (typeof (message.result.term) !== 'undefined') {
                //    installmentNumber = message.result.term.term;
                //    installmentValue = message.result.term.monthly_payment.value;
                //} else {
                //    installmentNumber = 1;
                //    installmentValue = message.result.payer.funding_option.funding_sources[0].amount.value;
                //}

                $("body").prepend('<div class="ui active dimmer loadingCheckout" style="position: fixed;"><div class="ui text loader">Aguarde</div></div>');

                $.ajax({
                    method: 'POST',
                    url: '/Checkout/GerarPedidoCompleto',
                    data: {
                        idCustomer: idCustomer,
                        idAddress: idAddress,
                        presente: presente,
                        mensagem: mensagem,
                        idPaymentBrand: idPaymentBrand,
                        shippingMode: shippingMode,
                        googleResponse: googleResponse,
                        deliveryTime: deliveryTime,
                        usefulDay: usefulDay,
                        kind: "CheckoutTransparent",
                        idInstallment: idInstallment,
                        installmentNumber: installmentNumber,
                        installmentValue: installmentValue,
                        installmentTotal: installmentTotal,
                        payPalPaymentId: payPalPaymentId,
                        payPalPayerId: payPalPayerId,
                        payPalOrderId: payPalOrderId,
                        payPalRememberedCard: payPalRememberedCard
                    },
                    success: function (response) {
                        $("#installmentCheckoutTransparent").removeAttr('disabled');
                        if (response.success === true) {
                            if (response.errorMsg != "") {
                                swal({
                                    title: '',
                                    html: response.errorMsg,
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                });
                            }
                            else {
                                if (response.urlRedirect != "") {
                                    if (response.typeRedirect == "1") {
                                        window.location.href = "Success?orderId=" + response.idPedido + "&d=" + response.urlRedirect;
                                    }
                                    else {
                                        window.location.href = response.urlRedirect;
                                    }
                                }
                                else {
                                    if (response.urlBoleto != "") {
                                        window.location.href = "Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                                        //window.location.href = "Success?orderId=" + response.idPedido;
                                    }
                                    else {
                                        if (response.msg != "") {
                                            window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                                        }
                                        else {
                                            window.location.href = "Success?orderId=" + response.idPedido;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                                swal({
                                    title: '',
                                    html: response.errorMsg,
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    if (response.urlRedirect !== "")
                                        window.location.href = response.urlRedirect;
                                });
                            }
                            else {
                                window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
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
                        $(".loadingCheckout").remove();
                    }
                });
            }
        }
    }
    catch (exc) { }
}

$(document).ready(function () {

    PayPalCheckout();
    PayPalCheckoutInCart2();

    window.onload = function () {

        $(".blocoTypePayment").on("click", function () {
            $(".contentPayment").hide()
            $(".contentPayment", this).show()
        })

        if ($("#formas-pagamento").length) {


            // Register postMessage Listener for the iframe. 
            if (window.addEventListener) {
                window.addEventListener("message", messageListener, false);
                //console.log("addEventListener successful", "debug");
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", messageListener);
                //console.log("attachEvent successful", "debug");
            } else {
                //console.log("Could not attach message listener", "debug");
                throw new Error("Can't attach message listener");
            }
        }


    }();
    
});