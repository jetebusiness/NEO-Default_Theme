import {moneyPtBR} from "../../functions/money";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {_alert, _confirm} from "../../functions/message";
const toastr = require("toastr");

$(document).ready(function () {
    $(".b2b_minus.detalhes, .b2b_plus.detalhes").click(function () {
        let skuID = $(this).parents(".sku_b2b").attr("data-sku-id");
        let quantidade_selecionada = parseInt($("#quantidade_b2b_"+skuID).val());
        let quantidade_stock = $(this).parents(".sku_b2b").attr("data-stock");
        let tipo = $(this).hasClass("b2b_minus") ? "MIN" : "MAX";
        ValidaQuantidadeSelecionada(skuID, quantidade_selecionada, quantidade_stock, tipo);
        $.when(AtualizarValoresUnitarios(skuID)).done(function( x ) {
            AtualizaValoresGerais();
            $("#parcelamento_b2b").find(".active").removeClass("active");
        });
    });

    $('input[id="quantidade_b2b_"]').keyup(function () {
        let skuID = $(this).parents(".sku_b2b").attr("data-sku-id");
        let quantidade_selecionada = parseInt($("#quantidade_b2b_"+skuID).val());
        let quantidade_stock = $(this).parents(".sku_b2b").attr("data-stock");
        ValidaQuantidadeSelecionada(skuID, quantidade_selecionada, quantidade_stock, "INPUT");
        $.when(AtualizarValoresUnitarios(skuID)).done(function( x ) {
            AtualizaValoresGerais();
            $("#parcelamento_b2b").find(".active").removeClass("active");
        });
    });

    $("#btn_comprar_b2b, #btn_comprar_continuar, #btn_comprar_oneclick_b2b").click(function () {
        var exibeMiniCarrinho = $(this)[0].id === "btn_comprar_b2b" ? true : false;

        $(this).addClass(".loading");
        let Cart = [];
        $("#grade_sku .sku_b2b").each(function(posicao) {
            let CartItem = new Object();
            CartItem.IdProduct = $(this).data("produto-id");
            CartItem.IdSku = $(this).data("sku-id");
            CartItem.Quantity = $(this).find(".quantidade_b2b").val();
            if(CartItem.Quantity > 0){
                Cart.push(CartItem);
            }
        });

        AdicionarListaProdutosCarrinho(Cart, exibeMiniCarrinho);

        if($(this)[0].id == "btn_comprar_oneclick_b2b") {
            $.ajax({
                method: "GET",
                url: "/Checkout/CheckoutNext",
                data: {},
                success: function(data){
                    if(data.success === true)
                        window.location.href = "/" + data.redirect
                    else
                        _alert("Mensagem", data.message, "error")
                },
                onFailure: function(data){
                    //console.log("Erro ao excluir frete");
                }
            });
        }
    });

    $(".avise_b2b").click(function () {
        let skuID = $(this).parents(".sku_b2b").attr("data-sku-id");
        let produtoID = $(this).data("produto-id");

        $.when(AviseMe(produtoID, skuID)).done(function(x) {

        });
    });

    $('#parcelamento_b2b.accordion').accordion({
        onOpening: function() {
            if($(this).hasClass('first-b2b-payment')){
                CarregarParcelamento(true);
            }
        }
    });
});

