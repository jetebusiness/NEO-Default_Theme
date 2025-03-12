import { isLoading } from "../api_config";
import { moneyPtBR } from "../../functions/money";
import { getAllMask } from "../../ui/modules/mask";

import { _alert } from "../../functions/message";
import { openModalQuickView, openLongModal } from "../../functions/modal";
import { LoadCarrinho } from "../../functions/mini_cart_generic";
import { SomenteNumerosPositivos } from "../../functions/form-control";
import { LoadCarrinhoEventList } from "../../functions/mini_cart_generic";
import { CarregarParcelamento, CarregaParcelamentoPagSeguro, CarregaParcelamentoPagSeguroApp, CarregaParcelamentoMercadoPago } from "../../api/product/detail_b2b.js";
import { CompraRecorrenteCart, CompraRecorrenteStorage } from '../../functions/recurringPurchase';

import { VariacaoDropDown, VariacaoCor, VariacaoImagem, VariacaoRadio, AtualizarCompreJunto } from "./variations-floating";

import { generateRecaptcha } from "../../ui/modules/recaptcha";
import { buscaCepCD, changeCd } from "../../ui/modules/multiCd";

import { isGtmEnabled, getProductAndPushAddToCartEvent } from "../../api/googleTagManager/googleTagManager";
import {getDiscountStore} from "./card";

