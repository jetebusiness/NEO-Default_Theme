import {isLoading} from "../api_config";
import {moneyPtBR} from "../../functions/money";
import {getAllMask} from "../../ui/modules/mask";

import {_alert} from "../../functions/message";
import {openModalQuickView, openLongModal} from "../../functions/modal";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {SomenteNumerosPositivos} from "../../functions/form-control";
import {LoadCarrinhoEventList} from "../../functions/mini_cart_generic";
import {CarregarParcelamento, CarregaParcelamentoPagSeguro} from "../../api/product/detail_b2b.js";

import { VariacaoDropDown, VariacaoCor, VariacaoImagem, VariacaoRadio, AtualizarCompreJunto  } from "./variations-floating";

import { generateRecaptcha }  from "../../ui/modules/recaptcha";

$(document).ready(function () {
    "use strict";
    
    //nova estrutura de variacao do produto
    variations.init();


    window.onload = function() { 

        $("#quantidade").keyup(function (e) {
            var valor_final = SomenteNumerosPositivos($(this).val());
            $(this).val(valor_final);
            AtualizarQuantidade();
            e.stopPropagation();
        });

        $("#qtdplus-detalhes, #qtdminus-detalhes").click(function(){
            var quantidade = parseInt($("#quantidade").val());
            var tipo = $(this).hasClass("qtdminus");

            if(tipo){
                quantidade -= 1;
            }else {
                quantidade += 1;
            }
            $("#quantidade").val(quantidade);
            AtualizarQuantidade();
        });

        $(".btn-avaliar").click(function () {


            var count = 0,
                form = $("#avaliar");
            
            $("textarea:not(.g-recaptcha-response), input:visible:not([type='checkbox']):not(.search)", form).each(function() {
                if($(this).val().trim() === "")
                    count++;

                if($(this).val().trim() === "")
                    console.log($(this))
            });

            $('.dropdown:not(.icon)', form).each(function() {
                if($(this).dropdown("get value").trim() === "")
                    count++;
            });
                        
            if(count === 0) {
                if($("[id^=googleVersion]", form).val() === "2") {
                    if (generateRecaptcha($("[id^=googleModule]", form).val(), form))
                        AvaliarProduto();
                } else {
                    AvaliarProduto();
                }
            } else {
                swal({
                    title: 'Ops...',
                    text: "Preencha todos os campos corretamente",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
       
        });

        $("#avaliar .ui.star.rating").click(function () {
            var starsSelected = $("#avaliar .ui.rating .icon.active").length;
            $("#Rate").val(starsSelected);
        });



        $("body").delegate(".btnComprar .detalhes, .flutuante .detalhes", "click", function () {
            console.log('oi')
            
            var resultado       = ValidarSkuProdutoPrincipal();
            let productSKU      = $("#produto-sku").val(),
                productID       = $("#produto-id").val(),
                productQuantity = parseInt($("#quantidade").val()),
                totalVariations = $("#principal-total-variacoes").val(),
                onClick         = $(this).hasClass("btn-comprar-oneclick");

            //PRODUTO DEVE SER DIFERENTE DE NULL
            if (productID != null && productID != "") {
                $(this).addClass("loading");
                //SE FOR, VALIDA SE EXISTE VARIAÇÔES                 
                
                if (parseInt(totalVariations) > 0) {
                    //SE EXISTE, VALIDA SE FOI SELECIONADA
                    if (productSKU != null && productSKU != "" && resultado > 0) {
                        
                        AdicionarProdutoAjx(parseInt(productSKU), parseInt(productID), productQuantity, onClick);    
                        ApplyDiscountInCart();
                    }else {
                        _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                    }
                } else {
                    ///GRAVA PRODUTO SEM VARIACAO                    
                    AdicionarProdutoAjx(null, parseInt(productID), productQuantity, onClick);         
                    ApplyDiscountInCart();
                }
            }else {
                _alert("Erro ao adicionar produto", "Mensagem", "error");
            }
        });


        $(".detalhes.btn-add-event-list").click(function(){
            var resultado = ValidarSkuProdutoPrincipal();
            let productSKU = $("#produto-sku").val(),
                productID = $("#produto-id").val(),
                productQuantity = parseInt($("#quantidade").val()),
                totalVariations = $("#principal-total-variacoes").val()

            //PRODUTO DEVE SER DIFERENTE DE NULL
            if(productID != null && productID != ""){
                $(this).addClass("loading");
                //SE FOR, VALIDA SE EXISTE VARIAÇÔES
                if(parseInt(totalVariations) > 0){
                    //SE EXISTE, VALIDA SE FOI SELECIONADA
                    if(productSKU != null && productSKU != "" && resultado > 0){
                        AdicionarProdutoAjxEventList(parseInt(productSKU), parseInt(productID), productQuantity);
                    }else {
                        _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                    }
                }else {
                    ///GRAVA PRODUTO SEM VARIACAO
                    AdicionarProdutoAjxEventList(0, parseInt(productID), productQuantity);
                }
            }else {
                _alert("Erro ao adicionar produto", "Mensagem", "error");
            }
        });

        //COMPRE JUNTO
        $("#btn_comprejunto").click(function(){
            isLoading("body");
            AdicionarProdutosCompreJuntoAjx();
            isLoading("body");
        });

        $("#btn_carregar_avaliacoes").click(function () {
            CarregarMaisAvaliacoes();
        });

        //parcelamento PAGSEGURO
        CarregaParcelamentoPagSeguro();        
        
        //funcao AVISE-ME
        alertSendStock()
        
        //calculo de frete
        calcShipping()
        
        //floating-bar
            
        if($("#buy-together").length > 0) {

            var defaults = {
                config: {
                    container: '#variations-buy-together'
                }                    
            } 

            $.extend(true, variations, defaults);
            
            variations.init()

            VariacaoCor();
            VariacaoRadio();
            VariacaoDropDown();
            VariacaoImagem();
        }

        if($("#floating-bar").length > 0) {

            var defaults = {
                config: {
                    container: '#variations-floating'
                }
            }

            $.extend(true, variations, defaults);

            variations.init()
        }

    }();
});

$(document).on("click", "#dica_promocional", function () {
    $(".modal-block").append("<div class='ui longer modal'><i class='close icon'></i><div class='header'>Dica Promocional</div><div class='ui medium image' style='display: none;' onerror=\"imgError(this)\"><img src=''></div><div class='description' style='margin: 20px;'>" + $("#dica_leve_x").html() + "</div></div>");
    openLongModal($(this).attr("data-modal-open"));
});



function CarregarMaisAvaliacoes() {
    let avaliacao_html = "";
    for (let i = 0; i < lista_avaliacao_produto.length; i++) {
        let data = new Date(parseInt(lista_avaliacao_produto[i].DateRegister.replace("/Date(", "").replace(")/", ""), 10));

        avaliacao_html += "<div class='comment'><div class='content'><a class='author'>" + lista_avaliacao_produto[i].Name + "</a><div class='metadata'><div class='rating'><div class='ui mini star rating' ";
        avaliacao_html += "data-rating=" + lista_avaliacao_produto[i].Rate + "></div></div><div class='date'></div>";
        if (lista_avaliacao_produto[i].LeavePublicEmail === true) {
            avaliacao_html += "<div class='email'>" + lista_avaliacao_produto[i].Email + "</div>";
        } else {
            avaliacao_html += "<div class='email'></div>";
        }
        avaliacao_html += "<div class='date'>" + data.toLocaleDateString() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds() + "</div>";
        avaliacao_html += "<div class='address'>" + lista_avaliacao_produto[i].AddressCity + "</div></div>";
        avaliacao_html += "<div class='text'>";
        avaliacao_html += "<h5>" + lista_avaliacao_produto[i].Title + "</h5>";
        avaliacao_html += "<p>" + lista_avaliacao_produto[i].Comment + "</p>";
        avaliacao_html += "</div";
        avaliacao_html += "</div>";
        avaliacao_html += "</div>";
        avaliacao_html += "<div class='ui divider'></div>";
    }

    $("#lista_avaliacoes").append($(avaliacao_html));
    $("#lista_avaliacoes .ui.rating").rating({ maxRating: 5, interactive: false });
    lista_avaliacao_produto = "";
    $("#btn_carregar_avaliacoes").addClass("disabled");
}



function AvaliarProduto() {
    
    var form = $('#avaliar');
    var googleRecaptcha = $("[id^=googleResponse]", form).length > 0 ? $("[id^=googleResponse]", form).val() : "";

    $.ajax({
        url: '/Product/ProductRating?googleResponse=' + googleRecaptcha,
        type: 'POST',
        data: {
            form: form.serialize(),
            productID: $("#produto-id").val()
        },
        dataType: 'json',
        success: function (response) {
            if (response.Success === true) {
                swal({
                    title: 'Avaliação Realizada com Sucesso!',
                    text: response.Message,
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then(function () {
                    $("#Comment, #Email, #Name, #cidade, #Title").val("");
                    $('#avaliar .ui.checkbox').checkbox("uncheck");
                    $('#avaliar .dropdown').dropdown("clear");
                    $("#rating_st .ui.star.rating").rating("clear rating");
                });
            }
            else {
                swal({
                    title: '',
                    text: response.Message,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
        },
        error: function (request, error) {
           
        },
        complete: function () {

            if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                if($("[id^=googleVersion_]").eq(0).val() === "2") {
                    (form.parents(".modal-login").length > 0 ? grecaptcha.reset(1) : grecaptcha.reset())
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), form);
                }
            }
        }
    });
}



export function AtualizarQuantidade() {

    isLoading("body");
    let quantidade = parseInt($("#quantidade").val());

    if (quantidade == 0) {
        quantidade = 1;
        $("#quantidade").val("1");
    }

    let preco          = parseFloat(SomenteNumeros($("#preco-unidade").val())),
        preco_promocao = SomenteNumeros($("#preco-promocao-unidade").val()),
        preco_max      = SomenteNumeros($("#parcela-maxima-unidade").val()),
        max_p          = $("#qtd-parcela-maxima-unidade").val(),
        description    = $("#pagamento-descricao").val(),
        desconto_boleto = $("#desconto_boleto").val(),
        preco_final = 0;



    $("#max-value").text(moneyPtBR(quantidade * preco_max));
    $("#max-p").text(max_p + "X de ");
    $("#description").text("(" + description+ ")");


    if (preco_promocao != null && preco_promocao != "" && isNaN(preco_promocao) === false) {
        preco_final = quantidade * preco_promocao;
        $("#preco").text(moneyPtBR(quantidade * preco_promocao));
        $("#preco").data("preco-inicial", quantidade * preco_promocao);
        $("#preco-antigo").text(moneyPtBR(quantidade * preco));
    } else {
        preco_final = quantidade * preco;
        $("#preco").text(moneyPtBR(quantidade * preco));
        $("#preco").data("preco-inicial", quantidade * preco);
        $("#preco-antigo").text("");
    }

    if (desconto_boleto !== "0,00") { 
        var valor_boleto = moneyPtBR((preco_final - (preco_final / 100) * parseFloat(desconto_boleto)));
        $("#preco_boleto").text(valor_boleto); 
    }

    var stock = $("#produto-stock").val();
    if (parseInt(stock) > quantidade) {
        if (preco_promocao != "" && preco_promocao != null && preco_promocao > 0) {
            AtualizarParcelamento(quantidade * preco_promocao);
        } else {
            AtualizarParcelamento(quantidade * preco);
        }
    }

    AtualizarCompreJunto();
    isLoading("body");
    $("#parcelamento_b2b").find(".active").removeClass("active");
    
}

function AtualizarParcelamento(preco) {
    CarregarParcelamento(false);
}



function ApplyDiscountInCart() {
    $.ajax({
        url: '/Checkout/ApplyDiscountInCart',
        type: 'GET',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {
                LoadCarrinho()
            } else {
                console.warn(response.message)
            }
        },
        error: function (response) {
            console.error(response.message)
        }
    });
}

function AdicionarProdutosCompreJuntoAjx() {

    if ($("#produto-sku").val() != "") {
        let sku_selecionado_produto_principal = ',' + $("#produto-id").val() + '-' + $("#produto-sku").val() + '-' + $("#quantidade").val();
        let listaSkus                         = $("#buy-together-skus").val();

        listaSkus = listaSkus.concat(sku_selecionado_produto_principal);

        $.ajax({
            url: '/Product/AddMultipleProductCart',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({productIDSKU: listaSkus}),
            dataType: 'json',
            success: function (response) {
                if (response.success === true) {
                    //window.location.href = "/Checkout/Index";
                    LoadCarrinho();
                    $(".carrinho").sidebar('toggle');
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
                }
            },
            error: function (request, error) {

            }
        });
    } else {
        swal({
            title: '',
            text: 'Variação do produto principal não selecionada',
            type: 'error',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
    }
}

function AdicionarProdutoAjx(productSKU, productID, quantity, oneclick) {
    
    var Cart    = [];
    var product = new Object();

    product.IdProduct = productID;
    product.IdSku     = productSKU;
    product.Quantity  = quantity;
    Cart.push(product);

    $.ajax({
        url: '/Checkout/InsertItemCart',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({CartItem: Cart}),
        dataType: 'json',
        success: function (response) {
            if (response.success === true)
            {
                if(typeof(oneclick) != undefined && oneclick === true)
                {
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
                else
                {
                    $(document).find(".loading").removeClass("loading");
                    LoadCarrinho();
                    $(".carrinho").sidebar('toggle');
                }
                //window.location.href = "/Checkout/Index";
            }
            else
            {
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


function AdicionarProdutoAjxEventList(productSKU, productID, quantity){
    $.ajax({
        url : '/EventList/InsertProductInEventListWithSku',
        type : 'POST',
        data : {
            idProduct: productID,
            idSKU    : productSKU,
            quantity : quantity
        },
        dataType:'json',
        success : function(response) {
            if(response.success === true){
                $(document).find(".loading").removeClass("loading");
                LoadCarrinhoEventList(true);
            }else {
                _alert(response.msg, "", "error");
            }
        },
        error : function(request,error)
        {
            _alert("Erro ao adicionar produto.", "", "error");
            //console.log("Erro ao adicionar produto a lista de eventos");
        }
    });
}


function ValidarSkuProdutoPrincipal() {
    var sku = $("#produto-sku").val();
    if (sku != "0") {
        var listSkus = JSON.parse($("#principal-lista-sku").val());
        for (var i = 0; i < listSkus.length; i++) {
            if (listSkus[i].IdSku === parseInt(sku)) {
                if (listSkus[i].Visible === true) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
    else {
        return 1;
    }
    return 0;
}

export function SomenteNumeros(valor) {
    if (!valor){
        valor = 0;
    }
    return parseFloat(getFloatFromCurrency(valor));
}

export function updateProductConjunctTable() {

    let valor_total = 0.0,
        valor_base  = 0.0,
        desconto = 0.0;

    $('.conjunct_product:checked').each(function () {

        let $card = $(this).closest('.card.produto'),
            preco_base,
            preco = getFloatFromCurrency($card.find('span.preco').text());

        if ($card.find('span.precoBase > i').length) {
            preco_base = getFloatFromCurrency($card.find('span.precoBase > i').text());
        } else {
            preco_base = preco;
        }

        /*console.log(`
            Buscando Informações do Produto.
            Produto: ${$card.find('h1').text()}
            ID: ${$card.data('idproduto')}
            ID SKU:  ${$card.data('idsku')}
            Preço: ${preco}
            Preço Base: ${preco_base}
        `);*/

        valor_total = parseFloat(valor_total) + parseFloat(preco);
        valor_base  = parseFloat(valor_base) + parseFloat(preco_base);
        desconto = parseFloat((parseFloat(valor_total) - parseFloat(valor_base)));

    });
    $("#preco-antigo").text(moneyPtBR(parseFloat(valor_base).toFixed(2)))
    $("#preco").text(moneyPtBR(parseFloat(valor_total).toFixed(2)))
    $("#conjunto-total").text(moneyPtBR(parseFloat(valor_base).toFixed(2)));
    $("#conjunto-desconto").text(moneyPtBR(parseFloat(desconto).toFixed(2)));
    $("#conjunto-total-final").text(moneyPtBR(parseFloat(valor_total).toFixed(2)));
    AtualizarParcelamento(valor_total)
    RefreshInfoPreco(valor_total)
}

export function getFloatFromCurrency(currency) {

    let regex  = /([+-]?[0-9|^.|^,]+)[\.|,]([0-9]+)$/igm,
        result = regex.exec(currency);

    return result ? result[1].replace(/[.,]/g, "") + "." + result[2] : String(currency).replace(/[^0-9-+]/g, "");
}

function RefreshInfoPreco(valor_total){
    var max_p =  $("#max-parc").val()
    $("#max-value").text(moneyPtBR(valor_total / max_p))
}

function calcShipping() {
    $('#simular-frete-cep').mask('00000-000');

    $('#simular-frete-submit').click(function () {
        let ZipCode = $('#simular-frete-cep').val();
        let B2b = "false";
        if ($("#b2b").val() != undefined) {
            B2b = $("#b2b").val();
        }

        if (ZipCode != "")
        {
            $('#listSimulateFreight').empty().append('<tr><td colspan="3" class="center aligned">Carregando...</td></tr>');


            let HasOpenSku = $('#has-open-sku').val();

            let LstProductsFreight = new Array();

            if ((B2b == "false" && (HasOpenSku == "false" || $('#produto-sku').val() == "0")) || (B2b == "true" && $('#produto-sku').val() == "0")) {
                let objProductFreight = {
                    IdProduct: $('#produto-id').val(),
                    IdSku: $('#produto-sku').val(),
                    Quantity: $('#quantidade').val()
                };

                LstProductsFreight.push(objProductFreight);
            } else {
                $.each($('.three.column.stackable.row.sku_b2b'), function (key, item) {
                    let IdProduct = $(item).data("produto-id");
                    let IdSku = $(item).data("sku-id");
                    let Quantity = Number.parseInt($(item).find('input[name=quantidade]').val());

                    if (Quantity > 0) {
                        let objProductFreight = {
                            IdProduct: IdProduct,
                            IdSku: IdSku,
                            Quantity: Quantity
                        };
                        LstProductsFreight.push(objProductFreight);
                    }
                });

                if (LstProductsFreight.length == 0) {
                    swal({
                        title: '',
                        text: 'Selecione ao menos uma variação para calcular o frete.',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    });
                    return false;
                }
            }

            $.ajax({
                url: '/Product/SimulateFreight',
                method: 'POST',
                data: {
                    ProductShippings: LstProductsFreight,
                    ZipCode: ZipCode,
                    B2b: B2b
                },
                success: function (response) {
                    $('#listSimulateFreight').empty();
                    if (response.success == true) {
                        $.each(response.lista, function (key, item) {

                            let valueShipping = "Grátis";
                            if (item.ValueShipping > 0) {
                                valueShipping = item.ValueShipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            }
                            let usefulDay = "";
                            if (item.ShippingMode.UsefulDay) {
                                if (parseInt(item.ShippingMode.DeliveryTime,10) < 2) {
                                    usefulDay = ' útil';
                                } else {
                                    usefulDay = ' úteis';
                                }
                            }

                            var strTr = '<tr>' +
                                '<td>' + item.ShippingMode.Name + '</td>' +
                                '<td align="center">' + valueShipping + '</td>' +
                                '<td align="center">' + ((item.ShippingMode.ScheduledDelivery) ? '(*)' : ((item.ShippingMode.DeliveryTime == null) ? '( Envio Imediato )' : item.ShippingMode.DeliveryTime + ' dia(s)' + usefulDay + '.')) + '</td>' +
                                '</tr>';
                            $('#listSimulateFreight').append(strTr);
                        });
                    } else {
                        swal({
                            title: '',
                            text: response.message,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        });
                        $('#simular-frete-cep').val('').focus();
                    }
                }
            });
        }
        else
        {
            swal({
                title: '',
                text: 'Preencha o cep para realizar a simulação do frete.',
                type: 'error',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
            $('#simular-frete-cep').val('').focus();
        }

        return false;
    });
}

function alertSendStock() {
    $(".button.avise").api({
        action: 'alert me',
        method: 'POST',
        dataType: "html",
        beforeSend: function (settings) {
            settings.data = {
                produtoID: $("#produto-id").val(),
                sku: $("#variacoesSelecionadas").val() !== "" ? $("#variacoesSelecionadas").val() : $(this).data("produto-variations") !== "" && $(this).data("produto-variations") !== undefined ? $(this).data("produto-variations") : "",
                titulo: $("#produto-nome").text() !== "" ? $("#produto-nome").text() : $(this).data("name"),
                imagem: $('#imagem-padrao').attr('src') !== undefined ? $('#imagem-padrao').attr('src') : $('#mainImageCard_' + $(this).data("id")).attr('src'),
                codigo: $("#produto-codigo").val()
            };
            return settings;
        },
        successTest: function (response) {
            return response.success || false;
        },
        onSuccess: function (response) {
            $(".modal-block").append(response);
            openModalQuickView("avise", getAllMask());
        },
        onFailure: function (response) {
            //console.log(response);
        },
        onError: function (errorMessage) {
            //console.log(errorMessage);
        }
    });
}