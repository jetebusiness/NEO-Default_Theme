import {isLoading} from "../api_config";
import {moneyPtBR} from "../../functions/money";
import {ZoomReset} from '../../functions/zoom';
import {lazyLoad} from '../../functions/lazy_load';
import {_alert, _confirm} from "../../functions/message";
import {openModalQuickView, openLongModal} from "../../functions/modal";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {SomenteNumerosPositivos} from "../../functions/form-control";
import {LoadCarrinhoEventList} from "../../functions/mini_cart_generic";
import {CarregarParcelamento, CarregaParcelamentoPagSeguro} from "../../api/product/detail_b2b.js";
import {getAllMask} from "../../ui/modules/mask";

$(document).ready(function () {
    "use strict";
    VariacaoCor();

    /*if($('#preco').length > 0) {
        $('#preco').on('DOMSubtreeModified', function(){
            CarregarParcelamento(false);
            CarregaParcelamentoPagSeguro();
        });
    }*/
    /*if($('#preco').length > 0) {
        $('#preco').on('DOMSubtreeModified', function(){
            CarregaParcelamentoPagSeguro();
        });
    }*/

    CarregaParcelamentoPagSeguro();

    $(document).on("keyup", "#quantidade", function (e) {
        var valor_final = SomenteNumerosPositivos($(this).val());
        $(this).val(valor_final);
        AtualizarQuantidade();
        e.stopPropagation();
    });


    $(".button.avise").api({
        action: 'alert me',
        method: 'POST',
        dataType: "html",
        beforeSend: function (settings) {
            settings.data = {
                produtoID: $("#produto-id").val(),
                sku: $("#variacoesSelecionadas").val(),
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
            openModalQuickView($(this).attr("data-modal-open"), callback => {
                getAllMask();
        });
        },
        onFailure: function (response) {
            //console.log(response);
        },
        onError: function (errorMessage) {
            //console.log(errorMessage);
        }
    });

    VariacaoRadio();


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
        var googleRecaptchaStatus = $("#avaliar #gCaptcha").length > 0 ? true : false
        if(googleRecaptchaStatus){
            if(grecaptcha.getResponse() != ""){
                $("#googleResponse").val(grecaptcha.getResponse())
                AvaliarProduto()
            }else{
                grecaptcha.reset()
            }
        }
        else
            AvaliarProduto()
    });


    $(".ui.star.rating").click(function () {
        var starsSelected = $(".ui.rating .icon.active").length;
        $("#Rate").val(starsSelected);
    });


    //PRODUTO PRINCIPAL
    VariacaoDropDown();
    VariacaoImagem();
    /////

    $(".detalhes.btn-comprar").click(function () {
        var resultado       = ValidarSkuProdutoPrincipal();
        let productSKU      = $("#produto-sku").val(),
            productID       = $("#produto-id").val(),
            productQuantity = parseInt($("#quantidade").val()),
            totalVariations = $("#principal-total-variacoes").val()

        //PRODUTO DEVE SER DIFERENTE DE NULL
        if (productID != null && productID != "") {
            $(this).addClass("loading");
            //SE FOR, VALIDA SE EXISTE VARIAÇÔES
            if (parseInt(totalVariations) > 0) {
                //SE EXISTE, VALIDA SE FOI SELECIONADA
                if (productSKU != null && productSKU != "" && resultado > 0) {
                    AdicionarProdutoAjx(parseInt(productSKU), parseInt(productID), productQuantity);
                    ApplyDiscountInCart();
                }else {
                    _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                }
            } else {
                ///GRAVA PRODUTO SEM VARIACAO
                AdicionarProdutoAjx(null, parseInt(productID), productQuantity);
                ApplyDiscountInCart();
            }
        }else {
            _alert("Erro ao adicionar produto", "Mensagem", "error");
        }
    });

    $(".detalhes.btn-comprar-oneclick").click(function () {
        var resultado       = ValidarSkuProdutoPrincipal();
        let productSKU      = $("#produto-sku").val(),
            productID       = $("#produto-id").val(),
            productQuantity = parseInt($("#quantidade").val()),
            totalVariations = $("#principal-total-variacoes").val()

        //PRODUTO DEVE SER DIFERENTE DE NULL
        if (productID != null && productID != "") {
            $(this).addClass("loading");
            //SE FOR, VALIDA SE EXISTE VARIAÇÔES
            if (parseInt(totalVariations) > 0) {
                //SE EXISTE, VALIDA SE FOI SELECIONADA
                if (productSKU != null && productSKU != "" && resultado > 0) {
                    AdicionarProdutoAjx(parseInt(productSKU), parseInt(productID), productQuantity, true);
                    ApplyDiscountInCart();
                }else {
                    _alert("Grade indisponível, escolha outra combinação!", "Mensagem", "error");
                }
            } else {
                ///GRAVA PRODUTO SEM VARIACAO
                AdicionarProdutoAjx(null, parseInt(productID), productQuantity, true);
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


    $(".buy-together .variacao.cor").click(function (e) {
        var produtoID = $(this).closest("#buy-together").attr('data-id');
        ValidaVariacaoSelecionada($(this).val(), +produtoID + '-buy-together');
        buscarSKU(produtoID + '-buy-together', produtoID);
    });


    $(".buy-together .variacao-radio").click(function (e) {
        var produtoID = $(this).closest("#buy-together").attr('data-id');
        ValidaVariacaoSelecionada($(this).val(), +produtoID + '-buy-together');
        buscarSKU(produtoID + '-buy-together', produtoID);
    });

    $(".buy-together .variacao-imagem").click(function (e) {
        var produtoID = $(this).closest("#buy-together").attr('data-id');
        ValidaVariacaoSelecionada($(this).val(), +produtoID + '-buy-together');
        buscarSKU(produtoID + '-buy-together', produtoID);
    });


    $('.buy-together .dropdown').dropdown({
        onChange: function (value, text, selectedItem) {
            var produtoID = $(this).closest("#buy-together").attr('data-id');
            ValidaVariacaoSelecionada(value, +produtoID + '-buy-together');
            buscarSKU(produtoID + '-buy-together', produtoID);
        }
    });


    $("button[id^='adicionar-compre-junto']").click(function () {
        var variacoes               = $(this).attr('data-variacoes');
        var jaAdicionado            = $(this).hasClass('adicionado');
        var id_product              = $(this).attr('data-id');
        var sku_selecionado         = $('#' + id_product + '-buy-together-sku').val();
        var produto_sku_selecionado = id_product;
        var skusJaSelecionados      = $('#buy-together-skus').val();
        var ArrskusJaSelecionados   = skusJaSelecionados.split(',');
        var preco_corrente          = $("#" + id_product + "-buy-together-preco").val().replace(",", ".");
        var preco_promocao_corrente = $("#" + id_product + "-buy-together-preco-promocao").val().replace(",", ".");


        if (parseInt(variacoes) == 0) {
            sku_selecionado = 0;
        }

        if (!jaAdicionado && sku_selecionado !== "") {
            $(this).addClass('adicionado');
            if (skusJaSelecionados == "") {
                $('#buy-together-skus').val(id_product + '-' + sku_selecionado + '-' + 1);
                AtualizarCarrinhoCompreJunto(preco_corrente, preco_promocao_corrente, '+');
            } else if (skusJaSelecionados.indexOf(produto_sku_selecionado) != -1) {
                for (var i = 0; i < ArrskusJaSelecionados.length; i++) {

                    if (ArrskusJaSelecionados[i].indexOf(produto_sku_selecionado) >= 0) {
                        ArrskusJaSelecionados[i] = id_product + '-' + sku_selecionado + '-' + 1;
                    }
                }

                $('#buy-together-skus').val(ArrskusJaSelecionados.join());
                AtualizarCarrinhoCompreJunto(preco_corrente, preco_promocao_corrente, '+');
            } else {
                $('#buy-together-skus').val(skusJaSelecionados + ',' + id_product + '-' + sku_selecionado + '-' + 1);
                AtualizarCarrinhoCompreJunto(preco_corrente, preco_promocao_corrente, '+');
            }
        } else if (sku_selecionado !== "") {
            $(this).removeClass('adicionado');
            if (skusJaSelecionados.indexOf(produto_sku_selecionado) != -1) {
                for (var i = 0; i < ArrskusJaSelecionados.length; i++) {

                    if (ArrskusJaSelecionados[i].indexOf(produto_sku_selecionado) >= 0) {
                        ArrskusJaSelecionados.splice(i, 1);
                    }
                }
                $('#buy-together-skus').val(ArrskusJaSelecionados.join());
                AtualizarCarrinhoCompreJunto(preco_corrente, preco_promocao_corrente, '-');
            }
        } else {
            $(this).removeClass('active');
            $(this).children().removeClass('checkmark');
            $(this).children().addClass('plus');


            swal({
                title: '',
                text: 'Variação Obrigatória',
                type: 'error',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    });


    $("#btn_carregar_avaliacoes").click(function () {
        CarregarMaisAvaliacoes();
    });
});

$(document).on("click", "#dica_promocional", function () {
    $(".modal-block").append("<div class='ui longer modal'><i class='close icon'></i><div class='header'>Dica Promocional</div><div class='ui medium image' style='display: none;' onerror=\"imgError(this)\"><img src=''></div><div class='description' style='margin: 20px;'>" + $("#dica_leve_x").html() + "</div></div>");
    openLongModal($(this).attr("data-modal-open"));
});

//FUNÇÔES
function VariacaoDropDown() {
    $('.product-grid .field.dropdown').dropdown({
        onChange: function (value, text, selectedItem) {
            var order        = $('.product-grid .variacao-drop[value=' + value + ']').data("order");
            var idReferencia = $('.product-grid .variacao-drop[value=' + value + ']').data("id-reference");
            ValidaVariacaoSelecionada(value, 'principal');
            BuscarVariacaoCor(value, order, idReferencia);
            isLoading("body");
            CarregarVariacoes('principal', value, order, idReferencia);
            buscarSKU('principal');
            //$(this).dropdown('set selected', value);
        }
    });
}

function VariacaoRadio() {
    $(".product-grid .variacao-radio").off("click");
    $(".product-grid .variacao-radio").on("click", function (e) {

        var valor_selecionado      = $(this).val();
        var referencia_selecionada = $(this).data("id-reference");
        var order                  = $(this).data('order');
        var idReferencia           = $(this).data('id-reference');
        ValidaVariacaoSelecionada($(this).val(), 'principal');
        BuscarVariacaoCor(valor_selecionado, order, idReferencia);
        isLoading("body");
        CarregarVariacoes('principal', valor_selecionado, order, idReferencia);

        //DESELECIONA
        $('.product-grid .variacao-radio[data-id-reference=' + referencia_selecionada + ']').removeClass('selecionado');
        $('.product-grid .variacao-radio[data-id-reference=' + referencia_selecionada + ']').addClass('basic');
        $('.product-grid .variacao-radio[data-id-reference=' + referencia_selecionada + ']').next().removeClass('checked');

        //SELECIONA
        $('.product-grid .variacao-radio[value=' + valor_selecionado + ']').removeClass('basic');
        $('.product-grid .variacao-radio[value=' + valor_selecionado + ']').addClass('selecionado');
        $('.product-grid .variacao-radio[value=' + valor_selecionado + ']').next().addClass('checked');

        buscarSKU('principal');

        e.stopPropagation();
    });
}

function VariacaoImagem() {
    $(".product-grid .variacao-imagem").off("click");
    $(".product-grid .variacao-imagem").on("click", function (e) {
        var valor_selecionado = $(this).data('value');
        var order             = $(this).data('order');
        var idReferencia      = $(this).data('id-reference');
        ValidaVariacaoSelecionada(valor_selecionado, 'principal');
        BuscarVariacaoCor(valor_selecionado, order, idReferencia);
        // $.when(CarregarVariacoes('principal', valor_selecionado, order, idReferencia)).done(function() {
        //   isLoading("body");
        // });
        isLoading("body");
        CarregarVariacoes('principal', valor_selecionado, order, idReferencia);

        buscarSKU('principal');
        $(".product-grid").find(".img-selecionado").removeClass("img-selecionado");
        $(this).parents(".variacao.image").addClass("img-selecionado");
        e.stopPropagation();
    });
}

function VariacaoCor() {
    $(".product-grid .variacao.cor").on("click", function (e) {
        isLoading("body");
        var valor_selecionado = $(this).val();
        ValidaVariacaoSelecionada(valor_selecionado, 'principal');
        var order        = $(this).data('order');
        var idReferencia = $(this).data('id-reference');
        BuscarVariacaoCor(valor_selecionado, order, idReferencia);
        CarregarVariacoes('principal', valor_selecionado, order, idReferencia);
        buscarSKU('principal');
    });
}

function BuscarVariacaoCor(valor_selecionado, order, idReferencia) {
    $.ajax({
        url: '/Product/SlideCor/',
        type: 'POST',
        data: {
            json: $("#lista-imagens-slide").val(),
            variacao: $("#principal-referencias-selecionadas").val()
        },
        dataType: 'html',
        success: function (response) {
            $("#exibePartial").html(response);
            lazyLoad();

            if($("#buy-together .image.medium").length > 0){
                $("#buy-together .image.medium")[0].children[0].src = $("#imagem-padrao").attr("data-src")
            }
            
            ZoomReset();            
            isLoading("body");
        },
        error: function (request, error) {
            isLoading("body");
            //console.log('Erro ao buscar cores');
        }
    });
}

function AtualizarDicaCompreJunto(_productID, _skuID) {
    $.ajax({
        url: '/Product/BuyingTips/',
        type: 'GET',
        data: {
            productID: _productID,
            skuID: _skuID
        },
        dataType: 'html',
        success: function (response) {
            $("#dica_compra_partial").html(response)
        },
        error: function (request, error) {
            //console.log('Erro ao buscar dica promocional')
        }
    });
}

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

    $("#lista_avaliacoes").append($(avaliacao_html)).fadeIn('slow');
    $(".ui.star.rating").rating("disable");
    lista_avaliacao_produto = "";
    $("#btn_carregar_avaliacoes").addClass("disabled");
}

function ValidaVariacaoSelecionada(selecionada, seletor) {
    let arrayVariacoesDropDown = $("#dropDownGridProduct .menu .active").attr("data-value");
    let referenciaSelecionada        = selecionada.split('-')[0] + '-';
    let referenciasJaSelecionadas    = $("#" + seletor + "-referencias-selecionadas").val();
    let ArrReferenciasJaSelecionadas = referenciasJaSelecionadas.split(',');

    if (typeof arrayVariacoesDropDown != 'undefined') {
        ArrReferenciasJaSelecionadas.push(arrayVariacoesDropDown);
    }
    //SE REFERENCIA JÁ FOI SELECIONADA, EXCLUI E ADICIONA DE NOVO
    if (referenciasJaSelecionadas == "") {
        $("#" + seletor + "-referencias-selecionadas").val(selecionada);
    } else if (referenciasJaSelecionadas.indexOf(referenciaSelecionada) != -1) {

        for (var i = 0; i < ArrReferenciasJaSelecionadas.length; i++) {

            if (ArrReferenciasJaSelecionadas[i].indexOf(referenciaSelecionada) >= 0) {
                ArrReferenciasJaSelecionadas[i] = selecionada;
            }
        }
        $("#" + seletor + "-referencias-selecionadas").val(ArrReferenciasJaSelecionadas.join());
    } else {
        $("#" + seletor + "-referencias-selecionadas").val(referenciasJaSelecionadas + ',' + selecionada)
    }
}

function AvaliarProduto() {
    var form = $('#avaliar');
    var googleRecaptcha = $("#avaliar #gCaptcha").length > 0 ?  $("#avaliar #gCaptcha").val() : ""
    var googleRecaptchaStatus = $("#avaliar #gCaptcha").length > 0 ? true : false

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
                    $("#Comment").val("");
                    $("#Email").val("");
                    $("#Name").val("");
                    $("#cidade").val("");
                    $("#Title").val("");
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
                }).then(function () {
                    if(googleRecaptchaStatus)
                        grecaptcha.reset()
                });
            }
        },
        error: function (request, error) {
            if(googleRecaptchaStatus)
                grecaptcha.reset()
        }
    });
}

