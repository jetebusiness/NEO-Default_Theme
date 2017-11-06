import {openModalQuickView} from "../../functions/modal";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {_alert, _confirm} from "../../functions/message";
import {CancelarCalculoFreteCart} from "../checkout/mini_cart";
import {moneyPtBR} from "../../functions/money";
import {updateProductConjunctTable} from "./detail";

function isExhausted(productId) {
    return !($("#Product_" + productId).data("exhausted").toLowerCase() === "false");
}
function loading(element) {
    $(element).toggleClass('loading');
}
$(document).on('click', '.btn-adiciona-conjunto', function () {

    let $checkbox = $(this).next(".conjunct_product");

    if ($(this).attr("disabled")){
        return false;
    }

    if ($checkbox.prop("checked")) {
        $(this)
            .prop("checked", false)
            .removeClass("green")
            .addClass("grey")
            .find(".icon")
            .removeClass("checkmark box")
            .addClass("square outline")
            .next("span")
            .text("Selecionar");
    }
    else {
        $(this)
            .prop("checked", true)
            .removeClass("grey")
            .addClass("green")
            .find(".icon")
            .addClass("square outline")
            .addClass("checkmark box")
            .next("span")
            .text("Selecionado");
    }

});

$(document).on('change', 'input.conjunct_product', function () {
    updateProductConjunctTable();
});

$(document).on("click", ".btn-comprar-card", function () {
    $(this).addClass("loading");
    CancelarCalculoFreteCart(1);
    insertItemInCart($(this).data("idproduct"), this);
});

$(document).on("click", "#btn_compre_conjunto_selecionado", function (e) {   
    let $product_selected = $(".conjunct_product:checked");
    if ($product_selected.length > 0) {
        $(this).addClass("loading");
        CancelarCalculoFreteCart(1);
        $product_selected.each(function () {
            insertItemInCart($(this).val(), $(this));
        });
    }else if($product_selected.length == 0){
        _alert('', 'Conjunto indisponível!', 'error');
    }
    else {
        _alert('', 'Selecione ao menos um produto, antes de adicionar ao carrinho.', 'error');
    }
    e.prevenDefault()
});

$(document).on("click", ".button.avise-card", function () {
    var that = $(this);
    loading(that);
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
                loading(that);
            });

        },
        onFailure: function (response) {
            console.log(response);
            loading(that);
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

    if ($(".conjunct_product:checked").length > 0) {

        $('.card.produto.conjunto').each(function (index, element) {
            let variations = $(this).data('variation');

            $(element).find('.ui.dropdown').each(function () {
                let $that = $(this);
                for (let variation in variations){
                    $that.dropdown('set selected', variations[variation].IdVariation);
                }
            });
            callAjaxGetSku(element);

            updateStockConjunct(element);
        });
        updateProductConjunctTable();
    }else{
        $(".buy-together").removeClass("ui animated green button fluid")
        $(".buy-together").addClass("ui labeled icon button fluid grey disabled")
        $("#buttonText").text("Indisponível")
        $("#iconCart").remove()
    }
});

function insertItemInCart(productId, element) {
    let $parent           = $(element).closest("div[id^='Product_']"),
        variationSelected = getVariationIds($parent, productId);

    if (variationSelected.status) {
        callAjaxInsertItemInCart(productId, variationSelected.ids, 1);
    }
    else {
        _alert("", "Variação não selecionada!", "warning");
        $(element).removeClass('loading');
    }
}