$(document).ready(function () {
    "use strict";
    //nova estrutura de variacao do produto    
    variations.init();
    personalization.init();

    window.onload = function () {
        $('.recurrentperiods').popup();

        $("#quantidade").on("change", function () {
            if ($(this).val().length > 0) {
                var valor_final = SomenteNumerosPositivos($(this).val());
                $(this).val(valor_final);
                AtualizarQuantidade();
                e.stopPropagation();
            } else {
                $(this).val(1);
                AtualizarQuantidade();
                e.stopPropagation();
            }
        })

        $(".variacao[data-idSku]").click(function () {

            if(parseInt($("#quantidade").val()) > 1)
                CarregarParcelamento(false);
        });

        $("#qtdplus-detalhes, #qtdminus-detalhes").click(function () {
            var quantidade = parseInt($("#quantidade").val());
            var tipo = $(this).hasClass("qtdminus");

            if (tipo) {
                quantidade -= 1;
            } else {
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



        $("body").delegate(".btnComprar .detalhes, .flutuante .detalhes", "click", function (e) {

            if($(personalization.config.container).length > 0) {

                var valid = personalization.validFields()

                if (valid === undefined || valid === false) {

                    e.preventDefault();
                    return;
                }
            }

            var resultado = ValidarSkuProdutoPrincipal();
            let productSKU = $("#produto-sku").val(),
                productID = $("#produto-id").val(),
                productQuantity = parseInt($("#quantidade").val()),
                totalVariations = $("#principal-total-variacoes").val(),
                onClick = $(this).hasClass("btn-comprar-oneclick"),
                signature = $(this).hasClass("btn-comprar-assinar") ? true : false;

            //PRODUTO DEVE SER DIFERENTE DE NULL
            if (productID != null && productID != "") {
                $(this).addClass("loading");
                //SE FOR, VALIDA SE EXISTE VARIAÇÔES                 

                if (parseInt(totalVariations) > 0) {
                    //SE EXISTE, VALIDA SE FOI SELECIONADA
                    if (productSKU != null && productSKU != "" && resultado > 0) {

                        AdicionarProdutoAjx(parseInt(productSKU), parseInt(productID), productQuantity, onClick, signature);
                        ApplyDiscountInCart();
                    } else {
                        _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                    }
                } else {
                    ///GRAVA PRODUTO SEM VARIACAO                    
                    AdicionarProdutoAjx(null, parseInt(productID), productQuantity, onClick, signature);
                    ApplyDiscountInCart();
                }
            } else {
                _alert("Erro ao adicionar produto", "Mensagem", "error");
            }
        });

        $(".detalhes.btn-add-event-list").click(function () {
            var resultado = ValidarSkuProdutoPrincipal();
            let productSKU = $("#produto-sku").val(),
                productID = $("#produto-id").val(),
                productQuantity = parseInt($("#quantidade").val()),
                totalVariations = $("#principal-total-variacoes").val()

            //PRODUTO DEVE SER DIFERENTE DE NULL
            if (productID != null && productID != "") {
                $(this).addClass("loading");
                //SE FOR, VALIDA SE EXISTE VARIAÇÔES
                if (parseInt(totalVariations) > 0) {
                    //SE EXISTE, VALIDA SE FOI SELECIONADA
                    if (productSKU != null && productSKU != "" && resultado > 0) {
                        AdicionarProdutoAjxEventList(parseInt(productSKU), parseInt(productID), productQuantity);
                    } else {
                        _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                    }
                } else {
                    ///GRAVA PRODUTO SEM VARIACAO
                    AdicionarProdutoAjxEventList(0, parseInt(productID), productQuantity);
                }
            } else {
                _alert("Erro ao adicionar produto", "Mensagem", "error");
            }
        });

        //COMPRE JUNTO
        $("#btn_comprejunto").click(function () {
            isLoading("body");
            AdicionarProdutosCompreJuntoAjx();
            isLoading("body");
        });

        $("#btn_carregar_avaliacoes").click(function () {
            CarregarMaisAvaliacoes();
        });

        //parcelamento PAGSEGURO
        CarregaParcelamentoPagSeguro();
        CarregaParcelamentoPagSeguroApp();
        CarregaParcelamentoMercadoPago();

        //funcao AVISE-ME
        alertSendStock()

        //calculo de frete
        calcShipping()

        if ($("#zipcode") != null && $("#zipcode").val().length > 0) {
            $('#simular-frete-cep').val($("#zipcode").val());
            if (getUrlVars()["calcShipping"] == 'true') {
                $("#simular-frete-submit").click();
                if ($("#simular-frete-cep").length > 0)
                    $('html, body').animate({ scrollTop: $("#simular-frete-cep").offset().top - 200 }, 1000);
            }
        }

        //floating-bar

        ($(".item.buy-together", "#buy-together").length === 0 ? $("#buy-together").remove() : "")

        if ($("#buy-together").length > 0) {

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

        if ($("#floating-bar").length > 0) {

            var defaults = {
                config: {
                    container: '#variations-floating'
                }
            }

            $.extend(true, variations, defaults);

            variations.init()
        }


        $(".discount-rules").on("click", function() {
            $(".modal-discount-rules").modal("show")
        })

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


    var stock = $("#produto-stock").val();
    if (parseInt(stock) < quantidade) {
        _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning")
        $("#quantidade").val(stock)
    } else {
        let preco = parseFloat(SomenteNumeros($("#preco-unidade").val())),
            preco_promocao = SomenteNumeros($("#preco-promocao-unidade").val()),
            preco_max = SomenteNumeros($("#parcela-maxima-unidade").val()),
            max_p = $("#qtd-parcela-maxima-unidade").val(),
            description = $("#pagamento-descricao").val(),
            desconto_boleto = $("#desconto_boleto").val(),
            preco_final = 0;


        $("#max-value").text(moneyPtBR(quantidade * preco_max));
        $("#max-p").text(max_p + "X de ");
        $("#description").text("(" + description + ")");

        if (preco_promocao != null && preco_promocao != "" && isNaN(preco_promocao) === false) {
            preco_final = quantidade * preco_promocao;
            $("#preco-antigo").text(moneyPtBR(quantidade * preco));
        } else {
            preco_final = quantidade * preco;
            $("#preco-antigo").text("");
        }

        $("#preco").text(moneyPtBR(preco_final));
        $("#preco").data("preco-inicial", preco_final);


        if($(".total-personalization").length > 0) {
            var personalizationValue = 0;

            $("input, select", "#personalizations").each(function () {
                if ($(this).is(":checked") || ($(this).prop('nodeName').toLowerCase() === 'select' && $(this).val() !== "")) {
                    personalizationValue += parseFloat($(this).data('price'))
                }
            });

            personalizationValue = personalizationValue * quantidade;

            $('.product-value', '.total-personalization').html(moneyPtBR(parseFloat(preco_final)))
            $('.personalization-value', '.total-personalization').html(moneyPtBR(personalizationValue))
            $('.total-value', '.total-personalization').html(moneyPtBR(personalizationValue + parseFloat(preco_final)))
        }

        let parent = document.querySelector(variations.config.htmlPrice.containerValues);
        getDiscountStore(parent, preco_final)

        if (desconto_boleto !== "0,00") {
            var valor_boleto = moneyPtBR((preco_final - (preco_final / 100) * parseFloat(desconto_boleto)));
            $("#preco_boleto").text("ou "+valor_boleto+" no boleto bancário ("+desconto_boleto+"% de desconto)");
        }

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
        let listaSkus = $("#buy-together-skus").val();

        listaSkus = listaSkus.concat(sku_selecionado_produto_principal);

        let purchaseTrackingType = $("#btn_comprejunto").data("purchasetracking-type");
        let purchaseTrackingValue = $("#btn_comprejunto").data("purchasetracking-value");

        $.ajax({
            url: '/Product/AddMultipleProductCart',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({ productIDSKU: listaSkus, purchaseTrackingType, purchaseTrackingValue }),
            dataType: 'json',
            success: function (response) {
                if (response.success === true) {
                    //window.location.href = "/checkout/index";
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

function AdicionarProdutoAjx(productSKU, productID, quantity, oneclick, signature = false) {

    var Cart = [],
        product = new Object(),
        personaliza = personalization.renderArray();

    product.IdProduct = productID;
    product.IdSku = productSKU;
    product.Quantity = quantity;
    product.isRecurrent = signature;

    if (personaliza.length > 0) {
        product.personalizations = personalization.renderArray();
        product.personalizationString = $("#json-personalizations").val()
    }

    let purchasetracking = JSON.parse(sessionStorage.getItem('purchasetracking'));

    if (purchasetracking != undefined && purchasetracking.type != undefined) {
        product.purchaseTracking = purchasetracking;
    }

    Cart.push(product);

    $.ajax({
        url: '/Checkout/InsertItemCart',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({ CartItem: Cart }),
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {

                if (isGtmEnabled()) {
                    getProductAndPushAddToCartEvent({ idProduct: product.IdProduct, idSku: product.IdSku, quantity: product.Quantity });
                }

                // Ativa ou desativa o modal de termos de aceite do Compra Recorrente
                if ($(CompraRecorrenteCart.modalConfig.id).length > 0)
                    $(CompraRecorrenteCart.modalConfig.id).attr("data-active", signature);

                // Limpa a Storage caso um produto sem recorrencia seja adicionado
                if (!signature)
                    CompraRecorrenteStorage.cleanStorage();

                if (typeof (oneclick) != undefined && oneclick === true) {
                    $.ajax({
                        method: "GET",
                        url: "/Checkout/CheckoutNext",
                        data: {},
                        success: function (data) {
                            if (data.success === true)
                                window.location.href = "/" + data.redirect
                            else
                                _alert("Mensagem", data.message, "error")
                        },
                        onFailure: function (data) {
                            //console.log("Erro ao excluir frete");
                        }
                    });
                }
                else {
                    $(document).find(".loading").removeClass("loading");
                    LoadCarrinho();
                    $(".carrinho").sidebar('toggle');
                }
                //window.location.href = "/checkout/index";

            }
            else {
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
        error: function (request, error) {
            $(document).find(".loading").removeClass("loading");
        }
    });
}

function AdicionarProdutoPurchaseTrackingAjx(productSKU, productID, quantity, oneclick, signature = false, purchasetrackingtype = "", purchasetrackingvalue = "") {

    var Cart = [],
        product = new Object(),
        personaliza = personalization.renderArray();

    product.IdProduct = productID;
    product.IdSku = productSKU;
    product.Quantity = quantity;
    product.isRecurrent = signature;

    if (personaliza.length > 0) {
        product.personalizations = personalization.renderArray();
        product.personalizationString = $("#json-personalizations").val()
    }

    let purchasetracking = JSON.parse(sessionStorage.getItem('purchasetracking'));

    if (purchasetrackingtype != "") {
        product.purchaseTracking = {
            type: purchasetrackingtype,
            value: purchasetrackingvalue
        };
    }

    Cart.push(product);

    $.ajax({
        url: '/Checkout/InsertItemCart',
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({ CartItem: Cart }),
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {

                if (isGtmEnabled()) {
                    getProductAndPushAddToCartEvent({ idProduct: product.IdProduct, idSku: product.IdSku, quantity: product.Quantity });
                }

                // Ativa ou desativa o modal de termos de aceite do Compra Recorrente
                if ($(CompraRecorrenteCart.modalConfig.id).length > 0)
                    $(CompraRecorrenteCart.modalConfig.id).attr("data-active", signature);

                // Limpa a Storage caso um produto sem recorrencia seja adicionado
                if (!signature)
                    CompraRecorrenteStorage.cleanStorage();

                if (typeof (oneclick) != undefined && oneclick === true) {
                    $.ajax({
                        method: "GET",
                        url: "/Checkout/CheckoutNext",
                        data: {},
                        success: function (data) {
                            if (data.success === true)
                                window.location.href = "/" + data.redirect
                            else
                                _alert("Mensagem", data.message, "error")
                        },
                        onFailure: function (data) {
                            //console.log("Erro ao excluir frete");
                        }
                    });
                }
                else {
                    $(document).find(".loading").removeClass("loading");
                    LoadCarrinho();
                    $(".carrinho").sidebar('toggle');
                }
                //window.location.href = "/checkout/index";

            }
            else {
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
        error: function (request, error) {
            $(document).find(".loading").removeClass("loading");
        }
    });
}

function AdicionarProdutoAjxEventList(productSKU, productID, quantity) {
    $.ajax({
        url: '/EventList/InsertProductInEventListWithSku',
        type: 'POST',
        data: {
            idProduct: productID,
            idSKU: productSKU,
            quantity: quantity
        },
        dataType: 'json',
        success: function (response) {
            if (response.success === true) {
                LoadCarrinhoEventList(false);
                $(document).find(".loading").removeClass("loading");
            } else {
                _alert(response.msg, "", "error");
                $(document).find(".loading").removeClass("loading");
            }
        },
        error: function (request, error) {
            _alert("Erro ao adicionar produto.", "", "error");
            $(document).find(".loading").removeClass("loading");
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
    if (!valor) {
        valor = 0;
    }
    return parseFloat(getFloatFromCurrency(valor));
}

export function updateProductConjunctTable() {

    let valor_total = 0.0,
        valor_base = 0.0,
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
        valor_base = parseFloat(valor_base) + parseFloat(preco_base);
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

    let regex = /([+-]?[0-9|^.|^,]+)[\.|,]([0-9]+)$/igm,
        result = regex.exec(currency);

    return result ? result[1].replace(/[.,]/g, "") + "." + result[2] : String(currency).replace(/[^0-9-+]/g, "");
}

function RefreshInfoPreco(valor_total) {
    var max_p = $("#max-parc").val()
    $("#max-value").text(moneyPtBR(valor_total / max_p))
}

function shippingCalculateDetail(status) {
    $(".qtdminus").prop("disabled", status);
    $(".qtdplus").prop("disabled", status);
    $("#quantidade").prop("disabled", status);
}

function calcShipping() {
    $('#simular-frete-cep').mask('00000-000');

    $('#frete-receber-detalhes').click(function () {
        $("#hdnRetirarDetalhes").val("false");
        $('#simular-frete-submit').trigger('click');
    });
    $('#frete-retirar-detalhes').click(function () {
        $("#hdnRetirarDetalhes").val("true");
        $('#simular-frete-submit').trigger('click');
    });

    $('#simular-frete-submit').click(function () {
        $(".div-frete-retira-detalhes").hide();
        $(".ui.dimmer.modals.page.transition.hidden").html("");
        shippingCalculateDetail(true)
        let ZipCode = $('#simular-frete-cep').val();
        let B2b = "false";
        if ($("#b2b").val() != undefined) {
            B2b = $("#b2b").val();
        }
        let CompraRecorrente = "false";
        if ($(this).data("purchaserecurring") !== undefined && $(this).data("purchaserecurring") == true) {
            CompraRecorrente = "true";
        }
        let RetirarLoja = "false";
        if ($("#hdnRetirarDetalhes").val() != undefined) {
            RetirarLoja = $("#hdnRetirarDetalhes").val();
        }

        if (ZipCode != "") {
            $('#listSimulateFreight').empty().append('<tr><td colspan="3" class="center aligned">Carregando...</td></tr>');

            if (RetirarLoja == "true") {
                $("#frete-receber-detalhes").removeClass('primary');
                $("#frete-retirar-detalhes").removeClass('basic');
                $("#frete-receber-detalhes").addClass('basic');
                $("#frete-retirar-detalhes").addClass('primary');
            } else {
                $("#frete-receber-detalhes").removeClass('basic');
                $("#frete-retirar-detalhes").removeClass('primary');
                $("#frete-receber-detalhes").addClass('primary');
                $("#frete-retirar-detalhes").addClass('basic');
            }

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
                    B2b: B2b,
                    CompraRecorrente: CompraRecorrente,
                    RetirarLoja: RetirarLoja
                },
                success: function (response) {
                    $('#listSimulateFreight, #listHeadSimulateFreight').empty();
                    if (response.success == true) {
                        var strHead = '';
                        if (RetirarLoja == 'true') {
                            strHead = '<tr><th>Pontos de retirada</th><th>Prazo</th></tr>';
                        } else {
                            strHead = '<tr><th>Entrega</th><th>Frete</th><th>Prazo</th></tr>';
                        }
                        $('#listSimulateFreight').append(strHead);

                        $.each(response.lista, function (key, item) {
                            var strTr = '';
                            if (RetirarLoja == 'true') {
                                let usefulDay = ''

                                if (parseInt(item.ShippingMode.DeliveryTime) > 0) {
                                    if (parseInt(item.ShippingMode.DeliveryTime, 10) < 2) {
                                        usefulDay = item.ShippingMode.DeliveryTime + ' hora';
                                    } else {
                                        usefulDay = item.ShippingMode.DeliveryTime + ' horas';
                                    }
                                } else {
                                    usefulDay = 'Imediato';
                                }
                                var textDescriptionFirstPickUpAddress = '';
                                var textDescriptionSecondPickUpAddress = '';
                                if (item.ShippingMode.PickUpAddress !== null) {
                                    if (item.ShippingMode.PickUpAddress.StreetAddress !== "") {
                                        textDescriptionFirstPickUpAddress = '<br><small>';
                                        textDescriptionFirstPickUpAddress += item.ShippingMode.PickUpAddress.StreetAddress;
                                        textDescriptionFirstPickUpAddress += (item.ShippingMode.PickUpAddress.StreetAddress !== "" && item.ShippingMode.PickUpAddress.Number !== "") ? ', ' + item.ShippingMode.PickUpAddress.Number : '';
                                        textDescriptionFirstPickUpAddress += '</small>';
                                    }
                                    if (item.ShippingMode.PickUpAddress.Neighbourhood !== "" || item.ShippingMode.PickUpAddress.City !== "") {
                                        textDescriptionSecondPickUpAddress = '<br><small>';
                                        textDescriptionSecondPickUpAddress += item.ShippingMode.PickUpAddress.Neighbourhood;
                                        textDescriptionSecondPickUpAddress += (item.ShippingMode.PickUpAddress.Neighbourhood !== "" && item.ShippingMode.PickUpAddress.City !== "") ? ', ' + item.ShippingMode.PickUpAddress.City : (item.ShippingMode.PickUpAddress.City !== "") ? item.ShippingMode.PickUpAddress.City + (item.ShippingMode.PickUpAddress.State !== "") ? ' - ' + item.ShippingMode.PickUpAddress.State : '' : '';
                                        textDescriptionSecondPickUpAddress += ((item.ShippingMode.PickUpAddress.Neighbourhood !== "" || item.ShippingMode.PickUpAddress.City !== "") && item.ShippingMode.PickUpAddress.ZipCode !== "") ? ' - ' + item.ShippingMode.PickUpAddress.ZipCode : '';
                                        textDescriptionSecondPickUpAddress += '</small>';
                                    }
                                }

                                var textDescription = "";
                                if (item.ShippingMode.Description !== null)
                                    textDescription = '<a href="#" class="shippingDescription modal-shipping-button" data-id="' + item.ShippingMode.IdShippingMode + '">' +
                                        '<h5> Ver mais detalhes</small></h5> ' +
                                        '<div class="ui modal modal-shipping-description-' + item.ShippingMode.IdShippingMode + '">' +
                                            '<i class="icon close"></i>' +
                                            '<div class="content">' +
                                                '<div class="ui header">Mais detalhes</div>' +
                                                '<div class="ui divider"></div>' +
                                                item.ShippingMode.Description +
                                            '</div>' +
                                        '</div>';

                                strTr = '<tr>' +
                                    '<td><i class="icon map marker"></i><strong>' + item.ShippingMode.Name + '</strong>' +
                                    textDescriptionFirstPickUpAddress +
                                    textDescriptionSecondPickUpAddress +
                                    textDescription +
                                    '</td> ' +
                                    '<td align="center">' + usefulDay + '<p class="shippingDescription">Grátis</p></td>' +
                                    '</tr>';
                            } else {
                                let valueShipping = "Grátis";
                                if (item.ValueShipping > 0) {
                                    valueShipping = item.ValueShipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                }
                                let usefulDay = "";
                                if (item.ShippingMode.UsefulDay) {
                                    if (parseInt(item.ShippingMode.DeliveryTime, 10) < 2) {
                                        usefulDay = ' útil';
                                    } else {
                                        usefulDay = ' úteis';
                                    }
                                }
                                let deliveryEstimateDate = "Previsão: ";
                                if (item.ShippingMode.DeliveryEstimateDate !== null) {
                                    deliveryEstimateDate += new Date(item.ShippingMode.DeliveryEstimateDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) + " - ";
                                }
                                var textDescription = "";
                                if (item.ShippingMode.Description !== null)
                                    textDescription = '<small class="shippingDescription">' + item.ShippingMode.Description + '</small>';

                                strTr = '<tr>' +
                                    '<td>' + item.ShippingMode.Name + textDescription + '</td> ' +
                                    '<td align="center">' + valueShipping + '</td>' +
                                    '<td align="center">' + ((item.ShippingMode.ScheduledDelivery) ? '(*)' : ((item.ShippingMode.DeliveryTime == null) ? '( Envio Imediato )' : deliveryEstimateDate + item.ShippingMode.DeliveryTime + (item.ShippingMode.DeliveryTime > 1 ? ' dias' : ' dia') + usefulDay + '.')) + '</td>' +
                                    '</tr>';
                            }

                            $('#listSimulateFreight').append(strTr);
                            $(".div-frete-retira-detalhes").show();
                        });

                        $(".modal-shipping-button").on("click", function (e) {
                            $(".modal-shipping-description-" + e.currentTarget.attributes["data-id"].value).modal("show");
                        })

                        //Checa estoque do produto com CD selecionado, se maior que quantidade digitada, altera valor de input
                        if (response.idMultiCD > 0 && response.productStockCD > 0 && LstProductsFreight[0].Quantity > response.productStockCD) {
                            $("#quantidade").val(response.productStockCD);
                            AtualizarQuantidade();

                            swal({
                                title: '',
                                text: 'Quantidade atualizada para sua região',
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });
                        }

                    } else {
                        if (RetirarLoja == 'false') {
                            swal({
                                title: '',
                                text: 'Não existem opções de entrega para o seu endereço',
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });
                            $(".div-frete-retira-detalhes").show();
                        } else if (RetirarLoja == 'true') {
                            swal({
                                title: '',
                                text: 'Não existem opções de retirada para o seu endereço',
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });
                            $(".div-frete-retira-detalhes").show();
                        } else {
                            swal({
                                title: response.title,
                                text: response.message,
                                type: response.type,
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });
                            $('#simular-frete-cep').val('').focus();
                        }
                    }
                    shippingCalculateDetail(false)
                }
            });
        }
        else {
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
            shippingCalculateDetail(false)
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

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}