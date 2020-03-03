import { _alert, _confirm } from '../../functions/message';
import { buscaCep, atualizaCampos } from '../../api/customer/AddressManager';
import { isLoading } from "../../api/api_config";
import { debug, isNull, isNullOrUndefined } from 'util';
import { generateRecaptcha }  from "../../ui/modules/recaptcha";

import { isMobile } from "../../functions/mobile";

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

//require("card/dist/jquery.card");

function SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub, value) {
    $.ajax({
        method: "POST",
        url: "SaveFrete",
        data: {
            zipCode: zipcode,
            idShippingMode: new Number(idFrete),
            deliveredByTheCorreiosService: correiosEntrega.toLowerCase(),
            deliveryShipping: entregaAgendada,
            valueAddShipping: valorSomaFrete,
            periodSelected: data_periodo_selecionada,
            dateSelected: data_selecionada,
            IdScheduled: idEntrega,
            IdScheduledPeriod: idPeriodoEntrega,
            carrier: carrier,
            mode: mode,
            hub: hub,
            value: value
        },
        success: function (response) {
            if (response.success) {
                //Atualiza o Valor do Frete na tabela Sessão
                if ($('#freteGratisValeCompra').length > 0 && $('#freteGratisValeCompra').val() == "1") {
                    var shoppingVoucherValue = new Number($('#ShoppingVoucherValue').val().replace(".", "").replace(",", "."));
                    if (valorSomaFrete === "0,0" && parseFloat(shoppingVoucherValue) > 0) {
                        $.ajax({
                            method: "GET",
                            url: "/Checkout/UpdateValueCart",
                            async: false,
                            success: function (responseUpdateValueCard) {
                                /*** Verificar se habilita forma de pagamento vale compra ***/
                                var subTotal = new Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
                                var discount = new Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));

                                var valorCompare = (subTotal - discount).toFixed(2);

                                if (shoppingVoucherValue.toFixed(2) === valorCompare) {
                                    $('#btnGerarPedidoValeCompra').removeAttr("disabled");
                                    $('#formas-pagamento').addClass("disable_column");
                                } else {
                                    $('#btnGerarPedidoValeCompra').attr("disabled", true);
                                    $('#formas-pagamento').removeClass("disable_column");
                                }
                            }
                        });


                    } else {
                        $('#btnGerarPedidoValeCompra').attr("disabled", true);
                        $('#formas-pagamento').removeClass("disable_column");
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
            isLoading(".ui.accordion.frete");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            //console.log("fechando com erro");
            isLoading(".ui.accordion.frete");
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
                initComponent(availableDates);
            }
        }
    }
}

function initComponent(availableDates) {
    //availableDates = ['01-25-2018','01-27-2018','01-22-2018'];

    $('.date').datepicker("destroy");
    $('.date').datepicker({
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
}

var useAntiFraudMaxiPago = false

function GerarPedidoCompleto(
    idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick,
    saveCardOneClick, userAgent, hasScheduledDelivery, paymentSession, paymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken,
    googleResponse, deliveryTime, usefulDay
) {
    var stop = false;
    stop = ValidCart(stop);

    if (stop) return;

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
            usefulDay: usefulDay
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
            else {
                if (response.errorMsg != "" && (response.idPedido == "" || response.idPedido == "0")) {

                    if (response.urlRedirect === "") {
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
                        swal({
                            title: '',
                            html: response.errorMsg,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        }).then(function (result) {
                            window.location.href = response.urlRedirect;
                        });
                    }
                   
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
    var idFrete = "";
    var correiosEntrega = "";
    var carrier = "";
    var mode = "";
    var hub = "";
    var entregaAgendada = "";
    var exclusivaEntregaAgendada = "";

    $("#GetShippping .item .checkbox").click(function () {
        //ValeCompraRemover();
        $("#GetShippping .item .checkbox").removeClass("checked")
        $(this).addClass("checked")

        $(".agendar").hide("slow");
        $('.hasDatepicker').datepicker('setDate', null);

        var ponteiroCurrent = $(".shippingGet", this);
        $(".shippingGet").attr("checked", false);
        $(ponteiroCurrent).attr("checked", true);

        valorFrete = $(ponteiroCurrent).attr("data-value");
        idFrete = $(ponteiroCurrent).attr("data-id");
        correiosEntrega = $(ponteiroCurrent).attr("data-correios");
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
                HabilitaBlocoPagamento(true)

            disparaAjaxShipping(zipcode, idFrete, correiosEntrega, entregaAgendada, valorFrete, dataperiodoentregaescolhida, dataentregaescolhida, idPeridoescolhido, carrier, mode, hub);
        }
    });
}

function disparaAjaxShipping(zipcode, idFrete, correiosEntrega, entregaAgendada, valorFrete, dataperiodoentregaescolhida, dataentregaescolhida, idPeridoescolhido, carrier, mode, hub) {

    $("#resumoCheckout .resumo .title").removeClass("active");
    $("#resumoCheckout .resumo .content").removeClass("active");
    $("#resumoCheckout .resumo .content").stop(false, true).slideUp();

    if (entregaAgendada == "True") {
        isLoading(".ui.accordion.frete");
        BuscaFreteEntregaAgendada(zipcode, idFrete, correiosEntrega, entregaAgendada);
    }
    else
        SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorFrete, dataperiodoentregaescolhida, dataentregaescolhida, idFrete, idPeridoescolhido, carrier, mode, hub);
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
        if (installmentValue2 == undefined) installmentValue1 = 0;
        //if($("#parcCard").find(':selected').hasAttr("data-InstallmentTotal"))
        installmentTotal2 = $("#parcCard2").find(':selected').attr("data-InstallmentTotal");
        if (installmentTotal2 == undefined) installmentTotal1 = 0;

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
                valueCard2: valor2
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
        
        var tipoVerificacao = $(this).attr("data-Card");

        if ((tipoVerificacao == "S" || tipoVerificacao == "D") && ($('#UseTwoCreditCards').is(':checked') || $('#UseTwoDebitCards').is(':checked'))) {
            OrderCreateTwoCards($(this));
            return false;
        }

        $(this).addClass("disabled");
        $(this).addClass("loading");

        var idCustomer = $("#idCustomer").val();
        var idAddress = $("#idAddress").val();
        var presente = $("#presente").val();
        var mensagem = $("#mensagem").val();
        var idInstallment = 0;
        var installmentNumber = 0;
        var installmentValue = 0;
        var installmentTotal = 0;
        var idPaymentBrand = "0";
        if (tipoVerificacao == "N") {
            idPaymentBrand = $(this).attr("data-idbrand");
        } else if (tipoVerificacao == "D") {
            idPaymentBrand = $('#debitIdBrandCard').val();
        } else {
            idPaymentBrand = $('#idBrandCard').val();
        }
        var card = $(this).prop("id") == "btnCardDebit" ? $("#DebitCard").val() : $("#CreditCard").val();
        var nameCard = $(this).prop("id") == "btnCardDebit" ? $("#DebitName").val() : $("#Name").val();
        var dt = new Date();
        var century = dt.getFullYear().toString().substring(0, 2);
        var expDateCard = "";
        if ($("#DebitExpDate").val() != null || $("#ExpDate").val() != null) {
            var DebitExpDate = "";
            if ($("#DebitExpDate").val() != undefined) {
                DebitExpDate = $("#DebitExpDate").val();
            }

            var ExpDate = "";
            if ($("#ExpDate").val() != undefined) {
                ExpDate = $("#ExpDate").val();
            }

            expDateCard = $(this).prop("id") == "btnCardDebit" ? DebitExpDate.toString().replace("/", "/" + century) : ExpDate.toString().replace("/", "/" + century);
            expDateCard = expDateCard.replace(/\s/g, "");
        }
        var validaMes = expDateCard != "" && expDateCard !== undefined ? new Number(expDateCard.split("/")[0]) : "";
        var validaAno = expDateCard != "" && expDateCard !== undefined ? new Number(((expDateCard.split("/")[1].trim().length <= 2) ? century + expDateCard.split("/")[1].trim() : expDateCard.split("/")[1].trim())) : "";
        var cvvCard = $("#CVV").val();
        var brandCard = $(this).prop("id") == "btnCardDebit" ? $("#debitBrandCard").val() : $("#brandCard").val();
        var document = $("#Document").val();
        var kind = "credit";
        var idOneClick = $("#OneClick").val();
        var saveCardOneClick = $('#SaveCard').is(":checked");
        var userAgent = navigator.userAgent;
        var msgErrors = "";
        var PaymentSession = "";
        if ($('#PaymentSession').length > 0) PaymentSession = $('#PaymentSession').val();
        var PaymentHash = "";
        var dateOfBirth = $('#DateOfBirth').val();
        var phone = $('#Phone').val();
        var cardToken = "";
        var externalCode = $(this).attr("data-externalcode");
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

        switch ($(this).prop("id")) {
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
            default:
                if ($(this).data("card") == "N") {
                    kind = "boleto";
                }
                break;
        }

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

        if (tipoVerificacao == "S") {

            if ($(this).attr("data-gateway") == "pagseguro") {
                PaymentHash = PagSeguroDirectPayment.getSenderHash();
                var statusPagSeguro = false;
                $.each(verifyPaymentMethod, function (key, value) {
                    if (value.code == externalCode) {
                        statusPagSeguro = value.status;
                    }
                });

                if (!statusPagSeguro) {
                    msgErrors += "<br />Esta forma de pagamento não esta ativa no gateway de pagamento!";
                }
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

        if (tipoVerificacao == "O") {
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

        if (tipoVerificacao != "S" && $('#hasPagSeguro').val() != "0" && $('#hasPagSeguro').val() != "" && externalCode != "") {
            PaymentHash = PagSeguroDirectPayment.getSenderHash();
            var statusPagSeguro = false;

            $.each(verifyPaymentMethod, function (key, value) {
                if (value.code == externalCode) {
                    statusPagSeguro = value.status;
                }
            });

            if (!statusPagSeguro) {
                msgErrors += "<br />Esta forma de pagamento não esta ativa no gateway de pagamento!";
            }
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
            $(".GerarPedido").removeClass("disabled")
        }
        else {
            if (validaFrete == "S") {
                //Verifica se o Antifraud do MaxiPago está ativo, se estiver gera o pré-pedido na sessão e carrega o iframe na página.
                if (useAntiFraudMaxiPago && kind != "oneclick") {
                    LoadIframeAntiFraudMaxiPago(idCustomer, idInstallment, idPaymentBrand, idAddress, mensagem)
                    //Gerar pedido completo com atraso de 5 segundos
                    setTimeout(function () { GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay); }, 5000);
                }
                else if (tipoVerificacao == "S" && $(this).attr("data-gateway") == "pagseguro") {

                    PagSeguroDirectPayment.createCardToken({
                        cardNumber: card.replace(/ /g, ''),
                        brand: brandCard,
                        cvv: cvvCard,
                        expirationMonth: validaMes,
                        expirationYear: validaAno,
                        success: function (response) {
                            cardToken = response.card.token;

                            GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay);
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
                else//Caso não utilize, segue o fluxo de gerar pedido normalmente sem iframe e sem atraso   
                {
                    GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken, googleResponse, deliveryTime, usefulDay);
                }

            }
            else {
                _alert("", "Escolha o frete antes de fechar o pedido!", "warning");
                $(".GerarPedido").removeClass("loading");
                $(".GerarPedido").removeClass("disabled");
            }
        }
    });
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

function testegit() {
    $("#exibeMsg > label").hide();
    $("#exibeMsg > #mensagem").hide();
    //alert("HI");
}

function onChangeParcelamento() {
    $('#parcCard').unbind().on('change', function () {
        var codigoBandeira = $("#idBrandCard").val();
        var parcela_selecionada = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
        var id_tipo = 1;

        if (codigoBandeira != "" && parcela_selecionada != "") {
            AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
        }
    });

    $('#parcCardOneClick').unbind().on('change', function () {
        var codigoBandeira = $("#idBrandOneClick").val();
        var parcela_selecionada = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
        var id_tipo = 1;

        if (codigoBandeira != "" && parcela_selecionada != "") {
            AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
        }
    });
}

function GetPaymentGateway(nameBrand, typeForm) {
    var seletorJson = typeForm == 'D' ? '#validCardDebit' : '#validCardCredit';

    var objPaymentMethod = $(seletorJson).data('paymentmethod');
    for (var i = 0; i < objPaymentMethod.PaymentBrands.length; i++) {
        var auxNameBrand = objPaymentMethod.PaymentBrands[i].Name.toLowerCase();
        if (auxNameBrand == nameBrand) {
            var IdPaymentBrand = Number.parseInt(objPaymentMethod.PaymentBrands[i].IdPaymentBrand, 10);
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

        if (event.type == "change") {
            numeroCartao = $(this).find("option:selected").text().substring(0, 4);
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
                hipercard: /^(38[0-9]{17}|60[0-9]{14})$/,
                hiper: /^(637599|637612|637609|637568|637095)+[0-9]{10}$/,
                amex: /^3[47][0-9]{13}$/,
                aura: /^5078[0-9]{12,15}$/,
                //mastercard: /^5[1-5][0-9]{14}$/,
                mastercard: /^(5[1-5][0-9]{14})|(2[2-7][0-9]{14})|(5021[0-9]{12})$/,
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
        if (numeroCartao != "" && codigoBandeira == 0) {
            if (typeForm == "C") {
                $(slParcelamento).html("<option value='0'>Informe o numero do cartão primeiro</option>");
            }
            //_alert("Ops! Encontramos um problema ..", "A loja pode não aceitar essa bandeira ou o cartão está incorreto", "warning");
            _alert("", "Bandeira de cartão não disponível na loja ou número do cartão inválido.", "warning");
            $(idOnBlur).val('');
        }
        else {
            if ($(idOnBlur).val() != "") {
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
                                    $(idOnBlur).val('');
                                    $(idOnBlur).empty();
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
                var objParcelamento = 0;
                if (response.ListInstallment != null && response.ListInstallment != "")
                    objParcelamento = response.ListInstallment;

                if (objMsgError == "" || typeof (objMsgError) == "undefined" || objParcelamento.length > 0) {
                    //if($('#divScriptPagSeguro').length > 0) $('#divScriptPagSeguro').remove();
                    if (typeof (objMaxiPago) != "undefined" && objMaxiPago == true) {
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
                    else if (typeof (objPagSeguro) != "undefined" && objPagSeguro == true) {
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

                        var totalCheckout = $('#total_checkout').html().replace("R$", "").replace(".", "").replace(",", ".");

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

                                if (parseInt(maximumInstallmentWithoutInterest) > 1) {
                                    objGetInstallments.maxInstallmentNoInterest = maximumInstallmentWithoutInterest;
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

                    if (!objPagSeguro) {
                        if (!oneclick) {
                            for (var i = 0; i < objParcelamento.length; i++) {
                                var IdInstallment = objParcelamento[i].IdInstallment;
                                var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                                var Description = objParcelamento[i].Description;
                                var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                                option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";
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

                                option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";
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
            var TotalDiscount = DiscountInitial + Discount1 + Discount2;
            $("#desconto_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(TotalDiscount));
        }

    } else {
        var obj_parcelamento = buscaTotalParcelamento(codigoBandeira, codigoPaymentMethod, parcela_selecionada);
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
        }
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
        $('.ui.modal.lista-endereco-cliente').modal('show');
    });
}

function showAddressPayment() {
    $("#addDataAddress").click(function () {
        if ($(".addAddress").length > 0) {
            var jsonArray = [];
            var splittedFormData = $("#disparaForm").serialize().split('&');

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
                success: function (responseDefault) {
                    if (responseDefault.success) {
                        atualizaEnderecos(responseDefault);
                    }
                    else {
                        _alert("", responseDefault.msg, "warning");
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
                            atualizaEnderecos(responseChange);
                        }
                        else {
                            _alert("", responseChange.msg, "warning");
                            _el.removeClass("loading")
                        }
                    }
                });
            }
        });
    });
}

function atualizaResumoCarrinho(oneclick) {
    $.ajax({
        method: "POST",
        url: "LoadResumoPayment",
        success: function (data) {
            $("#resumoCheckout").html(data);
            $("#resumoCheckout .resumo .title").addClass("active");
            $("#resumoCheckout .resumo .content").addClass("active");
            $("#resumoCheckout .resumo .content").stop(false, true).slideDown();

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
            $('.ui.accordion.usuario .title').addClass("active");
            $('.ui.accordion.usuario .dadosCliente').addClass("active");
            $('.ui.accordion.usuario .dadosCliente .fluid').removeClass("hidden");

            var idFrete = $("#GetShippping .item .checkbox.checked input").val();
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
                $("#formas-pagamento").children().children().addClass("hideme");
                $("#pagamento-desconto").removeClass("hideme");
                $('#formas-pagamento').removeClass("disable_column");
                if ($(".shopping-voucher").length > 0) {
                    let valueShoppingVoucher = Number.parseFloat($("#desconto_shopping_voucher").text().replace('R$', '').replace('.', '').replace(',', '.'));
                    let totalCheckout = Number.parseFloat($("#total_checkout").text().replace('R$', '').replace('.', '').replace(',', '.'));

                    if (valueShoppingVoucher == 0 || totalCheckout > 0) {
                        $(".shopping-voucher").addClass("hideme");
                    }
                }
            } else {
                $("#formas-pagamento").children().children().removeClass("hideme");
                $("#pagamento-desconto").addClass("hideme");
                if ($(".shopping-voucher").length > 0) {
                    $(".shopping-voucher").removeClass("hideme");
                }
            }
        }
    });
}

function atualizaEnderecos(responseChange) {
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
    }

    $.ajax({
        method: "POST",
        url: "ListaFretePagamento",
        success: function success(data) {
            $("#updateShippingPayment").html(data);
            clickShipping();
            HabilitaBlocoPagamento(false);
            CampoEntregaAgendada();
            $('.ui.modal').modal('hide');
            //isLoading(".ui.accordion.frete");
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
                        // if ($('.ui.accordion.shopping-voucher').length > 0) {
                        //     ValeCompraRemover();
                        // }
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

        var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
        
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

function viewRecive_Code() {
    $.ajax({
        method: "POST",
        url: "Recive_Code",
        success: function success(response) {
            $("#ListaEnderecosCliente").html(response);
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

function HabilitarButtonIrParaPagamento() {
    $('#goToPayment').attr("disabled", true);
    $("#checkoutColumn2").addClass("disable_column");

    $("#goToPayment").click(function () {
        $("#checkoutColumn2").removeClass("disable_column");
    });
}
function HabilitaBlocoPagamento(habilita) {

    if ($("#checkoutColumn2").length > 0) {
        if (habilita == true) {
            $("#checkoutColumn2").removeClass("disable_column");
            if (isMobile())
                $('html, body').animate({ scrollTop: $("#checkoutColumn2 .jetCheckout").offset().top - 30 }, 1000);
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
    if (strCPF == "00000000000") return false;

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
                    $.ajax({
                        method: "POST",
                        url: "ListaFretePagamento",
                        data: {
                            freteGratisValeCompra: true
                        },
                        success: function success(data) {   
                            
                            sessionStorage.setItem("shippingSelected", $("#GetShippping .item .checkbox.checked input").val())
                            sessionStorage.setItem("ShippingValue", $("#GetShippping .item .checkbox.checked input").data("value"))

                            $("#updateShippingPayment").html(data);

                            var ShippingSelected = sessionStorage.getItem("shippingSelected");
                            var ShippingValue = sessionStorage.getItem("ShippingValue");
                            var idShipping = $("#GetShippping .item .checkbox input[data-id='"+ShippingSelected+"']", "#updateShippingPayment");
                            var valueShipping = $("#GetShippping .item .checkbox input[data-id='"+ShippingSelected+"']").data("value");

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
                isLoading(".ui.accordion.shopping-voucher");
                ValeCompraRefresh();
                $('#ShoppingVoucherValue').val('');
                $('#btnGerarPedidoValeCompra').attr("disabled", true);
                $(".ui.accordion.shopping-voucher").accordion('close', 0);
                $('#formas-pagamento').removeClass("disable_column");
                atualizaResumoCarrinho(false);
                _alert("", "Vale Compras removido com sucesso!", "success");
            }
            //} else {
            //    //_alert(responseValeCompra.msg);
            //}
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
                //$('#btnGerarPedidoValeCompra').attr("disabled", true);

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

                isLoading(".ui.accordion.shopping-voucher");
            }
        }
    });
}


function CampoEntregaAgendada() {
    $('[id*="combo_dataperiodoagendada_"]').change(function () {
        isLoading(".ui.accordion.frete");

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
            data_selecionada = $("#dateAgendada_" + idFrete).val()
            correiosEntrega = $("#radio_" + idFrete).attr("data-correios");
            entregaAgendada = $("#radio_" + idFrete).attr("data-entregaagendada");
            exclusivaEntregaAgendada = $("#radio_" + idFrete).attr("data-exclusiva-entregaagendada");
            carrier = $("#radio_" + idFrete).attr("data-carrier");
            mode = $("#radio_" + idFrete).attr("data-mode");
            hub = $("#radio_" + idFrete).attr("data-hub");
            value = $("#radio_" + idFrete).attr("data-value");

            SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub, value);
        }
        else {
            $("#combo_dataperiodoagendada_" + idFrete).hide("fast");
            $('.hasDatepicker').datepicker('setDate', null);
            atualizaResumoCarrinho();
        }
        isLoading(".ui.accordion.frete");
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
var verifyPaymentMethod = [];

$(document).ready(function () {

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
            
            var shoppingVoucherValue = new Number(valor.replace(".", "").replace(",", "."));
            var subTotal = new Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
            var saldoShoppingVoucher = new Number(balance.replace(",", "."));
            var shippingTotal = new Number($('#shipping_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));
            var discount = new Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));

            var valorCompare = (subTotal - discount).toFixed(2);

            console.log(parseFloat(shoppingVoucherValue))
            
            
            if (shoppingVoucherValue > valorCompare || shoppingVoucherValue > saldoShoppingVoucher) {
                _alert("", "O valor deve ser menor ou igual ao valor dos produtos!", "warning");
                //$(this).val('');                    
                //ValeCompraRemover();    

            } else {

                if (parseFloat(shoppingVoucherValue) == 0) {
                    ValeCompraRemover();
                } else {
                    if (parseFloat(shoppingVoucherValue) == parseFloat(valorCompare) && parseFloat(shippingTotal) == 0) {
                        $('#btnGerarPedidoValeCompra').removeAttr("disabled");
                        $('#formas-pagamento').addClass("disable_column");
                    } else {
                        $('#btnGerarPedidoValeCompra').attr("disabled", true);
                        $('#formas-pagamento').removeClass("disable_column");
                    }

                    if (parseFloat(shoppingVoucherValue) > 0 && shoppingVoucherValue <= subTotal && shoppingVoucherValue <= saldoShoppingVoucher) {
                        ValeCompraAplicar(shoppingVoucherValue);                        
                    }
                }                 
                                                    
                
            }                
            
        })
    }

    if ($('#hasPagSeguro').val() != "0" && $('#hasPagSeguro').val() != undefined) {
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

                        var totalCheckout = $('#total_checkout').html().replace("R$", "").replace(".", "").replace(",", ".");

                        PagSeguroDirectPayment.getPaymentMethods({
                            amount: totalCheckout,
                            success: function (response) {
                                if (response.error == false) {
                                    $.each(response.paymentMethods, function (item, value) {
                                        $.each(value.options, function (item2, value2) {
                                            verifyPaymentMethod.push({
                                                code: value2.code,
                                                name: value2.name,
                                                status: ((value2.status == "AVAILABLE") ? true : false)
                                            });
                                        });
                                    });
                                }
                            },
                            error: function (response) {
                                _alert("Erro ao obter formas de pagamento.");
                            },
                            complete: function () {
                                $.ajaxSetup({ async: true });
                            }
                        });
                    });
                }
                else {
                    _alert("Erro ao obter sessão no pagseguro, entre em contato com suporte técnico.");
                }
            }
        });
    }
    if (document.location.pathname.toLowerCase() == "/checkout/payment")
        GetStatusAntiFraudMaxiPago();


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

    //$.jetRoute("checkout", function (){
    if ($("#idAddress").val() != "") {
        window.onbeforeunload = function (e) {
            if (window.location.pathname.toLowerCase() == "/checkout/payment") {
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
        validaCartaoCreditoBandeira("#OneClick", "#btnOneClick", "#brandOneClick", "#idBrandOneClick", "#parcCardOnClick", "C", 1, 0, "change");
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
            alert('Por favor, permita exibir popups para esse site.');
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

                $('.one-card').addClass('hide');
                $('.multi-card').removeClass('hide');

                $('.multi-card > .ui.attached.tabular.menu > a[data-tab=card-1]').trigger('click');
            } else {
                $('.one-card').removeClass('hide');
                $('.multi-card').addClass('hide');
                $('.card-wrapper1,.card-wrapper2').addClass('hide');
                $('.card-wrapper').removeClass('hide');

                $('#CreditCard1, #CreditCard2, #Name1, #Name2, #ExpDate1, #ExpDate2, #CVV1, #CVV2').val('');
                $("#parcCard1, #parcCard2").html("<option value='0'>Informe o numero do cartão primeiro</option>");

                atualizaResumoCarrinho();
            }
        });

        $(document).on('click', '.multi-card > .ui.attached.tabular.menu > a', function () {
            if ($(this).attr('data-tab') == "card-1") {
                $('.card-wrapper,.card-wrapper2').addClass('hide');
                $('.card-wrapper1').removeClass('hide');
            }
            else
            {
                $('.card-wrapper,.card-wrapper1').addClass('hide');
                $('.card-wrapper2').removeClass('hide');
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

                $('.one-debit').addClass('hide');
                $('.multi-debit').removeClass('hide');
                $('.multi-debit > .ui.attached.tabular.menu > a[data-tab=debit-1]').trigger('click');
            } else {
                $('.one-debit').removeClass('hide');
                $('.multi-debit').addClass('hide');
                $('.card-wrapper-debit1,.card-wrapper-debit2').addClass('hide');
                $('.card-wrapper-debit').removeClass('hide');

                $('#DebitCard1, #DebitCard2, #DebitName1, #DebitName2, #DebitExpDate1, #DebitExpDate2, #DebitCVV1, #DebitCVV2').val('');

                atualizaResumoCarrinho();

            }
        });

        $(document).on('click', '.multi-debit > .ui.attached.tabular.menu > a', function () {
            if ($(this).attr('data-tab') == "debit-1") {
                $('.card-wrapper-debit,.card-wrapper-debit2').addClass('hide');
                $('.card-wrapper-debit1').removeClass('hide');
            }
            else {
                $('.card-wrapper-debit,.card-wrapper-debit1').addClass('hide');
                $('.card-wrapper-debit2').removeClass('hide');
            }
        });
    }
});