export function CarregarParcelamento(isB2b){
    let json = "",
        html = "",
        json_string = "",
        json_content = "";

    json_string = BuscarJsonParcelamento(isB2b);
    if(json_string != "0"){
        json = JSON.parse(json_string);
        json_content = JSON.parse(json.Content);
        var total_parcelas_exibidas = 0;
        //GATEWAY
        for (var i = 0; i < json_content.length; i++) {
            //METHODS
            for (var j = 0; j < json_content[i].paymentMethods.length; j++) {
                //BRANDS
                if(json_content[i].paymentMethods[j].status === true){
                    for (var k = 0; k < json_content[i].paymentMethods[j].paymentBrands.length; k++) {
                        var total_parcelas = json_content[i].paymentMethods[j].paymentBrands[k].installments.length;

                        if(total_parcelas > 0){
                            total_parcelas_exibidas++;

                            if(json_content[i].idPaymentGateway == 6)
                            {
                                html += `<div class="title">
                                      <i class="dropdown icon"></i>
                                      ${json_content[i].paymentMethods[j].paymentBrands[k].name}
                                  </div>
                                  <div class="content">
                                      <div class="ui list">`
                                html += `<div class="pagSeguroParcelamento" id="pagSeguroParcelamento" data-paymentbrand="${json_content[i].paymentMethods[j].paymentBrands[k].idPaymentBrand}" data-brand="${json_content[i].paymentMethods[j].paymentBrands[k].name.toLowerCase()}"> </div>`
                                html += `</div>
                                  </div>`
                            }
                            else
                            {
                                html += `         <div class="title">
                                      <i class="dropdown icon"></i>
                                      ${json_content[i].paymentMethods[j].paymentBrands[k].name}
                                  </div>
                                  <div class="content">
                                      <div class="ui list">`
                                for (var l = 0; l < json_content[i].paymentMethods[j].paymentBrands[k].installments.length; l++) {
                                    html += `<span class="item parcelamentos">
                                                  <span class="parcelas">${json_content[i].paymentMethods[j].paymentBrands[k].installments[l].installmentNumber} x</span>
                                                  <span class="valor"> ${moneyPtBR(json_content[i].paymentMethods[j].paymentBrands[k].installments[l].value)} </span>
                                                  <span class="modelo">(${json_content[i].paymentMethods[j].paymentBrands[k].installments[l].description})</span>
                                                  <span class="total">Total Parcelado: ${moneyPtBR(json_content[i].paymentMethods[j].paymentBrands[k].installments[l].total)}</span>
                                              </span>`
                                }
                                html += `</div>
                                  </div>`
                            }
                        }
                    }
                }
            }
        }

    }else {
        html += `<div class="title">
              <span>Não existem produtos selecionados</span>
          </div>`;
    }
    if(total_parcelas_exibidas === 0){
        html += `<div class="title">
               <span>Não existem parcelamento disponíveis</span>
            </div>`;
    }
    $("#parcelamento_info").html(html);
    CarregaParcelamentoPagSeguro();
}

