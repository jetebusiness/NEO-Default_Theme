import { _alert, _confirm } from '../../functions/message';
import { buscaCep } from '../../api/customer/AddressManager';
import { isLoading } from "../../api/api_config";
import { generateRecaptcha } from "../../ui/modules/recaptcha";
import { CompraRecorrenteStorage } from "../../functions/recurringPurchase";
import { PayPalCheckoutTransparent, PayPalCheckoutInCart, PayPalCheckoutReference } from "../../ui/modules/paypal";
import { createModelExhausted } from './mini_cart'
import { buscaCepCD, changeCdCheckout, changeCd } from "../../ui/modules/multiCd";
import { bpmpi_load, bpmpi_environment, bpmpi_unload } from "../../vendors/braspag-3ds20";

import { isMobile } from "../../functions/mobile";
import swal from 'sweetalert2';

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

function SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub, valorFrete, correiosEntregaNome) {
    $.ajax({
        method: "POST",
        url: "SaveFrete",
        data: {
            zipCode: zipcode,
            idShippingMode: new Number(idFrete),
            deliveredByTheCorreiosService: ((correiosEntrega) ? correiosEntrega.toLowerCase() : ""),
            deliveryShipping: entregaAgendada,
            valueAddShipping: valorSomaFrete,
            dateSelected: data_selecionada,
            periodSelected: data_periodo_selecionada,
            IdScheduled: idEntrega,
            IdScheduledPeriod: idPeriodoEntrega,
            carrier: carrier,
            mode: mode,
            hub: hub,
            valueShipping: valorFrete,
            correiosEntregaNome: correiosEntregaNome
        },
        success: function (response) {
            if (response.success) {

                if (valorFrete === "0,0" || valorFrete === "0") {
                    $.ajax({
                        method: "GET",
                        url: "/Checkout/UpdateValueCart",
                        async: false,
                        success: function (responseUpdateValueCard) {

                        }
                    });
                }


                if($('#ShoppingVoucherValue').length > 0) {
                    var shoppingVoucherValue = Number($('#ShoppingVoucherValue').val().replace(".", "").replace(",", "."));

                    /*** Verificar se habilita forma de pagamento vale compra ***/
                    var subTotal = Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
                    var discount = Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", ".").replace("&nbsp;", ""));
                    var shipping = Number(valorFrete.toString().replace('R$', '').replace(".", "").replace(",", "."));

                    var valorCompare = (subTotal - discount + shipping).toFixed(2);

                    if (shoppingVoucherValue.toFixed(2) === valorCompare) {
                        $('#btnGerarPedidoValeCompra').removeClass("hideme");
                        $('#formas-pagamento').addClass("disable_column");
                    } else {
                        $('#btnGerarPedidoValeCompra').addClass("hideme");
                        $('#formas-pagamento').removeClass("disable_column");
                    }
                }

                var _codigoBandeira = $("#idBrandCard").val();
                if (_codigoBandeira !== undefined) {
                    var _parcela = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                    var _parcela_selecionada = _parcela != undefined ? _parcela : "1";
                    if (_codigoBandeira != "" && _parcela_selecionada != "") {
                        if ($('#hasPagSeguro').val() == "1" || $('#hasPagSeguroApp').val() == "1" || $('#hasMercadoPago').val() == "1") {
                            $('#parcCard').empty().append("<option value='0'>Informe o numero do cartão primeiro</option>");
                            $('#CreditCard,#DebitCard').val('');
                            $("#idBrandCard").val('');
                        }
                    }
                }

                atualizaResumoCarrinho();
                //------------------------------------
                if ($('.ui.toggle.checkbox.box-card').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-card').trigger('click');
                }
                if ($('.ui.toggle.checkbox.box-debit').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-debit').trigger('click');
                }
            }
            else {
                _alert("", response.msg, "warning");
                HabilitaBlocoPagamento(false);
                isLoading("#resumoCheckout");
                //location.reload(true);
            }

        }
    });
}

function BuscaFreteEntregaAgendada(zipcode, idFrete, correiosEntrega, entregaAgendada) {
    //console.log("abrindo");
    //isLoading(".ui.accordion.frete");
    $.ajax({
        method: "POST",
        url: "EntregaAgendada",
        data: {
            idShippingMode: new Number(idFrete)
        },
        success: function (response) {
            var DataAgendadas = JSON.parse(response.msg);

            //$(".agendar").hide("slow");
            $("#json_dataagendada_" + idFrete).val(response.msg);

            if (DataAgendadas[0].listScheduled === null) {
                $(".agendar").hide("slow");
                _alert("", "Nao existem mais entregas disponíveis para essa data!", "warning");
            }
            else {
                //$("#dateAgendada_" + idFrete).show("slow");
                DataPickerEntregaAgendada(response.msg, idFrete);
            }

            //console.log("fechando");
            //SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, dataEntregaAgenda, periodoEntregaAgendada, valorEntregaAgendada);
            //SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada);
            //isLoading(".ui.accordion.frete");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            //console.log("fechando com erro");
            //isLoading(".ui.accordion.frete");
        }
    })
}

function DataPickerEntregaAgendada(msg, idFrete) {
    var optionData = "";
    if (msg != "" && msg != "[]") {
        availableDates = [];
        var DataAgendadas = JSON.parse(msg);
        if (DataAgendadas[0].listScheduled != null) {
            for (var i = 0; i < DataAgendadas[0].listScheduled.length; i++) {
                if (DataAgendadas[0].listScheduled[i].listScheduledPeriodo != null)
                    availableDates.push(DataAgendadas[0].listScheduled[i].date.substr(5, 2) + "-" + DataAgendadas[0].listScheduled[i].date.substr(8, 2) + "-" + DataAgendadas[0].listScheduled[i].date.substr(0, 4));
                //optionData = optionData + "<option data-id-frete = '"+idFrete+"' value=" +  DataAgendadas[0].listScheduled[i].date.substr(8,2)+"-"+DataAgendadas[0].listScheduled[i].date.substr(5,2)+"-"+DataAgendadas[0].listScheduled[i].date.substr(0,4) + ">" + DataAgendadas[0].listScheduled[i].dayName + " - " + DataAgendadas[0].listScheduled[i].date.substr(8,2)+"/"+DataAgendadas[0].listScheduled[i].date.substr(5,2)+"/"+DataAgendadas[0].listScheduled[i].date.substr(0,4) + " </option>";
            }

            //availableDates = ['2018-04-25'];
            $("#dateAgendada_" + idFrete).show("slow");
            if (availableDates.length == 0) {
                $(".agendar").hide();
                $("#dateAgendada_" + idFrete).hide();
                _alert("", "Não existem mais entregas disponíveis para esse frete!", "warning");
            }
            else {
                initComponent(availableDates, idFrete);
            }
        }
    }
}

function initComponent(availableDates, idFrete) {
    //availableDates = ['01-25-2018','01-27-2018','01-22-2018'];
    $('.date').datepicker("destroy");
    $("#dateAgendada_" + idFrete).datepicker({
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
        dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        dateFormat: 'dd/mm/yy',
        minDate: new Date(availableDates[0]),
        maxDate: new Date(availableDates[availableDates.length - 1]),
        beforeShowDay: function (d) {
            var dmy = (d.getMonth() + 1)
            if (d.getMonth() < 9)
                dmy = "0" + dmy;
            dmy += "-";

            if (d.getDate() < 10) dmy += "0";
            dmy += d.getDate() + "-" + d.getFullYear();

            if ($.inArray(dmy, availableDates) != -1) {
                return [true, "", "Available"];
            } else {
                return [false, "", "unAvailable"];
            }
        },
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
    });
    //$(".date").datepicker({ minDate: 10, maxDate: "+1M" });

    if ($('#PaymentLinkChangeBrand').length > 0) {
        if ($('#PaymentLinkChangeBrand').val() == "1") {
            $("#dateAgendada_" + idFrete).trigger("change");
        }
    }
}

var useAntiFraudMaxiPago = false;

function GerarPedidoCompleto(
    idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick,
    saveCardOneClick, userAgent, hasScheduledDelivery, paymentSession, paymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken,
    googleResponse, deliveryTime, usefulDay, SelectedRecurrentTime, labelOneClick, typeDocument, has3DS20, cavv3DS20, xid3DS20, eci3DS20, version3DS20, referenceId3DS20
) {
    if ($("#PaymentLinkChangeBrand").val() == undefined || $("#PaymentLinkChangeBrand").val() == "0") {
        var stop = false;
        stop = ValidCart(stop);

        if (stop) return;
    }

    $.ajax({
        method: "POST",
        url: "GerarPedidoCompleto",
        data: {
            idCustomer: idCustomer,
            idAddress: new Number(idAddress),
            presente: presente,
            mensagem: mensagem,
            idInstallment: idInstallment,
            idPaymentBrand: new Number(idPaymentBrand),
            card: card,
            nameCard: nameCard,
            expDateCard: expDateCard,
            cvvCard: cvvCard,
            brandCard: brandCard,
            installmentNumber: new Number(installmentNumber),
            kind: kind,
            document: document,
            idOneClick: idOneClick,
            saveCardOneClick: saveCardOneClick,
            userAgent: userAgent,
            hasScheduledDelivery: hasScheduledDelivery,
            paymentSession: paymentSession,
            paymentHash: paymentHash,
            shippingMode: shippingMode,
            dateOfBirth: dateOfBirth,
            phone: phone,
            installmentValue: installmentValue,
            installmentTotal: installmentTotal,
            cardToken: cardToken,
            googleResponse: googleResponse,
            deliveryTime: deliveryTime,
            usefulDay: usefulDay,
            SelectedRecurrentTime: SelectedRecurrentTime,
            labelOneClick: labelOneClick,
            typeDocument: typeDocument,
            has3DS20: has3DS20,
            cavv3DS20: cavv3DS20,
            xid3DS20: xid3DS20,
            eci3DS20: eci3DS20,
            version3DS20: version3DS20,
            referenceId3DS20: referenceId3DS20
        },
        success: function (response) {
            if (response.success === true) {
                if (response.errorMsg != "") {
                    _alert("", response.errorMsg, "warning");
                    $(".GerarPedido").removeClass("loading");
                    $(".GerarPedido").removeClass("disabled");
                }
                else {
                    CompraRecorrenteStorage.cleanStorage();
                    if (response.urlRedirect != "") {
                        if (response.typeRedirect == "1") {
                            window.location.href = "/Checkout/Success?orderId=" + response.idPedido + "&d=" + response.urlRedirect;
                        } else {
                            window.location.href = response.urlRedirect;
                        }
                    } else {
                        if (response.urlBoleto != "") {
                            window.location.href = "/Checkout/Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                            //window.location.href = "Success?orderId=" + response.idPedido;
                        }
                        else if (response.paymentLink != "") {
                            window.location.href = "/Checkout/Success?orderId=" + response.idPedido + "&l=" + response.paymentLink;
                        } else {
                            if (response.msg != "") {
                                window.location.href = "/Checkout/Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                            }
                            else {
                                window.location.href = "/Checkout/Success?orderId=" + response.idPedido;
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
                        if (has3DS20 == "true") {
                            bpmpi_unload();
                        }

                        if (response.urlRedirect !== "")
                            window.location.href = response.urlRedirect;
                    });

                    $(".GerarPedido").removeClass("loading");
                    $(".GerarPedido").removeClass("disabled");
                }
                else {
                    window.location.href = "/Checkout/Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                }
            }
        },
        complete: function() {
            if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                if($("[id^=googleVersion_]").eq(0).val() === "2") {
                    grecaptcha.reset()
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), "body");
                }
            }
        }
    });
}

function GetStatusAntiFraudMaxiPago() {
    $.ajax({
        method: "GET",
        url: "/Checkout/GetStatusAntiFraudMaxiPago",
        async: false,
        success: function (response) {
            useAntiFraudMaxiPago = response.active
        },
        error: function (response) {
            _alert("", response, "warning");
            useAntiFraudMaxiPago = false
        }
    })
}

function LoadIframeAntiFraudMaxiPago(idCustomer, idInstallment, idPaymentBrand, idAddress, mensagem) {
    $.ajax({
        method: "POST",
        url: "/Checkout/LoadIframeAntiFraudMaxiPago",
        data: {
            idCustomer: idCustomer,
            idInstallment: idInstallment,
            idPaymentBrand: idPaymentBrand,
            idAddress: idAddress,
            _msgPedido: mensagem
        },
        async: false,
        success: function (response) {
            $("body").append(response.iframe)
        },
        error: function (response) {
            _alert("", response, "warning");
        }
    })
}

function clickShipping() {

    var zipcode = $("#zipcode").val();
    var valorFrete = "";
    var valorAdicional = "";
    var idFrete = "";
    var correiosEntrega = "";
    var carrier = "";
    var mode = "";
    var hub = "";
    var entregaAgendada = "";
    var exclusivaEntregaAgendada = "";
    var correiosEntregaNome = "";

    $("#GetShippping .card").click(function () {

        if ($("#installmentCheckoutTransparent").length) {
            $("#installmentCheckoutTransparent > option").remove();
            $("#installmentCheckoutTransparent").append('<option value="0">Aguarde carregando.</option>');
        }

        if($("#paypal-cc-form").length)
            $("#paypal-cc-form").empty();

        if($("#paypal-button-reference").length)
            $("#paypal-button-reference").empty();

        //ValeCompraRemover();
        $("#GetShippping .card, #GetShippping .card .checkbox").removeClass("checked")
        $(this).addClass("checked").find(".checkbox").addClass("checked")

        $(".card:not(.checked) .agendar", "#GetShippping").hide("slow");
        $(".card:not(.checked) .hasDatepicker", "#GetShippping").datepicker('setDate', null);


        var ponteiroCurrent = $(".shippingGet", this);
        $(".shippingGet").attr("checked", false);
        $(ponteiroCurrent).attr("checked", true);

        valorFrete = $(ponteiroCurrent).attr("data-value");
        valorAdicional = $(ponteiroCurrent).data("addvalue");
        idFrete = $(ponteiroCurrent).attr("data-id");
        correiosEntrega = $(ponteiroCurrent).attr("data-correios");
        correiosEntregaNome = $(ponteiroCurrent).attr("data-correios-name");
        carrier = $(ponteiroCurrent).data("carrier");
        mode = $(ponteiroCurrent).data("mode");
        hub = $(ponteiroCurrent).data("hub");

        entregaAgendada = $(ponteiroCurrent).attr("data-entregaagendada");
        exclusivaEntregaAgendada = $(ponteiroCurrent).attr("data-exclusiva-entregaagendada");
        $("#checkoutColumn2").addClass("disable_column");


        if ((valorFrete != "") && (idFrete != "") && (correiosEntrega != "") && (zipcode != "")) {
            var dataperiodoentregaescolhida = null;
            var dataentregaescolhida = null;
            var idPeridoescolhido = null;

            if (exclusivaEntregaAgendada == "True") {
                if (($("#dateAgendada_" + idFrete).val() != "") && ($("#combo_dataperiodoagendada_" + idFrete).val() != "")) {
                    idPeridoescolhido = $("#combo_dataperiodoagendada_" + idFrete).val();
                    dataperiodoentregaescolhida = $("#combo_dataperiodoagendada_" + idFrete).val();
                    dataentregaescolhida = $("#dateAgendada_" + idFrete).val();
                    HabilitaBlocoPagamento(true);
                }
                else
                    HabilitaBlocoPagamento(false);
            }
            else
                HabilitaBlocoPagamento(true);

            disparaAjaxShipping(zipcode, idFrete, correiosEntrega, entregaAgendada, valorAdicional, dataperiodoentregaescolhida, dataentregaescolhida, idPeridoescolhido, carrier, mode, hub, valorFrete, correiosEntregaNome);
        }
    });
}

function disparaAjaxShipping(zipcode, idFrete, correiosEntrega, entregaAgendada, valorAdicional, dataperiodoentregaescolhida, dataentregaescolhida, idPeridoescolhido, carrier, mode, hub, valorFrete, correiosEntregaNome) {

    isLoading("#resumoCheckout")

    if (entregaAgendada == "True") {
        //isLoading(".ui.accordion.frete");
        BuscaFreteEntregaAgendada(zipcode, idFrete, correiosEntrega, entregaAgendada);
    }
    else
        SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorAdicional, dataperiodoentregaescolhida, dataentregaescolhida, idFrete, idPeridoescolhido, carrier, mode, hub, valorFrete, correiosEntregaNome);
}