function callAjaxGetSku(element) {

    let productId         = $(element).data("idproduct"),
        $parent           = $(element).closest("div[id^='Product_']"),
        variationSelected = getVariationIds($parent, productId);

    if (variationSelected.status) {
        console.warn("Buscando SKU de Produto por variação");
        console.log(`ID produto: ${productId}
            Variações: ${variationSelected.ids}`);
        $.ajax({
            url: "/product/GetSkuByIdProductJson",
            data: {id: productId, variations: variationSelected.ids},
            method: "GET",
            success: function (response) {

                let sku = JSON.parse(response.data);
                var ponteiroPricesCurrent = $parent.find("#basePrice_" + productId + "> i").length;

                if (sku.Price > 0 && sku.PricePromotion > 0) {
                    if(ponteiroPricesCurrent > 0){
                        $parent.find("#basePrice_" + productId + "> i").text(moneyPtBR(sku.Price));
                    }else{
                        $parent.find(".preco").before('<span id="basePrice_'+productId+'" class="precoBase">de <i>'+moneyPtBR(sku.Price)+'</i> por</span>');
                    }
                    $parent.find(".preco").text(moneyPtBR(sku.PricePromotion));
                }
                else {
                    if(ponteiroPricesCurrent > 0){
                        $parent.find("#basePrice_" + productId).remove();
                    }
                    $parent.find(".preco").text(moneyPtBR(sku.Price));
                }

                if (sku.InstallmentMax) {
                    $parent.find(".installmentMaxNumber").text(sku.InstallmentMax.MaxNumber);
                    $parent.find(".installmentMaxValue").text(moneyPtBR(sku.InstallmentMax.Value));
                }

                if (sku.Stock <= 0 || isExhausted(productId)) {
                    $parent.find("#btn-comprar-card-" + productId)
                        .removeClass("green btn-comprar-card")
                        .addClass("grey avise-card avise-me-modal")
                        .html('<i class="icon announcement"></i> Avise-me');
                    $parent.find("#produto-esgotado_" + productId).removeClass("hideme");
                    $parent.data("stock", sku.Stock);
                }
                else {
                    $parent.find("#btn-comprar-card-" + productId)
                        .removeClass("grey avise-card avise-me-modal")
                        .addClass("green btn-comprar-card")
                        .html('<i class="icon add to cart"></i> Comprar');
                    $parent.find("#produto-esgotado_" + productId).addClass("hideme");
                    $parent.data("stock", sku.Stock);
                }

                if ($parent.hasClass("conjunto")) {
                    updateStockConjunct($parent);
                    updateProductConjunctTable();
                }
            },
            error: function (response) {
                console.error("Response Error: " + response);
            }
        });
    }
}

function callAjaxInsertItemInCart(idProduct, variations, quantity) {
    console.warn("Adicionando Produto ao Carrinho");
    console.log(`ID produto: ${idProduct}
            Variações: ${variations}
            Quantidade: ${quantity}`);
    $.ajax({
        url: "/Checkout/InsertUniqueItemCart",
        method: "POST",
        data: {idProduct: idProduct, variations: variations, quantity: quantity},
        success: function (response) {
            if (response.success) {
                $(document).find(".loading").removeClass("loading");
                LoadCarrinho();
                $(".carrinho").sidebar('show');
            }
            else {
                $(document).find(".loading").removeClass("loading");
                _alert("Mensagem", response.msg, "warning")
            }
        },
        error: function (response) {
            console.log(response);
        }
    });
}

function updateStockConjunct(element) {
    let stock     = $(element).data('stock');
    let productId = $(element).data('idproduct');
    let $button = $(element).find('.btn-adiciona-conjunto')

    if (stock <= 0 || isExhausted(productId)) {
        $button
            .attr('disabled', true)
            .prop("checked", false)
            .removeClass("green")
            .addClass("black")
            .find(".icon")
            .removeAttr("class")
            .attr("class", "icon warning circle")
            .next("span")
            .text("Esgotado");

        $button
            .next('input.conjunct_product')
            .prop('checked', false);

        return false;
    }
    else {
        $button
            .attr('disabled', false)
            .prop("checked", true)
            .removeClass("black")
            .addClass("green")
            .find(".icon")
            .removeAttr("class")
            .attr("class", "icon checkmark box")
            .next("span")
            .text("Selecionado");

        $button
            .next('input.conjunct_product')
            .prop('checked', true);
        return true;
    }
}

function getVariationIds(parentElement, productId) {
    let variationSelected = "",
        _return = {},
        $skuOptions = $(parentElement).find(".sku-options [id=referencefromproduct_" + productId + "]");
    if ($skuOptions.length) {
        $skuOptions.each(function () {
            let idVariation = $(this).dropdown("get value");
            if (idVariation === "") {
                _return = {
                    status: false
                };
            }
            else {
                variationSelected += variationSelected !== "" ? "," + idVariation : idVariation;
                _return = {
                    status: true,
                    ids: variationSelected
                };
            }
        });
    }
    else{
        _return = {
            status: true,
            ids: ""
        };
    }
    return _return;
}