function buscarSKU(seletor, produtoID) {

    var referenciasJaSelecionadas    = $("#" + seletor + "-referencias-selecionadas").val();
    var ArrReferenciasJaSelecionadas = referenciasJaSelecionadas.split(',');
    var totalVariacoes               = $("#" + seletor + "-total-variacoes").val();
    var jsonSKU                      = $("#" + seletor + "-lista-sku").val();
    var parcelaMaximaUnidade         = $("#parcela-maxima-unidade").val();
    parcelaMaximaUnidade             = parcelaMaximaUnidade.replace("/\./","");
    parcelaMaximaUnidade             = parcelaMaximaUnidade.replace(",",".");

    var qtdParcelaMaximaUnidade      = $("#qtd-parcela-maxima-unidade").val();
    var pagamentoDescricao           = $("#pagamento-descricao").val();
    
    console.log(ArrReferenciasJaSelecionadas)

    $.ajax({
        url: '/Product/GetSku/',
        type: 'POST',
        data: {
            jsonSKU                 : jsonSKU,
            referencias             : referenciasJaSelecionadas,
            parcelaMaximaUnidade    : parcelaMaximaUnidade,
            qtdParcelaMaximaUnidade : new Number(qtdParcelaMaximaUnidade),
            pagamentoDescricao      : pagamentoDescricao
        },
        dataType: 'json',
        success: function (data) {
            console.log(data)
            if (typeof produtoID != 'undefined') {
                if (data.Visible === true && data.Stock > 0) {
                    AtualizarGradeCompreJunto(data, produtoID, referenciasJaSelecionadas);
                } else {
                    swal({
                        title: '',
                        text: 'Variação inválida ou produto sem estoque!',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        $("adicionar-compre-junto-" + produtoID).removeClass('adicionado');
                        $("adicionar-compre-junto-" + produtoID).removeClass('active');
                        $("#" + produtoID + "-buy-together-sku").val("");
                    });
                }

            } else {
                AtualizarGrade(data);
            }

            AtualizarDicaCompreJunto($("#produto-id").val(), data.IdSku);
            CarregarParcelamento(false);
        },
        error: function (request, error) {
            //console.log("erro ao buscar sku");
        }
    });
}