function OrderCreateTwoCards(obj) {

    $(".GerarPedido").addClass("loading");
    $(".GerarPedido").addClass("disabled");

    var dt = new Date();
    var century = dt.getFullYear().toString().substring(0, 2);
    var msgErrors = "";

    var userAgent = navigator.userAgent;
    var kind = $(obj).prop("id") == "btnCardDebit" ? "debit" : "credit";
    var idCustomer = $("#idCustomer").val();
    var idAddress = $("#idAddress").val();
    var presente = $("#presente").val();
    var mensagem = $("#mensagem").val();
    var tipoVerificacao = $(obj).attr("data-card");
    var shippingMode = "";
    if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");

    var idFrete = $("#GetShippping .item .checkbox.checked input").val();
    var hasScheduledDelivery = $("#radio_" + idFrete).attr("data-entregaagendada");

    var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";

    var deliveryTime = null;
    var usefulDay = null;
    if ($('input[name=radio]:checked').length > 0) {
        deliveryTime = $('input[name=radio]:checked').data('deliverytime');
        usefulDay = (($('input[name=radio]:checked').data('usefullday') == "1") ? true : false);
    }

    var validaFrete = "";

    $("#GetShippping .item .description").each(function (index, value) {
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


    var idInstallment1 = 0;
    var installmentNumber1 = 0;
    var installmentValue1 = 0;
    var installmentTotal1 = 0;
    var idPaymentBrand1 = $(obj).prop("id") === "btnCardDebit" ? $('#debitIdBrandCard1').val() : $("#idBrandCard1").val();
    var card1 = $(obj).prop("id") === "btnCardDebit" ? $("#DebitCard1").val() : $("#CreditCard1").val();
    var nameCard1 = $(obj).prop("id") === "btnCardDebit" ? $("#DebitName1").val() : $("#Name1").val();
    var expDateCard1 = "";
    if ($("#DebitExpDate1").val() != null || $("#ExpDate1").val() != null) {
        var DebitExpDate1 = "";
        if ($("#DebitExpDate1").val() != undefined) {
            DebitExpDate1 = $("#DebitExpDate1").val();
        }

        var ExpDate1 = "";
        if ($("#ExpDate1").val() != undefined) {
            ExpDate1 = $("#ExpDate1").val();
        }

        expDateCard1 = $(obj).prop("id") == "btnCardDebit" ? DebitExpDate1.toString().replace("/", "/" + century) : ExpDate1.toString().replace("/", "/" + century);
        expDateCard1 = expDateCard1.replace(/\s/g, "");
    }
    var validaMes1 = expDateCard1 != "" && expDateCard1 !== undefined ? new Number(expDateCard1.split("/")[0]) : "";
    var validaAno1 = expDateCard1 != "" && expDateCard1 !== undefined ? new Number(((expDateCard1.split("/")[1].trim().length <= 2) ? century + expDateCard1.split("/")[1].trim() : expDateCard1.split("/")[1].trim())) : "";
    var cvvCard1 = $(obj).prop("id") == "btnCardDebit" ? $("#DebitCVV1").val() : $("#CVV1").val();
    var brandCard1 = $(obj).prop("id") == "btnCardDebit" ? $("#debitBrandCard1").val() : $("#brandCard1").val();
    var valor1 = $(obj).prop("id") == "btnCardDebit" ? $('#DebitValor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim() : $('#Valor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim();

    var idInstallment2 = 0;
    var installmentNumber2 = 0;
    var installmentValue2 = 0;
    var installmentTotal2 = 0;
    var idPaymentBrand2 = $(obj).prop("id") === "btnCardDebit" ? $('#debitIdBrandCard2').val() : $('#idBrandCard2').val();
    var card2 = $(obj).prop("id") === "btnCardDebit" ? $("#DebitCard2").val() : $("#CreditCard2").val();
    var nameCard2 = $(obj).prop("id") === "btnCardDebit" ? $("#DebitName2").val() : $("#Name2").val();
    var expDateCard2 = "";
    if ($("#DebitExpDate2").val() != null || $("#ExpDate2").val() != null) {
        var DebitExpDate2 = "";
        if ($("#DebitExpDate2").val() != undefined) {
            DebitExpDate2 = $("#DebitExpDate2").val();
        }

        var ExpDate2 = "";
        if ($("#ExpDate2").val() != undefined) {
            ExpDate2 = $("#ExpDate2").val();
        }

        expDateCard2 = $(obj).prop("id") == "btnCardDebit" ? DebitExpDate2.toString().replace("/", "/" + century) : ExpDate2.toString().replace("/", "/" + century);
        expDateCard2 = expDateCard2.replace(/\s/g, "");
    }
    var validaMes2 = expDateCard2 != "" && expDateCard2 !== undefined ? new Number(expDateCard2.split("/")[0]) : "";
    var validaAno2 = expDateCard2 != "" && expDateCard2 !== undefined ? new Number(((expDateCard2.split("/")[1].trim().length <= 2) ? century + expDateCard2.split("/")[1].trim() : expDateCard2.split("/")[1].trim())) : "";
    var cvvCard2 = $(obj).prop("id") == "btnCardDebit" ? $("#DebitCVV2").val() : $("#CVV2").val();
    var brandCard2 = $(obj).prop("id") == "btnCardDebit" ? $("#debitBrandCard2").val() : $("#brandCard2").val();
    var valor2 = $(obj).prop("id") == "btnCardDebit" ? $('#DebitValor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim() : $('#Valor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim();

    var discountInitial = new Number($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var discountShoppingVoucher = 0;
    if ($('#desconto_shopping_voucher').length > 0) {
        discountShoppingVoucher = new Number($('#desconto_shopping_voucher').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    }
    var shippingCheckout = new Number($('#shipping_checkout').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var subTotalCheckout = new Number($('.subtotal').html().replace('&nbsp;', '').replace('R$', '').replace(".", "").replace(",", "."));

    var totalCheckout = Number.parseFloat((subTotalCheckout + shippingCheckout) - (discountInitial + discountShoppingVoucher)).toFixed(2);

    if (tipoVerificacao == "S") {

        var dataCurrent = new Date();
        var anoCurrent = new Number(dataCurrent.getFullYear());
        var mesCurrent = new Number(dataCurrent.getMonth() + 1);

        idInstallment1 = $("#parcCard1").val();
        installmentNumber1 = $("#parcCard1").find(':selected').attr("data-InstallmentNumber");
        installmentValue1 = $("#parcCard1").find(':selected').attr("data-InstallmentValue");
        if (installmentValue1 == undefined) installmentValue1 = 0;
        //if($("#parcCard").find(':selected').hasAttr("data-InstallmentTotal"))
        installmentTotal1 = $("#parcCard1").find(':selected').attr("data-InstallmentTotal");
        if (installmentTotal1 == undefined) installmentTotal1 = 0;

        var msgErrorCard1 = "";

        if (validaMes1 > 12) {
            msgErrorCard1 += "<br />O campo Data de Validade está com o mês inválido!";
        }

        if (validaAno1 < anoCurrent) {
            msgErrorCard1 += "<br />O campo Data de Validade está com o ano inválido!";
        }
        else
        {
            if (validaAno1 == anoCurrent) {
                if (validaMes1 < mesCurrent) {
                    msgErrorCard1 += "<br />O campo Data de Validade está com o mês inválido!";
                }
            }
        }

        $("#validCardCredit .multi-card .card-1").find(".required").each(function () {
            var labelCurrent = $(".labelCheckPayment", this).text();
            var valorCurrent = $(".fieldCheckPayment", this).val();

            if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                msgErrorCard1 += "<br />O campo " + labelCurrent + " está inválido!";
            }
        });

        if (valor1 == "") valor1 = "0";
        var auxValue1 = new Number(valor1);

        if (auxValue1 <= shippingCheckout) {
            msgErrorCard1 += "<br />O campo valor deve ser maior que " + $('#shipping_checkout').html() + "!";
        }

        if (msgErrorCard1 != "") {
            msgErrors += "<h3>Cartão 1:</h3>" + msgErrorCard1;
        }

        idInstallment2 = $("#parcCard2").val();
        installmentNumber2 = $("#parcCard2").find(':selected').attr("data-InstallmentNumber");
        installmentValue2 = $("#parcCard2").find(':selected').attr("data-InstallmentValue");
        if (installmentValue2 == undefined) installmentValue2 = 0;
        //if($("#parcCard").find(':selected').hasAttr("data-InstallmentTotal"))
        installmentTotal2 = $("#parcCard2").find(':selected').attr("data-InstallmentTotal");
        if (installmentTotal2 == undefined) installmentTotal2 = 0;

        var msgErrorCard2 = "";
        if (validaMes2 > 12) {
            msgErrorCard2 += "<br />O campo Data de Validade está com o mês inválido!";
        }

        if (validaAno2 < anoCurrent) {
            msgErrorCard2 += "<br />O campo Data de Validade está com o ano inválido!";
        }
        else {
            if (validaAno2 == anoCurrent) {
                if (validaMes2 < mesCurrent) {
                    msgErrorCard2 += "<br />O campo Data de Validade está com o mês inválido!";
                }
            }
        }


        $("#validCardCredit .multi-card .card-2").find(".required").each(function () {
            var labelCurrent = $(".labelCheckPayment", this).text();
            var valorCurrent = $(".fieldCheckPayment", this).val();

            if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                msgErrorCard2 += "<br />O campo " + labelCurrent + " está inválido!";
            }
        });

        if (valor2 == "") valor2 = "0";
        var auxValue2 = new Number(valor2);

        if (auxValue2 <= shippingCheckout) {
            msgErrorCard2 += "<br />O campo valor deve ser maior que " + $('#shipping_checkout').html() + "!";
        }

        if (msgErrorCard2 != "") {
            msgErrors += "<h3>Cartão 2:</h3>" + msgErrorCard2;
        }

        var somaValores = Number.parseFloat(auxValue1 + auxValue2).toFixed(2);
        if (somaValores != totalCheckout) {
            msgErrors += "<br />A soma dos valores dos cartões é diferente do valor do pedido!";
        }
    }

    if (tipoVerificacao == "D") {
        var dataCurrent = new Date();
        var anoCurrent = new Number(dataCurrent.getFullYear());
        var mesCurrent = new Number(dataCurrent.getMonth() + 1);

        idInstallment1 = 0;
        installmentNumber1 = 0;

        var msgErrorCard1 = "";

        if (validaMes1 > 12) {
            msgErrorCard1 += "<br />O campo Data de Validade está com o mês inválido!";
        }

        if (validaAno1 < anoCurrent) {
            msgErrorCard1 += "<br />O campo Data de Validade está com o ano inválido!";
        }
        else {
            if (validaAno1 == anoCurrent) {
                if (validaMes1 < mesCurrent) {
                    msgErrorCard1 += "<br />O campo Data de Validade está com o mês inválido!";
                }
            }
        }

        $("#validCardDebit .multi-debit .debit-1").find(".required").each(function () {
            var labelCurrent = $(".labelCheckPayment", this).text();
            var valorCurrent = $(".fieldCheckPayment", this).val();

            if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                msgErrorCard1 += "<br />O campo " + labelCurrent + " está inválido!";
            }
        });

        if (valor1 == "") valor1 = "0";
        var auxValue1 = parseFloat(valor1);

        if (auxValue1 <= shippingCheckout) {
            msgErrorCard1 += "<br />O campo valor deve ser maior que " + $('#shipping_checkout').html() + "!";
        }

        if (msgErrorCard1 != "") {
            msgErrors += "<h3>Cartão 1:</h3>" + msgErrorCard1;
        }

        idInstallment2 = 0;
        installmentNumber2 = 0;

        var msgErrorCard2 = "";

        if (validaMes2 > 12) {
            msgErrorCard2 += "<br />O campo Data de Validade está com o mês inválido!";
        }

        if (validaAno2 < anoCurrent) {
            msgErrorCard2 += "<br />O campo Data de Validade está com o ano inválido!";
        }
        else {
            if (validaAno2 == anoCurrent) {
                if (validaMes2 < mesCurrent) {
                    msgErrorCard2 += "<br />O campo Data de Validade está com o mês inválido!";
                }
            }
        }

        $("#validCardDebit .multi-debit .debit-2").find(".required").each(function () {
            var labelCurrent = $(".labelCheckPayment", this).text();
            var valorCurrent = $(".fieldCheckPayment", this).val();

            if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                msgErrorCard2 += "<br />O campo " + labelCurrent + " está inválido!";
            }
        });

        if (valor2 == "") valor2 = "0";
        var auxValue2 = parseFloat(valor2);

        if (auxValue2 <= shippingCheckout) {
            msgErrorCard2 += "<br />O campo valor deve ser maior que " + $('#shipping_checkout').html() + "!";
        }

        if (msgErrorCard2 != "") {
            msgErrors += "<h3>Cartão 2:</h3>" + msgErrorCard2;
        }

        if ((auxValue1 + auxValue2) != totalCheckout) {
            msgErrors += "<br />A soma dos valores dos cartões é diferente do valor do pedido!";
        }
    }

    if (msgErrors != "") {
        swal({
            title: '',
            html: msgErrors,
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
        $(".GerarPedido").removeClass("loading");
        $(".GerarPedido").removeClass("disabled");
    }
    else {

        $.ajax({
            method: "POST",
            url: "GerarPedidoCompleto",
            data: {
                idCustomer: idCustomer,
                idAddress: new Number(idAddress),
                presente: presente,
                mensagem: mensagem,
                idInstallment: idInstallment1,
                idPaymentBrand: new Number(idPaymentBrand1),
                card: card1,
                nameCard: nameCard1,
                expDateCard: expDateCard1,
                cvvCard: cvvCard1,
                brandCard: brandCard1,
                installmentNumber: new Number(installmentNumber1),
                kind: kind,
                document: "",
                idOneClick: "",
                saveCardOneClick: "",
                userAgent: userAgent,
                hasScheduledDelivery: hasScheduledDelivery,
                paymentSession: "",
                paymentHash: "",
                shippingMode: shippingMode,
                dateOfBirth: "",
                phone: "",
                installmentValue: installmentValue1,
                installmentTotal: installmentTotal1,
                cardToken: "",
                googleResponse: googleResponse,
                deliveryTime: deliveryTime,
                usefulDay: usefulDay,
                twoCads: true,
                valueCard: valor1,
                idInstallment2: idInstallment2,
                idPaymentBrand2: new Number(idPaymentBrand2),
                card2: card2,
                nameCard2: nameCard2,
                expDateCard2: expDateCard2,
                cvvCard2: cvvCard2,
                brandCard2: brandCard2,
                installmentNumber2: new Number(installmentNumber2),
                valueCard2: valor2,
                installmentValue2: installmentValue2,
                installmentTotal2: installmentTotal2,
            },
            success: function (response) {
                if (response.success === true) {
                    if (response.errorMsg != "") {
                        _alert("", response.errorMsg, "warning");
                        $(".GerarPedido").removeClass("loading");
                        $(".GerarPedido").removeClass("disabled");
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
                else
                {
                    if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                        swal({
                            title: '',
                            html: response.errorMsg,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        }).then(function (result) {

                            if (response.urlRedirect !== "")
                                window.location.href = response.urlRedirect;
                        });


                        $(".GerarPedido").removeClass("loading");
                        $(".GerarPedido").removeClass("disabled");
                    }
                    else {
                        window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
                    }
                }
            },
            complete: function() {
                if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                    if($("[id^=googleVersion_]").eq(0).val() === "2") {
                        grecaptcha.reset()
                    } else {
                        generateRecaptcha($("[id^=googleModule]").val(), "body");
                    }
                }
            }
        });
    }
}

function OrderCreate() {
    $(".GerarPedido").click(function (event) {
        event.preventDefault();


        var $this = $(this);
        var tipoVerificacao = $this.attr("data-Card");

        $this.addClass("disabled");
        $this.addClass("loading");


        checkValidatePersonalization()


        if ((tipoVerificacao == "S" && $('#UseTwoCreditCards').is(':checked')) || (tipoVerificacao == "D" && $('#UseTwoDebitCards').is(':checked'))) {
            OrderCreateTwoCards($(this));
            return false;
        }

        var exhausted = false;

        $.when(
            $.ajax({
                method: "GET",
                url: "/Checkout/LoadProductsMiniCart",
                cache: false,
                success: function (loadProduct) {
                    if ($("#PaymentLinkChangeBrand").val() == undefined || $("#PaymentLinkChangeBrand").val() == "0") {
                        if (loadProduct) {
                            var retornoAjax = loadProduct.split("|$|");
                            var listaProdutos = retornoAjax[0];
                            $("#checkout_products_list").html(listaProdutos);
                            $(".item:not(.exhausted) .removeCartItem, " +
                                ".item:not(.exhausted) .description, " +
                                ".item.exhausted .avaibility", "#checkout_products_list").remove()

                            if ($(".exhausted", "#checkout_products_list").length > 0) {

                                createModelExhausted("#checkout_products_list");

                                exhausted = true;
                            }
                        }
                    }
                },
                complete: function () {
                    if (exhausted) {
                        $this.removeClass("disabled");
                        $this.removeClass("loading");
                    }
                }
            })
        ).then(function () {
            if (!exhausted) {
                if (!$this.hasClass("disabled")) $this.addClass("disabled");
                if (!$this.hasClass("loading")) $this.addClass("loading");

                var idCustomer = $("#idCustomer").val();
                var idAddress = $("#idAddress").val();
                var presente = $("#presente").val();
                var mensagem = $("#mensagem").val();
                var idInstallment = 0;
                var installmentNumber = 0;
                var installmentValue = 0;
                var installmentTotal = 0;
                var idPaymentBrand = "0";
                if (tipoVerificacao === "N") {
                    idPaymentBrand = $this.attr("data-idbrand");
                } else if (tipoVerificacao === "D") {
                    idPaymentBrand = $('#debitIdBrandCard').val();
                } else if (tipoVerificacao === "O") {
                    idPaymentBrand = $('#idBrandOneClick').val();
                } else {
                    idPaymentBrand = $('#idBrandCard').val();
                }
                var card = $this.prop("id") === "btnCardDebit" ? $("#DebitCard").val() : $("#CreditCard").val();
                var nameCard = $this.prop("id") === "btnCardDebit" ? $("#DebitName").val() : $("#Name").val();
                var dt = new Date();
                var century = dt.getFullYear().toString().substring(0, 2);
                var expDateCard = "";
                if ($("#DebitExpDate").val() !== undefined || $("#ExpDate").val() !== undefined) {
                    var DebitExpDate = "";
                    if ($("#DebitExpDate").val() !== undefined) {
                        DebitExpDate = $("#DebitExpDate").val();
                    }

                    var ExpDate = "";
                    if ($("#ExpDate").val() !== undefined) {
                        ExpDate = $("#ExpDate").val();
                    }

                    expDateCard = $this.prop("id") === "btnCardDebit" ? DebitExpDate.toString().replace("/", "/" + century) : ExpDate.toString().replace("/", "/" + century);
                    expDateCard = expDateCard.replace(/\s/g, "");
                }

                var validaMes = expDateCard !== "" && expDateCard !== undefined ? new Number(expDateCard.split("/")[0]) : "";
                var validaAno = expDateCard !== "" && expDateCard !== undefined ? new Number(((expDateCard.split("/")[1].trim().length <= 2) ? century + expDateCard.split("/")[1].trim() : expDateCard.split("/")[1].trim())) : "";

                var cvvCard = $("#CVV").val();
                var brandCard = $this.prop("id") === "btnCardDebit" ? $("#debitBrandCard").val() : $("#brandCard").val();
                var document = $("#Document").val();
                var kind = "credit";
                var idOneClick = $("#OneClick").val();
                var saveCardOneClick = $('#SaveCard').is(":checked");
                var labelOneClick = $('#Label').val();
                var userAgent = navigator.userAgent;
                var msgErrors = "";
                var PaymentSession = "";
                if ($('#PaymentSession').length > 0) PaymentSession = $('#PaymentSession').val();
                var PaymentHash = "";
                var dateOfBirth = $('#DateOfBirth').val();
                var phone = $('#Phone').val();
                var cardToken = "";
                var externalCode = $this.attr("data-externalcode");
                var shippingMode = "";
                if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");

                var idFrete = $("#GetShippping .card .checkbox.checked input").val();
                var hasScheduledDelivery = $("#radio_" + idFrete).attr("data-entregaagendada");

                var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
                var deliveryTime = null;
                var usefulDay = null;
                if ($('input[name=radio]:checked').length > 0) {
                    deliveryTime = $('input[name=radio]:checked').data('deliverytime');
                    usefulDay = (($('input[name=radio]:checked').data('usefullday') == "1") ? true : false);
                }
                var selectedRecurrentTime = $("#compraRecorrenteFrequencia").data('value');
                var emailCard = $('#emailCard').val();
                var typeDocument = "";
                var issuer = "";

                var validaFrete = "";
                var hasBraspag3DS20 = $('#hasBraspag3DS20').val();

                switch ($this.prop("id")) {
                    case "btnCardDebit":
                        kind = "debit";
                        cvvCard = $("#DebitCVV").val();
                        break;
                    case "btnOneClick":
                        kind = "oneclick";
                        cvvCard = $("#CVVOneClick").val();
                        break;
                    case "btnDebitRedirect":
                        kind = "debit";
                        break;
                    case "btnPix":
                        kind = "pix";
                        break;
                    default:
                        if ($this.data("card") == "N") {
                            kind = "boleto";
                        }
                        break;
                }

                $("#GetShippping .card").each(function (index, value) {
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

                if (tipoVerificacao === "S") {
                    if ($this.attr("data-gateway") === "pagseguro" || $this.attr("data-gateway") === "pagseguroapp") {
                        PaymentHash = PagSeguroDirectPayment.getSenderHash();
                    }

                    idInstallment = $("#parcCard").val();
                    installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                    installmentValue = $("#parcCard").find(':selected').attr("data-InstallmentValue");
                    if (installmentValue == undefined) installmentValue = 0;
                    //if($("#parcCard").find(':selected').hasAttr("data-InstallmentTotal"))
                    installmentTotal = $("#parcCard").find(':selected').attr("data-InstallmentTotal");
                    if (installmentTotal == undefined) installmentTotal = 0;

                    var dataCurrent = new Date();
                    var anoCurrent = new Number(dataCurrent.getFullYear());
                    var mesCurrent = new Number(dataCurrent.getMonth() + 1);

                    if (validaMes > 12) {
                        msgErrors += "<br />O campo Data de Validade está com o mês inválido!";
                    }

                    if (validaAno < anoCurrent) {
                        msgErrors += "<br />O campo Data de Validade está com o ano inválido!";
                    }
                    else {
                        if (validaAno == anoCurrent) {
                            if (validaMes < mesCurrent) {
                                msgErrors += "<br />O campo Data de Validade está com o mês inválido!";
                            }
                        }
                    }

                    $("#validCardCredit .one-card").find(".required").each(function () {
                        var labelCurrent = $(".labelCheckPayment", this).text();
                        var valorCurrent = $(".fieldCheckPayment", this).val();

                        if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                            msgErrors += "<br />O campo " + labelCurrent + " está inválido!";
                        }
                    });
                }

                if (tipoVerificacao === "O") {
                    idInstallment = $("#parcCardOneClick").val();
                    installmentNumber = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");

                    $("#validOneClick").find(".required").each(function () {
                        var labelCurrent = $(".labelCheckPayment", this).text();
                        var valorCurrent = $(".fieldCheckPayment", this).val();

                        if ((valorCurrent == "") || (valorCurrent.length < 3 && labelCurrent != "Cartões Salvos")) {
                            msgErrors += "<br />O campo " + labelCurrent + " está inválido!";
                        }
                    });
                }

                if (tipoVerificacao == "D") {
                    idInstallment = $("#parcCard").val();
                    installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");

                    var dataCurrent = new Date();
                    var anoCurrent = new Number(dataCurrent.getFullYear());
                    var mesCurrent = new Number(dataCurrent.getMonth() + 1);

                    if (validaMes > 12) {
                        msgErrors += "<br />O campo Data de Validade está com o mês inválido!";
                    }

                    if (validaAno < anoCurrent) {
                        msgErrors += "<br />O campo Data de Validade está com o ano inválido!";
                    }
                    else {
                        if (validaAno == anoCurrent) {
                            if (validaMes < mesCurrent) {
                                msgErrors += "<br />O campo Data de Validade está com o mês inválido!";
                            }
                        }
                    }

                    $("#validCardDebit .one-debit").find(".required").each(function () {
                        var labelCurrent = $(".labelCheckPayment", this).text();
                        var valorCurrent = $(".fieldCheckPayment", this).val();

                        if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                            msgErrors += "<br />O campo " + labelCurrent + " está inválido!";
                        }
                    });
                }

                if (tipoVerificacao !== "S" && externalCode !== "" && (($('#hasPagSeguro').val() !== "0" && $('#hasPagSeguro').val() !== "") || ($('#hasPagSeguroApp').val() !== "0" && $('#hasPagSeguroApp').val() !== ""))) {
                    PaymentHash = PagSeguroDirectPayment.getSenderHash();
                }

                if (msgErrors != "") {
                    swal({
                        //title: 'Ops! Encontramos um problema ..',
                        html: msgErrors,
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    });
                    $(".GerarPedido").removeClass("loading");
                    $(".GerarPedido").removeClass("disabled");
                }
                else {
                    if (validaFrete === "S") {
                        //Verifica se o Antifraud do MaxiPago está ativo, se estiver gera o pré-pedido na sessão e carrega o iframe na página.
                        if (useAntiFraudMaxiPago && kind !== "oneclick") {
                            LoadIframeAntiFraudMaxiPago(idCustomer, idInstallment, idPaymentBrand, idAddress, mensagem)
                            //Gerar pedido completo com atraso de 5 segundos
                            setTimeout(function () { GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay, selectedRecurrentTime, labelOneClick, typeDocument); }, 5000);
                        }
                        else if (tipoVerificacao === "S" && ($this.attr("data-gateway") === "pagseguro" || $this.attr("data-gateway") === "pagseguroapp")) {

                            PagSeguroDirectPayment.createCardToken({
                                cardNumber: card.replace(/ /g, ''),
                                brand: brandCard,
                                cvv: cvvCard,
                                expirationMonth: validaMes,
                                expirationYear: validaAno,
                                success: function (response) {
                                    cardToken = response.card.token;

                                    GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay, selectedRecurrentTime, labelOneClick);
                                },
                                error: function (response) {
                                    swal({
                                        //title: 'Ops! Encontramos um problema ..',
                                        html: "Não foi possível gerar o token do cartão no Pagseguro.",
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    });

                                    $(".GerarPedido").removeClass("loading");
                                    $(".GerarPedido").removeClass("disabled");
                                }
                            });
                        }
                        else if (tipoVerificacao === "S" && $this.attr("data-gateway") === "mercadopago") {

                            Mercadopago.clearSession();

                            brandCard = $("#paymentMethodId").val();
                            document = $("#docNumber").val();
                            typeDocument = $("#docType").val();
                            issuer = $("#issuer").val();

                            var $form = GenerateFormMercadoPago(emailCard, card, cvvCard, validaMes, validaAno, nameCard, typeDocument, document, issuer, installmentNumber, installmentTotal, brandCard, "");

                            window.Mercadopago.createToken($form, function (status, response) {
                                if (status == 200) {
                                    cardToken = response.id;

                                    GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay, selectedRecurrentTime, labelOneClick, typeDocument);
                                } else {
                                    swal({
                                        //title: 'Ops! Encontramos um problema ..',
                                        html: "Não foi possível gerar o token do cartão no Mercado Pago.",
                                        type: 'warning',
                                        showCancelButton: false,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'OK'
                                    });

                                    $(".GerarPedido").removeClass("loading");
                                    $(".GerarPedido").removeClass("disabled");
                                }
                            });
                        }
                        else if (hasBraspag3DS20 == "true" && (tipoVerificacao === "S" || tipoVerificacao === "D")) {
                            $.ajax({
                                method: "POST",
                                url: "/Checkout/LoadBrasPag3DS20",
                                data: {
                                    idCustomer: idCustomer,
                                    idInstallment: idInstallment,
                                    idPaymentBrand: idPaymentBrand,
                                    idAddress: idAddress,
                                    msgPedido: mensagem,
                                    card: card,
                                    cardExpirationMonth: validaMes,
                                    cardExpirationYear: validaAno,
                                    installmentNumber: installmentNumber
                                },
                                async: false,
                                success: function (response) {
                                    var count3DS20BraspagClick = 0;

                                    if ($('.divBraspag3DS20').length > 0) {
                                        $('.divBraspag3DS20').remove();
                                    }
                                    $("body").append(response);

                                    bpmpi_load();


                                    $(window).unbind("jetCheckoutBraspag3DS20");
                                    //window.removeEventListener("jetCheckoutBraspag3DS20", function (e) { });

                                    $(window).bind("jetCheckoutBraspag3DS20", function (e) {

                                        if (e['detail'] != null && e['detail'] != undefined) {
                                            if (e.detail.status == "success") {
                                                if (count3DS20BraspagClick == 0) {
                                                    GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay, selectedRecurrentTime, labelOneClick, typeDocument, hasBraspag3DS20, e.detail.cavv, e.detail.xid, e.detail.eci, e.detail.version, e.detail.referenceId);
                                                    count3DS20BraspagClick++;
                                                }
                                            } else {
                                                //_alert("", e.detail.message, "warning");
                                                _alert("", "Falha ao realizar autorização. [" + e.detail.status + "]", "warning");
                                                $(".GerarPedido").removeClass("disabled");
                                                $(".GerarPedido").removeClass("loading");
                                            }
                                        }

                                    });
                                    
                                },
                                error: function (response) {
                                    _alert("", "Falha ao realizar autorização no 3DS.", "warning");
                                    $(".GerarPedido").removeClass("disabled");
                                    $(".GerarPedido").removeClass("loading");
                                }
                            });
                        }
                        else//Caso não utilize, segue o fluxo de gerar pedido normalmente sem iframe e sem atraso   
                        {
                            GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay, selectedRecurrentTime, labelOneClick, typeDocument);
                        }

                    }
                    else {
                        _alert("", "Escolha o frete antes de fechar o pedido!", "warning");
                        $(".GerarPedido").removeClass("loading");
                        $(".GerarPedido").removeClass("disabled");
                    }
                }
            }
        });
    });
}

