import {openModalQuickView} from "../../functions/modal";
import {LoadCarrinho} from "../../functions/mini_cart_generic";
import {_alert, _confirm} from "../../functions/message";
import {CancelarCalculoFreteCart} from "../checkout/mini_cart";

$(document).on("click", ".btn-comprar-card", function(){
    CancelarCalculoFreteCart(1);
    insertItemInCart(this);
});


$(document).on("click", ".button.avise-card", function(){
    $(".button.avise-card").api({
        action: 'alert me',
        method: 'GET',
        dataType: "html",
        beforeSend: function (settings) {
            settings.data = {
                produtoID: $("#produto-id").val(),
                sku: $("#produto-sku").val(),
                titulo: $("#produto-nome").text() !== "" ? $("#produto-nome").text() : $(this).data("name"),
                imagem: $('#mainImageCard_' + $(this).data("idproduct")).attr('src'),
                codigo: $("#produto-codigo").val()
            };
            return settings;
        },
        successTest: function (response) {
            return response.success || false;
        },
        onSuccess: function (response) {
            $(".modal-block").append(response);
            openModalQuickView($(this).attr("data-modal-open"));
        },
        onFailure: function (response) {
            console.log(response);
        },
        onError: function (errorMessage) {
            console.log(errorMessage);
        }
    });
})

//$(document).dropdown.on("change", ".dropdownreference", function(){
//    callAjaxGetSku(this);
//});

$(document).on("change", ".dropdownreference", function() {
    callAjaxGetSku(this);
});

$(document).ready(function() {
    //$(".dropdownreference").dropdown({
    //    onChange: function(){
    //        callAjaxGetSku(this);
    //    }
    //});


    /**
     * Semantic-UI API
     * Abre Modal com detalhe do produto
     */
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

function insertItemInCart(element) {
    let keep = true;
    let variationSelected = "";
    let idProduct = $(element).data("idproduct");

    let divClass;
    if ($(element).parents(".featuredProducts").length > 0) {
        divClass = ".featuredProducts";
    }
    else if ($(element).parents(".categoryProducts").length > 0) {
        divClass = ".categoryProducts";
    }
    else if ($(element).parents(".groupProducts").length > 0) {
        divClass = ".groupProducts";
    }
    else if ($(element).parents(".brandProducts").length > 0) {
        divClass = ".brandProducts";
    }
    else if ($(element).parents(".searchProducts").length > 0) {
        divClass = ".searchProducts";
    }
    else if ($(element).parents(".topSellersProducts").length > 0) {
        divClass = ".topSellersProducts";
    }

    $(divClass + " .sku-options [id=referencefromproduct_" + idProduct + "]").each(function(){
        let idVariation = $(this).dropdown("get value");

        if (idVariation == "") {
            keep = false;
            return keep;
        }
        else {
            variationSelected += variationSelected != "" ? "," + idVariation : idVariation;
            keep = true;
        }
    });

    if (keep) {
        callAjaxInsertItemInCart(idProduct, variationSelected, 1);
    }
    else {
        _alert("", "Varia&ccedil;&atilde;o n&atilde;o selecionada!", "warning")
    }
}

function callAjaxGetSku(element) {
    let keep = false;
    let variationSelected = "";

    let divClass;
    if ($(element).parents(".featuredProducts").length > 0) {
        divClass = ".featuredProducts";
    }
    else if ($(element).parents(".categoryProducts").length > 0) {
        divClass = ".categoryProducts";
    }
    else if ($(element).parents(".groupProducts").length > 0) {
        divClass = ".groupProducts";
    }
    else if ($(element).parents(".brandProducts").length > 0) {
        divClass = ".brandProducts";
    }
    else if ($(element).parents(".searchProducts").length > 0) {
        divClass = ".searchProducts";
    }
    else if ($(element).parents(".topSellersProducts").length > 0) {
        divClass = ".topSellersProducts";
    }

    $(divClass + " .sku-options [id=referencefromproduct_" + $(element).data("idproduct")+"]").each(function(){
        let idVariation = $(this).dropdown("get value");

        //let idVariation = $($this "[name=reference_" + $(element).data("idproduct")+"]").val();


        if (idVariation == "") {
            keep = false;
            return false;
        }
        else {
            variationSelected += variationSelected != "" ? "," + idVariation : idVariation;
            keep = true;
        }
    });

    if (keep) {
        let idProduct = $(element).data("idproduct");
        $.ajax({
            url: "/product/GetSkuByIdProductJson",
            data: {id: idProduct, variations: variationSelected},
            method: "GET",
            success: function (response) {

                let sku = JSON.parse(response.data);

                $("#basePrice_" + idProduct).text("R$ " + sku.Price);

                if (sku.Stock <= 0) {
                    $("#btn-comprar-card-" + idProduct).removeClass("green").removeClass("btn-comprar-card").addClass("grey avise-card avise-me-modal");
                    $("#btn-comprar-card-" + idProduct).html(`<i id="btn-icon-card-${idProduct}" class="icon announcement"></i> Avise-me`);
                    $("#produto-esgotado_" + idProduct).removeClass("hideme");
                }
                else {
                    $("#btn-comprar-card-" + idProduct).removeClass("grey avise-card avise-me-modal").addClass("green btn-comprar-card");
                    $("#btn-comprar-card-" + idProduct).html(`<i id="btn-icon-card-${idProduct}" class="icon add to cart"></i> Comprar`);
                    $("#produto-esgotado_" + idProduct).addClass("hideme");
                }
            },
            error: function(response) {
                console.log("Erro");
            }
        });
    }
}

function callAjaxInsertItemInCart(idProduct, variations, quantity) {
    $.ajax({
        url: "/Checkout/InsertUniqueItemCart",
        method: "POST",
        data: {idProduct: idProduct, variations: variations, quantity: quantity },
        success: function (response) {
            if(response.success){
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