function AtualizarGradeCompreJunto(jsonSKU, productID, referencias) {
    var id = productID;

    $.ajax({
        url: '/Product/GetProductImages?id=' + productID + '&referencias=' + referencias,
        type: 'GET',
        success: function (result)
        {
            var listProducts = document.getElementById("buy-together").getElementsByClassName("item buy-together");
            for (var i = 0; i < listProducts.length; i++)
            {
                if(listProducts[i].dataset.id == id)
                {
                    document.getElementById("buy-together").getElementsByClassName("ui image small")[i].children[0].children[0].src = result.lista[0].ImageDefault;
                }
            }
        }
    });

    var existeCompreJunto = parseInt($('#buy-together .ui.container').length);
    if (existeCompreJunto > 0) {
        let pricePromotion = jsonSKU.PricePromotion,
            price          = jsonSKU.Price;

        if (pricePromotion == "") {
            $("#" + productID + "-price-product-buy-together").text(moneyPtBR(price));
        } else {
            $("#" + productID + "-price-product-buy-together").text(moneyPtBR(pricePromotion));
        }

        $("#" + productID + "-buy-together-sku").val(jsonSKU.IdSku);
        $("#" + productID + "-buy-together-preco").val(price);
        $("#" + productID + "-buy-together-preco-promocao").val(pricePromotion);
    }
}