function GenerateFormMercadoPago(
    txtEmail, txtCardNumber, txtSecurityCode, txtCardExpirationMonth, txtCardExpirationYear, txtCardholderName, txtDocType, txtDocNumber, txtIssuer,
    txtInstallments, txtTransactionAmount, txtPaymentMethodId, txtDescription) {
    var form = document.createElement("form");
    form.setAttribute("method", "post");

    $(form).append('<input id="email" name="email" type="text" value="' + txtEmail + '"/>');
    $(form).append('<select id="docType" name="docType" data-checkout="docType" type="text"><option value="' + txtDocType + '" selected="selected">' + txtDocType + '</option></select>');
    $(form).append('<input id="docNumber" name="docNumber" data-checkout="docNumber" type="text" value="' + txtDocNumber + '"/>');
    $(form).append('<input id="cardholderName" data-checkout="cardholderName" type="text" value="' + txtCardholderName + '"/>');
    $(form).append('<input type="text" placeholder="MM" id="cardExpirationMonth" data-checkout="cardExpirationMonth" value="' + txtCardExpirationMonth + '"/>');
    $(form).append('<input type="text" placeholder="YY" id="cardExpirationYear" data-checkout="cardExpirationYear" value="' + txtCardExpirationYear + '"/>');
    $(form).append('<input type="text" id="cardNumber" data-checkout="cardNumber" value="' + txtCardNumber + '"/>');
    $(form).append('<input id="securityCode" data-checkout="securityCode" type="text" value="' + txtSecurityCode + '"/>');
    $(form).append('<select id="issuer" name="issuer" data-checkout="issuer"><option value="' + txtIssuer + '" selected="selected">' + txtIssuer + '</option></select>');
    $(form).append('<select type="text" id="installments" name="installments"><option value="' + txtInstallments + '" selected="selected">' + txtInstallments + '</option></select>');
    $(form).append('<input type="hidden" name="transactionAmount" id="transactionAmount" value="' + txtTransactionAmount + '" />');
    $(form).append('<input type="hidden" name="paymentMethodId" id="paymentMethodId" value="' + txtPaymentMethodId + '" />');
    $(form).append('<input type="hidden" name="description" id="description" value="' + txtDescription + '" />');
    $(form).append('<button type="submit">Pagar</button>');

    return form;
}

function onChangeCheckBox() {
    $('#checkPresente').checkbox({
        onChecked: function () {
            $("#presente").val("on");
            $("#exibeMsg > label").show();
            $("#exibeMsg > #mensagem").show();
        },
        onUnchecked: function () {
            $("#presente").val("off");
            $("#exibeMsg > label").hide();
            $("#exibeMsg > #mensagem").hide();
        }
    });
}

function verificaPresente() {
    //$("#embrulhaPresente").click(function(){
    $("#exibeMsg").removeAttr("style");
    if ($('#checkPresente').checkbox('is checked')) {
        $("#exibeMsg > label").show();
        $("#exibeMsg > #mensagem").show();
    }
    else {
        $("#exibeMsg > label").hide();
        $("#exibeMsg > #mensagem").hide();
    }
    //});
}

function onChangeParcelamento() {
    if ($('#parcCard').length > 0) {
        $('#parcCard').unbind();
        $(document).on('change', '#parcCard', function () {
            var codigoBandeira = $("#idBrandCard").val();
            var parcela_selecionada = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
            var id_tipo = 1;

            if (codigoBandeira != "" && parcela_selecionada != "") {
                AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
            }
            
            var total_parcela_selecionada = Number($("#parcCard").find(':selected').attr("data-installmenttotal"));
            var totalCheckout = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));
            //var totalDiscount = Number($('#desconto_checkout').text().replace("R$", "").replace("&nbsp;", "").replace(".", "").replace(",", "."))
            //var juros = total_parcela_selecionada - (totalCheckout - totalDiscount);
            //if ($('#hasPagSeguro').val() == "1" || $('#hasPagSeguroApp').val() == "1" || $('#hasMercadoPago').val() == "1") {
            var juros = total_parcela_selecionada - totalCheckout;
            //}
            $('#interest_checkout').html(juros.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
        });
    }

    if ($('#parcCardOneClick').length > 0) {
        $('#parcCardOneClick').unbind();
        $(document).on('change', '#parcCardOneClick', function () {
            var codigoBandeira = $("#idBrandOneClick").val();
            var parcela_selecionada = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
            var id_tipo = 1;

            if (codigoBandeira != "" && parcela_selecionada != "") {
                AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
            }

            var total_parcela_selecionada = Number($("#parcCard").find(':selected').attr("data-installmenttotal"));
            var totalCheckout = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));
            var totalDiscount = Number($('#desconto_checkout').text().replace("R$", "").replace("&nbsp;", "").replace(".", "").replace(",", "."))
            var juros = total_parcela_selecionada - (totalCheckout - totalDiscount);
            $('#interest_checkout').html(juros.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
        });
    }

    if (($('#parcCard1').length > 0) && ($('#parcCard2').length > 0)) {
        $('#parcCard1, #parcCard2').unbind();
        $(document).on('change', '#parcCard1, #parcCard2', function () {
            if (($('#parcCard1').val() != '') && ($('#parcCard2').val() != '')) {
                var total_card1 = Number($("#parcCard1").find(':selected').attr("data-installmenttotal"));
                var total_card2 = Number($("#parcCard2").find(':selected').attr("data-installmenttotal"));
                var totalCheckout = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));
                var totalDiscount = Number($('#desconto_checkout').text().replace("R$", "").replace("&nbsp;", "").replace(".", "").replace(",", "."))
                var juros = (total_card1 + total_card2) - (totalCheckout - totalDiscount);
                $('#interest_checkout').html(juros.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
                $('#total_checkout').html((total_card1 + total_card2).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));
            }
        });
    }
}

function GetPaymentGateway(nameBrand, typeForm) {
    var seletorJson = typeForm == 'D' ? '#validCardDebit' : '#validCardCredit';

    var objPaymentMethod = $(seletorJson).data('paymentmethod');
    for (var i = 0; i < objPaymentMethod.PaymentBrands.length; i++) {
        var auxNameBrand = objPaymentMethod.PaymentBrands[i].Name.toLowerCase();
        if (auxNameBrand == nameBrand) {
            var IdPaymentBrand = Number.parseInt(objPaymentMethod.PaymentBrands[i].IdPaymentBrand, 10),
                valueRecurrency = $("#checkout_products_list .item[data-recurrent='True']").length;

            if(valueRecurrency > 0) {
                var listPermissionRecurrent = [258, 259, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274];

                console.log(jQuery.inArray( IdPaymentBrand, listPermissionRecurrent))

                if(jQuery.inArray( IdPaymentBrand, listPermissionRecurrent) < 0)
                    return -1;

            }

            return IdPaymentBrand;

        }
    }
    return 0;
}

function GetPaymentBrandExternalCode(nameBrand, typeForm) {
    var seletorJson = typeForm == 'D' ? '#validCardDebit' : '#validCardCredit';

    var objPaymentMethod = $(seletorJson).data('paymentmethod'); //jQuery.parseJSON($('#validCardCredit').data('paymentgateway'));

    //console.log(objPaymentGateway);
    for (var i = 0; i < objPaymentMethod.PaymentBrands.length; i++) {
        var auxNameBrand = objPaymentMethod.PaymentBrands[i].Name.toLowerCase();
        if (auxNameBrand == nameBrand) {
            var ExternalCode = objPaymentMethod.PaymentBrands[i].ExternalCode;
            return ExternalCode;
        }
    }
    return "";
}

