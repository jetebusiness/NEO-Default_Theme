import {openModalQuickView} from "../../functions/modal";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {_alert, _confirm} from "../../functions/message";
import {CancelarCalculoFreteCart} from "../checkout/mini_cart";
import {moneyPtBR} from "../../functions/money";

function isExhausted(productId) {
    return !($("#Product_" + productId).data("exhausted").toLowerCase() === "false");
}

$(document).on("click", ".btn-comprar-card", function () {
    $(this).addClass("loading");
    CancelarCalculoFreteCart(1);
    insertItemInCart($(this).data("idproduct"), this);
});

$(document).on("click", ".button.avise-card", function () {
    $.ajax({
        method: "GET",
        url: "/Product/AlertMe",
        dataType: "html",
        data: {
            produtoID: typeof($("#produto-id").val()) !== "undefined" ? $("#produto-id").val() : $(this).data("idproduct"),
            sku: typeof($("#produto-sku").val()) !== "undefined" ? $("#produto-sku").val() : $(this).data("produto-sku"),
            titulo: $("#produto-nome").text() !== "" ? $("#produto-nome").text() : $(this).data("name"),
            imagem: $('#mainImageCard_' + $(this).data("idproduct")).attr('src'),
            codigo: typeof($("#produto-codigo").val()) !== "undefined" ? $("#produto-codigo").val() : $(this).data("produto-codigo")
        },
        success: function (response) {
            $(".modal-block").append(response);
            openModalQuickView($(this).attr("data-modal-open"), callback => {
                $("input.masked").inputmask();
            });
        },
        onFailure: function (response) {
            console.log(response);
        }
    });
});

$(document).on("change", ".dropdownreference", function () {
    callAjaxGetSku(this);
});

$(document).ready(function () {
    $(".quick-view-opener").api({
        action: 'quickview product',
        dataType: 'html',
        beforeSend: function (settings) {
            settings.urlData = {
                code: $(this).attr("data-modal-open")
            };
            return settings;
        },
        onSuccess: function (response) {
            $(".modal-block").append(response);
            openModalQuickView($(this).attr("data-modal-open"));
        },
        onError: function (errorMessage) {
            console.log(errorMessage);
        }
    });
});


function insertItemInCart(productId, element) {
    let keep              = true,
        variationSelected = "",
        $parent = $(element).closest(".ui.card.produto");

    $parent.find(".sku-options [id=referencefromproduct_" + productId + "]").each(function () {
        let idVariation = $(this).dropdown("get value");
        if (idVariation === "") {
            keep = false;
            return false;
        }
        else {
            variationSelected += variationSelected !== "" ? "," + idVariation : idVariation;
            keep = true;
        }
    });

    if (keep) {
        callAjaxInsertItemInCart(productId, variationSelected, 1, element);
    }
    else {
        _alert("", "Varia&ccedil;&atilde;o n&atilde;o selecionada!", "warning")
    }
}


function callAjaxGetSku(element) {

    let keep              = false,
        variationSelected = "",
        productId         = $(element).data("idproduct"),
        $parent = $(element).closest(".ui.card.produto");

    $parent.find(".sku-options [id=referencefromproduct_" + productId + "]").each(function () {

        let idVariation = $(this).dropdown("get value");
        if (idVariation === "") {
            keep = false;
            return false;
        }
        else {
            variationSelected += variationSelected !== "" ? "," + idVariation : idVariation;
            keep = true;
        }
    });

    if (keep) {
        console.log(`ID produto: ${productId}
            Variações: ${variationSelected}`);
        $.ajax({
            url: "/product/GetSkuByIdProductJson",
            data: {id: productId, variations: variationSelected},
            method: "GET",
            success: function (response) {

                let sku = JSON.parse(response.data);

                if(sku.Price && sku.PricePromotion){
                    $parent.find("#basePrice_" + productId+ "> i").text(moneyPtBR(sku.Price));
                    $parent.find(".preco").text(moneyPtBR(sku.PricePromotion));
                }
                else{
                    $parent.find("#price_" + productId).text(moneyPtBR(sku.Price));
                }

                if (sku.InstallmentMax){
                    $parent.find(".installmentMaxNumber").text(sku.InstallmentMax.MaxNumber);
                    $parent.find(".installmentMaxValue").text(moneyPtBR(sku.InstallmentMax.Value));
                }

                if (sku.Stock <= 0 || isExhausted(productId)) {
                    $("#btn-comprar-card-" + productId)
                        .removeClass("green btn-comprar-card")
                        .addClass("grey avise-card avise-me-modal")
                        .html(`<i id="btn-icon-card-${productId}" class="icon announcement"></i> Avise-me`);
                    $("#produto-esgotado_" + productId).removeClass("hideme");
                }
                else {
                    $("#btn-comprar-card-" + productId)
                        .removeClass("grey avise-card avise-me-modal")
                        .addClass("green btn-comprar-card")
                        .html(`<i id="btn-icon-card-${productId}" class="icon add to cart"></i> Comprar`);
                    $("#produto-esgotado_" + productId).addClass("hideme");
                }
            },
            error: function (response) {
                console.error("Response Error: "+response);
            }
        });
    }
}

function callAjaxInsertItemInCart(idProduct, variations, quantity, element) {
    console.warn("Adicionando Produto ao Carrinho");
    console.log(`ID produto: ${idProduct}
            Variações: ${variations}
            Quantidade: ${quantity}`);
    $.ajax({
        url: "/Checkout/InsertUniqueItemCart",
        method: "POST",
        data: {idProduct: idProduct, variations: variations, quantity: quantity },
        success: function (response) {
            if(response.success){
                $(element).removeClass("loading");
                LoadCarrinho();
                $(".carrinho").sidebar('toggle');
            }
            else{
                _alert("Mensagem", response.msg, "warning")
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
}