function BuscarJsonParcelamento(isB2b){
    var total = "";
    if(typeof $("#total_geral").data("total-geral") != "undefined"){
        total = $("#total_geral").data("total-geral");
    }else{
        total = $("#preco").data("preco-inicial");
    }
    var retorno = "0";
    total = total.toString();
    total = parseFloat(total.replace(",","."))
    if(total > 0){
        $.ajax({
            url: '/Product/BuscarParcelamento',
            type: 'POST',
            async: false,
            data: {
                Valor : total,
                isB2b : isB2b
            },
            dataType: 'json',
            success: function (response) {
                retorno = response;
            },
            error : function(request,error)
            {
                retorno = "";
            }
        });
    }
    return retorno;
}
function AtualizarValoresUnitarios(skuID) {
    let quantidade_selecionada = parseInt($("#quantidade_b2b_"+skuID).val());
    let preco_promocional_unidade = $("#preco_antigo_unidade_"+skuID).val().replace(",",".");;
    let preco_unidade = $("#preco_unidade_" + skuID).val().replace(",",".");
    if(quantidade_selecionada > 0){
        if(preco_promocional_unidade > 0){
            $("#preco_antigo_"+skuID).html("de: <i>"+ moneyPtBR(preco_unidade * quantidade_selecionada) + "</i> por ");
            $("#preco_"+skuID).text(moneyPtBR(preco_promocional_unidade * quantidade_selecionada));
        }else{
            $("#preco_"+skuID).text(moneyPtBR(preco_unidade * quantidade_selecionada));
        }
    }
}
function AtualizaValoresGerais(){
    let total_real_skus_selecionados = 0;
    let total_qtd_skus_selecionados = 0;
    $("#grade_sku .sku_b2b").each(function(posicao) {
        let valor_str = $(this).find(".preco").text();
        let quantidade_str = $(this).find(".quantidade_b2b").val();
        let quantidade_float = somenteNumeros(quantidade_str);
        let valor_float = somenteNumeros(valor_str);
        total_qtd_skus_selecionados += quantidade_float;
        if(quantidade_float > 0){
            total_real_skus_selecionados += valor_float;
        }
    });
    $("#total_geral").text("Total: " + moneyPtBR(total_real_skus_selecionados));
    $("#total_geral").data("total-geral", total_real_skus_selecionados);
    $("#total_selecionados").text("Itens selecionados: " + parseInt(total_qtd_skus_selecionados));
}
function ValidaQuantidadeSelecionada(skuID, qtdSelecionada, stock, tipo){
    if(tipo != "INPUT"){
        if(qtdSelecionada >= 0){
            if(tipo === "MIN"){
                qtdSelecionada = qtdSelecionada > 0 ? qtdSelecionada-1 : 0;
            }else {
                qtdSelecionada += 1;
            }
        }else {
            qtdSelecionada = 0;
        }
        if(qtdSelecionada > stock){
            qtdSelecionada = stock;
            _alert("Quantidade máxima para o produto selecionado: "+stock+" unidades", "Mensagem", "warning");
        }

        $("#quantidade_b2b_"+skuID).val(qtdSelecionada);
    }
    else if(tipo === "INPUT"){
        let qtd = 0;
        if(qtdSelecionada >= 0){
            qtd = qtdSelecionada;
        }

        if(qtd > stock){
            qtd = stock;
            _alert("Quantidade máxima para o produto selecionado: "+stock+" unidades", "Mensagem", "warning");
        }

        $("#quantidade_b2b_"+skuID).val(qtd);
    }
}
function AviseMe (produtoID, skuID){
    $.ajax({
        url: '/Product/AlertMeCurrent',
        type: 'POST',
        data: {
            IdSku : skuID,
            IdProduct : produtoID.toString()
        },
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {
                _alert("", "Alerta criado com sucesso", "success");
            } else {
                _alert("", "Não foi possível criar o alerta: "+response.message, "warning");
            }
        },
        error : function(request,error)
        {
            _alert("","Erro ao criar alerta: "+error , "error");
        }
    });
}
function somenteNumeros(valor){
    var str = valor.replace("R$", "").replace(".","").replace(",",".");
    var retValue = 0;
    if(str !== null) {
        if(str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseFloat(str);
            }
        }
    }
    return retValue;
}
function AdicionarListaProdutosCarrinho(Cart, exibeMiniCarrinho) {
    $.ajax({
        url: '/Product/InsertItemCart',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(Cart),
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {
                $(document).find(".loading").removeClass("loading");
                toastr.success("Produto adicionado ao carrinho com sucesso!");
                LoadCarrinho(exibeMiniCarrinho);
                if(exibeMiniCarrinho === true){
                    window.location.href = "/Checkout";
                }
            } else {
                swal({
                    title: '',
                    text: response.msg,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
                $(document).find(".loading").removeClass("loading");
            }

        },
        error : function(request,error)
        {
            $(document).find(".loading").removeClass("loading");
        }
    });
}

export function CarregaParcelamentoPagSeguro()
{
    if($('.pagSeguroParcelamento').length > 0)
    {
        $('.pagSeguroParcelamento').html("Carregando...");
        $.ajax({
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

                $.getScript(urlJS, function () {
                    PagSeguroDirectPayment.setSessionId(responseConfig.session.Id);

                    var totalCheckout = 0;

                    if($('#preco').length > 0)
                        totalCheckout = $('#preco').html().replace('R$', '').replace('&nbsp;', '').replace('.', '').replace(',', '.');
                    else
                        totalCheckout = $('#conjunto-total-final').html().replace('R$', '').replace('&nbsp;', '').replace('.', '').replace(',', '.');

                    $.each($('.pagSeguroParcelamento'), function(key, item)
                    {
                        var divParcelamento = $(item);
                        var _brand = $(divParcelamento).data("brand");

                        PagSeguroDirectPayment.getInstallments({
                            amount: totalCheckout,
                            brand: _brand,
                            maxInstallmentNoInterest: responseConfig.config.maximumInstallmentWithoutInterest,
                            success: function (responseInstallment) {
                                //var auxTotalProduto = Number.parseFloat(totalCheckout);
                                //var jurosTotal = 0;
                                //var taxaMensal = 0;
                                var maximumInstallment = Number.parseInt(responseConfig.config.maximumInstallment);
                                $.each(responseInstallment.installments, function (key, ResponseBrand) {
                                    //jurosTotal = Number.parseFloat(item.totalAmount) - auxTotalProduto;

                                    //taxaMensal = (jurosTotal / (auxTotalProduto * Number.parseFloat(item.quantity))) * 100;
                                    $("div.pagSeguroParcelamento[data-brand=" + key + "]").empty();
                                    $.each(ResponseBrand, function(key2, item)
                                    {
                                        //if(item.quantity <= maximumInstallment)
                                        //{
                                        $("div.pagSeguroParcelamento[data-brand=" + key + "]").append(
                                            '<span class="item parcelamentos">' +
                                            '<span class="parcelas">' + item.quantity + ' x </span>' +
                                            '<span class="valor">' + item.installmentAmount.toLocaleString('en-US', { style: 'currency', currency: 'BRL' }) + ' </span>' +
                                            '<span class="modelo">(' + ((item.interestFree)? 'Sem juros' : 'Com juros') + ')</span>' +
                                            //'<span class="modelo">(' + ((item.interestFree)? 'Sem Juros' : 'juros de ' + taxaMensal.toFixed(4) + '% ao mês') + ')</span>' +
                                            '<span class="total">Total Parcelado: ' + item.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'BRL' }) + '</span>' +
                                            '</span>'
                                        );
                                        //}
                                    });
                                });
                            },
                            error: function (responseInstallment) {
                                console.log(responseInstallment);
                            }
                        });

                    });
                });
            }
        });
    }
}