function validaCartaoCreditoBandeira(idOnBlur, btnCard, updateBrand, idPaymentBrand, slParcelamento, typeForm, codigoPaymentMethod, parcela_selecionada, _event) {
    $(idOnBlur).on(_event, function (event) {
        var numeroCartao;
        var codigoBandeira = 0;
        var oneclick = false;
        var externalCode = "";
        var gateway = "";
        var containerField = ".fieldCheckPayment#OneClick";

        if (event.type == "change") {
            $('#DelOneClick').addClass("hideme");
            gateway = $(this).find("option:selected").data("type"); //.toLowerCase();
            if (gateway == "maxipago") {
                numeroCartao = $(this).find("option:selected").text().substring(0, 4);
            } else if (gateway == "pagsegurov4") {
                let valueOneClick = $(this).val();
                if (valueOneClick != "") {
                    $('#DelOneClick').removeClass("hideme").unbind().click(function () {

                        _confirm({
                            title: "Deseja realmente remover este cartão?",
                            text: "",
                            type: "warning",
                            confirm: {
                                text: "Remover"
                            },
                            cancel: {
                                text: "Cancelar"
                            },
                            callback: function () {
                                $.ajax({
                                    method: "POST",
                                    url: "DeleteCardOneClick",
                                    data: {
                                        Token: valueOneClick
                                    },
                                    success: function (response) {
                                        if (response.success) {
                                            $("option:selected", containerField).remove()
                                            $('#DelOneClick').addClass("hideme");

                                            if($("option", containerField).length > 1)
                                                $(containerField).val("0")
                                            else
                                                window.location.reload();


                                        } else {
                                            _alert("", response.message, "warning");
                                        }
                                    }
                                });
                            }
                        });

                        return false;
                    });
                }
            }
            cartao = $(this).find("option:selected").data("brand").toLowerCase();
            codigoBandeira = GetPaymentGateway(cartao, typeForm);
            externalCode = GetPaymentBrandExternalCode(cartao, typeForm);
            $(idPaymentBrand).val(codigoBandeira);
            $(btnCard).attr({
                "data-externalcode": externalCode
            });
            $(updateBrand).val(cartao);
            oneclick = true;
        }
        else {
            numeroCartao = $(this).val().replace(/\s/g, '');

            var cartoes = {
                elo: /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(50900\d|5090[1-9]\d|509[1-9]\d{2})|65003[1-3]|(65003[5-9]|65004\d|65005[0-1])|(65040[5-9]|6504[1-3]\d)|(65048[5-9]|65049\d|6505[0-2]\d|65053[0-8])|(65054[1-9]| 6505[5-8]\d|65059[0-8])|(65070\d|65071[0-8])|65072[0-7]|(65090[1-9]|65091\d|650920)|(65165[2-9]|6516[6-7]\d)|(65500\d|65501\d)|(65502[1-9]|6550[3-4]\d|65505[0-8])|(65048[5-9]\d|65049[0-9]\d|6505[0-2][0-9]\d|65053[0-8]\d))[0-9]{10,12}/,
                diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                dinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
                hipercard: /^606282|^637095|^637599|^637568/,
                hiper: /^(637599|637612|637609|637568|637095)+[0-9]{10}$/,
                amex: /^3[47][0-9]{12,13}$/,
                aura: /^5078[0-9]{12,15}$/,
                //mastercard: /^5[1-5][0-9]{14}$/,
                mastercard: /^(5[1-5][0-9]{14})|(2[2-7][0-9]{14})|(5021[0-9]{12})|(5899[0-9]{12})|(5018|5020|5038|5893|6304|6036|6759|6761|6762|6763)[0-9]{8,15}$/,
                visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                jcb: /^35(2+[8-9]|3+[0-9]|4+[0-9]|5+[0-9]|6+[0-9]|7+[0-9]|8+[0-9])+[0-9]{12,15}$/,
                credz: /^(636760|637032)+[0-9]{10}$/
            };

            for (var cartao in cartoes) {
                if (numeroCartao.match(cartoes[cartao])) {
                    codigoBandeira = GetPaymentGateway(cartao, typeForm);
                    externalCode = GetPaymentBrandExternalCode(cartao, typeForm);
                    $(idPaymentBrand).val(codigoBandeira);
                    $(btnCard).attr({
                        "data-externalcode": externalCode
                    });
                    $(updateBrand).val(cartao);
                    break;
                }
            }
        }
        if (numeroCartao !== "" && codigoBandeira === 0 || codigoBandeira === -1) {
            if (typeForm === "C") {
                $(slParcelamento).html("<option value='0'>Informe o numero do cartão primeiro</option>");
            }
            if(codigoBandeira === -1)
                _alert("", "Bandeira de cartão não permitida para compra recorrente.", "warning");
            else
                _alert("", "Bandeira de cartão não disponível na loja ou número do cartão inválido.", "warning");

            $(idOnBlur).val('');
        }
        else {
            if ($(idOnBlur).val() !== "") {
                $.ajax({
                    method: "POST",
                    url: "VerificaStatusBandeira",
                    data: {
                        idPaymentMethod: codigoPaymentMethod,
                        idPaymentBrand: new Number(codigoBandeira)
                    },
                    success: function (response) {
                        if (response.success) {
                            if (typeForm == "C") {
                                if (!oneclick) {
                                    $("#btnCardCredit").attr("disabled", false);
                                    $("#idBrandOneClick").val("");
                                    $("#btnOneClick").attr("disabled", true);
                                    $("#parcCardOneClick").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                } else {
                                    $("#btnOneClick").attr("disabled", false);
                                    $("#idBrandCard, #idBrandCard1, #idBrandCard2").val("");
                                    $("#btnCardCredit").attr("disabled", true);
                                    //$(idOnBlur).val('');
                                    //$(idOnBlur).empty();
                                    $("#parcCard, #parcCard1, #parcCard2").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                }
                                if ($('#resumoCheckout > .ui.resumo > .content').is(':visible') == false) {
                                    atualizaResumoCarrinho(oneclick);
                                }
                                atualizaParcelamento(codigoBandeira, oneclick, idOnBlur, slParcelamento);
                            }
                        }
                        else {
                            $(idPaymentBrand).val(0);
                            $(updateBrand).val("");
                            $(idOnBlur).val("");
                            _alert("", response.message, "warning");
                            $(idOnBlur).val('');
                        }
                    }
                });
            } else {
                $(idPaymentBrand).val(0);
                $(updateBrand).val("");
                if ($('#resumoCheckout > .ui.resumo > .content').is(':visible') == false) {
                    atualizaResumoCarrinho(oneclick);
                }
            }
        }
    });
}

function atualizaParcelamento(codigoBandeira, oneclick, idOnBlur, slParcelamento) {
    var option = "";
    var value = "";
    if (codigoBandeira > 0) {

        if (idOnBlur == "#CreditCard1") value = $('#Valor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
        if (idOnBlur == "#CreditCard2") value = $('#Valor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim();

        $.ajax({
            method: "POST",
            url: "LoadInstallment",
            data: {
                idPaymentBrand: new Number(codigoBandeira),
                idPaymentMethod: new Number(1),
                numberCard: $(idOnBlur).val(),
                value: value
            },
            success: function (response) {
                var objOneClick = response.OneClick;
                var objMsgError = response.ErrorMsg;
                var objAdditionalFields = response.AdditionalFields;
                var objMaxiPago = response.MaxiPago;
                var objPagSeguro = response.PagSeguro;
                var objPagSeguroV4 = response.PagSeguroV4;
                var objPagSeguroApp = response.PagSeguroApp;
                var objMercadoPago = response.MercadoPago;
                var objParcelamento = 0;
                if (response.ListInstallment != null && response.ListInstallment != "")
                    objParcelamento = response.ListInstallment;

                if (objMsgError == "" || typeof (objMsgError) == "undefined" || objParcelamento.length > 0) {
                    //if($('#divScriptPagSeguro').length > 0) $('#divScriptPagSeguro').remove();
                    if (typeof (objPagSeguroV4) != "undefined" && objPagSeguroV4 == true) {
                        $("#btnCardCredit").attr("data-gateway", "pagsegurov4");
                        if (objOneClick != "" && typeof (objOneClick) != "undefined") {
                            $("#checkOneClickField").show();

                            $('#checkOneClickField .checkbox')
                                .checkbox({
                                    onChecked: function() {
                                        $('#labelField').removeClass("hideme").addClass("required");
                                    },
                                    onUnchecked: function() {
                                        $('#labelField').addClass("hideme").removeClass("required");
                                    }
                                });
                        }
                    }
                    else if (typeof (objMaxiPago) != "undefined" && objMaxiPago == true) {
                        $("#btnCardCredit").attr("data-gateway", "maxipago");
                        if (objOneClick != "" && typeof (objOneClick) != "undefined") {
                            $("#checkOneClickField").show();
                            $("#documentField").show();
                            $("#documentField").addClass("required");
                        }
                        else {
                            $("#checkOneClickField").hide();
                            $("#documentField").hide();
                            $("#documentField").removeClass("required");
                        }

                        $("#dateOfBirthField").hide();
                        $("#dateOfBirthField").removeClass("required");
                        $("#phoneField").hide();
                        $("#phoneField").removeClass("required");
                        onChangeParcelamento();
                    }
                    else if (typeof (objPagSeguro) !== "undefined" && objPagSeguro === true) {
                        $("#btnCardCredit").attr("data-gateway", "pagseguro");
                        if (objAdditionalFields.length > 0) {
                            if (ContainsInArray("document", objAdditionalFields) == true) {
                                $("#documentField").show();
                                $("#documentField").addClass("required");
                            }
                            else {
                                $("#documentField").hide();
                                $("#documentField").removeClass("required");
                            }
                            if (ContainsInArray("dateOfBirth", objAdditionalFields) == true) {
                                $("#dateOfBirthField").show();
                                $("#dateOfBirthField").addClass("required");
                            }
                            else {
                                $("#dateOfBirthField").hide();
                                $("#dateOfBirthField").removeClass("required");
                            }
                            if (ContainsInArray("phone", objAdditionalFields) == true) {
                                $("#phoneField").show();
                                $("#phoneField").addClass("required");
                            }
                            else {
                                $("#phoneField").hide();
                                $("#phoneField").removeClass("required");
                            }
                        }
                        $("#checkOneClickField").hide();

                        var totalCheckout = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));

                        var ccNumber = $(idOnBlur).val().replace(/[ .-]/g, '').slice(0, 6);
                        var maximumInstallmentWithoutInterest = $('#MaximumInstallmentWithoutInterest').val();
                        var maximumInstallment = Number.parseInt($('#MaximumInstallment').val());

                        PagSeguroDirectPayment.getBrand({
                            cardBin: ccNumber,
                            success: function (responseBrand) {

                                var objGetInstallments = {
                                    amount: totalCheckout,
                                    brand: responseBrand.brand.name,
                                    success: function (responseInstallment) {
                                        //console.log(responseInstallment);
                                        var option = "";
                                        $.each(responseInstallment.installments[responseBrand.brand.name], function (key, item) {
                                            //console.log(item);
                                            //if(item.quantity <= maximumInstallment) {
                                            option += "<option value='000' data-InstallmentValue='" + item.installmentAmount + "' data-InstallmentNumber='" + item.quantity + "' data-InstallmentTotal='" + item.totalAmount + "'>" + item.quantity + "x de " + item.installmentAmount.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) + " (" + ((item.interestFree) ? 'Sem juros' : 'Com juros') + ")</option>";
                                            //}
                                        });
                                        $(slParcelamento).unbind().html(option);
                                    },
                                    error: function (responseInstallment) {
                                        console.log(responseInstallment);
                                    },
                                    complete: function (responseBrand) {}
                                };

                                if (parseInt(maximumInstallmentWithoutInterest) > 1) {
                                    objGetInstallments.maxInstallmentNoInterest = maximumInstallmentWithoutInterest;
                                }


                                PagSeguroDirectPayment.getInstallments(objGetInstallments);
                            },
                            error: function (responseBrand) {
                                console.log(responseBrand);
                            },
                            complete: function (responseBrand) {}
                        });
                    }
                    else if (typeof (objPagSeguroApp) !== "undefined" && objPagSeguroApp === true) {
                        $("#btnCardCredit").attr("data-gateway", "pagseguroapp");
                        if (objAdditionalFields.length > 0) {
                            if (ContainsInArray("document", objAdditionalFields) == true) {
                                $("#documentField").show();
                                $("#documentField").addClass("required");
                            }
                            else {
                                $("#documentField").hide();
                                $("#documentField").removeClass("required");
                            }
                            if (ContainsInArray("dateOfBirth", objAdditionalFields) == true) {
                                $("#dateOfBirthField").show();
                                $("#dateOfBirthField").addClass("required");
                            }
                            else {
                                $("#dateOfBirthField").hide();
                                $("#dateOfBirthField").removeClass("required");
                            }
                            if (ContainsInArray("phone", objAdditionalFields) == true) {
                                $("#phoneField").show();
                                $("#phoneField").addClass("required");
                            }
                            else {
                                $("#phoneField").hide();
                                $("#phoneField").removeClass("required");
                            }
                        }
                        $("#checkOneClickField").hide();

                        var totalCheckoutApp = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));

                        var ccNumberApp = $(idOnBlur).val().replace(/[ .-]/g, '').slice(0, 6);
                        var maximumInstallmentWithoutInterestApp = $('#MaximumInstallmentWithoutInterest').val();

                        PagSeguroDirectPayment.getBrand({
                            cardBin: ccNumberApp,
                            success: function (responseBrand) {

                                var objGetInstallments = {
                                    amount: totalCheckoutApp,
                                    brand: responseBrand.brand.name,
                                    success: function (responseInstallment) {
                                        //console.log(responseInstallment);
                                        var option = "";
                                        $.each(responseInstallment.installments[responseBrand.brand.name], function (key, item) {
                                            //console.log(item);
                                            //if(item.quantity <= maximumInstallment) {
                                            option += "<option value='000' data-InstallmentValue='" + item.installmentAmount + "' data-InstallmentNumber='" + item.quantity + "' data-InstallmentTotal='" + item.totalAmount + "'>" + item.quantity + "x de " + item.installmentAmount.toLocaleString('en-US', { style: 'currency', currency: 'BRL' }) + " (" + ((item.interestFree) ? 'Sem juros' : 'Com juros') + ")</option>";
                                            //}
                                        });
                                        $(slParcelamento).unbind().html(option);
                                    },
                                    error: function (responseInstallment) {
                                        console.log(responseInstallment);
                                    },
                                    complete: function (responseBrand) {
                                        console.log(responseBrand);
                                    }
                                };

                                if (parseInt(maximumInstallmentWithoutInterestApp) > 1) {
                                    objGetInstallments.maxInstallmentNoInterest = maximumInstallmentWithoutInterestApp;
                                }


                                PagSeguroDirectPayment.getInstallments(objGetInstallments);
                            },
                            error: function (responseBrand) {
                                console.log(responseBrand);
                            },
                            complete: function (responseBrand) {
                                console.log(responseBrand);
                            }
                        });
                    }
                    else if (typeof (objMercadoPago) !== "undefined" && objMercadoPago === true) {
                        $("#btnCardCredit").attr("data-gateway", "mercadopago");
                        if (objAdditionalFields.length > 0) {
                            if (ContainsInArray("email", objAdditionalFields) == true) {
                                $("#emailField").show();
                                $("#emailField").addClass("required");
                            } else {
                                $("#documentField").hide();
                                $("#documentField").removeClass("required");
                            }
                            if (ContainsInArray("docType", objAdditionalFields) == true) {
                                $("#docTypeField").show();
                                $("#docTypeField").addClass("required");
                            } else {
                                $("#docTypeField").hide();
                                $("#docTypeField").removeClass("required");
                            }
                            if (ContainsInArray("docNumber", objAdditionalFields) == true) {
                                $("#docNumberField").show();
                                $("#docNumberField").addClass("required");
                            } else {
                                $("#docNumberField").hide();
                                $("#docNumberField").removeClass("required");
                            }
                            if (ContainsInArray("issuer", objAdditionalFields) == true) {
                                //$("#issuerField").show();
                                //$("#issuerField").addClass("required");
                            } else {
                                $("#issuerField").hide();
                                $("#issuerField").removeClass("required");
                            }
                        }

                        window.Mercadopago.getIdentificationTypes();

                        var _totalCheckout = Number($('#total_checkout').data("totalcheckout").replace("R$", "").replace(".", "").replace(",", "."));

                        if (objParcelamento.length > 0) {
                            _totalCheckout = objParcelamento[0].Total;
                        }

                        let bin = $(idOnBlur).val().replace(/\s/g, '').substring(0, 6);
                        window.Mercadopago.getPaymentMethod({
                            "bin": bin
                        }, function (status, response) {
                            if (status == 200) {
                                let paymentMethod = response[0];
                                $("#paymentMethodId").val(paymentMethod.id);
                                let payment_type_id = paymentMethod.payment_type_id;

                                window.Mercadopago.getIssuers(
                                    paymentMethod.id,
                                    function (status_, response_) {
                                        if (status_ == 200) {
                                            $("#issuer option").remove();
                                            var _issuerCount = 0;
                                            response_.forEach(issuer => {
                                                $("#issuer").append('<option value="' + issuer.id + '">' + issuer.name + '</option>');
                                                _issuerCount++;
                                            });

                                            if (_issuerCount > 1 && payment_type_id != "credit_card") {
                                                $("#issuerField").show();
                                                $("#issuerField").addClass("required");
                                            }

                                            window.Mercadopago.getInstallments({
                                                "payment_method_id": $("#paymentMethodId").val(),
                                                "amount": _totalCheckout,
                                                "issuer_id": parseInt($("#issuer").val())
                                            }, function (status__, response__) {
                                                if (status__ == 200) {
                                                    $("#parcCard option").remove();
                                                    response__[0].payer_costs.forEach(payerCost => {
                                                        $("#parcCard").append('<option value="000" data-InstallmentValue="' + payerCost.installment_amount + '" data-InstallmentNumber="' + payerCost.installments + '" data-InstallmentTotal="' + payerCost.total_amount + '">' + payerCost.recommended_message + '</option>');
                                                    });
                                                    $("#emailCard").val($("#MercadoPagoEmail").val());

                                                } else {
                                                    alert(`installments method info error: ${response__}`);
                                                }
                                            });
                                        } else {
                                            alert(`issuers method info error: ${response_}`);
                                        }
                                    }
                                );
                            } else {
                                alert(`payment method info error: ${response}`);
                            }
                        });
                    }
                    else {
                        onChangeParcelamento();
                        $("#documentField").hide();
                        $("#documentField").removeClass("required");
                        $("#dateOfBirthField").hide();
                        $("#dateOfBirthField").removeClass("required");
                        $("#phoneField").hide();
                        $("#phoneField").removeClass("required");
                        $("#checkOneClickField").hide();
                    }

                    if (!objPagSeguro && !objPagSeguroApp && !objMercadoPago) {
                        if (!oneclick) {
                            for (var i = 0; i < objParcelamento.length; i++) {
                                var IdInstallment = objParcelamento[i].IdInstallment;
                                var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                                var Description = objParcelamento[i].Description;
                                var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                                option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "' data-InstallmentTotal='" + objParcelamento[i].Total + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";
                                $(slParcelamento).html(option);

                            }
                            var installmentNumber = $(slParcelamento).find(':selected').attr("data-InstallmentNumber");
                            AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                        }
                        else {
                            for (var i = 0; i < objParcelamento.length; i++) {
                                var IdInstallment = objParcelamento[i].IdInstallment;
                                var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                                var Description = objParcelamento[i].Description;
                                var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                                option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "' data-InstallmentTotal='" + objParcelamento[i].Total + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";
                                $(slParcelamento).html(option);
                            }

                            var installmentNumber = $(slParcelamento).find(':selected').attr("data-InstallmentNumber");
                            AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                        }
                    }
                }
                else {
                    $(slParcelamento).html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("", objMsgError, "warning");
                }
            }
        });
    }
    else {
        $(slParcelamento).html("<option value='0'>Informe o numero do cartão primeiro</option>");
    }
}