function AtualizarGrade(jsonSKU) {

    let
        estoque        = parseInt(jsonSKU.Stock),
        html_price     = "",
        price          = jsonSKU.Price,
        max_p          = jsonSKU.InstallmentMax.MaxNumber,
        max_v          = moneyPtBR(jsonSKU.InstallmentMax.Value),
        description    = jsonSKU.InstallmentMax.Description,
        pricePromotion = moneyPtBR(jsonSKU.PricePromotion) || "",
        valorDesconto  = $("#desconto_boleto").val(),
        descontoBoleto = "";

    if (parseFloat(valorDesconto.replace(',','.')) > 0) {
        if(jsonSKU.PricePromotion <= 0){
            descontoBoleto = `
            <br />
            <span>ou</span>
            <span>
                <span id="preco_boleto">${moneyPtBR(price - ((price * parseFloat(valorDesconto.replace(',', '.'))) / 100))}</span>
                no boleto bancário (${valorDesconto}% de desconto)
            </span>
            `
        }
        else{
            descontoBoleto = `
            <br />
            <span>ou</span>
            <span>
                <span id="preco_boleto">${moneyPtBR(jsonSKU.PricePromotion - ((jsonSKU.PricePromotion * parseFloat(valorDesconto.replace(',', '.'))) / 100))}</span>
                no boleto bancário (${valorDesconto}% de desconto)
            </span>
            `
        }
    }
    if (jsonSKU.PricePromotion != "" && jsonSKU.PricePromotion != "0") {
        html_price = `<span class="precoAntigo">
                        <span>de: </span>
                        <span id="preco-antigo">${price}</span>
                        <span> por</span>
                      </span>
                    <span itemprop="price" class="preco" id="preco" data-preco-inicial ="${jsonSKU.PricePromotion}">${pricePromotion}</span>
                    <span class="infoPreco">
                        <span>em</span>
                        <span id="max-p">${max_p}<span>X de </span></span>
                        <span id="max-value">${max_v}</span>
                        <span id="description">(${description})</span>
                        ${descontoBoleto}
                    </span>`;
    } else {
        html_price = `<span itemprop="price" class="preco" id="preco" data-preco-inicial ="${jsonSKU.Price}">${price}</span>
                                                    <span class="infoPreco">
                                                        <span>em</span>
                                                        <span id="max-p">
                                                            ${max_p}
                                                            <span>X de </span>
                                                        </span>
                                                        <span id="max-value">${max_v}</span>
                                                        <span id="description">()${description})</span>
                                                        ${descontoBoleto}
                                                    </span>`;
    }

    if (estoque == 0) {
        //$("#pagamento-calculado").addClass("detalhes hideme");
        $("#avise_me").removeClass("detalhes hideme");
        $("#btn_comprejunto").addClass("disabled");
        $(".btn-comprar div").html("PRODUTO ESGOTADO");
        $(".btn-comprar").addClass("disabled");
        $(".btn-comprar-oneclick").addClass("disabled");
        $(".btn-add-event-list").addClass("disabled");
        $("#calculo-frete").addClass("detalhes hideme");
        $("#calculo-parcelamento").addClass("detalhes hideme");
    } else {
        $("#btn_comprejunto").removeClass("disabled");
        //$("#pagamento-calculado").removeClass("detalhes hideme");
        $("#avise_me").addClass("detalhes hideme");
        $(".btn-comprar div").html("ADICIONAR AO CARRINHO");
        $(".btn-comprar").removeClass("disabled");
        $(".btn-comprar-oneclick").removeClass("disabled");
        $("#calculo-frete").removeClass("detalhes hideme");
        $("#calculo-parcelamento").removeClass("detalhes hideme");
    }


    $("#produto-stock").val(jsonSKU.Stock);
    $("#variacao-preco").html(html_price);
    $("#preco-unidade").val(price);
    $("#preco-promocao-unidade").val(pricePromotion);
    $("#parcela-maxima-unidade").val(max_v);
    $("#qtd-parcela-maxima-unidade").val(max_p);
    $("#pagamento-descricao").val(description);

    let referenciasvariacoes = $("#principal-referencias-selecionadas").val().split(",");
    let variacoesSelecionadas = "";
    for (var i = 0; i < referenciasvariacoes.length; i++) {
        variacoesSelecionadas += variacoesSelecionadas !== "" ? "," + referenciasvariacoes[i].split("-")[1] : referenciasvariacoes[i].split("-")[1];
    }

    $("#variacoesSelecionadas").val(variacoesSelecionadas);
    $("#produto-sku").val(jsonSKU.IdSku);

    AtualizarQuantidade();
    $("#parcelamento_b2b").find(".active").removeClass("active");
}

