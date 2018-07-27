import { _alert, _confirm } from '../../functions/message';
import { buscaCep, atualizaCampos } from '../../api/customer/AddressManager';
﻿import { isLoading } from "../../api/api_config";
import { debug, isNull, isNullOrUndefined } from 'util';

﻿import { isMobile } from "../../functions/mobile";

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

function SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub) {
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
            hub: hub
        },
        success: function (response) {
            if (response.success) {
                atualizaResumoCarrinho();
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
            idShippingMode: new Number(idFrete),
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
    saveCardOneClick, userAgent, hasScheduledDelivery, paymentSession, paymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken
) {
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
            cardToken: cardToken
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
                    swal({
                        title: '',
                        html: response.errorMsg,
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
                    window.location.href = "Success?orderId=" + response.idPedido + "&s=" + response.success + "&m=" + response.msgEncrypt;
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
        ValeCompraRemover();
        $("#GetShippping .item .checkbox").removeClass("checked")
        $(this).addClass("checked")

        $(".agendar").hide("slow");
        $('.hasDatepicker').datepicker('setDate', null);
        if (cancelarCalculoFrete()) {
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
        }

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

function OrderCreate() {
    $(".GerarPedido").click(function (event) {
        event.preventDefault();

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
        var idPaymentBrand = $(this).attr("data-idBrand");
        var tipoVerificacao = $(this).attr("data-Card");
        var card = $(this).prop("id") == "btnCardDebit" ? $("#DebitCard").val() : $("#CreditCard").val();
        var nameCard = $(this).prop("id") == "btnCardDebit" ? $("#DebitName").val() : $("#Name").val();
        var expDateCard = $(this).prop("id") == "btnCardDebit" ? $("#DebitExpDate").val() : $("#ExpDate").val();
        var validaMes = expDateCard != "" && expDateCard !== undefined ? new Number(expDateCard.split("/")[0]) : "";
        var validaAno = expDateCard != "" && expDateCard !== undefined ? new Number(expDateCard.split("/")[1]) : "";
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
        var shippingMode = "";
        var dateOfBirth = $('#DateOfBirth').val();
        var phone = $('#Phone').val();
        var cardToken = "";
        var externalCode = $(this).attr("data-externalcode");
        if ($('.shippingGet:checked').length > 0) shippingMode = $('.shippingGet:checked').data("mode");

        var idFrete = $("#GetShippping .item .checkbox.checked input").val();
        var hasScheduledDelivery = $("#radio_" + idFrete).attr("data-entregaagendada");

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

            $("#validCardCredit").find(".required").each(function () {
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

            $("#validCardDebit").find(".required").each(function () {
                var labelCurrent = $(".labelCheckPayment", this).text();
                var valorCurrent = $(".fieldCheckPayment", this).val();

                if ((valorCurrent == "") || (valorCurrent.length < 3)) {
                    msgErrors += "<br />O campo " + labelCurrent + " está inválido!";
                }
            });
        }

        if (tipoVerificacao != "S" && $('#hasPagSeguro').val() != "0" && $('#hasPagSeguro').val() != "") {
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
                    setTimeout(function () { GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken) }, 5000);
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

                            GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken);
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
                    GerarPedidoCompleto(idCustomer, idAddress, presente, mensagem, idInstallment, idPaymentBrand, card, nameCard, expDateCard, cvvCard, brandCard, installmentNumber, kind, document, idOneClick, saveCardOneClick, userAgent, hasScheduledDelivery, PaymentSession, PaymentHash, shippingMode, dateOfBirth, phone, installmentValue, installmentTotal, cardToken);
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
    alert("HI");
}

function onChangeParcelamento() {
    $('#parcCard').unbind().on('change', function () {
        var codigoBandeira = $("#btnCardCredit").attr("data-idBrand");
        var parcela_selecionada = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
        var id_tipo = 1;

        if (codigoBandeira != "" && parcela_selecionada != "") {
            AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
        }
    });

    $('#parcCardOneClick').unbind().on('change', function () {
        var codigoBandeira = $("#btnOneClick").attr("data-idBrand");
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

function GetPaymentBrandExternalCode(nameBrand) {
    var objPaymentMethod = $('#validCardCredit').data('paymentmethod'); //jQuery.parseJSON($('#validCardCredit').data('paymentgateway'));
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

function validaCartaoCreditoBandeira(idOnBlur, btnCard, updateBrand, typeForm, codigoPaymentMethod, parcela_selecionada, _event) {
    $(idOnBlur).on(_event, function (event) {
        $(btnCard).removeAttr("data-idBrand");
        var numeroCartao;
        var codigoBandeira = 0;
        var oneclick = false;
        var externalCode = "";

        if (event.type == "change") {
            numeroCartao = $(this).find("option:selected").text().substring(0, 4);
            cartao = $(this).find("option:selected").data("brand").toLowerCase();
            codigoBandeira = GetPaymentGateway(cartao, typeForm);
            externalCode = GetPaymentBrandExternalCode(cartao);
            $(btnCard).attr({
                "data-idBrand": codigoBandeira,
                "data-externalcode": externalCode
            });
            $(updateBrand).val(cartao);
            oneclick = true;
        }
        else {
            numeroCartao = $(this).val().replace(/\s/g, '');

            var cartoes = {
                elo: /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(50900\d|5090[1-9]\d|509[1-9]\d{2})|65003[1-3]|(65003[5-9]|65004\d|65005[0-1])|(65040[5-9]|6504[1-3]\d)|(65048[5-9]|65049\d|6505[0-2]\d|65053[0-8])|(65054[1-9]| 6505[5-8]\d|65059[0-8])|(65070\d|65071[0-8])|65072[0-7]|(65090[1-9]|65091\d|650920)|(65165[2-9]|6516[6-7]\d)|(65500\d|65501\d)|(65502[1-9]|6550[3-4]\d|65505[0-8]))[0-9]{10,12}/,
                diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                dinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
                hipercard: /^(38[0-9]{17}|60[0-9]{14})$/,
                hiper: /^(637599|637612|637609|637568|637095)+[0-9]{10}$/,
                amex: /^3[47][0-9]{13}$/,
                aura: /^5078[0-9]{12,15}$/,
                //mastercard: /^5[1-5][0-9]{14}$/,
                mastercard: /^(5[1-5][0-9]{14})|(2[2-7][0-9]{14})$/,
                visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                jcb: /^35(2+[8-9]|3+[0-9]|4+[0-9]|5+[0-9]|6+[0-9]|7+[0-9]|8+[0-9])+[0-9]{12,15}$/,
                credz: /^(636760|637032)+[0-9]{10}$/
            };

            for (var cartao in cartoes) {
                if (numeroCartao.match(cartoes[cartao])) {
                    codigoBandeira = GetPaymentGateway(cartao, typeForm);
                    externalCode = GetPaymentBrandExternalCode(cartao);
                    $(btnCard).attr({
                        "data-idBrand": codigoBandeira,
                        "data-externalcode": externalCode
                    });
                    $(updateBrand).val(cartao);
                    break;
                }
            }
        }
        if (numeroCartao != "" && codigoBandeira == 0) {
            if (typeForm == "C") {
                $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
            }
            //_alert("Ops! Encontramos um problema ..", "A loja pode não aceitar essa bandeira ou o cartão está incorreto", "warning");
            _alert("", "Bandeira de cartão não disponível na loja ou número do cartão inválido.", "warning");
            $('#CreditCard').val('');
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
                                    $("#btnOneClick").attr("data-idbrand", "");
                                    $("#btnOneClick").attr("disabled", true);
                                    $("#parcCardOneClick").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                } else {
                                    $("#btnOneClick").attr("disabled", false);
                                    $("#btnCardCredit").attr("data-idbrand", "");
                                    $("#btnCardCredit").attr("disabled", true);
                                    $("#CreditCard").val('');
                                    $("#CreditCard").empty();
                                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                }

                                atualizaParcelamento(codigoBandeira, oneclick);
                            }
                        }
                        else {
                            $(btnCard).attr("data-idBrand", 0);
                            $(updateBrand).val("");
                            $(idOnBlur).val("");
                            _alert("", response.message, "warning");
                            $('#CreditCard').val('');
                        }
                    }
                });
            }
        }
    });
}

function atualizaParcelamento(codigoBandeira, oneclick) {
    var option = "";
    if (codigoBandeira > 0) {
        $.ajax({
            method: "POST",
            url: "LoadInstallment",
            data: {
                idPaymentBrand: new Number(codigoBandeira),
                idPaymentMethod: new Number(1),
                numberCard: $('#CreditCard').val()
            },
            success: function (response) {
                var objOneClick = response.OneClick;
                var objMsgError = response.ErrorMsg;
                var objAdditionalFields = response.AdditionalFields;
                var objMaxiPago = response.MaxiPago;
                var objPagSeguro = response.PagSeguro;
                if (response.ListInstallment != null && response.ListInstallment != "")
                    var objParcelamento = response.ListInstallment;
                else
                    var objParcelamento = 0;

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

                        var ccNumber = $('#CreditCard').val().replace(/[ .-]/g, '').slice(0, 6);
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
                                        $("#parcCard").unbind().html(option);
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
                                $("#parcCard").html(option);

                            }
                            var installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                            AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                        }
                        else {
                            for (var i = 0; i < objParcelamento.length; i++) {
                                var IdInstallment = objParcelamento[i].IdInstallment;
                                var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                                var Description = objParcelamento[i].Description;
                                var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                                option += "<option value='" + IdInstallment + "' data-InstallmentNumber='" + InstallmentNumber + "'>" + InstallmentNumber + "x de " + Value + "(" + Description + ")</option>";
                                $("#parcCardOneClick").html(option);
                            }

                            var installmentNumber = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
                            AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                        }
                    }
                }
                else {
                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("", objMsgError, "warning");
                }
            }
        });
    }
    else {
        $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
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

function AtualizaResumoCarrinhocomDesconto(codigoBandeira, codigoPaymentMethod, parcela_selecionada) {
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
                item["value"] = splittedValue[1];
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

function cancelarCalculoFrete() {
    if ($('.contentcartao .menu.tabular .item.active').data('tab') == "oneclick") {
        atualizaResumoCarrinho(true);
    }
    else {
        atualizaResumoCarrinho(false);
    }
    return (true);
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

            var codigoBandeira = $("#btnCardCredit").attr("data-idBrand");
            if ($("#btnOneClick").length > 0) {
                codigoBandeira = $("#btnCardCredit").attr("data-idBrand") != "" ? $("#btnCardCredit").attr("data-idBrand") : $("#btnOneClick").attr("data-idBrand");
            }

            if (typeof (codigoBandeira) != "undefined") {
                atualizaParcelamento(codigoBandeira);
                var _parcela = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                if (oneclick || $("#btnOneClick").attr("data-idBrand") != "") {
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

            if (exclusivaEntregaAgendada == "True") {
                if (($("#dateAgendada_" + idFrete).val() != "") && ($("#combo_dataperiodoagendada_" + idFrete).val() != ""))
                    HabilitaBlocoPagamento(true)
                else
                    HabilitaBlocoPagamento(false);
            } else {
                if (idFrete == undefined || idFrete == "") {
                    HabilitaBlocoPagamento(false)
                } else {
                    HabilitaBlocoPagamento(true)
                }
            }
            //isLoading(".ui.segment.teal");
        }
    });
}

function atualizaEnderecos(responseChange) {
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

    $.ajax({
        method: "POST",
        url: "ListaFretePagamento",
        success: function success(data) {
            $("#updateShippingPayment").html(data);
            if (cancelarCalculoFrete()) {
                clickShipping();
            }
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
                        if ($('.ui.accordion.shopping-voucher').length > 0) {
                            ValeCompraRemover();
                        }
                        _alert("Cupom de Desconto!", response.msg, "success");
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
    $("#RecoverPasswordByEmail").click(function () {
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
                isLoading(".ui.accordion.shopping-voucher");
                ValeCompraRefresh();
                atualizaResumoCarrinho(false);
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
                atualizaResumoCarrinho(false);
                $('#ShoppingVoucherValue').val('');
                $('#btnGerarPedidoValeCompra').attr("disabled", true);
                $(".ui.accordion.shopping-voucher").accordion('close', 0);
                $('#formas-pagamento').removeClass("disable_column");
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

            SaveFrete(zipcode, idFrete, correiosEntrega, entregaAgendada, valorSomaFrete, data_periodo_selecionada, data_selecionada, idEntrega, idPeriodoEntrega, carrier, mode, hub);
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

var availableDates = [];
var verifyPaymentMethod = [];

$(document).ready(function () {

    if ($('.ui.accordion.shopping-voucher').length > 0) {
        // Limpa o vale compra ao recarregar a pagina.
        ValeCompraRemover();

        // Vale Compra
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

        var delay = (function () {
            var timer = 0;
            return function (callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })();

        $('#ShoppingVoucherValue')
            .maskMoney()
            .keypress(function () {
                var shoppingVoucherValue = new Number($(this).val().replace(".", "").replace(",", "."));
                var subTotal = new Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
                var saldoShoppingVoucher = new Number($(this).data('balance').replace(".", "").replace(",", "."));

                var discount = new Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));

                var valorCompare = subTotal - discount;


                if (shoppingVoucherValue > valorCompare) {
                    _alert("", "O valor deve ser menor ou igual ao valor dos produtos!", "warning");
                    //$(this).val('');
                    delay(function () {
                        ValeCompraRemover();
                    }, 1000);
                }

                if (shoppingVoucherValue > saldoShoppingVoucher) {
                    _alert("", "O valor deve ser menor ou igual ao saldo do cliente!", "warning");
                    //$(this).val('');
                    delay(function () {
                        ValeCompraRemover();
                    }, 1000);
                }
            });



        $('#ShoppingVoucherValue').keyup(function () {
            let valor = $(this).val();
            let balance = $(this).data('balance');
            delay(function () {
                var shoppingVoucherValue = new Number(valor.replace(".", "").replace(",", "."));
                var subTotal = new Number($('.subtotal').html().replace('R$', '').replace(".", "").replace(",", "."));
                var saldoShoppingVoucher = new Number(balance.replace(",", "."));
                var shippingTotal = new Number($('#shipping_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));
                var discount = new Number($('#desconto_checkout').html().replace('R$', '').replace(".", "").replace(",", "."));

                var valorCompare = subTotal - discount;


                if (parseFloat(shoppingVoucherValue) == parseFloat(valorCompare) && parseFloat(shippingTotal) == 0) {
                    $('#btnGerarPedidoValeCompra').removeAttr("disabled");
                    $('#formas-pagamento').addClass("disable_column");
                } else {
                    $('#btnGerarPedidoValeCompra').attr("disabled", true);
                    $('#formas-pagamento').removeClass("disable_column");
                }

                if (parseFloat(shoppingVoucherValue) > 0 && shoppingVoucherValue <= subTotal && shoppingVoucherValue <= saldoShoppingVoucher) {
                    ValeCompraAplicar(shoppingVoucherValue);
                } else {
                    if (parseFloat(shoppingVoucherValue) == 0) {
                        ValeCompraRemover();
                    }
                }
            }, 1000);
        });
    }

    if ($('#hasPagSeguro').val() != "0" && $('#hasPagSeguro').val() != undefined) 
    {
        $.ajax({
            async: false,
            method: "GET",
            url: "/Checkout/GetConfigPagSeguro",
            success: function (responseConfig) {
                var urlJS = '';
                if(responseConfig.config.production) 
                {
                    urlJS = 'https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }
                else 
                {
                    urlJS = 'https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js'
                }

                $('#MaximumInstallment').val(responseConfig.config.maximumInstallment);

                $('#MaximumInstallmentWithoutInterest').val(responseConfig.config.maximumInstallmentWithoutInterest);

                if (responseConfig.session != null) 
                {
                    $.ajaxSetup({ async: false });
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
                        success: function (responseValeCompra) {}
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
        validaCartaoCreditoBandeira("#CreditCard", "#btnCardCredit", "#brandCard", "C", 1, 1, "blur");

        //Cartão de Débito
        validaCartaoCreditoBandeira("#DebitCard", "#btnCardDebit", "#debitBrandCard", "D", 14, 0, "blur");

        //OneClick
        validaCartaoCreditoBandeira("#OneClick", "#btnOneClick", "#brandOneClick", "C", 1, 0, "change");
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
                        default:
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
                    //Envia Token                                
                    if (SendCheckAccessKeyByEmail(email)) {
                        //Exibir modal de Access Code (token enviado por e-mail)
                        $("#KeyAccess").val("")
                        $("#modalAccessCode").removeClass("hidden")
                        $("#modalAccessCode").modal("show")
                        $("#UserNameCode").val(email)
                    }
                    else {
                        swal('', response.message, 'error');
                    }
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
});