function ContainsInArray(needle, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == needle) return true;
    }
    return false;
}

function buscaTotalParcelamento(codigoBandeira, codigoPaymentMethod, parcela_selecionada) {
    var valor = {};
    if (codigoBandeira > 0) {
        $.ajax({
            method: "POST",
            url: "LoadInstallmentJson",
            async: false,
            data: {
                _codigoBandeira: new Number(codigoBandeira),
                _paymentMethod: new Number(codigoPaymentMethod),
                _parcela_selecionada: new Number(parcela_selecionada)
            },
            success: function (response) {
                if (response.success === true) {
                    valor = response;
                }
                else {
                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("", response.result, "warning", false);
                    $("#CreditCard").val("");
                }
            }
        });
    }
    return valor;
}

function buscaTotalParcelamentoValor(codigoBandeira, codigoPaymentMethod, parcela_selecionada, value) {
    var valor = {};
    if (codigoBandeira > 0) {
        $.ajax({
            method: "POST",
            url: "LoadInstallmentJson",
            async: false,
            data: {
                _codigoBandeira: new Number(codigoBandeira),
                _paymentMethod: new Number(codigoPaymentMethod),
                _parcela_selecionada: new Number(parcela_selecionada),
                _value: value
            },
            success: function (response) {
                if (response.success === true) {
                    valor = response;
                }
                else {
                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("", response.result, "warning", false);
                    $("#CreditCard").val("");
                }
            }
        });
    }
    return valor;
}

function AtualizaResumoCarrinhocomDesconto(codigoBandeira, codigoPaymentMethod, parcela_selecionada) {

    if ($('#UseTwoCreditCards').is(':checked') == true) {

        var Total = 0;
        var TotalDiscount = 0;
        var Discount1 = 0;
        var Discount2 = 0;
        var DiscountInitial = parseFloat($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));

        var idBrandCard1 = $('#idBrandCard1').val().trim();
        var ValorCartao1 = $('#Valor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
        var parcCard1 = $("#parcCard1").find(':selected').attr("data-InstallmentNumber");
        var obj_parcelamento1 = buscaTotalParcelamentoValor(idBrandCard1, 1, parcCard1, ValorCartao1);

        if (Object.keys(obj_parcelamento1).length > 0) {
            Discount1 = obj_parcelamento1.discount;
            Total += obj_parcelamento1.result;
        }

        var idBrandCard2 = $('#idBrandCard2').val().trim();
        var ValorCartao2 = $('#Valor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
        var parcCard2 = $("#parcCard2").find(':selected').attr("data-InstallmentNumber");
        var obj_parcelamento2 = buscaTotalParcelamentoValor(idBrandCard2, 1, parcCard2, ValorCartao2);

        if (Object.keys(obj_parcelamento2).length > 0) {
            Discount2 = obj_parcelamento2.discount;
            Total += obj_parcelamento2.result;
        }

        if (Total > 0) {
            $("#total_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Total));
        }

        if ((Discount1 + Discount2) > 0) {
            TotalDiscount = DiscountInitial + Discount1 + Discount2;
            $("#desconto_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(TotalDiscount));
        }

    }
    else {
        var obj_parcelamento;
        if (($('#hasPagSeguro').val() !== "0" && $('#hasPagSeguro').val() !== undefined) || ($('#hasPagSeguroApp').val() !== "0" && $('#hasPagSeguroApp').val() !== undefined) || ($('#hasMercadoPago').val() !== "0" && $('#hasMercadoPago').val() !== undefined)) {
            obj_parcelamento = buscaTotalParcelamentoValor(codigoBandeira, codigoPaymentMethod, 1);
        } else {
            obj_parcelamento = buscaTotalParcelamento(codigoBandeira, codigoPaymentMethod, parcela_selecionada);
        }
        setTimeout(function() {
            var valor = $('#parcCard > option:selected').data('installmenttotal');
            obj_parcelamento.juros = valor - obj_parcelamento.result;
            if (obj_parcelamento.juros < 0) obj_parcelamento.juros = 0;
            obj_parcelamento.result = valor;


            //var obj_carrinho = buscaValorFinalCarrinho();
            if (Object.keys(obj_parcelamento).length > 0) {
                var desconto_inicial = $("#desconto_checkout").attr("data-discount-initial");

                if (desconto_inicial.indexOf(',') != -1) {
                    desconto_inicial = desconto_inicial.substring(0, desconto_inicial.indexOf(','));
                }
                desconto_inicial = desconto_inicial.replace(/[^0-9\.-]+/g, "");
                desconto_inicial = parseFloat(desconto_inicial);

                $("#desconto_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj_parcelamento.discount + desconto_inicial));
                $("#total_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj_parcelamento.result));
                $("#interest_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj_parcelamento.juros));
            }
        }, 1000)        
    }
}

function listAddressPayment() {
    $("#listAddressPayment").click(function () {
        $("#addDataAddress").removeClass("addAddress");
        $("#addDataAddress").text("Adicionar");
        $("#listAddressData").show();
        $("#registerAddressPayment").hide();
        viewAddressLogged(".lista-endereco-cliente");
        RecoverPasswordByEmail(".lista-endereco-cliente");
        if (localStorage.getItem('multiCdAddress') != undefined) {
            var response = localStorage.getItem('multiCdAddress');
            localStorage.removeItem('multiCdAddress');
            $('.ui.modal.lista-endereco-cliente')
                .modal({closable: false})
                .modal({
                    onHidden: function () {
                        if (response.indexOf('redirecionado') == -1) {
                            changeCd(false, true, undefined, false, true)
                        } else {
                            $.ajax({
                                method: "POST",
                                url: "/Checkout/ClearCart",
                                success: function (data) {
                                    window.location.href = "/home";
                                }
                            });
                        }
                    }
                })
                .modal('show');
        } else {
            $('.ui.modal.lista-endereco-cliente').modal({closable: false}).modal('show');
        }
    });
}

function showAddressPayment() {
    $("#addDataAddress").click(function () {
        if ($(".addAddress").length > 0) {
            var jsonArray = [];
            var splittedFormData = $("#disparaForm").serialize().split('&');
            if($("[id^=googleResponse]", "body").length > 0)
                jsonArray['googleResponse'] = $("[id^=googleResponse]", "body").val();

            $.each(splittedFormData, function (key, value) {
                var item = {};
                var splittedValue = value.split('=');
                item["name"] = splittedValue[0];
                item["value"] = decodeURI(splittedValue[1]);
                jsonArray.push(item);
            });

            $.ajax({
                method: "POST",
                url: "CreateAddress",
                data: jsonArray,
                dataType: "json",
                success: function (responseDefault) {
                    if (responseDefault.success) {
                        if ($("#multiCDActive").val().toLowerCase() == "true") {
                            document.location.reload()
                        } else {
                            atualizaEnderecos(responseDefault);
                        }
                    }
                    else {
                        _alert("", responseDefault.msg, "warning");
                    }
                },
                complete: function() {
                    if ($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                        if ($("[id^=googleVersion_]").eq(0).val() === "2") {
                            grecaptcha.reset()
                        } else {
                            generateRecaptcha($("[id^=googleModule]").val(), "body");
                        }
                    }
                }
            });
        }
        else {
            $("#listAddressData").hide();
            $("#registerAddressPayment").show();
            $(this).addClass("addAddress");
            $(this).text("Cadastrar");
            $('.ui.modal.lista-endereco-cliente').modal('refresh');
        }
    });
}

function changeAddressPayment() {
    $(".utilAddress").click(function () {

        var _el = $(this);
        _el.addClass("loading")

        var idAddressChange = $(this).attr("data-id");
        $("#registerAddressPayment").hide();

        $.ajax({
            method: "POST",
            url: "ListAddressDefault",
            success: function (responseDefault) {
                $.ajax({
                    method: "POST",
                    url: "ChangeAddressCheckout",
                    data: {
                        idAddressDefault: responseDefault.msg,
                        idAddressCurrent: idAddressChange
                    },
                    success: function (responseChange) {
                        if (responseChange.success) {
                            if ($("#multiCDActive").val().toLowerCase() == "true") {
                                document.location.reload()
                            } else {
                                atualizaEnderecos(responseChange);
                            }
                        }else {
                            _alert("", responseChange.msg, "warning");
                            _el.removeClass("loading")
                        }
                    }
                });
            }
        });
    });
}

export function atualizaResumoCarrinho(oneclick) {
    $.ajax({
        method: "POST",
        url: "LoadResumoPayment",
        success: function (data) {

            isLoading("#resumoCheckout")

            $("#resumoCheckout").html(data);

            var codigoBandeira = $("#idBrandCard").val();
            if ($("#btnOneClick").length > 0) {
                codigoBandeira = $("#idBrandCard").val() != "" ? $("#idBrandCard").val() : $("#idBrandOneClick").val();
            }

            if (typeof (codigoBandeira) != "undefined") {
                atualizaParcelamento(codigoBandeira, false, "#CreditCard", "#parcCard");
                var _parcela = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                if (oneclick || $("#idBrandOneClick").val() != "") {
                    _parcela = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
                }
                var parcela_selecionada = _parcela != undefined ? _parcela : "1";
                var id_tipo = 1;
                if (codigoBandeira != "" && parcela_selecionada != "") {
                    AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
                }
            }

            //isLoading(".ui.accordion.frete");
            $('.ui.accordion.usuario').accordion("refresh");

            var idFrete = $(".shippingGet:checked").val(); //$("#GetShippping .card .checkbox.checked input").val();
            var exclusivaEntregaAgendada = $("#radio_" + idFrete).attr("data-exclusiva-entregaagendada");

            pagamentocomDesconto();
            if (exclusivaEntregaAgendada == "True") {
                if (($("#dateAgendada_" + idFrete).val() != "") && ($("#combo_dataperiodoagendada_" + idFrete).val() != ""))
                    HabilitaBlocoPagamento(true)
                else
                    HabilitaBlocoPagamento(false);
            } else {
                if (idFrete == undefined || idFrete == "") {
                    HabilitaBlocoPagamento(false);
                } else {
                    HabilitaBlocoPagamento(true);
                }
            }

            PayPalCheckoutInCart();

            if ($(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").is(':visible') === true && $('#frm-paypal-checkout-transparent').is(':visible') === true) {
                PayPalCheckoutTransparent();
            }

            if ($(".ui.tab.segment[data-tab=paypalCheckoutReference]").is(':visible') === true) {
                PayPalCheckoutReference();
            }

            if ($('#UseTwoCreditCards').is(':checked') == true) {

                var _valorSelecionado = "";
                if ($('.multi-card .menu .item.active').data('tab') == 'card-1') {
                    _valorSelecionado = "#Valor1";
                } else {
                    _valorSelecionado = "#Valor2";
                }

                UpdateValueTwoCreditCards($(_valorSelecionado));
            }
            //isLoading(".ui.segment.teal");
        }
    });
}

function pagamentocomDesconto() {
    $.ajax({
        method: "POST",
        url: "PagamentoComDesconto",
        success: function success(data) {

            if (data.pagamentoDesconto) {
                $("#formas-pagamento [data-tab]").addClass("hideme");
                $("[data-tab='paymentDescount']").removeClass("hideme").show();
                $('#formas-pagamento').removeClass("disable_column");
                if ($(".shopping-voucher").length > 0) {
                    let valueShoppingVoucher = Number.parseFloat($("#desconto_shopping_voucher").text().replace('R$', '').replace('.', '').replace(',', '.'));
                    let totalCheckout = Number.parseFloat($("#total_checkout").text().replace('R$', '').replace('.', '').replace(',', '.'));
                    if (valueShoppingVoucher == 0 || totalCheckout > 0) {
                        $(".shopping-voucher").addClass("hideme");
                    }
                }
            } else {
                $("#formas-pagamento [data-tab]").removeClass("hideme");
                $("[data-tab='paymentDescount']").addClass("hideme").hide();
                if ($(".shopping-voucher").length > 0) {
                    $(".shopping-voucher").removeClass("hideme");
                }
            }
        }
    });
}

export function atualizaEnderecos(responseChange) {
    if (responseChange != undefined) {
        updateAddress();

        $("#idAddress").val(responseChange.idAddress);
        $("#streetClient").text(responseChange.streetClient);
        $("#numberClient").text(responseChange.numberClient);
        $("#complementClient").text(responseChange.complementClient);
        $("#neighbourhoodClient").text(responseChange.neighbourhoodClient);
        $("#cityClient").text(responseChange.cityClient);
        $("#stateClient").text(responseChange.stateClient);
        $("#zipCodeClient").text(responseChange.zipCodeClient);
        $("#zipcode").val(responseChange.zipCodeClient);

        var zipCode = responseChange.zipCodeClient;
        $("#zipcode").val(zipCode)
    }

    $("#updateShippingPayment").html('<div class="row text center loading-shipping"><img src="/assets/image/loading.svg"></div>')
    $.ajax({
        method: "POST",
        url: "ListaFretePagamento",
        success: function success(data) {
            if (data.indexOf("|@|&RR0RM&SS@G&|@|CD") > -1) {
                $("#updateShippingPayment").html("");
                HabilitaBlocoPagamento(false);
                $('.ui.modal').modal('hide');
            } else {
                $("#updateShippingPayment").html(data);
                clickShipping();
                HabilitaBlocoPagamento(false);
                CampoEntregaAgendada();
                $('.ui.modal.lista-endereco-cliente').modal('hide');

                if ($('#PaymentLinkChangeBrand').length > 0) {
                    if ($('#PaymentLinkChangeBrand').val() == "1") {

                        var zipcode = $("#zipcode").val();

                        if ($("#installmentCheckoutTransparent").length) {
                            $("#installmentCheckoutTransparent > option").remove();
                            $("#installmentCheckoutTransparent").append('<option value="0">Aguarde carregando.</option>');
                        }

                        if ($("#paypal-cc-form").length)
                            $("#paypal-cc-form").empty();

                        if ($("#paypal-button-reference").length)
                            $("#paypal-button-reference").empty();

                        $("#GetShippping .card, #GetShippping .card .checkbox").removeClass("checked")
                        $(this).addClass("checked").find(".checkbox").addClass("checked")

                        $(".card:not(.checked) .agendar", "#GetShippping").hide("slow");
                        $(".card:not(.checked) .hasDatepicker", "#GetShippping").datepicker('setDate', null);

                        var ponteiroCurrent = $(".shippingGet:checked");

                        var valorFrete = $(ponteiroCurrent).attr("data-value");
                        var valorAdicional = $(ponteiroCurrent).data("addvalue");
                        var idFrete = $(ponteiroCurrent).attr("data-id");
                        var correiosEntrega = $(ponteiroCurrent).attr("data-correios");
                        var carrier = $(ponteiroCurrent).data("carrier");
                        var mode = $(ponteiroCurrent).data("mode");
                        var hub = $(ponteiroCurrent).data("hub");

                        var entregaAgendada = $(ponteiroCurrent).attr("data-entregaagendada");
                        var exclusivaEntregaAgendada = $(ponteiroCurrent).attr("data-exclusiva-entregaagendada");

                        if ((valorFrete != "") && (idFrete != "") && (correiosEntrega != "") && (zipcode != "")) {
                            var dataperiodoentregaescolhida = null;
                            var dataentregaescolhida = null;
                            var idPeridoescolhido = null;

                            if (exclusivaEntregaAgendada == "True") {
                                if (($("#dateAgendada_" + idFrete).val() != "") && ($("#combo_dataperiodoagendada_" + idFrete).val() != "")) {
                                    idPeridoescolhido = $("#combo_dataperiodoagendada_" + idFrete).val();
                                    dataperiodoentregaescolhida = $("#combo_dataperiodoagendada_" + idFrete).val();
                                    dataentregaescolhida = $("#dateAgendada_" + idFrete).val();
                                }
                            }

                            disparaAjaxShipping(zipcode, idFrete, correiosEntrega, entregaAgendada, valorAdicional, dataperiodoentregaescolhida, dataentregaescolhida, idPeridoescolhido, carrier, mode, hub, valorFrete);
                        }
                        $('.ui.toggle.checkbox.box-card').trigger('click');
                    }
                }
            }
        },
        error: function (error) {
            if (error.responseText.indexOf("CD") > -1) {
                $("#updateShippingPayment").html("");
                HabilitaBlocoPagamento(false);
                $('.ui.modal.lista-endereco-cliente').modal('hide');
            }
        }
    });
}


function applyDiscount() {
    $("#applyDiscount").click(function () {
        var key = $("#key").val();
        var customerId = $("#idCustomer").val();

        if ((key != "") && (customerId != "")) {
            $.ajax({
                method: "POST",
                url: "AplicaDescontoCheckout",
                data: {
                    key: key,
                    customerId: customerId
                },
                success: function success(response) {
                    if (response.success) {
                        atualizaResumoCarrinho();
                        if ($('.ui.accordion.shopping-voucher').length > 0) {
                            $.ajax({
                                async: false,
                                method: "PUT",
                                url: "/Checkout/ValeCompraRemover",
                                success: function (responseValeCompra) {
                                    $('#btnGerarPedidoValeCompra').attr("disabled", true);
                                    $(".ui.accordion.shopping-voucher").accordion('close', 0);
                                    $('#formas-pagamento').removeClass("disable_column");
                                    ValeCompraRefresh();
                                }
                            });
                        }
                        
                        if (response.couponfreeshipping) {
                            atualizaEnderecos();
                            _alert("Cupom aplicado com sucesso!", response.msg, "success");
                        } else {
                            _alert("Cupom de Desconto!", response.msg, "success");
                        }

                        if ($('.ui.toggle.checkbox.box-card').hasClass('checked')) {
                            $('.ui.toggle.checkbox.box-card').trigger('click');
                        }
                        if ($('.ui.toggle.checkbox.box-debit').hasClass('checked')) {
                            $('.ui.toggle.checkbox.box-debit').trigger('click');
                        }
                    }
                    else {
                        $("#key").val("");
                        _alert("", response.msg, "warning");
                    }
                }
            });
        }
        else {
            _alert("", "Você não informou uma chave de desconto!", "warning");
        }
    });
}

function updateAddress() {
    $.ajax({
        method: "POST",
        url: "ListaEnderecosCliente",
        success: function success(data) {
            $("#ListaEnderecosCliente").html(data);
            $("#registerAddressPayment").hide();
            changeAddressPayment();
            showAddressPayment();
            calculaFreteUpdate();
            $('.ui.modal.lista-endereco-cliente').modal('refresh');
        }
    });
}

function viewAddressLogged(form) {
    $(form + " .loginPayment").click(function () {
        var token = $(form + " input[name='__RequestVerificationToken']").val();
        var userName = $(form + " .UserName").val();
        var password = $(form + " .password").val();

        var googleResponse = $("[id^=googleResponse]", form).length > 0 ? $("[id^=googleResponse]", form).val() : "";

        if (googleResponse) {

            $.ajax({
                method: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: token,
                    UserName: userName,
                    password: password,
                    googleResponse: googleResponse
                },
                success: function success(response) {
                    if (response.success) {
                        $(".ui.modal.shopping-voucher").html('Logged').modal('hide');
                        $(".ui.accordion.shopping-voucher").accordion('open', 0);

                        if ($(".ui.modal.paypal-reference").length > 0) {
                            $(".ui.modal.paypal-reference").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === ".paypal-reference") {
                                $('#payPalReferenceDescription').hide();
                                $('#paypal-button-reference').empty();
                                $(".ui.tab.segment[data-tab=paypalCheckoutReference]").show();
                                PayPalCheckoutReference();
                            }
                        }

                        if ($(".ui.modal.paypal-transparent").length > 0) {
                            $(".ui.modal.paypal-transparent").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === ".paypal-transparent") {
                                $('#frm-paypal-checkout-transparent').show();
                                $(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").show();
                                PayPalCheckoutTransparent();
                            }
                        }

                        updateAddress();
                        updateDadosUsuario();


                    } else {
                        _alert("", response.message, "warning");
                    }
                },
                complete: function() {
                    if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                        if($("[id^=googleVersion_]").eq(0).val() === "2") {
                            grecaptcha.reset()
                        } else {
                            generateRecaptcha($("[id^=googleModule]").val(), "body");
                        }
                    }
                }
            });

        } else {
            $.ajax({
                method: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: token,
                    UserName: userName,
                    password: password
                },
                success: function success(response) {
                    if (response.success) {
                        $(".ui.modal.shopping-voucher").html('Logged').modal('hide');
                        $(".ui.accordion.shopping-voucher").accordion('open', 0);

                        if ($(".ui.modal.paypal-reference").length > 0) {
                            $(".ui.modal.paypal-reference").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === ".paypal-reference") {
                                $('#payPalReferenceDescription').hide();
                                $('#paypal-button-reference').empty();
                                $(".ui.tab.segment[data-tab=paypalCheckoutReference]").show();
                                PayPalCheckoutReference();
                            }
                        }

                        if ($(".ui.modal.paypal-transparent").length > 0) {
                            $(".ui.modal.paypal-transparent").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === ".paypal-transparent") {
                                $('#frm-paypal-checkout-transparent').show();
                                $(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").show();
                                PayPalCheckoutTransparent();
                            }
                        }

                        updateAddress();
                        updateDadosUsuario();
                    } else {
                        _alert("", response.message, "warning");
                    }
                }
            });
        }
    });
}

function calculaFreteUpdate() {
    $("#zipCode").keyup(function (event) {
        var cep = $("#zipCode").val()
        cep = cep.replace("-", "")
        if (cep.length == 8) {
            buscaCep(cep)
        }
    });
}

function updateDadosUsuario() {
    var zipCodeCart = $("#zipCode").val();
    var idShippingModeCart = $("#idAddress").val();
    $.ajax({
        method: "POST",
        url: "ListaDadosCliente",
        data: {
            zipCodeCart: zipCodeCart,
            idShippingModeCart: idShippingModeCart
        },
        success: function success(response) {
            $("#dadosClienteUpdate").html(response);
            $('.dadosUsuario').addClass('active');
            $('.ui.accordion').accordion("refresh");
            $("#key").val('')
            updateAddress();
            listAddressPayment();
        }
    });
}

function CheckAccessKey(form) {
    $(form).on("click", ".confirmTokkenPayment", function (event) {
        var codeTokkenPayment = $(form + " .codeTokkenPayment").val();
        if ((codeTokkenPayment != "") && (typeof (codeTokkenPayment) != "undefined")) {
            $.ajax({
                method: "POST",
                url: "/customer/CheckAccessKey",
                data: {
                    KeyAccess: codeTokkenPayment
                },
                success: function success(response) {
                    if (response.Success) {
                        viewNewPassword(form);
                        $('.ui.modal.lista-endereco-cliente').modal('refresh');
                    }
                    else {
                        _alert("", response.Message, "warning");
                    }
                }
            });
        } else {
            _alert("", "Informe a Chave de Acesso!", "warning");
        }
    });
}

function viewNewPassword(form) {
    var token = $("input[name='__RequestVerificationToken']").val();

    $.ajax({
        method: "POST",
        url: "PageNewPassword",
        data: {
            __RequestVerificationToken: token
        },
        success: function success(response) {
            $(form).html(response);
            accessUser(form);
        }
    });
}

function accessUser(form) {
    $(form + " .pwdPayment").click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        var token = $(form + " input[name='__RequestVerificationToken']").val();
        var pwdUser = $(form + " .pwdUser").val();
        var pwdUserConfirm = $(form + " .pwdUserConfirm").val();

        if ((pwdUser != "") && (pwdUserConfirm != "")) {
            $.ajax({
                method: "POST",
                url: "NewPassword",
                data: {
                    __RequestVerificationToken: token,
                    pwdUser: pwdUser,
                    pwdUserConfirm: pwdUserConfirm
                },
                success: function success(response) {
                    if (response.success) {
                        updateAddress();
                        updateDadosUsuario();
                        calculaFreteUpdate();

                        $(".ui.modal.shopping-voucher").html('Logged').modal('hide');
                        $(".ui.accordion.shopping-voucher").accordion('open', 0);

                        if ($(".ui.modal.paypal-reference").length > 0) {
                            $(".ui.modal.paypal-reference").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === "#modal-paypal-reference") {
                                $('#payPalReferenceDescription').hide();
                                $('#paypal-button-reference').empty();
                                $(".ui.tab.segment[data-tab=paypalCheckoutReference]").show();
                                PayPalCheckoutReference();
                            }
                        }

                        if ($(".ui.modal.paypal-transparent").length > 0) {
                            $(".ui.modal.paypal-transparent").html('Logged').modal('hide');
                            if ($('.jetCheckout').hasClass('disable_column') === false && form === "#modal-paypal-transparent") {
                                $('#frm-paypal-checkout-transparent').show();
                                $(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").show();
                                PayPalCheckoutTransparent();
                            }
                        }
                    }
                    else {
                        _alert("", response.message, "warning");
                    }
                }
            });
        }
        else {
            _alert("", "Informe a senha", "warning");
        }
    });
}

