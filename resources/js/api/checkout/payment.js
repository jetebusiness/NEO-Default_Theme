import {_alert, _confirm} from '../../functions/message';
import {buscaCep, atualizaCampos} from '../../api/customer/AddressManager';
﻿import {isLoading} from "../../api/api_config";

function clickShipping(){
    var zipcode = $("#zipcode").val();
    var valorFrete = "";
    var idFrete = "";
    var correiosEntrega = "";
    $("#GetShippping .item .checkbox").click(function(){
        if(cancelarCalculoFrete())
        {
            var ponteiroCurrent = $(".shippingGet", this);
            $(".shippingGet").attr("checked", false);
            $(ponteiroCurrent).attr("checked",true);

            valorFrete = $(ponteiroCurrent).attr("data-value");
            idFrete = $(ponteiroCurrent).attr("data-id");
            correiosEntrega = $(ponteiroCurrent).attr("data-correios");
        }

        if ((valorFrete != "") && (idFrete != "") && (correiosEntrega != "") && (zipcode != ""))
        {
            $('#goToPayment').attr("disabled", false);
            disparaAjaxShipping(zipcode, idFrete, correiosEntrega);
        }
    });
}

function disparaAjaxShipping(zipcode, idFrete, correiosEntrega){
    $("#resumoCheckout .resumo .title").removeClass("active");
    $("#resumoCheckout .resumo .content").removeClass("active");
    $("#resumoCheckout .resumo .content").stop(false, true).slideUp();

    $.ajax({
        method: "POST",
        url: "SaveFrete",
        data: {
            zipCode: zipcode,
            idShippingMode: new Number(idFrete),
            deliveredByTheCorreiosService: correiosEntrega.toLowerCase()
        },
        success: function (response) {
            atualizaResumoCarrinho();
        }
    });
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

        var validaFrete = "";

        switch($(this).prop("id"))
        {
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
                if($(this).data("card") == "N")
                {
                    kind = "boleto";
                }
                break;
        }

        $("#GetShippping .item .description").each(function (index, value) {
            var ponteiroCurrent = $(this);

            if($(ponteiroCurrent).find(".checked").length > 0)
            {
                validaFrete = "S";
                return (false);
            }
            else
            {
                if($(ponteiroCurrent).find(":checked").length > 0)
                {
                    validaFrete = "S";
                    return (false);
                }
            }
        });

        if(tipoVerificacao == "S")
        {
            idInstallment = $("#parcCard").val();
            installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");

            var dataCurrent = new Date();
            var anoCurrent = new Number(dataCurrent.getFullYear());
            var mesCurrent = new Number(dataCurrent.getMonth()+1);

            if(validaMes > 12)
            {
                msgErrors+= "<br />O campo Data de Validade está com o mês inválido!";
            }

            if(validaAno < anoCurrent)
            {
                msgErrors+= "<br />O campo Data de Validade está com o ano inválido!";
            }
            else
            {
                if(validaAno == anoCurrent)
                {
                    if(validaMes < mesCurrent)
                    {
                        msgErrors+= "<br />O campo Data de Validade está com o mês inválido!";
                    }
                }
            }

            $("#validCardCredit").find(".required").each(function(){
                var labelCurrent = $(".labelCheckPayment", this).text();
                var valorCurrent = $(".fieldCheckPayment", this).val();

                if((valorCurrent == "") || (valorCurrent.length < 3)){
                    msgErrors+= "<br />O campo "+labelCurrent+ " está inválido!";
                }
            });
        }

        if(tipoVerificacao == "O")
        {
            idInstallment = $("#parcCardOneClick").val();
            installmentNumber = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");

            $("#validOneClick").find(".required").each(function(){
                var labelCurrent = $(".labelCheckPayment", this).text();
                var valorCurrent = $(".fieldCheckPayment", this).val();

                if((valorCurrent == "") || (valorCurrent.length < 3 && labelCurrent != "Cartões Salvos")){
                    msgErrors+= "<br />O campo "+labelCurrent+ " está inválido!";
                }
            });
        }

        if(tipoVerificacao == "D")
        {
            idInstallment = $("#parcCard").val();
            installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");

            var dataCurrent = new Date();
            var anoCurrent = new Number(dataCurrent.getFullYear());
            var mesCurrent = new Number(dataCurrent.getMonth()+1);

            if(validaMes > 12)
            {
                msgErrors+= "<br />O campo Data de Validade está com o mês inválido!";
            }

            if(validaAno < anoCurrent){
                msgErrors+= "<br />O campo Data de Validade está com o ano inválido!";
            }
            else
            {
                if(validaAno == anoCurrent)
                {
                    if(validaMes < mesCurrent)
                    {
                        msgErrors+= "<br />O campo Data de Validade está com o mês inválido!";
                    }
                }
            }

            $("#validCardDebit").find(".required").each(function(){
                var labelCurrent = $(".labelCheckPayment", this).text();
                var valorCurrent = $(".fieldCheckPayment", this).val();

                if((valorCurrent == "") || (valorCurrent.length < 3)){
                    msgErrors+= "<br />O campo "+labelCurrent+ " está inválido!";
                }
            });
        }

        if(msgErrors != "")
        {
            swal({
                title: 'Ops! Encontramos um problema ..',
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
        else
        {
            if (validaFrete == "S") 
            {
                $.ajax({
                    method: "POST",
                    url: "GerarPedidoCompleto",
                    data: {
                        idCustomer        : idCustomer,
                        idAddress         : new Number(idAddress),
                        presente          : presente,
                        mensagem          : mensagem,
                        idInstallment     : idInstallment,
                        idPaymentBrand    : new Number(idPaymentBrand),
                        card              : card,
                        nameCard          : nameCard,
                        expDateCard       : expDateCard,
                        cvvCard           : cvvCard,
                        brandCard         : brandCard,
                        installmentNumber : new Number(installmentNumber),
                        kind              : kind,
                        document          : document,
                        idOneClick        : idOneClick,
                        saveCardOneClick  : saveCardOneClick,
                        userAgent         : userAgent
                    },
                    success: function (response) {
                        if (response.success === true) 
                        {
                            if(response.errorMsg != ""){
                                _alert("Ops! Encontramos um problema ..", response.errorMsg, "warning");
                                $(".GerarPedido").removeClass("loading");
                                $(".GerarPedido").removeClass("disabled");
                            }
                            else{
                                if (response.urlRedirect != "") 
                                {
                                    window.location.href = response.urlRedirect;
                                }
                                else 
                                {
                                    if(response.urlBoleto != "")
                                    {
                                        window.location.href = "Success?orderId=" + response.idPedido + "&b=" + response.urlBoleto;
                                        //window.location.href = "Success?orderId=" + response.idPedido;
                                    }
                                    else{
                                        window.location.href = "Success?orderId=" + response.idPedido;
                                    }
                                }
                            }
                        } 
                        else 
                        {
                            if (response.showMessage) {
                                swal({
                                    title: '',
                                    html: response.msg,
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
                                window.location.href = "Success?orderId=" + response.idPedido + "&s="+response.success+"&m="+response.msgEncrypt;
                            }
                        }
                    }
                });
            } 
            else 
            {
                _alert("Ops! Encontramos um problema ..", "Escolha o frete antes de fechar o pedido!", "warning");
                $(".GerarPedido").removeClass("loading");
                $(".GerarPedido").removeClass("disabled");
            }
        }
    });
}

function onChangeCheckBox(){
    $('#checkPresente').checkbox({
        onChecked: function() {
            $("#presente").val("on");
            $("#exibeMsg > label").show();
            $("#exibeMsg > #mensagem").show();
        },
        onUnchecked: function() {
            $("#presente").val("off");
            $("#exibeMsg > label").hide();
            $("#exibeMsg > #mensagem").hide();
        }
    });
}

function verificaPresente(){
    //$("#embrulhaPresente").click(function(){
    $("#exibeMsg").removeAttr("style");
    if($('#checkPresente').checkbox('is checked')) 
    {
        $("#exibeMsg > label").show();
        $("#exibeMsg > #mensagem").show();
    }
    else 
    {
        $("#exibeMsg > label").hide();
        $("#exibeMsg > #mensagem").hide();
    }
    //});
}


function onChangeParcelamento(){
    $('#parcCard').on('change', function() {
        var codigoBandeira = $("#btnCardCredit").attr("data-idBrand");
        var parcela_selecionada = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
        var id_tipo = 1;

        if(codigoBandeira != "" && parcela_selecionada != ""){
            AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
        }
    });

    $('#parcCardOneClick').on('change', function() {
        var codigoBandeira = $("#btnOneClick").attr("data-idBrand");
        var parcela_selecionada = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
        var id_tipo = 1;

        if(codigoBandeira != "" && parcela_selecionada != ""){
            AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
        }
    });
}

function GetPaymentGateway(nameBrand){
    var objPaymentMethod = $('#validCardCredit').data('paymentmethod'); //jQuery.parseJSON($('#validCardCredit').data('paymentgateway'));
    //console.log(objPaymentGateway);
    for (var i = 0; i < objPaymentMethod.PaymentBrands.length; i++) 
    {
        var auxNameBrand = objPaymentMethod.PaymentBrands[i].Name.toLowerCase();
        if(auxNameBrand == nameBrand) 
        {
            var IdPaymentBrand = Number.parseInt(objPaymentMethod.PaymentBrands[i].IdPaymentBrand, 10);
            return IdPaymentBrand;
        }
    }
    return 0;
}

function validaCartaoCreditoBandeira(idOnBlur, btnCard, updateBrand, typeForm, codigoPaymentMethod, parcela_selecionada, _event){
    $(idOnBlur).on(_event, function(event){
        $(btnCard).removeAttr("data-idBrand");
        var numeroCartao;
        var codigoBandeira = 0;
        var oneclick = false;

        if(event.type == "change")
        {
            numeroCartao = $(this).find("option:selected").text().substring(0,4);
            cartao = $(this).find("option:selected").data("brand").toLowerCase();
            codigoBandeira = GetPaymentGateway(cartao);
            $(btnCard).attr("data-idBrand",codigoBandeira);
            $(updateBrand).val(cartao);
            oneclick = true;
        } 
        else 
        {
            numeroCartao = $(this).val().replace(/\s/g, '' );

            var cartoes = {
                elo: /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(50900\d|5090[1-9]\d|509[1-9]\d{2})|65003[1-3]|(65003[5-9]|65004\d|65005[0-1])|(65040[5-9]|6504[1-3]\d)|(65048[5-9]|65049\d|6505[0-2]\d|65053[0-8])|(65054[1-9]| 6505[5-8]\d|65059[0-8])|(65070\d|65071[0-8])|65072[0-7]|(65090[1-9]|65091\d|650920)|(65165[2-9]|6516[6-7]\d)|(65500\d|65501\d)|(65502[1-9]|6550[3-4]\d|65505[0-8]))[0-9]{10,12}/,
                diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                dinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
                hipercard: /^(38[0-9]{17}|60[0-9]{14})$/,
                amex: /^3[47][0-9]{13}$/,
                aura: /^50[0-9]{14,17}$/,
                mastercard: /^5[1-5][0-9]{14}$/,
                visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                jcb: /^(?:2131|1800|35\d{3})\d{11}/
            };

            for (var cartao in cartoes)
            {
                if (numeroCartao.match(cartoes[cartao]))
                {
                    codigoBandeira = GetPaymentGateway(cartao);
                    $(btnCard).attr("data-idBrand",codigoBandeira);
                    $(updateBrand).val(cartao);
                    break;
                }
            }
        }
        if(numeroCartao != "" && codigoBandeira == 0)
        {
            if(typeForm == "C")
            {
                $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
            }
            _alert("Ops! Encontramos um problema ..", "A loja pode não aceitar essa bandeira ou o cartão está incorreto", "warning");
        }
        else
        {
            if($(idOnBlur).val() != "")
            {
                $.ajax({
                    method: "POST",
                    url: "VerificaStatusBandeira",
                    data: {
                        idPaymentMethod : codigoPaymentMethod,
                        idPaymentBrand  : new Number(codigoBandeira)
                    },
                    success: function (response) {
                        if(response.success)
                        {
                            if(typeForm == "C"){
                                if(!oneclick){
                                    $("#btnCardCredit").attr("disabled", false);
                                    $("#btnOneClick").attr("data-idbrand","");
                                    $("#btnOneClick").attr("disabled", true);
                                    $("#parcCardOneClick").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                }else{
                                    $("#btnOneClick").attr("disabled", false);
                                    $("#btnCardCredit").attr("data-idbrand","");
                                    $("#btnCardCredit").attr("disabled", true);
                                    $("#CreditCard").val('');
                                    $("#CreditCard").empty();
                                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                                }

                                atualizaParcelamento(codigoBandeira, oneclick);
                            }
                        }
                        else
                        {
                            $(btnCard).attr("data-idBrand",0);
                            $(updateBrand).val("");
                            $(idOnBlur).val("");
                            _alert("Ops! Encontramos um problema ..", response.message, "warning");
                        }
                    }
                });
            }
        }
    });
}

function atualizaParcelamento(codigoBandeira, oneclick){
    var option = "";
    if(codigoBandeira > 0){
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
                var objParcelamento = response.ListInstallment;

                if(objMsgError == "" || typeof(objMsgError) == "undefined")
                {
                    if(objOneClick != "" && typeof(objOneClick) != "undefined")
                    {
                        $("#checkOneClickMaxiPago").show();
                        $("#documentOneClick").show();
                        $("#documentOneClick").addClass("required");
                    }
                    else
                    {
                        $("#checkOneClickMaxiPago").hide();
                        $("#documentOneClick").hide();
                        $("#documentOneClick").removeClass("required");
                    }

                    if(!oneclick)
                    {
                        for (var i = 0; i < objParcelamento.length; i++)
                        {
                            var IdInstallment = objParcelamento[i].IdInstallment;
                            var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                            var Description = objParcelamento[i].Description;
                            var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                            option += "<option value='"+IdInstallment+"' data-InstallmentNumber='"+InstallmentNumber+"'>"+InstallmentNumber+"x de "+Value+"("+Description+")</option>";
                            $("#parcCard").html(option);

                            var installmentNumber = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                            AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                        }
                    }
                    else
                    {
                        for (var i = 0; i < objParcelamento.length; i++) 
                        {
                            var IdInstallment = objParcelamento[i].IdInstallment;
                            var InstallmentNumber = objParcelamento[i].InstallmentNumber;
                            var Description = objParcelamento[i].Description;
                            var Value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objParcelamento[i].Value);

                            option += "<option value='"+IdInstallment+"' data-InstallmentNumber='"+InstallmentNumber+"'>"+InstallmentNumber+"x de "+Value+"("+Description+")</option>";
                            $("#parcCardOneClick").html(option);
                        }

                        var installmentNumber = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
                        AtualizaResumoCarrinhocomDesconto(codigoBandeira, 1, installmentNumber);
                    }
                }
                else
                {
                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("Ops! Encontramos um problema ..", objMsgError, "warning");
                }
            }
        });
    }
    else{
        $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
    }
}