function AtualizarQuantidade() {

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

    if(desconto_boleto > 0){
        var valor_boleto = moneyPtBR((preco_final - (preco_final / 100) * desconto_boleto));
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

function AtualizarCompreJunto() {
    var existeCompreJunto = parseInt($('#buy-together .ui.container').length);
    if (existeCompreJunto > 0) {
        let preco_unidade                        = SomenteNumeros($("#preco-unidade").val()),
            preco_promocao                       = SomenteNumeros($("#preco-promocao-unidade").val()),
            quantidade                           = parseInt($("#quantidade").val()),
            skus_selecionados                    = $("#buy-together-skus").val(),
            Arrskus_selecionados                 = skus_selecionados.split(','),
            total_produtos_ja_selecionados       = 0,
            desconto_produtos_ja_selecionados    = 0,
            total_final_produtos_ja_selecionados = 0;

        if (quantidade == 0) {
            quantidade = 1;
            $("#quantidade").val("1");
        }

        if (skus_selecionados != "") {
            for (var i = 0; i < Arrskus_selecionados.length; i++) {

                let product_id     = Arrskus_selecionados[i].split('-')[0];
                let preco_promocao = $("#" + product_id + "-buy-together-preco-promocao").val();
                let preco          = $("#" + product_id + "-buy-together-preco").val();

                total_produtos_ja_selecionados = parseFloat(total_produtos_ja_selecionados) + parseFloat(preco);
                if (preco_promocao != "") {
                    desconto_produtos_ja_selecionados    = parseFloat(desconto_produtos_ja_selecionados) + (parseFloat(preco) - parseFloat(preco_promocao));
                    total_final_produtos_ja_selecionados = parseFloat(total_final_produtos_ja_selecionados) + parseFloat(preco_promocao);
                } else {
                    desconto_produtos_ja_selecionados    = parseFloat(desconto_produtos_ja_selecionados) + (parseFloat(preco));
                    total_final_produtos_ja_selecionados = parseFloat(total_final_produtos_ja_selecionados) + parseFloat(preco);
                }

            }
        }


        if (preco_promocao == "") {
            let preco_final = preco_unidade * quantidade;
            $("#preco-floating-bar").text(moneyPtBR(preco_final));
            $("#price-buy-together").text(moneyPtBR(preco_final));
            $("#compre-junto-desconto").text(moneyPtBR(desconto_produtos_ja_selecionados));
            $("#compre-junto-total").text(moneyPtBR(preco_final + parseFloat(total_produtos_ja_selecionados)));
            $("#compre-junto-total-final").text(moneyPtBR(preco_final + parseFloat(total_final_produtos_ja_selecionados)));
        } else {
            $("#price-buy-together").text(moneyPtBR(preco_promocao * quantidade));
            $("#compre-junto-total").text(moneyPtBR(preco_promocao * quantidade));
            $("#compre-junto-total-final").text(moneyPtBR(preco_promocao * quantidade));
            $("#preco-floating-bar").text(moneyPtBR(preco_promocao * quantidade));
        }
    }
}

function AtualizarCarrinhoCompreJunto(valor, valorP, operador) {
    var existeCompreJunto = parseInt($('#buy-together .ui.container').length);
    if (existeCompreJunto > 0) {
        let total       = SomenteNumeros($("#compre-junto-total").text());
        let desconto    = SomenteNumeros($("#compre-junto-desconto").text());
        let total_final = SomenteNumeros($("#compre-junto-total-final").text());
        let descontoP   = 0;
        if (valorP != "" && valorP != "0") {
            descontoP = parseFloat(valor) - parseFloat(valorP);
        } else {
            valorP = 0;
        }

        if (operador == "+") {
            $("#compre-junto-desconto").text(moneyPtBR(parseFloat(desconto) + parseFloat(descontoP)));
            if (valorP != "" && parseFloat(valorP) > 0) {
                $("#compre-junto-total").text(moneyPtBR(parseFloat(total) + parseFloat(valorP)));
                $("#compre-junto-total-final").text(moneyPtBR(parseFloat(total_final) + parseFloat(valorP)));
            } else {
                $("#compre-junto-total").text(moneyPtBR(parseFloat(total) + parseFloat(valor)));
                $("#compre-junto-total-final").text(moneyPtBR(parseFloat(total_final) + parseFloat(valor)));
            }
        } else if (operador == "-") {

            $("#compre-junto-desconto").text(moneyPtBR(parseFloat(desconto) - parseFloat(descontoP)));
            if (valorP != "" && parseFloat(valorP) > 0) {
                $("#compre-junto-total").text(moneyPtBR(parseFloat(total) - parseFloat(valorP)));
                $("#compre-junto-total-final").text(moneyPtBR(parseFloat(total_final) - parseFloat(valorP)));
            } else {
                $("#compre-junto-total").text(moneyPtBR(parseFloat(total) - parseFloat(valor)));
                $("#compre-junto-total-final").text(moneyPtBR(parseFloat(total_final) - parseFloat(valor)));
            }
        }
    }
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

function CarregarVariacoes(seletor, valorSelecionado, ordem, idReferencia) {
    var variacoes_selecionadas    = $("#" + seletor + "-referencias-selecionadas").val();
    var variacoes_filtradas_array = variacoes_selecionadas.split(",");
    var variacoes_filtradas       = "";
    for (var i = 0; i < ordem; i++) {
        if (variacoes_filtradas != "") {
            variacoes_filtradas += "," + variacoes_filtradas_array[i];
        } else {
            variacoes_filtradas += variacoes_filtradas_array[i];
        }
    }

    if (ordem == 1) {
        variacoes_selecionadas = valorSelecionado;
    }

    $.ajax({
        url: '/Product/ObterPossiveisReferenciasVariacao/',
        type: 'POST',

        data: {
            reference: $("#" + seletor + "-produto-referecias").val(),
            variacoes: variacoes_filtradas,
            listaSKU: $("#" + seletor + "-lista-sku").val()
        },
        dataType: 'json',
        success: function (response) {
            AtualizaVariacoes(response, ordem, valorSelecionado, seletor, idReferencia);
        },
        error: function (request, error) {
            //console.log(request);
            //console.log(error);
            //console.log("Erro Variacao");
        }
    });
}

function AtualizaVariacoes(listaReferenciaSkuJson, ordem, valorSelecionado, seletor, idReferenciaSelecionada) {
    var seletorPai = "";

    var ListaReferencia     = $("#" + seletor + "-produto-referecias").val();
    var ListaReferenciaJson = JSON.parse(ListaReferencia);

    var totalVariacoes = parseInt($("#principal-total-variacoes").val());

    if (seletor == "principal") {
        seletorPai = "product-grid"
    }

    var total_para_atualizar       = 0;
    var comeco_para_atualizar      = 0;
    var variacoes_selecionadas_bkp = $("#" + seletor + "-referencias-selecionadas").val();
    if (ordem == 1) {
        $("#" + seletor + "-referencias-selecionadas").val("");
        total_para_atualizar  = totalVariacoes;
        comeco_para_atualizar = ordem;
        $("#" + seletor + "-referencias-selecionadas").val(valorSelecionado);
    } else if (ordem <= totalVariacoes) {
        total_para_atualizar  = ordem + 1;
        comeco_para_atualizar = ordem + 1;
    }

    //ATUALIZA TODOS ATÉ O TOTAL DE VARIACOES
    for (var i = comeco_para_atualizar; i <= total_para_atualizar; i++) {
        var tipo         = "";
        var idReferencia = 0;
        $('.' + seletorPai + ' .field*[data-order=' + i + ']').each(function () {
            tipo = $(this).data("tipo");
            if (tipo == "") {
                tipo = $('.' + seletorPai + ' .variacao-drop[value=' + valorSelecionado + ']').data("tipo");
            }
            idReferencia = $(this).data("id-reference");
        });

        MontarHtmlVariacao(seletorPai, i, ListaReferenciaJson, listaReferenciaSkuJson, idReferencia, tipo, seletor, variacoes_selecionadas_bkp, valorSelecionado);
    }
}

function MontarHtmlVariacao(seletor, posicao, ListaReferenciaJson, listaReferenciaSkuJson, idReferencia, tipoBtn, seletor_produto, variacoes_selecionadas_bkp, valorSelecionado) {
    var selecionar        = "";
    var lista_desabilitar = "";
    var lista_esconder    = "";

    var html            = "";
    var flag_buscar_sku = false;
    if (posicao > 1 || ListaReferenciaJson.length === 1) {
        flag_buscar_sku = true;
    }
    $('.' + seletor + ' .field*[data-order=' + posicao + ']').each(function () {
        html = "";
        for (var i = 0; i < ListaReferenciaJson.length; i++) {
            if (ListaReferenciaJson[i].IdReference == idReferencia) {
                for (var j = 0; j < ListaReferenciaJson[i].Variations.length; j++) {
                    var skU = "";

                    if (flag_buscar_sku === true) {
                        skU = ValidaVariacao(ListaReferenciaJson[i].Variations[j].IdVariation, listaReferenciaSkuJson, ListaReferenciaJson[i].IdReference);
                    }

                    if (tipoBtn == "color") {
                        html += MontaTipoCor(skU, seletor_produto, ListaReferenciaJson[i], ListaReferenciaJson[i].Variations[j], variacoes_selecionadas_bkp, flag_buscar_sku, posicao);
                    } else if (tipoBtn == "check") {
                        html += MontaTipoCheckBox(skU, seletor_produto, ListaReferenciaJson[i], ListaReferenciaJson[i].Variations[j], variacoes_selecionadas_bkp, flag_buscar_sku, posicao);
                    } else if (tipoBtn == "drop") {
                        var ObjetoCompleto = MontaTipoDropdown(skU, seletor_produto, ListaReferenciaJson[i], ListaReferenciaJson[i].Variations[j], variacoes_selecionadas_bkp, flag_buscar_sku, posicao);
                        html += ObjetoCompleto.html;
                        selecionar += ObjetoCompleto.selecionar;
                        lista_desabilitar += ObjetoCompleto.lista_desabilitar;
                        lista_esconder += ObjetoCompleto.lista_esconder;
                    } else if (tipoBtn == "image") {
                        html += MontaTipoImagem(skU, seletor_produto, ListaReferenciaJson[i], ListaReferenciaJson[i].Variations[j], variacoes_selecionadas_bkp, flag_buscar_sku, posicao);
                    }
                }
            }
        }
        $(this).html(html);
        //EVENTOS DE SELEÇÂO PARA PLUGINS
        if (tipoBtn == "drop") {
            SelecaoDropdown(selecionar, lista_desabilitar, lista_esconder);
        }
        ValidaVariacaoSelecionada(valorSelecionado, seletor_produto);
    });
    // FUNÇÔES A SEREM CARREGADAS PARA CADA TIPO DE VARIACAO
    if (tipoBtn == "color") {
        VariacaoCor();
    } else if (tipoBtn == "check") {
        VariacaoRadio();
    } else if (tipoBtn == "drop") {
        VariacaoDropDown();
    } else if (tipoBtn == "image") {
        VariacaoImagem();
    }
}

function MontaTipoCor(skU, seletor_produto, reference, variation, variacoes_selecionadas_bkp, flag_buscar_sku, posicao) {
    var html      = "";
    var classeBtn = "ui basic button radio variacao cor";

    if (flag_buscar_sku === true) {
        if (skU.stock <= 0 || skU.visible === false) {
            if (skU.stock <= 0) {
                //classeBtn += " disabled";
            }
            else if (skU.visible === false) {
                classeBtn += " hideme";
            }
        }
    }

    if (validaSejaEstaSelecionado(seletor_produto, reference.IdReference, variation.IdVariation, variacoes_selecionadas_bkp)) {
        classeBtn += " selecionado";
    }
    html += "<button class='" + classeBtn + "' style='background-color: " + variation.Color + " !important; margin: 0em 0.50em 0em 0em;' data-tooltip=" + variation.Name + " value='" + reference.IdReference + "-" + variation.IdVariation + "' data-id-reference='" + reference.IdReference + "' data-tipo='color' data-order='" + posicao + "'></button>";
    html += "<div class='ui checkbox hideme'><input type='radio' name='radio' value=" + variation.Color + ">";
    html += "<label></label></div>";
    return html;
}

function MontaTipoCheckBox(skU, seletor_produto, reference, variation, variacoes_selecionadas_bkp, flag_buscar_sku, posicao) {
    var html      = "";
    var classeBtn = "ui basic primary button radio tiny variacao-radio";
    var classeDiv = "ui checkbox hideme";

    if (skU != "" && skU != undefined) {
        if (skU.stock <= 0 || skU.visible === false) {
            if (skU.stock <= 0) {
                //classeBtn += "disabled"; mesmo que stock = 0 o mesmo deve ser exibido
                classeBtn += "";
            }
            else if (skU.visible === false) {
                classeBtn += " hideme";
            }
        }
    } else {
        classeBtn += " hideme";
    }

    if (validaSejaEstaSelecionado(seletor_produto, reference.IdReference, variation.IdVariation, variacoes_selecionadas_bkp)) {
        classeBtn = classeBtn.replace("basic", "");
        classeBtn += " selecionado";
        classeDiv += " checked";
    }

    html += "<button class='" + classeBtn + "' value='" + reference.IdReference + "-" + variation.IdVariation + "'";
    html += " data-id-reference='" + reference.IdReference + "' data-tipo='check' data-order='" + posicao + "'>";
    html += variation.Name + "</button>";
    html += " <div class='" + classeDiv + "'>";
    html += " <input type='radio' name='" + reference.IdReference + "' value='" + variation.Name + "'>";
    html += " <label></label>";
    html += " </div>";
    return html;
}

function MontaTipoImagem(skU, seletor_produto, reference, variation, variacoes_selecionadas_bkp, flag_buscar_sku, posicao) {
    var html      = "";
    var classeBtn = "ui variacao image";
    var classeDiv = "ui checkbox hideme";

    if (skU.stock <= 0 || skU.visible === false) {
        if (skU.stock <= 0) {
            //classeBtn += " disabled";
        }
        else if (skU.visible === false) {
            classeBtn += " hideme";
        }
    }

    if (validaSejaEstaSelecionado(seletor_produto, reference.IdReference, variation.IdVariation, variacoes_selecionadas_bkp)) {
        classeBtn += " img-selecionado";
        classeDiv += " checked";
    }

    html += "<div class='" + classeBtn + "'>";
    html += "<img src='"+ variation.Image + "' onerror=\"imgError(this)\" alt='" + variation.Name + "' data-value='" + reference.IdReference + "-" + variation.IdVariation + "' class='variacao-imagem'";
    html += " data-id-reference='" + reference.IdReference + "' data-tipo='image' data-order='" + posicao + "'>";
    html += "<div class='" + classeDiv + "'>";
    html += "<input type='radio' name='" + reference.IdReference + "' value='" + variation.Name + "-" + variation.IdVariation + "'>";
    html += "<label></label>";
    html += "</div></div>";

    return html;
}

function MontaTipoDropdown(skU, seletor_produto, reference, variation, variacoes_selecionadas_bkp, flag_buscar_sku, posicao) {
    var ObjetoCompleto    = [];
    let html              = "";
    let lista_desabilitar = "";
    let lista_esconder    = "";
    let selecionar        = "";

    html = "<option value=''>Selecione</option>";

    if (validaSejaEstaSelecionado(seletor_produto, reference.IdReference, variation.IdVariation, variacoes_selecionadas_bkp)) {
        selecionar += reference.idReferencia + "-" + variation.IdVariation;
    }

    if (flag_buscar_sku === true) {
        if (skU.stock <= 0 || skU.visible === false) {
            if (skU.stock <= 0) {
                if (lista_desabilitar != "") {
                    lista_desabilitar += "," + reference.IdReference + "-" + variation.IdVariation;
                } else {
                    lista_desabilitar += reference.IdReference + "-" + variation.IdVariation;
                }
            }
            else if (skU.visible === false) {
                if (lista_esconder != "") {
                    lista_esconder += "," + reference.IdReference + "-" + variation.IdVariation;
                } else {
                    lista_esconder += reference.IdReference + "-" + variation.IdVariation;
                }
            }
        }
    }

    html += "<option class='variacao-drop' value='" + reference.IdReference + "-" + variation.IdVariation + "' data-tipo='drop'";
    html += " data-order='" + posicao + "'";
    html += " data-id-reference='" + reference.IdReference + "'>" + variation.IdVariation + "</option>";

    ObjetoCompleto.html              = html;
    ObjetoCompleto.lista_desabilitar = lista_desabilitar;
    ObjetoCompleto.lista_esconder    = lista_esconder;
    ObjetoCompleto.selecionar        = selecionar;

    return ObjetoCompleto;
}

function SelecaoDropdown(selecionar, lista_desabilitar, lista_esconder) {
    if (selecionar != "") {
        $('.product-grid .dropdown').dropdown('set selected', selecionar);
    }
    selecionar  = "";
    var inputsD = lista_desabilitar.split(",");
    for (var i = 0; i < inputsD.length; i++) {
        if (inputsD[i] != "") {
            $(".product-grid .dropdown option[value='" + inputsD[i] + "']").addClass('disabled');
            $(".product-grid .dropdown div[data-value='" + inputsD[i] + "']").addClass('disabled');
        }
    }


    var inputs = lista_esconder.split(",");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i] != "") {
            $(".product-grid .dropdown option[value='" + inputs[i] + "']").addClass('hideme');
            $(".product-grid .dropdown div[data-value='" + inputs[i] + "']").addClass('hideme');
        }
    }
}