function ReEnviarCodigoEmail() {
    $(".reenviarCod").click(function () {
        $.ajax({
            method: "POST",
            url: "ReEnviarCodigoEmail",
            success: function success(response) {
                if (!response.success) {
                    _alert("", response.message, "warning");
                }
                else {
                    _alert("Por favor Aguarde!", "Em instantes você receberá no seu e-mail, as instruções para obter seu código de acesso.", "warning");
                }
            }
        });
    });
}

function RecoverPasswordByEmail(form) {
    $(".RecoverPasswordByEmail").click(function () {
        $.ajax({
            method: "POST",
            url: "/customer/RecoverPasswordByEmail",
            data: {
                email: $("#UserName").val()
            },
            success: function success(response) {
                if (response.Success) {
                    _alert("Por favor Aguarde!", response.Message, "warning");
                }
                else {
                    _alert("", response.Message, "warning");
                }
            }
        });
    });
}

function HabilitaBlocoPagamento(habilita) {

    if ($("#checkoutColumn2").length > 0) {
        if (habilita == true) {
            $("#checkoutColumn2").removeClass("disable_column");
            if (isMobile())
                $('html, body').animate({ scrollTop: $("#checkoutColumn2").offset().top - 30 }, 1000);
        } else {
            $("#checkoutColumn2").addClass("disable_column");
            if (isMobile())
                $('html, body').animate({ scrollTop: $(".accordion.frete").offset().top - 30 }, 1000);
        }
    }
}

function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
    if (strCPF.length != 11 ||
        strCPF == "00000000000" ||
        strCPF == "11111111111" ||
        strCPF == "22222222222" ||
        strCPF == "33333333333" ||
        strCPF == "44444444444" ||
        strCPF == "55555555555" ||
        strCPF == "66666666666" ||
        strCPF == "77777777777" ||
        strCPF == "88888888888" ||
        strCPF == "99999999999")
        return false;

    for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
}

function TestaCNPJ(strCnpj) {

    strCnpj = strCnpj.replace(/[^\d]+/g, '');

    if (strCnpj == '') return false;

    if (strCnpj.length != 14)
        return false;

    // Elimina CNPJs invalidos conhecidos
    if (strCnpj == "00000000000000" ||
        strCnpj == "11111111111111" ||
        strCnpj == "22222222222222" ||
        strCnpj == "33333333333333" ||
        strCnpj == "44444444444444" ||
        strCnpj == "55555555555555" ||
        strCnpj == "66666666666666" ||
        strCnpj == "77777777777777" ||
        strCnpj == "88888888888888" ||
        strCnpj == "99999999999999")
        return false;

    // Valida DVs
    tamanho = strCnpj.length - 2
    numeros = strCnpj.substring(0, tamanho);
    digitos = strCnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;

    tamanho = tamanho + 1;
    numeros = strCnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return false;

    return true;

}

function onlyNumbers(evt) {
    var event = evt || window.event;
    var val = event.target.value;
    var filtered = val.replace(/[^0-9]/g, '');

    if (filtered !== val) {
        event.target.value = filtered;
    }
}

function ValeCompraAplicar(_valor) {

    _valor = (_valor + "").replace(".", ",");

    $.ajax({
        async: false,
        method: "POST",
        url: "/Checkout/ValeCompraAplicar",
        data: {
            valor: _valor
        },
        success: function (responseValeCompra) {
            if (responseValeCompra.success) {

                //Atualiza dados do Frete

                if ($('#freteGratisValeCompra').length > 0 && $('#freteGratisValeCompra').val() == "1") {
                    $("#updateShippingPayment").html('<div class="row text center loading-shipping"><img src="/assets/image/loading.svg"></div>')

                    $.ajax({
                        method: "POST",
                        url: "ListaFretePagamento",
                        data: {
                            freteGratisValeCompra: true
                        },
                        success: function success(data) {

                            sessionStorage.setItem("shippingSelected", $("#GetShippping .card .checkbox.checked input").val())
                            sessionStorage.setItem("ShippingValue", $("#GetShippping .card .checkbox.checked input").data("value"))

                            $("#updateShippingPayment").html(data);

                            var ShippingSelected = sessionStorage.getItem("shippingSelected");
                            var ShippingValue = sessionStorage.getItem("ShippingValue");
                            var idShipping = $("#GetShippping .card .checkbox input[data-id='"+ShippingSelected+"']", "#updateShippingPayment");
                            var valueShipping = $("#GetShippping .card .checkbox input[data-id='"+ShippingSelected+"']").data("value");

                            clickShipping();
                            HabilitaBlocoPagamento(false);

                            if(idShipping.length > 0 && valueShipping == ShippingValue) {
                                idShipping.click();
                                _alert("", "Vale compras aplicado com sucesso", "success");
                            } else {
                                _alert("Vale compras aplicado com sucesso", "Os valores de frete foram atualizados. Selecione o frete desejado", "warning");
                            }
                            CampoEntregaAgendada();
                            $('.ui.modal').modal('hide');


                            //isLoading(".ui.accordion.frete");
                        }
                    });
                } else {
                    _alert("", "Vale Compras aplicado com sucesso!", "success");
                }

                isLoading(".ui.accordion.shopping-voucher");
                ValeCompraRefresh();
                atualizaResumoCarrinho(false);
                isLoading(".ui.accordion.shopping-voucher");
                if ($('.ui.toggle.checkbox.box-card').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-card').trigger('click');
                }
                if ($('.ui.toggle.checkbox.box-debit').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-debit').trigger('click');
                }
            } else {
                _alert(responseValeCompra.msg);
            }
        }
    });
}

function ValeCompraRemover() {
    $.ajax({
        async: false,
        method: "PUT",
        url: "/Checkout/ValeCompraRemover",
        success: function (responseValeCompra) {
            if (responseValeCompra.success) {
                atualizaEnderecos();
                ValeCompraRefresh();
                $('#btnGerarPedidoValeCompra').addClass("hideme");
                $(".ui.accordion.shopping-voucher").accordion('close', 0);
                $('#formas-pagamento').removeClass("disable_column");
                atualizaResumoCarrinho(false);
                _alert("", "Vale Compras removido com sucesso!", "success");
            }
        }
    });
}

function ValeCompraRefresh() {
    $.ajax({
        async: false,
        method: "GET",
        url: "/Checkout/ValeCompraRefresh",
        success: function (responseValeCompra) {

            if (responseValeCompra.success) {

                var balance = ("" + responseValeCompra.valeCompra.balanceAmount).replace(",", ".");

                $('#ShoppingVoucherValue').data('balance', balance);

                var remainingBalance = responseValeCompra.valeCompra.remainingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                var balanceAmount = responseValeCompra.valeCompra.balanceAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                var suggestedAmount = responseValeCompra.valeCompra.suggestedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                $('#ValeCompra_remainingBalance').html(remainingBalance);
                $('#ValeCompra_balanceAmount').html(balanceAmount);
                $('#ValeCompra_suggestedAmount').html(suggestedAmount);

                if ($('.ui.toggle.checkbox.box-card').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-card').trigger('click');
                }
                if ($('.ui.toggle.checkbox.box-debit').hasClass('checked')) {
                    $('.ui.toggle.checkbox.box-debit').trigger('click');
                }
            }
        }
    });
}


function CampoEntregaAgendada() {
    $('[id*="combo_dataperiodoagendada_"]').change(function () {
        //isLoading(".ui.accordion.frete");

        HabilitaBlocoPagamento(false)
        var data_periodo_selecionada = $("option:selected", this).val()
        var idFrete = $(this).attr('data-id-frete');
        if ($("#combo_dataperiodoagendada_" + idFrete).val() != "") {
            var zipcode = $("#zipcode").val();
            var idEntrega = "";
            var idPeriodoEntrega = "";
            var valorFrete = "";
            var correiosEntrega = "";
            var entregaAgendada = "";
            var exclusivaEntregaAgendada = "";
            var carrier;
            var mode;
            var hub;
            var valorSomaFrete = "";
            var data_selecionada = "";
            var value = "";
            var ponteiroCurrent = $(".shippingGet", this);
            $(".shippingGet").attr("checked", false);
            $(ponteiroCurrent).attr("checked", true);

            //valorSomaFrete = $("#combo_dataperiodoagendada_"+idFrete + " option:selected").data("addvalue");
            valorSomaFrete = $("option:selected", this).data("addvalue");
            idEntrega = $("option:selected", this).data("idscheduled");
            idPeriodoEntrega = $("option:selected", this).data("idscheduledperiod");
            valorFrete = $("#radio_" + idFrete).attr("data-value");
            data_selecionada = $("#dateAgendada_" + idFrete).val();
            correiosEntrega = $("#radio_" + idFrete).attr("data-correios");
            entregaAgendada = $("#radio_" + idFrete).attr("data-entregaagendada");
            exclusivaEntregaAgendada = $("#radio_" + idFrete).attr("data-exclusiva-entregaagendada");
            carrier = $("#radio_" + idFrete).attr("data-carrier");
            mode = $("#radio_" + idFrete).attr("data-mode");
            hub = $("#radio_" + idFrete).attr("data-hub");
            value = $("#radio_" + idFrete).attr("data-value");

            SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub, value, valorFrete);
        }
        else {
            $("#combo_dataperiodoagendada_" + idFrete).hide("fast");
            $(".card:not(.checked) .hasDatepicker", "#GetShippping").datepicker('setDate', null);
            atualizaResumoCarrinho();
        }
        //isLoading(".ui.accordion.frete");
    });

    $('[id*="dateAgendada_"]').change(function () {
        var data_selecionada = $(this).val();
        var idFrete = $(this).attr('data-id-frete');
        var DataAgendadas = JSON.parse($('#json_dataagendada_' + idFrete).val());
        var optionPeriodo = "";

        var exclusivaEntregaAgendada = $("#radio_" + idFrete).attr("data-exclusiva-entregaagendada");

        for (var i = 0; i < DataAgendadas[0].listScheduled.length; i++) {
            if (DataAgendadas[0].listScheduled[i].listScheduledPeriodo != null)
                for (var j = 0; j < DataAgendadas[0].listScheduled[i].listScheduledPeriodo.length; j++) {
                    if (DataAgendadas[0].listScheduled[i].date.substr(0, 10) == data_selecionada.substr(6, 4) + "-" + data_selecionada.substr(3, 2) + "-" + data_selecionada.substr(0, 2))
                        optionPeriodo = optionPeriodo + "<option value=" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].period + " data-addvalue=" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].deliveryPlusValue + " data-idscheduled=" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].idScheduled + " data-IdScheduledPeriod=" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].idScheduledPeriod + ">" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].period + " (" + DataAgendadas[0].listScheduled[i].listScheduledPeriodo[j].timePeriod.replace(" - ", " às ") + ")</option>";
                }
        }

        $("#combo_dataperiodoagendada_" + idFrete)
            .find('option')
            .remove()
            .end()
            .append('<option value="">Selecione</option>')
            .val('')
        ;

        $("#combo_dataperiodoagendada_" + idFrete).append(optionPeriodo);
        $("#combo_dataperiodoagendada_" + idFrete).trigger("chosen:updated");
        $("#combo_dataperiodoagendada_" + idFrete).show("slow");

        if (exclusivaEntregaAgendada == "True")
            if (($("#dateAgendada_" + idFrete).val() != "") && ($("#combo_dataperiodoagendada_" + idFrete).val() != ""))
                HabilitaBlocoPagamento(true)
            else
                HabilitaBlocoPagamento(false);
        else
            HabilitaBlocoPagamento(true)

        if ($('#PaymentLinkChangeBrand').length > 0) {
            if ($('#PaymentLinkChangeBrand').val() == "1") {
                $("#combo_dataperiodoagendada_" + idFrete).val($("#PaymentLinkPeriod").val()).trigger("change");
            }
        }
        //alert(data_selecionada + id_selecionado);
    });

}