function buscaTotalParcelamento(codigoBandeira, codigoPaymentMethod, parcela_selecionada){
    var valor = {};
    if(codigoBandeira > 0)
    {
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
                if(response.success === true)
                {
                    valor = response;
                }
                else
                {
                    $("#parcCard").html("<option value='0'>Informe o numero do cartão primeiro</option>");
                    _alert("Ops! Encontramos um problema ..", response.result, "warning", false);
                }
            }
        });
    }
    return valor;
}

function AtualizaResumoCarrinhocomDesconto(codigoBandeira, codigoPaymentMethod, parcela_selecionada){
    var obj_parcelamento = buscaTotalParcelamento(codigoBandeira, codigoPaymentMethod, parcela_selecionada);
    //var obj_carrinho = buscaValorFinalCarrinho();
    if(Object.keys(obj_parcelamento).length > 0){
        var desconto_inicial = $("#desconto_checkout").attr("data-discount-initial");

        if(desconto_inicial.indexOf(',') != -1){
            desconto_inicial = desconto_inicial.substring(0, desconto_inicial.indexOf(','));
        }
        desconto_inicial = desconto_inicial.replace(/[^0-9\.-]+/g,"");
        desconto_inicial = parseFloat(desconto_inicial);

        $("#desconto_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj_parcelamento.discount + desconto_inicial));
        $("#total_checkout").text(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(obj_parcelamento.result));
    }
}


function listAddressPayment(){
    $("#listAddressPayment").click(function(){
        $("#addDataAddress").removeClass("addAddress");
        $("#addDataAddress").text("Adicionar");
        $("#listAddressData").show();
        $("#registerAddressPayment").hide();

        viewAddressLogged();
        RecoverPasswordByEmail();
        $('.ui.modal').modal('show');
    });
}

function showAddressPayment(){
    $("#addDataAddress").click(function(){
        if($(".addAddress").length > 0){
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
                success: function(responseDefault){
                    if(responseDefault.success)
                    {
                        atualizaEnderecos(responseDefault);
                    }
                    else
                    {
                        _alert("Ops! Encontramos um problema ..", responseDefault.msg, "warning");
                    }
                }
            });
        }
        else
        {
            $("#listAddressData").hide();
            $("#registerAddressPayment").show();
            $(this).addClass("addAddress");
            $(this).text("Cadastrar");
            $('.ui.modal').modal('refresh');
        }
    });
}