function validaSejaEstaSelecionado(seletor, IdReference, IdVariation, variacoes_selecionadas_bkp) {
    var resultado                     = false;
    var referenciasJaSelecionadasNova = $("#" + seletor + "-referencias-selecionadas").val();

    if (variacoes_selecionadas_bkp.indexOf(IdReference + "-" + IdVariation) != -1) {
        resultado = true;
        if (referenciasJaSelecionadasNova.indexOf(IdReference + "-" + IdVariation) == -1) {
            if (referenciasJaSelecionadasNova == "") {
                $("#" + seletor + "-referencias-selecionadas").val(IdReference + "-" + IdVariation);
            } else {
                $("#" + seletor + "-referencias-selecionadas").val(referenciasJaSelecionadasNova + "," + IdReference + "-" + IdVariation);
            }
        }
    }
    return resultado;
}

function ValidaVariacao(variacao, listaSkuVariacao, idReferencia) {
    //RECEBE UMA VARIACAO E VALIDA ESTOQUE E VISIBILIDADE
    var SKU         = [];
    var variacaoSKU = "";

    for (var i = 0; i < listaSkuVariacao.length; i++) {
        if (listaSkuVariacao[i].IdReference == idReferencia) {
            for (var j = 0; j < listaSkuVariacao[i].Variations.length; j++) {
                if (listaSkuVariacao[i].Variations[j].IdVariation == variacao) {
                    SKU.push(listaSkuVariacao[i].Variations[j]);
                }
            }
        }
    }

    for (var i = 0; i < SKU.length; i++) {
        if (SKU[i].stock > 0 && SKU[i].visible === true) {
            variacaoSKU = SKU[i];
            break;
        }
    }

    if (variacaoSKU == "") {
        for (var i = 0; i < SKU.length; i++) {
            if (SKU[i].visible === true) {
                variacaoSKU = SKU[i];
                break;
            }
        }
    }

    if (variacaoSKU == "") {
        for (var i = 0; i < SKU.length; i++) {
            if (SKU[i].stock > 0) {
                variacaoSKU = SKU[i];
                break;
            }
        }
    }
    return variacaoSKU;
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

function SomenteNumeros(valor) {
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

function getFloatFromCurrency(currency) {

    let regex  = /([+-]?[0-9|^.|^,]+)[\.|,]([0-9]+)$/igm,
        result = regex.exec(currency);

    return result ? result[1].replace(/[.,]/g, "") + "." + result[2] : String(currency).replace(/[^0-9-+]/g, "");
}

function RefreshInfoPreco(valor_total){
    var max_p =  $("#max-parc").val()
    $("#max-value").text(moneyPtBR(valor_total / max_p))
}