function ValidCart(stop) {
    $.ajax({
        method: "GET",
        url: "/Checkout/ValidCart",
        async: false,
        cache: false,
        dataType: "json",
        success: function (response) {
            if (!response.success) {
                stop = true;
                _confirm({
                    title: "",
                    text: response.message,
                    type: "error",
                    confirm: {
                        text: "OK"
                    },
                    cancel: {
                        text: "Cancelar",
                        color: "#95979b"
                    },
                    showCancelButton: false,
                    callback: function () {
                        location.reload();
                    }
                }, false);
                $(".GerarPedido").removeClass("loading");
                $(".GerarPedido").removeClass("disabled");
            } else
                stop = false;
        },
        error: function (response) {
            swal('', response.message, 'error');
            stop = false;
        }
    });

    return stop;
}

function UpdateValueTwoCreditCards(obj) {
    var strValorCartao1 = $('#Valor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
    if (strValorCartao1 == "") strValorCartao1 = "0";
    var strValorCartao2 = $('#Valor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
    if (strValorCartao2 == "") strValorCartao2 = "0";

    var discountInitial = parseFloat($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var discountShoppingVoucher = 0;
    if ($('#desconto_shopping_voucher').length > 0) {
        discountShoppingVoucher = parseFloat($('#desconto_shopping_voucher').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    }
    var shippingCheckout = parseFloat($('#shipping_checkout').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var subTotalCheckout = parseFloat($('.subtotal').html().replace('&nbsp;', '').replace('R$', '').replace(".", "").replace(",", "."));

    var totalCheckout = (subTotalCheckout + shippingCheckout) - (discountInitial + discountShoppingVoucher);
    var valorCartao1 = parseFloat(strValorCartao1);
    var valorCartao2 = parseFloat(strValorCartao2);

    if (valorCartao1 < shippingCheckout) {
        _alert("", "Valor do cartão 1 deve ser maior que " + $('#shipping_checkout').html() + ".", "warning");
        return false;
    }
    if (valorCartao2 < shippingCheckout) {
        _alert("", "Valor do cartão 2 deve ser maior que " + $('#shipping_checkout').html() + ".", "warning");
        return false;
    }

    if ($(obj).attr('id') === 'Valor1') {
        valorCartao2 = (totalCheckout - valorCartao1);
    } else {
        valorCartao1 = (totalCheckout - valorCartao2);
    }

    if ((valorCartao1 + valorCartao2) > totalCheckout) {
        _alert("", "Valor digitado excede o valor total do pedido.", "warning");
        return false;
    }

    $('#Valor1').val(valorCartao1.toFixed(2).replace(",", "").replace(".", ","));
    $('#Valor2').val(valorCartao2.toFixed(2).replace(",", "").replace(".", ","));

    $("#CreditCard1, #CreditCard2").trigger('blur');
    return false;
}

function UpdateValueTwoDebitCards(obj) {
    var strValorCartao1 = $('#DebitValor1').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
    if (strValorCartao1 == "") strValorCartao1 = "0";
    var strValorCartao2 = $('#DebitValor2').val().replace("R$", "").replace(".", "").replace(",", ".").trim();
    if (strValorCartao2 == "") strValorCartao2 = "0";

    var discountInitial = parseFloat($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var discountShoppingVoucher = 0;
    if ($('#desconto_shopping_voucher').length > 0) {
        discountShoppingVoucher = parseFloat($('#desconto_shopping_voucher').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    }
    var shippingCheckout = parseFloat($('#shipping_checkout').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
    var subTotalCheckout = parseFloat($('.subtotal').html().replace('&nbsp;', '').replace('R$', '').replace(".", "").replace(",", "."));

    var totalCheckout = (subTotalCheckout + shippingCheckout) - (discountInitial + discountShoppingVoucher);
    var valorCartao1 = parseFloat(strValorCartao1);
    var valorCartao2 = parseFloat(strValorCartao2);

    if (valorCartao1 < shippingCheckout) {
        _alert("", "Valor do cartão 1 deve ser maior que " + $('#shipping_checkout').html() + ".", "warning");
        return false;
    }
    if (valorCartao2 < shippingCheckout) {
        _alert("", "Valor do cartão 2 deve ser maior que " + $('#shipping_checkout').html() + ".", "warning");
        return false;
    }

    if ($(obj).attr('id') === 'DebitValor1') {
        valorCartao2 = (totalCheckout - valorCartao1);
    } else {
        valorCartao1 = (totalCheckout - valorCartao2);
    }

    if ((valorCartao1 + valorCartao2) > totalCheckout) {
        _alert("", "Valor digitado excede o valor total do pedido.", "warning");
        return false;
    }

    $('#DebitValor1').val(valorCartao1.toFixed(2).replace(",", "").replace(".", ","));
    $('#DebitValor2').val(valorCartao2.toFixed(2).replace(",", "").replace(".", ","));

    $("#DebitCard1, #DebitCard2").trigger('blur');

    return false;
}


var availableDates = [];
//var mp;
//var cardForm;

$(document).ready(function () {
    
    if($("#formas-pagamento").length > 0)
        checkValidatePersonalization();
    

    if ($("#hasBraspag3DS20").val() == "true") {
        bpmpi_environment($('#envBraspag3DS20').val());
    }

    $("#formas-pagamento .itemTabPayment").appendTo($("#formas-pagamento #tabPayment"));

    var valueRecurrency = $("#checkout_products_list .item[data-recurrent='True']").length,
        containerPayment = $("#formas-pagamento");

    if(valueRecurrency > 0) {
        $('.itemTabPayment[data-tab!="cardCredit"], >.tab[data-tab!="cardCredit"]', containerPayment).hide()
        $(".itemTabPayment", containerPayment).appendTo($("#tabPayment", containerPayment));
    }

    // $("#formas-pagamento #tabPayment .itemTabPayment").tab();
    $("#formas-pagamento #tabPayment .itemTabPayment").tab({
        onVisible: function (tabPath) {
            if (tabPath != "cardCredit" && $('#CreditCard').val() != "") {
                $('#parcCard').empty().append("<option value='0'>Informe o numero do cartão primeiro</option>");
                $('#CreditCard').val('');
                $("#idBrandCard").val('');
                atualizaResumoCarrinho();
            }
            else if (tabPath != "cardDebit" && $('#DebitCard').val() != "")
            {
                $('#DebitCard').val('');
                $("#idBrandCard").val('');
                atualizaResumoCarrinho();
            }

            $(">iframe", "#paypal-cc-form").css("width", "100%");
        }
    });

    if ($('#tabPayment > a[data-tab=paypalCheckoutTransparent]').length > 0 && $('#modal-paypal-transparent').length > 0) {
        $('#frm-paypal-checkout-transparent').hide();
        $('#tabPayment > a[data-tab=paypalCheckoutTransparent]').on('click', function () {
            if ($('.ui.modal.paypal-transparent').html().trim() === "Logged") {
                $('#frm-paypal-checkout-transparent').show();
                $(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").show();
                PayPalCheckoutTransparent();
            }
            else {
                $('#frm-paypal-checkout-transparent').hide();
                $(".ui.tab.segment[data-tab=paypalCheckoutTransparent]").hide();
                viewAddressLogged(".paypal-transparent");
                RecoverPasswordByEmail(".paypal-transparent");
                CheckAccessKey("#modal-paypal-transparent");
                ReEnviarCodigoEmail();
                $('.ui.modal.paypal-transparent').modal('show');
                return false;
            }
        });
    }
    else {
        $('#frm-paypal-checkout-transparent').show();
        $('#tabPayment > a[data-tab=paypalCheckoutTransparent]').trigger('click');
    }

    if ($('#tabPayment > a[data-tab=paypalCheckoutReference]').length > 0) {
        $('#tabPayment > a[data-tab=paypalCheckoutReference]').on('click', function () {
            if ($('.ui.modal.paypal-reference').html().trim() === "Logged") {
                $('#payPalReferenceDescription').hide();
                $('#paypal-button-reference').empty();
                $(".ui.tab.segment[data-tab=paypalCheckoutReference]").show();
                PayPalCheckoutReference();
            }
            else {
                $(".ui.tab.segment[data-tab=paypalCheckoutReference]").hide();
                viewAddressLogged(".paypal-reference");
                RecoverPasswordByEmail(".paypal-reference");
                CheckAccessKey("#modal-paypal-reference");
                ReEnviarCodigoEmail();
                $('.ui.modal.paypal-reference').modal('show');
                return false;

            }
        });
    }

    if ($('.ui.accordion.shopping-voucher').length > 0) {

        //ValeCompraRemover()

        $('#ShoppingVoucherValue').mask('#.##0,00', { reverse: true })

        $('.ui.accordion.shopping-voucher > .title').on('click', function () {
            //if(!confirm("checka accordion")) return false;
            if ($('.ui.modal.shopping-voucher').html().trim() == "Logged") {
                return true;
            }
            else {
                viewAddressLogged(".shopping-voucher");
                RecoverPasswordByEmail(".shopping-voucher");
                CheckAccessKey("#modal-shopping-voucher");
                ReEnviarCodigoEmail();
                $('.ui.modal.shopping-voucher').modal('show');
                return false;
            }
        });

        $("#ApplyVoucher").on("click", function() {

            var $voucher = $('#ShoppingVoucherValue');
            let valor = $voucher.val();
            let balance = $voucher.data('balance');
            let calculationBase = $voucher.data('base');

            var shoppingVoucherValue = new Number(valor.replace(".", "").replace(",", "."));
            var subTotal = new Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
            var saldoShoppingVoucher = new Number(balance.replace(",", "."));
            var shippingTotal = new Number($('#shipping_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));
            var discount = new Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));

            var valorCompare = 0;

            let applyVoucher = true;
            if (calculationBase == "TotalProduto") {
                valorCompare = (subTotal - discount).toFixed(2);
                if (shoppingVoucherValue > valorCompare || shoppingVoucherValue > saldoShoppingVoucher) {
                    _alert("", "O valor deve ser menor ou igual ao valor total dos produtos!", "warning");
                    applyVoucher = false;
                }
            } else {
                valorCompare = ((subTotal - discount) + shippingTotal).toFixed(2);
                if (shoppingVoucherValue > valorCompare || shoppingVoucherValue > saldoShoppingVoucher) {
                    _alert("", "O valor deve ser menor ou igual ao valor total do pedido!", "warning");
                    applyVoucher = false;
                }
            }
            if (applyVoucher) {

                //if (shoppingVoucherValue > valorCompare || shoppingVoucherValue > saldoShoppingVoucher) {
                //    _alert("", "O valor deve ser menor ou igual ao valor dos produtos!", "warning");
                //    //$(this).val('');                    
                //    //ValeCompraRemover();    

                //} else {

                if (parseFloat(shoppingVoucherValue) == 0) {
                    ValeCompraRemover();
                } else {
                    if (calculationBase == "TotalPedido") {
                        shippingTotal = valorCompare - shoppingVoucherValue;
                    }
                    if (parseFloat(shoppingVoucherValue) === parseFloat(valorCompare) && parseFloat(shippingTotal) === 0 && $("#GetShippping .card .checkbox.checked input").val() !== undefined) {
                        $('#btnGerarPedidoValeCompra').removeClass("hideme");
                        $('#formas-pagamento').addClass("disable_column");
                    } else {
                        $('#btnGerarPedidoValeCompra').addClass("hideme");
                        $('#formas-pagamento').removeClass("disable_column");
                    }

                    if (parseFloat(shoppingVoucherValue) > 0 && shoppingVoucherValue <= valorCompare && shoppingVoucherValue <= saldoShoppingVoucher) {
                        ValeCompraAplicar(shoppingVoucherValue);
                    }
                }
            }
        });
    }

    if ($('#hasPagSeguroApp').val() !== "0" && $('#hasPagSeguroApp').val() !== undefined) {
        $.ajax({
            async: false,
            method: "GET",
            url: "/Checkout/GetConfigPagSeguroApp",
            success: function (responseConfig) {
                var urlJS = '';
                if (responseConfig.config.Homologation === false) {
                    urlJS = 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }
                else {
                    urlJS = 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }

                $('#MaximumInstallmentWithoutInterest').val(responseConfig.config.MaximumInstallmentWithoutInterest);

                if (responseConfig.session !== null) {
                    $.getScript(urlJS, function () {
                        $('#PaymentSession').val(responseConfig.session.Id);
                        PagSeguroDirectPayment.setSessionId(responseConfig.session.Id);

                        $.ajaxSetup({ async: true });
                    });
                }
                else {
                    _alert("Erro ao obter sessão no pagseguro, entre em contato com suporte técnico.");
                }
            }
        });
    }

    if ($('#hasPagSeguro').val() !== "0" && $('#hasPagSeguro').val() !== undefined) {
        $.ajax({
            async: false,
            method: "GET",
            url: "/Checkout/GetConfigPagSeguro",
            success: function (responseConfig) {
                var urlJS = '';
                if (responseConfig.config.production) {
                    urlJS = 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }
                else {
                    urlJS = 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }

                $('#MaximumInstallment').val(responseConfig.config.maximumInstallment);

                $('#MaximumInstallmentWithoutInterest').val(responseConfig.config.maximumInstallmentWithoutInterest);

                if (responseConfig.session != null) {
                    $.getScript(urlJS, function () {
                        $('#PaymentSession').val(responseConfig.session.Id);
                        PagSeguroDirectPayment.setSessionId(responseConfig.session.Id);
                        $.ajaxSetup({ async: true });
                    });
                }
                else {
                    _alert("Erro ao obter sessão no pagseguro, entre em contato com suporte técnico.");
                }
            }
        });
    }

    if (document.location.pathname.toLowerCase() == "/checkout/payment") {
        GetStatusAntiFraudMaxiPago();
        var zipCode = $("#dadosClienteUpdate #zipcode").val();
        $("#zipcode").val(zipCode)
        isLoading(".ui.accordion.frete");
        buscaCepCD(zipCode).then(function () {
            changeCdCheckout();
        })
        isLoading(".ui.accordion.frete");
    }


    if ($('#hasMercadoPago').val() !== undefined && $('#hasMercadoPago').val() !== "0") {
        $.getScript("https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js", function () {
            window.Mercadopago.setPublishableKey($('#MercadoPagoPublicKey').val());
            GerarPedidoMercadoPagoCheckoutPRO();
        });
    }


    $('#Document').keyup(function (event) {
        return onlyNumbers(event);
    });

    CampoEntregaAgendada();

    $('#Document').blur(function () {
        if (!TestaCPF($(this).val())) {
            _alert("", "Número de CPF inválido.", "warning");
            $(this).val('');
        }
        return false;
    });

    $('#docNumber').keyup(function (event) {
        return onlyNumbers(event);
    });

    $('#docNumber').blur(function () {
        if ($('#docType').val() == "CPF") {
            if (!TestaCPF($(this).val())) {
                _alert("", "Número de CPF inválido.", "warning");
                $(this).val('');
            }
        } else {
            if (!TestaCNPJ($(this).val())) {
                _alert("", "Número de CNPJ inválido.", "warning");
                $(this).val('');
            }
        }
        return false;
    });

    //$.jetRoute("checkout", function (){
    if ($("#idAddress").val() != "") {
        window.onbeforeunload = function (e) {
            if (window.location.pathname.toLowerCase().trim() == "/checkout/payment") {
                $('#checkoutColumn1, #checkoutColumn2').addClass("disable_column");
                if ($('.ui.accordion.shopping-voucher').length > 0) {
                    $.ajax({
                        async: false,
                        method: "PUT",
                        url: "/Checkout/ValeCompraRemover",
                        success: function (responseValeCompra) { }
                    });
                }

                $.ajax({
                    async: false,
                    method: "POST",
                    url: "/Checkout/CancelarCalculoFrete",
                    success: function (responseCancelarCalculoFrete) { }
                });
            }
        }

        clickShipping();
        if ($(".GerarPedido").length > 0) {
            OrderCreate();
        }
        onChangeCheckBox();
        verificaPresente();


        //Cartão de Crédito
        validaCartaoCreditoBandeira("#CreditCard", "#btnCardCredit", "#brandCard",  "#idBrandCard",  "#parcCard",  "C", 1, 1, "blur");
        validaCartaoCreditoBandeira("#CreditCard1", "#btnCardCredit", "#brandCard1", "#idBrandCard1", "#parcCard1", "C", 1, 1, "blur");
        validaCartaoCreditoBandeira("#CreditCard2", "#btnCardCredit", "#brandCard2", "#idBrandCard2", "#parcCard2", "C", 1, 1, "blur");

        //Cartão de Débito
        validaCartaoCreditoBandeira("#DebitCard", "#btnCardDebit", "#debitBrandCard", "#debitIdBrandCard", "#parcCard", "D", 14, 0, "blur");
        validaCartaoCreditoBandeira("#DebitCard1", "#btnCardDebit", "#debitBrandCard1", "#debitIdBrandCard1", "#parcCard1", "D", 14, 0, "blur");
        validaCartaoCreditoBandeira("#DebitCard2", "#btnCardDebit", "#debitBrandCard2", "#debitIdBrandCard2", "#parcCard2", "D", 14, 0, "blur");

        //OneClick
        validaCartaoCreditoBandeira("#OneClick", "#btnOneClick", "#brandOneClick", "#idBrandOneClick", "#parcCardOneClick", "C", 1, 0, "change");
        $("#checkOneClickField").hide();
        $("#documentField").hide();
        $("#documentField").removeClass("required");

        listAddressPayment();
        changeAddressPayment();
        showAddressPayment();
        applyDiscount();
        CheckAccessKey("#ListaEnderecosCliente");
        ReEnviarCodigoEmail();
        onChangeParcelamento();

        HabilitaBlocoPagamento(false);
    }
    else {
        _alert("", "Você não pode fechar um pedido sem um endereço de entrega!", "warning");
    }
    if ($('.contentcartao').length > 0) {
        $('.ui.accordion').accordion({
            exclusive: true,
            animateChildren: false,
            onOpening: function () {
                $('.contentcartao .segment').removeClass('visible').removeAttr('style');
            }
        });
    }

    function GerarPedidoMercadoPagoCheckoutPRO() {
        $('.GerarPedidoMercadoPagoCheckoutVPRO').unbind().on('click', function () {
            let _idPaymentBrand = $(this).attr("data-idbrand");

            $(".GerarPedidoMercadoPagoCheckoutVPRO").addClass("loading");
            $(".GerarPedidoMercadoPagoCheckoutVPRO").addClass("disabled");

            $.ajax({
                url: "/Checkout/MercadoPagoGenereatePreference",
                method: "POST",
                data: {
                    idCustomer: $("#idCustomer").val(),
                    idPaymentBrand: new Number(_idPaymentBrand),
                    idAddress: $("#idAddress").val(),
                    _msgPedido: $("#mensagem").val()
                },
                success: function (response) {
                    if (response.Success == true) {
                        let _preferenceId = response.PreferenceId;

                        $.getScript("https://sdk.mercadopago.com/js/v2", function () {
                            const mp = new MercadoPago($('#MercadoPagoPublicKey').val(), {
                                locale: 'pt-BR'
                            });

                            mp.checkout({
                                preference: {
                                    id: _preferenceId
                                },
                                autoOpen: true
                            });
                        });
                    }
                    else {
                        swal({
                            title: '',
                            html: response.Message,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        });
                    }
                },
                complete: function () {
                    $(".GerarPedidoMercadoPagoCheckoutVPRO").removeClass("loading");
                    $(".GerarPedidoMercadoPagoCheckoutVPRO").removeClass("disabled");
                }
            });
        });
    }

    function SendCheckAccessKeyByEmail(email) {
        let emailDelivered = false

        $.ajax({
            method: "POST",
            url: "/Customer/Accesskey",
            async: false,
            cache: false,
            data: {
                __RequestVerificationToken: gettoken(),
                email: email
            },
            success: function (response) {
                if (response.Success)
                    emailDelivered = true
                else
                    emailDelivered = false
            },
            error: function (response) {
                emailDelivered = false
                swal('', response.message, 'error')
            }
        })
        return emailDelivered
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    function BankSliptItauShopline(KeyAccessBankSlip) {
        let html =
            "<div class='column'>" +
            "<form id='BankSliptItauShopline' action='https://shopline.itau.com.br/shopline/shopline.aspx'" +
            "method='post'" +
            "name='itauShopline'" +
            "id='itauShopline'" +
            "target='openShopline'>" +
            "<input type='hidden' name='DC' id='DC' value='" + KeyAccessBankSlip + "' />" +
            "</form>" +
            "</div>"

        $("#printBankSlip").html(html)
        $('.ui.modal.shopline').modal('show');
        $("#BankSliptItauShopline").submit()
    }

    function BankSlipByLink(url) {
        var win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            $("body").append('<a id="linkPaymentBank" href="'+url+'" target="_blank"></a>');
            swal({
                title: 'Ops!',
                html: "Seu navegador bloqueou a abertura do boleto. <br/>O boleto será aberto em uma nova página",
                type: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            }).then(function () {
                document.getElementById("linkPaymentBank").click();
            });

        }
    }

    function PrintBankSlipSecurity() {
        let PaymentJson = readCookie("Payment").replace("Payment=", "")

        $.ajax({
            method: "POST",
            url: "/Checkout/PrintBankSlipSecurity",
            async: false,
            dataType: "text",
            cache: false,
            data: {
                __RequestVerificationToken: gettoken(),
                json: PaymentJson
            },
            success: function (response) {
                if (response != "") {
                    let payment = JSON.parse(response)
                    switch (payment.paymentResponse.Gateway) {
                        //0 - Enum Maxpago
                        case 0:
                            BankSlipByLink(payment.paymentResponse.URLBoleto)
                            break;
                        //2 - Enum PagSeguro
                        case 2:
                            BankSlipByLink(payment.paymentResponse.URLBoleto)
                            break;
                        //4 - Enum Itau Shopline
                        case 4:
                            BankSliptItauShopline(payment.paymentResponse.KeyAccessBankSlip)
                            break;
                        case 5:
                            BankSlipByLink(payment.paymentResponse.URLBoleto)
                            break;
                        case 6:
                            BankSlipByLink(payment.paymentResponse.URLBoleto)
                            break;
                        default:
                            BankSlipByLink(payment.paymentResponse.URLBoleto)
                            break;
                    }
                } else {
                    swal('', response, 'error');
                }
            },
            error: function (response) {
                swal('', response, 'error');
            }
        })
    }



    $(document).on('click', '#CopyQrCode', function (e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).html("PIX Copia e cola");

        if ($(this).attr("disabled") != "disabled") {
            let value = $('.divQrCode').text();

            let inputTest = document.createElement("input");
            inputTest.value = value;
            //Anexa o elemento ao body
            document.body.appendChild(inputTest);
            //seleciona todo o texto do elemento
            inputTest.select();
            //executa o comando copy
            //aqui é feito o ato de copiar para a area de trabalho com base na seleção
            document.execCommand('copy');
            //remove o elemento
            document.body.removeChild(inputTest);

            $(this).html($(this).text() + ' <i class="check icon"></i>');
        }
    });


    $(document).on('click', '#PaymentLinkCopy', function (e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).html("Copiar link de pagamento");

        if ($(this).attr("disabled") != "disabled") {
            let value = $(this).attr("href");

            let inputTest = document.createElement("input");
            inputTest.value = value;
            //Anexa o elemento ao body
            document.body.appendChild(inputTest);
            //seleciona todo o texto do elemento
            inputTest.select();
            //executa o comando copy
            //aqui é feito o ato de copiar para a area de trabalho com base na seleção
            document.execCommand('copy');
            //remove o elemento
            document.body.removeChild(inputTest);

            $(this).html($(this).text() + ' <i class="check icon"></i>');
        }
    });

    $(document).on('click', '#PaymentLinkCopyCentral', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($(this).attr("disabled") != "disabled") {
            let value = $(this).attr("href");

            let inputTest = document.createElement("input");
            inputTest.value = value;
            //Anexa o elemento ao body
            document.body.appendChild(inputTest);
            //seleciona todo o texto do elemento
            inputTest.select();
            //executa o comando copy
            //aqui é feito o ato de copiar para a area de trabalho com base na seleção
            document.execCommand('copy');
            //remove o elemento
            document.body.removeChild(inputTest);

            $(this).html($(this).text() + ' <i class="check icon"></i>');
        }
    });

    $(document).on('click', '#PaymentLinkWhatsApp', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($(this).attr("disabled") != "disabled") {
            window.open($(this).attr("href"), "", "");
        }
    });

    //Botão de imprimir da página
    $(document).on("click", "#ProcessBankSlip", function (e) {
        e.stopPropagation()

        $.ajax({
            method: "GET",
            url: "/Customer/HasRegisteredPassword",
            async: false,
            cache: false,
            success: function (response) {
                let email = response.email
                if (!response.AutomaticSecurePasswordGeneration) {
                    //Exibir modal de senha
                    $("#UserName").val(email)
                    $("#modalPassword").removeClass("hidden")
                    $("#modalPassword").modal('show')
                }
                else {
                    PrintBankSlipSecurity()
                }
            },
            error: function (response) {
                swal('', response.message, 'error');
            }
        });
    })

    //Botões modal de código de acesso    **************************************
    function KeyAccess() {
        let email = $("#UserName").val()
        let keyAccess = $("#KeyAccess").val()

        $.ajax({
            method: "POST",
            url: "/Customer/CheckAccessKey",
            async: false,
            cache: false,
            data: {
                Email: email,
                KeyAccess: keyAccess
            },
            success: function (response) {
                if (response.Success) {
                    //Exibir modal de cadastro de senha        
                    $("#modalAccessCode").modal("hide")
                    $("#modalRegisterPassword").removeClass("hidden")
                    $("#modalRegisterPassword").modal("show")
                } else {
                    swal('', response.Message, 'error');
                }
            },
            error: function (response) {
                swal('', response.message, 'error');
            }
        });
    }

    $(document).on("click", "#ConfirmAccessCode", function (e) {
        e.stopPropagation()
        KeyAccess()
    })

    $(document).on("keypress", "#KeyAccess", function (e) {
        if (e.which == 13) {
            e.stopPropagation()
            KeyAccess()
            return false
        }
    })

    $(document).on("click", "#ReSendAccessCode", function (e) {
        e.stopPropagation()
        let email = $("#UserName").val()
        if (SendCheckAccessKeyByEmail(email)) {
            //Exibir modal de Access Code (token enviado por e-mail)
            $("#KeyAccess").val("")
            swal('', "Código de acesso enviado.", 'success');
        }
        else {
            swal('', "Código de acesso não enviado.", 'error');
        }
    })

    $(document).on("click", "#BackAccessCode", function (e) {
        e.stopPropagation()
        $("#modalAccessCode").modal("hide")
    })

    //************************************************************************


    //Botões modal de senha    ***********************************************
    function Login() {
        let userName = $("#UserName").val()
        let password = $("#loginPassword").val()

        $.ajax({
            method: "POST",
            url: "/Customer/LoginApplications",
            async: false,
            cache: false,
            dataType: "json",
            data: {
                __RequestVerificationToken: gettoken(),
                UserName: userName,
                Password: password
            },
            success: function (response) {
                if (response.success) {
                    PrintBankSlipSecurity()
                    $("#loginPassword").val("")
                    $("#modalPassword").modal("hide")
                } else {
                    swal('', response.message, 'error')
                    $("#loginPassword").val("")
                }
            },
            error: function (response) {
                swal('', response.message, 'error')
                $("#loginPassword").val("")
                $("#modalPassword").modal("hide")
            }
        })
    }

    $(document).on("click", "#ConfirmPassword", function (e) {
        e.stopPropagation()
        Login()
    })
    $(document).on("keypress", "#loginPassword", function (e) {
        if (e.which == 13) {
            e.stopPropagation()
            Login()
            return false
        }
    })

    $(document).on("click", "#BackPassword", function (e) {
        e.stopPropagation()
        $("#modalPassword").addClass("hidden")
        $("#modalPassword").modal("hide")
    })
    //***************************************************************************


    //Botões modal de cadastro de senha    **************************************
    function RegisterPasswordWithKeyAccess() {
        let password = $("#password").val()
        let passwordConfirm = $("#passwordConfirm").val()
        let email = $("#UserNameCode").val()
        let keyAccess = $("#KeyAccess").val()

        $.ajax({
            method: "POST",
            url: "/Customer/RegisterPasswordWithKeyAccess",
            async: false,
            cache: false,
            data: {
                __RequestVerificationToken: gettoken(),
                password: password,
                passwordConfirm: passwordConfirm,
                email: email,
                keyAccess: keyAccess
            },
            success: function (response) {
                if (response.success) {
                    //Exibir boleto                    
                    $("#modalRegisterPassword").modal("hide")
                    $("#password").val("")
                    $("#passwordConfirm").val("")
                    swal('', "Senha cadastrada.", 'success')
                    setTimeout(function () {
                        PrintBankSlipSecurity()
                    }, 2000)
                } else {
                    $("#password").val("")
                    $("#passwordConfirm").val("")
                    $("#password").focus()
                    swal('', response.message, 'error')
                }
            },
            error: function (response) {
                $("#password").val("")
                $("#passwordConfirm").val("")
                swal('', response.message, 'error')
            }
        })
    }

    $(document).on("click", "#RegisterPassword", function (e) {
        e.stopPropagation(e)
        RegisterPasswordWithKeyAccess()
    })

    $(document).on("keypress", "#passwordConfirm", function (e) {
        e.stopPropagation()
        if (e.which == 13)
            return false
    })

    $(document).on("keypress", "#passwordConfirm", function (e) {
        e.stopPropagation()
        if (e.which == 13) {
            RegisterPasswordWithKeyAccess()
        }
    })
    //************************************************************************



    if ($('form#validCardCredit').length > 0) {
        $('#Valor1, #Valor2').maskMoney();

        $('.card-wrapper > .jp-card-container, .card-wrapper1 > .jp-card-container, .card-wrapper2 > .jp-card-container').css({ 'transform': 'scale(1)' });

        $(document).on('change', '#Valor1, #Valor2', function () {
            UpdateValueTwoCreditCards($(this));
            return false;
        });

        $(document).on('click', '.ui.toggle.checkbox.box-card', function () {
            var shippingCheckout = 0;
            var subTotalCheckout = 0;
            var totalCheckout = 0;
            var valueCard1 = 0;
            var valueCard2 = 0;
            if ($('#UseTwoCreditCards').is(':checked')) {

                var discountInitial = parseFloat($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                var discountShoppingVoucher = 0;
                if ($('#desconto_shopping_voucher').length > 0) {
                    discountShoppingVoucher = parseFloat($('#desconto_shopping_voucher').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                }
                shippingCheckout = parseFloat($('#shipping_checkout').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                subTotalCheckout = parseFloat($('.subtotal').html().replace('&nbsp;', '').replace('R$', '').replace(".", "").replace(",", "."));

                totalCheckout = (subTotalCheckout + shippingCheckout) - (discountInitial + discountShoppingVoucher);

                valueCard1 = parseFloat(totalCheckout) / 2;
                valueCard1 = valueCard1.toFixed(2);

                valueCard2 = (totalCheckout - valueCard1).toFixed(2);

                $('#Valor1').val(valueCard1.replace(",", "").replace(".", ","));
                $('#Valor2').val(valueCard2.replace(",", "").replace(".", ","));

                $('.one-card').addClass('hideme');
                $('.multi-card').removeClass('hideme');

                $('.multi-card > .ui.attached.tabular.menu > a[data-tab=card-1]').trigger('click');
            } else {
                $('.one-card').removeClass('hideme');
                $('.multi-card').addClass('hideme');

                $('#CreditCard1, #CreditCard2, #Name1, #Name2, #ExpDate1, #ExpDate2, #CVV1, #CVV2').val('');
                $("#parcCard1, #parcCard2").html("<option value='0'>Informe o numero do cartão primeiro</option>");

                atualizaResumoCarrinho();
            }
        });
    }

    if ($('form#validCardDebit').length > 0) {
        $('#DebitValor1, #DebitValor2').maskMoney();

        $('.card-wrapper-debit > .jp-card-container, .card-wrapper-debit1 > .jp-card-container, .card-wrapper-debit2 > .jp-card-container').css({ 'transform': 'scale(1)' });

        $(document).on('change', '#DebitValor1, #DebitValor2', function () {
            UpdateValueTwoDebitCards($(this));
            return false;
        });

        $(document).on('click', '.ui.toggle.checkbox.box-debit', function () {
            var shippingCheckout = 0;
            var subTotalCheckout = 0;
            var totalCheckout = 0;
            var valueCard1 = 0;
            var valueCard2 = 0;
            if ($('#UseTwoDebitCards').is(':checked')) {

                var discountInitial = parseFloat($("#desconto_checkout").attr("data-discount-initial").replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                var discountShoppingVoucher = 0;
                if ($('#desconto_shopping_voucher').length > 0) {
                    discountShoppingVoucher = parseFloat($('#desconto_shopping_voucher').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                }
                shippingCheckout = parseFloat($('#shipping_checkout').html().replace('&nbsp;', '').replace("R$", "").replace(".", "").replace(",", "."));
                subTotalCheckout = parseFloat($('.subtotal').html().replace('&nbsp;', '').replace('R$', '').replace(".", "").replace(",", "."));

                totalCheckout = (subTotalCheckout + shippingCheckout) - (discountInitial + discountShoppingVoucher);

                valueCard1 = parseFloat(totalCheckout) / 2;
                valueCard1 = valueCard1.toFixed(2);

                valueCard2 = (totalCheckout - valueCard1).toFixed(2);

                $('#DebitValor1').val(valueCard1.replace(",", "").replace(".", ","));
                $('#DebitValor2').val(valueCard2.replace(",", "").replace(".", ","));

                $('.one-debit').addClass('hideme');
                $('.multi-debit').removeClass('hideme');
                $('.multi-debit > .ui.attached.tabular.menu > a[data-tab=debit-1]').trigger('click');
            } else {
                $('.one-debit').removeClass('hideme');
                $('.multi-debit').addClass('hideme');

                $('#DebitCard1, #DebitCard2, #DebitName1, #DebitName2, #DebitExpDate1, #DebitExpDate2, #DebitCVV1, #DebitCVV2').val('');

                atualizaResumoCarrinho();

            }
        });
    }
});


function checkValidatePersonalization() {

    if ($("#PaymentLinkChangeBrand").val() == undefined || $("#PaymentLinkChangeBrand").val() == "0") {
        //PersonalizationsValidation
        $.ajax({
            url: "/Checkout/PersonalizationsValidation",
            method: "GET",
            success: function (response) {
                if (response.indexOf('modal-personalization-validate') > -1) {


                    $("body").append(response);

                    var modalPersonalizate = $(".modal-personalization-validate");

                    if (modalPersonalizate.length > 0) {

                        modalPersonalizate.modal({
                            onHidden: function () {

                                $.when(
                                    $.ajax({
                                        method: "GET",
                                        url: "/Checkout/LoadProductsMiniCart",
                                        cache: false,
                                        success: function (loadProduct) {
                                            if (loadProduct) {
                                                if (loadProduct.indexOf("itemCartProduct_") === -1) {
                                                    swal({
                                                        title: 'Ops ... Seu carrinho agora está vazio!',
                                                        html: 'Estamos te direcionando para a Home!',
                                                        type: 'warning',
                                                        showCancelButton: false,
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        confirmButtonText: 'OK'
                                                    }).then(function () {
                                                        window.location.href = "/Home";
                                                    });
                                                } else {
                                                    var retornoAjax = loadProduct.split("|$|");
                                                    var listaProdutos = retornoAjax[0];
                                                    $("#checkout_products_list").html(listaProdutos);
                                                    $(".item:not(.exhausted) .removeCartItem, " +
                                                        ".item:not(.exhausted) .description, " +
                                                        ".item.exhausted .avaibility", "#checkout_products_list").remove()
                                                }
                                            }
                                        }
                                    })
                                );
                            },
                        }).modal('show')
                    }
                }
            },
            complete: function () {
                $(".GerarPedidoMercadoPagoCheckoutVPRO").removeClass("loading");
                $(".GerarPedidoMercadoPagoCheckoutVPRO").removeClass("disabled");
            }
        });
    }
}

window.onload = function () {

    $(".blocoTypePayment").on("click", function () {
        $(".contentPayment").hide()
        $(".contentPayment", this).show()
    })

}();