function changeAddressPayment(){
    $(".utilAddress").click(function(){
        var idAddressChange = $(this).attr("data-id");
        $("#registerAddressPayment").hide();

        $.ajax({
            method: "POST",
            url: "ListAddressDefault",
            success: function(responseDefault){
                $.ajax({
                    method: "POST",
                    url: "ChangeAddressCheckout",
                    data:{
                        idAddressDefault : responseDefault.msg,
                        idAddressCurrent : idAddressChange
                    },
                    success: function(responseChange){
                        if(responseChange.success)
                        {
                            atualizaEnderecos(responseChange);
                        }
                        else
                        {
                            _alert("Ops! Encontramos um problema ..", responseChange.msg, "warning");
                        }
                    }
                });
            }
        });
    });
}

function cancelarCalculoFrete(){
    if($('.contentcartao .menu.tabular .item.active').data('tab') == "oneclick")
    {
        atualizaResumoCarrinho(true);
    }
    else
    {
        atualizaResumoCarrinho(false);
    }
    return(true);
}

function atualizaResumoCarrinho(oneclick){
    $.ajax({
        method: "POST",
        url: "LoadResumoPayment",
        success: function (data) {
            $("#resumoCheckout").html(data);
            $("#resumoCheckout .resumo .title").addClass("active");
            $("#resumoCheckout .resumo .content").addClass("active");
            $("#resumoCheckout .resumo .content").stop(false, true).slideDown();
            
            var codigoBandeira = $("#btnCardCredit").attr("data-idBrand");
            if($("#btnOneClick").length > 0){
                codigoBandeira = $("#btnCardCredit").attr("data-idBrand") != "" ? $("#btnCardCredit").attr("data-idBrand") : $("#btnOneClick").attr("data-idBrand");
            }

            if(typeof(codigoBandeira) != "undefined")
            {
                atualizaParcelamento(codigoBandeira);
                var _parcela = $("#parcCard").find(':selected').attr("data-InstallmentNumber");
                if(oneclick || $("#btnOneClick").attr("data-idBrand") != "") 
                {
                    _parcela = $("#parcCardOneClick").find(':selected').attr("data-InstallmentNumber");
                }
                var parcela_selecionada = _parcela != undefined ? _parcela : "1";
                var id_tipo = 1;
                if(codigoBandeira != "" && parcela_selecionada != ""){
                    AtualizaResumoCarrinhocomDesconto(codigoBandeira, id_tipo, parcela_selecionada);
                }
            }
        }
    });
}

