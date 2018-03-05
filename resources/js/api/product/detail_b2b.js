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

    $("#btn_comprar_b2b, #btn_comprar_continuar").click(function () {
        var exibeMiniCarrinho = $(this)[0].id === "btn_comprar_continuar" ? false : true;

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