function atualizaEnderecos(responseChange){
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
            if(cancelarCalculoFrete())
            {
                clickShipping();
            }
            HabilitarButtonIrParaPagamento();
            $('.ui.modal').modal('hide');
        }
    });
}


function applyDiscount(){
    $("#applyDiscount").click(function(){
        var key = $("#key").val();
        var customerId = $("#idCustomer").val();

        if((key != "") && (customerId != ""))
        {
            $.ajax({
                method: "POST",
                url: "AplicaDescontoCheckout",
                data: {
                    key         : key,
                    customerId  : customerId
                },
                success: function success(response) {
                    if(response.success)
                    {
                        atualizaResumoCarrinho();
                        _alert("Cupom de Desconto!", response.msg, "success");
                    }
                    else
                    {
                        $("#key").val("");
                        _alert("Ops! Encontramos um problema ..", response.msg, "warning");
                    }
                }
            });
        }
        else
        {
            _alert("Ops! Encontramos um problema ..", "Você não informou uma chave de desconto!", "warning");
        }
    });
}

function updateAddress(){
    $.ajax({
        method: "POST",
        url: "ListaEnderecosCliente",
        success: function success(data) {
            $("#ListaEnderecosCliente").html(data);
            $("#registerAddressPayment").hide();
            changeAddressPayment();
            showAddressPayment();
            calculaFreteUpdate();
            $('.ui.modal').modal('refresh');
        }
    });
}

function viewAddressLogged(){
    $("#loginPayment").click(function(){
        var token = $("input[name='__RequestVerificationToken']").val();
        var userName = $("#UserName").val();
        var password = $("#password").val();
        $.ajax({
            method: "POST",
            url: "/Customer/Login",
            data:{
                __RequestVerificationToken : token,
                UserName : userName,
                password: password
            },
            success: function success(response){
                if(response.success){
                    updateAddress();
                    updateDadosUsuario();
                }else{
                    _alert("Ops! Encontramos um problema ..", response.message, "warning");
                }
            }
        });
    });
}

function calculaFreteUpdate(){
    $("#zipCode").keyup(function (event) {
        var cep = $("#zipCode").val()
        cep = cep.replace("-", "")
        if (cep.length == 8) 
        {
            buscaCep(cep)
        }
    });
}

function updateDadosUsuario(){
    var zipCodeCart = $("#zipCode").val();
    var idShippingModeCart = $("#idAddress").val();
    $.ajax({
        method: "POST",
        url: "ListaDadosCliente",
        data:{
            zipCodeCart         : zipCodeCart,
            idShippingModeCart  : idShippingModeCart
        },
        success: function success(response){
            $("#dadosClienteUpdate").html(response);
            updateAddress();
            listAddressPayment();
        }
    });
}

function CheckAccessKey(){
    $("#ListaEnderecosCliente").on("click", "#confirmTokkenPayment", function(event){
        var codeTokkenPayment = $("#codeTokkenPayment").val();
        if((codeTokkenPayment != "") && (typeof(codeTokkenPayment) != "undefined")){
            $.ajax({
                method: "POST",
                url: "/customer/CheckAccessKey",
                data:{
                    KeyAccess : codeTokkenPayment
                },
                success: function success(response){
                    if(response.Success)
                    {
                        viewNewPassword();
                        $('.ui.modal').modal('refresh');
                    }
                    else
                    {
                        _alert("Ops! Encontramos um problema ..", response.Message, "warning");
                    }
                }
            });
        }else{
            _alert("Ops! Encontramos um problema ..", "Informe a Chave de Acesso!", "warning");
        }
    });
}

function viewNewPassword(){
    var token = $("input[name='__RequestVerificationToken']").val();

    $.ajax({
        method: "POST",
        url: "PageNewPassword",
        data:{
            __RequestVerificationToken : token
        },
        success: function success(response){
            $("#ListaEnderecosCliente").html(response);
            accessUser();
        }
    });
}

function accessUser(){
    $("#pwdPayment").click(function(event){
        event.preventDefault();
        event.stopPropagation();
        var token = $("input[name='__RequestVerificationToken']").val();
        var pwdUser = $("#pwdUser").val();
        var pwdUserConfirm = $("#pwdUserConfirm").val();

        if((pwdUser != "") && (pwdUserConfirm != ""))
        {
            $.ajax({
                method: "POST",
                url: "NewPassword",
                data: {
                    __RequestVerificationToken : token,
                    pwdUser : pwdUser,
                    pwdUserConfirm : pwdUserConfirm
                },
                success: function success(response){
                    if(response.success)
                    {
                        updateAddress();
                        updateDadosUsuario();
                        calculaFreteUpdate();
                    }
                    else
                    {
                        _alert("Ops! Encontramos um problema .. 1", response.message, "warning");
                    }
                }
            });
        }
        else
        {
            _alert("Ops! Encontramos um problema ..", "Informe a senha", "warning");
        }
    });
}

function ReEnviarCodigoEmail(){
    $("#reenviarCod").click(function(){
        $.ajax({
            method: "POST",
            url: "ReEnviarCodigoEmail",
            success: function success(response){
                if(!response.success)
                {
                    _alert("Ops! Encontramos um problema ..", response.message, "warning");
                }
                else
                {
                    _alert("Por favor Aguarde!", "Em instantes você receberá no seu e-mail, as instruções para obter seu código de acesso.", "warning");
                }
            }
        });
    });
}

function RecoverPasswordByEmail(){
    $("#RecoverPasswordByEmail").click(function(){
        $.ajax({
            method: "POST",
            url: "/customer/RecoverPasswordByEmail",
            data:{
                email : $("#UserName").val()
            },
            success: function success(response){
                if(response.Success)
                {
                    _alert("Por favor Aguarde!", response.Message, "warning");
                }
                else
                {
                    _alert("Ops! Encontramos um problema ..", response.Message, "warning");
                }
            }
        });
    });
}

function HabilitarButtonIrParaPagamento(){
    $('#goToPayment').attr("disabled", true);
    $("#checkoutColumn2").addClass("disable_column");

    $("#goToPayment").click(function(){
        $("#checkoutColumn2").removeClass("disable_column");
    });
}

function TestaCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;
    if (strCPF == "00000000000") return false;
    
    for (var i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
 
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
 
    Soma = 0;
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
 
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
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


$(document).ready(function () {

    $('#Document').keyup(function (event) {
        return onlyNumbers(event);
    });

    $('#Document').blur(function(){
        if(!TestaCPF($(this).val())) {
            _alert("Ops! Encontramos um problema ..", "Número de CPF inválido.", "warning");
            $(this).val('');
        }
        return false;
    });

    //$.jetRoute("checkout", function (){
    if($("#idAddress").val() != "")
    {
        clickShipping();
        if ($(".GerarPedido").length > 0) 
        {
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
        $("#checkOneClickMaxiPago").hide();
        $("#documentOneClick").hide();
        $("#documentOneClick").removeClass("required");

        listAddressPayment();
        changeAddressPayment();
        showAddressPayment();
        applyDiscount();
        CheckAccessKey();
        ReEnviarCodigoEmail();
        onChangeParcelamento();
        HabilitarButtonIrParaPagamento();
    }
    else
    {
        _alert("Ops! Encontramos um problema ..", "Você não pode fechar um pedido sem um endereço de entrega!", "warning");
    }
    //});
    if($('.contentcartao').length > 0)
    {
        $('.ui.accordion').accordion({
            exclusive: true,
            animateChildren: false,
            onOpening: function(){
                $('.contentcartao .segment').removeClass('visible').removeAttr('style');
            }
        });
    }
});