import { isLoading } from "../api_config";
import { _alert, _confirm } from "../../functions/message";
import { LoadCarrinho, LoadCarrinhoEventList } from "../../functions/mini_cart_generic";
import { UpdateCarrinho } from "../../functions/mini_cart_generic";
import { montaListaProdutos } from "../../ui/modules/mini_cart";
import { SomenteNumerosPositivos } from "../../functions/form-control";
import { CompraRecorrenteCart, CompraRecorrenteStorage } from '../../functions/recurringPurchase';
import { atualizaResumoCarrinho } from './payment'
import { buscaCepCD, changeCd } from "../../ui/modules/multiCd";
import { debounce } from "../../functions/util";
import { isGtmEnabled, tryPushEvent, getProductAndPushRemoveFromCartEvent, getProductAndPushAddToCartEvent } from "../../api/googleTagManager/googleTagManager";
import { getCartItens } from "../../functions/checkout"

$(document).ready(function () {
    $(document).on("click", "#mini-carrinho-checkout", function (event) {

        if($(".exhausted").length > 0) {
            createModelExhausted("#ListProductsCheckout");            
            return false;
        }

        window.location = '/checkout';

    });

    $(document).on("click", "#btn_finalizar", function (event) {
        
        var url = $(this).data("user-url");

        var permiteVenda = $('#permiteVenda').val();

        if (permiteVenda == "False") {
            _alert("Ops... vincule um cliente para finalizar a venda", "", "warning");
            return false;
        }

        $(".exhausted").each(function () {
            let _div = $(this);
            let divIgnore = false;
            let arrDivIgnore = ["buy-together", "AlsoProducts", "RelatedProducts"]

            for (let i = 0; i < arrDivIgnore.length; i++) {
                if (_div.closest("#" + arrDivIgnore[i]).length > 0) {
                    divIgnore = true;
                    break;
                }
            }

            if (!divIgnore) {
                createModelExhausted("#ListProductsCheckout");
                return false;
            }
        });
        
        if (CompraRecorrenteCart.modalConfig.hasModal())
            CompraRecorrenteCart.modalConfig.showModal(url);
        else
            window.location = url.toLowerCase();
        
    });

    $(document).on("click", "#CallServiceShippingMiniCart", function (event) {
        var zipCode = $('#CallServiceShippingMiniCart').prev('input').cleanVal();
        CalculaFreteMiniCarrinho(zipCode, true);
        event.stopPropagation();
    });


    $("#GetShipping").unbind().on("change", function (event) {
        var ponteiroCurrent = $(this);
        var idCurrent = $(ponteiroCurrent).val();

        var zipCode = $("#shipping").cleanVal();
        var idShippingMode = idCurrent;
        var deliveredByTheCorreiosService = $(ponteiroCurrent).children("option:selected").attr("data-correios");
        var carrier = $(ponteiroCurrent).children("option:selected").data("carrier");
        var mode = $(ponteiroCurrent).children("option:selected").data("mode");
        var hub = $(ponteiroCurrent).children("option:selected").data("hub");

        SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService, carrier, mode, hub);
        ExibirDicadeFrete(idShippingMode, zipCode);
    });


    $(document).on("click", ".cartbutton.mini-cart", function (event) {
        let segment = $(this).data("segment");

        if (segment === "b2b") {
            window.location.href = "/checkout";
        }
        else {
            if ($("#zipcode") != null && $("#zipcode").val().length > 0) {
                $('#shipping').val($("#zipcode").val());
            }

            LoadCarrinho();
            $(".carrinho").sidebar('toggle');


        }
    });

    $(document).on("click", ".cartbutton.mini-cart-list-event", function (event) {
        LoadCarrinhoEventList(true);
    });

    $(document).on("click", "#ClearCart", function () {
        _confirm({
            title: "Deseja realmente remover todos os produtos do carrinho?",
            text: "",
            type: "warning",
            confirm: {
                text: "Remover"
            },
            cancel: {
                text: "Cancelar"
            },
            callback: function () {
                if (isGtmEnabled()) {
                    clearCartAndPushRemoveFromCartEvent();
                } else {
                    clearCartAndRedirectToHome();
                }
            }
        });
    });

    function clearCartAndPushRemoveFromCartEvent() {
        getCartItens()
            .then((response) => {
                $.ajax({
                    method: "POST",
                    url: "Checkout/ClearCart",
                    success: function (data) {

                        let cartItens = response;

                        tryPushEvent({
                            event: 'remove_from_cart',
                            data: {
                                'currencyCode': 'BRL',
                                'remove': {
                                    'products': cartItens
                                }
                            }
                        });

                        window.location.href = "/home";
                    }
                });
            })
            .catch((response) => {
                clearCartAndRedirectToHome();
            });
    }


    $(document).on("click", "#miniCarrinho .removeCartItem", function (e) {
        var idCurrent = new Number($(this).attr("data-id"));
        var idCartPersonalization = new Number($(this).attr("data-id-personalization-cart"));
        var restrictedDeliveryProduct = $(this).data('restricted-delivery');
        var recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val();
        excluirProdutoCarrinho(idCurrent, idCartPersonalization, restrictedDeliveryProduct, recalculatedRestrictedProducts);
        e.stopPropagation();
    });

    $(document).on("keyup", "#miniCarrinho input[id^='qtd_']", debounce(updateQuantity, 1000));

    function clearCartAndRedirectToHome() {
        $.ajax({
            method: "POST",
            url: "Checkout/ClearCart",
            success: function (data) {
                window.location.href = "/home";
            }
        });
    }

    function updateQuantity(e) {
        let initialQuantity = $("#qtdInicial_" + $(this).attr("data-id")).val();

        if (initialQuantity == $(this).val()) {
            return;
        }

        if ($(this).val().length > 0) {
            var valor_final = SomenteNumerosPositivos($(this).val());
            $(this).val(valor_final);

            limparFrete();

            var action = $(this).attr("data-action");
            var idCurrent = $(this).attr("data-id");
            var idCartPersonalization = $(this).attr("data-id-personalization-cart");
            var valorInput = valor_final;
            var valorStock = new Number($("#stock_" + idCurrent).val());

            if (valorInput <= valorStock && valorInput < 1000) {
                isLoading("#miniCarrinho");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
            else {
                _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
                valorInput -= 1;
                isLoading("#miniCarrinho");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
            e.stopPropagation();
        }
    }

    $(document).on("click", ".qtdActionMiniCart", function (event) {
        $(".qtdActionMiniCart").off("click");
        var action = $(this).attr("data-action");
        var idCurrent = $(this).attr("data-id");
        var idCartPersonalization = $(this).attr("data-id-personalization-cart");
        
        if(idCartPersonalization && idCartPersonalization > 0)
            var valorInput = new Number($("[id^=qtd_" + idCurrent + "][data-id-personalization-cart='"+idCartPersonalization+"']").val());
        else
            var valorInput = new Number($("#qtd_" + idCurrent).val());
       
        var valorStock = new Number($("#stock_" + idCurrent).val());        

        if (action == "plus") {
            valorInput += 1;
            if (valorInput <= valorStock && valorInput < 1000) {
                isLoading("#miniCarrinho");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization);
            }
            else {
                _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
                valorInput -= 1;
            }
        }
        else {
            valorInput -= 1;
            if (valorInput <= 0) {
                valorInput = 1;
            }
            else {
                isLoading("#miniCarrinho");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
        }
        $("#qtd_" + idCurrent).val(valorInput);
    });


    $(document).on("click", "#btn_recalcular_frete", function (event) {
        CancelarCalculoFreteCart(1);
        UpdateCarrinho();
    });

});

function shippingCalculateMiniCart(status) {
    $(".qtdActionMiniCart").prop("disabled", status);
    $(".removeCartItem").prop("disabled", status);
    $(".quantidade").prop("disabled", status);
}

export function excluirProdutoCarrinho(idCurrent, idCartPersonalization, restrictedDeliveryProduct, recalculatedRestrictedProducts) {
    _confirm({
        title: "Deseja realmente remover esse produto do carrinho?",
        text: "",
        type: "warning",
        confirm: {
            text: "Remover"
        },
        cancel: {
            text: "Cancelar"
        },
        callback: function () {
            $.ajax({
                method: "POST",
                url: "/Checkout/DeleteProduct",
                async: false,
                data: {
                    idCartItem: idCurrent,
                    idCartPersonalization
                },
                success: function (data) {
                    if (data.success === false) {
                        swal({
                            text: data.msg,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        });
                        LoadCarrinho();
                    } else {

                        if (isGtmEnabled()) {
                            PushRemoveFromCartEvent(idCurrent);
                        }

                        if (restrictedDeliveryProduct == false && recalculatedRestrictedProducts == false) {
                            CancelarCalculoFreteCart(0);
                            LoadCarrinho();
                        } else {
                            $('#itemCartProduct_' + idCurrent).remove();
                            LoadCarrinho();
                        }
                    }
                }
            });
        }
    });
}

function PushRemoveFromCartEvent(idCurrent) {
    let cartItem = document.querySelector(`[data-id-cart='${idCurrent}']`);
    let cartButon = cartItem.querySelector("[data-id-produto][data-id-sku]");
    let idSku = cartButon.getAttribute('data-id-sku');
    let idProduct = cartButon.getAttribute('data-id-produto');
    var initialQuantity = Number($("#qtdInicial_" + idCurrent).val());
    getProductAndPushRemoveFromCartEvent({ idProduct: idProduct, idSku: idSku, quantity: initialQuantity });
}

//FUNÇÕES
export function CancelarCalculoFreteCart(flagUpdate) {
    limparFrete();

    $(".description.frete").css("display", "block");
    $(".description.resultado").css("display", "none");
    $.ajax({
        method: "POST",
        url: "/Checkout/CancelarCalculoFrete",
        data: {},
        success: function (data) {
            if (data.success === false) {
                //console.log("Erro ao excluir frete");
            }

            if (flagUpdate === 1) {
                UpdateCarrinho();
            }

        },
        onFailure: function (data) {
            //console.log("Erro ao excluir frete");
        }
    });
}

export function LoadingCart(loading) {
    if (loading) {
        isLoading("#miniCarrinho");
        isLoading("#ListProductsCheckoutCompleto");
    }
}

export function disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization = 0, loading = false) {
    CancelarCalculoFreteCart(0);

    var qtdInicial = $("#qtdInicial_" + idCurrent).val();

    let product = $("#itemCartProduct_" + idCurrent),
        idCompraAutomaticaTipoEntregaStorage = CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue),
        idCompraAutomaticaTipoEntrega = null;

    if (product.attr("data-signature").toLowerCase() == "true" && idCompraAutomaticaTipoEntregaStorage !== null)
        idCompraAutomaticaTipoEntrega = parseInt(idCompraAutomaticaTipoEntregaStorage);

    $.ajax({
        method: "POST",
        url: "/Checkout/UpdateProduct",
        data: {
            idCartItem: idCurrent,
            Quantity: valorInput,
            idCompraAutomaticaTipoEntrega,
            idCartPersonalization
        },
        success: function (data) {
            if (data.success === true) {

                if (isGtmEnabled()) {
                    pushAddOrRemoveGtmEvent(idCurrent, valorInput, qtdInicial);
                }

                $("#qtdInicial_" + idCurrent).val(valorInput);

                UpdateCarrinho();

                LoadingCart(loading)

            } else {

                swal({
                    text: data.msg,
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });

                if (action == "plus") {
                    valorInput -= 1;
                    $("#qtd_" + idCurrent).val(valorInput);
                } else if (action == "ipt") {
                    $("#qtd_" + idCurrent).val(qtdInicial);
                }
                else {
                    valorInput += 1;
                    $("#qtd_" + idCurrent).val(qtdInicial);
                }

                LoadingCart(loading)
            }
        },
        onFailure: function (data) {
            if (action == "plus") {
                valorInput -= 1;
            } else {
                valorInput += 1;
            }
        }
    });
}

function pushAddOrRemoveGtmEvent(idCurrent, valorInput, qtdInicial) {
    let cartItem = document.querySelector(`[data-id-cart='${idCurrent}']`);
    let cartButon = cartItem.querySelector("[data-id-produto][data-id-sku]");
    let idSku = cartButon.getAttribute('data-id-sku');
    let idProduct = cartButon.getAttribute('data-id-produto');
    let incrementProductQuantity = valorInput > qtdInicial;
    let difference = Math.abs(valorInput - qtdInicial);

    if (incrementProductQuantity) {
        getProductAndPushAddToCartEvent({ idProduct: idProduct, idSku: idSku, quantity: difference });
    } else {
        getProductAndPushRemoveFromCartEvent({ idProduct: idProduct, idSku: idSku, quantity: difference });
    }
}

function ChangeFrete() {
    $("#GetShipping .ShippingValueBox").unbind().click(function () {
        var ponteiroCurrent = $(this).find(".ShippingValue");
        $(".ShippingValue").prop("checked", false).removeAttr("checked");
        ponteiroCurrent.prop("checked", true);

        var idCurrent = $(ponteiroCurrent).val();
        var zipCode = $("#shipping").cleanVal();
        var idShippingMode = idCurrent;
        var deliveredByTheCorreiosService = $(ponteiroCurrent).attr("data-correios");
        var carrier = $(ponteiroCurrent).data("carrier");
        var mode = $(ponteiroCurrent).data("mode");
        var hub = $(ponteiroCurrent).data("hub");
        var recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val()
        var pickUpStore = $(ponteiroCurrent).data("pickupstore");

        if ($("#recalculatedRestrictedProducts").length) {
            if (pickUpStore.toLowerCase() === 'false' && recalculatedRestrictedProducts && $(".productRestrictedMessage").is(":visible")) {
                _alert("Aviso!", "Não é possível selecionar o frete, pois existem produtos que não podem ser entregues para este endereço.", "warning", true);
                ponteiroCurrent.prop("checked", false).removeAttr("checked");
                return;
            }
        }

        $("#id_frete_selecionado").val(idShippingMode);
        $("#cep_selecionado").val(zipCode);

        isLoading("#miniCarrinho");

        SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService, carrier, mode, hub, true);
    });
}


function SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService, carrier, mode, hub, loading = false) {
    $.ajax({
        method: "POST",
        url: "/Checkout/SaveFrete",
        data: {
            zipCode: zipCode,
            idShippingMode: idShippingMode,
            deliveredByTheCorreiosService: deliveredByTheCorreiosService,
            carrier: carrier,
            mode: mode,
            hub: hub
        },
        success: function (data) {

            UpdateCarrinho();

            isLoading("#miniCarrinho");
        }
    });
}

function CalculaFreteMiniCarrinho(zipCode, recalculaFrete = true) {
    $('#CallServiceShippingMiniCart').addClass("loading");
    shippingCalculateMiniCart(true)
    if (zipCode != "") {
        $.ajax({
            method: "POST",
            url: "/Checkout/GetShippingValuesV2",
            data: { zipCode: zipCode },
            success: function (data) {
                if (data.success == true) {
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    $(".description.frete").hide();
                    $(".description.resultado .valor").html(data.result); //preenche conteudo HTML
                    $(".description.resultado").show();

                    if ($("#recalculatedRestrictedProducts").length) {
                        var recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val()
                        if (recalculatedRestrictedProducts.toLowerCase() == 'true') {
                            $(".productRestrictedMessage").show();
                        }
                    }

                    ChangeFrete();
                }
                else {
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    $("#zipcode").val(zipCode);

                    if (data.relocateCD == true) {
                        buscaCepCD(zipCode).then(function () {
                            changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                                LoadCarrinho();
                            });
                        });
                        return;
                    }

                    swal({
                        title: data.title,
                        text: data.message,
                        type: data.type,
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        LoadCarrinho();
                        if (data.recalculateShipping == true && recalculaFrete == true)
                            CalculaFreteMiniCarrinho(zipCode, false); //recalcula frete
                    });
                }

                shippingCalculateMiniCart(false);
            },
            error: function (error) {
                $('#CallServiceShippingMiniCart').removeClass('loading');
                swal({
                    title: error.title,
                    text: error.message,
                    type: error.type,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
        });
    } else {
        swal({
            title: '',
            text: 'Digite um CEP válido!',
            type: 'error',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
        $('#CallServiceShippingMiniCart').removeClass('loading');
    }
}

export function ExibirDicadeFrete(shippingID, zipcode) {
    if (zipcode == "" || zipcode == "0")
        return;

    $.ajax({
        method: "GET",
        url: "/Checkout/ObterDicaFrete",
        data: {
            zipcode: zipcode,
            shippingID: shippingID
        },
        success: function (data) {
            //EXIBE LINHA FRETE
            if (data.success === true) {
                $("#dica_frete").removeClass("hideme");
                $("#descricao_dica").text(data.msg);
            } else {
                $("#dica_frete").addClass("hideme");
                $("#descricao_dica").text("");
            }
            montaListaProdutos();
        },
        onFailure: function (data) {
            //console.log("Erro ao buscar dica de frete");
        }
    });
}

export function limparFrete() {
    $("#id_frete_selecionado").val("");
    $("#cep_selecionado").val("");
}


export function createModelExhausted(element) {
    
    if($(".modal-exhausted").length === 0)
        $("body").append('<div class="ui tiny modal modal-exhausted"><i class="close icon"></i><div class="scrolling content"><div class="ui divided very relaxed list" id="list-exhausted"></div></div><div class="actions"><div class="ui action approve button" id="removeExhausted"><i class="trash alternate icon"></i>Excluir Produtos</div></div></div>')

    var imageProduct = "",
        nameProduct = "",
        idCart = "",
        html = "",
        modal = ".modal-exhausted",
        container = "#list-exhausted",
        total = $(">.item.exhausted", element).length;

    $(".header", modal).remove()
    $(container, modal).html('')


    $(modal).prepend('<div class="header">Ops... <span>' + (total > 1 ? "existem <strong>"+(total < 10 ? '0'+total : total)+" produtos</strong> esgotados" : "existe <strong>01 produto</strong> esgotado") + ' no seu carrinho.</span></div>')

    $(">.item.exhausted", element).each(function() {
        
        idCart = $(this).data("id-cart");
        imageProduct = $(">.image img", this).attr("src");
        nameProduct = $(">.content .nameProduct", this).html();
        
        html += '<div class="item" data-idCart="'+idCart+'"><div class="ui tiny image"><img src="'+imageProduct+'" /></div><div class="content">'+nameProduct+'</div></div>';      
        
    })
    
       
    $(container, modal).html(html);
    
    $(modal).modal('show');

    $("#removeExhausted").on("click", function() {
        
        $(this).addClass("loading");

        $(">.item.exhausted", element).each(function() {
            
            var $this = $(this),
                $idCart = $this.data("id-cart"),
                idCartPersonalization = $this.data('id-personalization-cart');

            $.ajax({
                method: "POST",
                url: "/Checkout/DeleteProduct",
                async: false,
                data: {
                    idCartItem: $idCart,
                    idCartPersonalization
                },
                success: function (data) {

                    if (data.success === true) {

                        $("#itemCartProduct_" + $idCart).remove();

                        if ($('#formas-pagamento').length > 0) {
                            if ($("[id^=itemCartProduct_]", "#checkout_products_list").length === 0) {
                                swal({
                                    title: 'Ops ... Seu carrinho agora está vazio!',
                                    html: 'Estamos te direcionando para a Home!',
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    window.location.href = "/home";
                                });

                            } else {
                                atualizaResumoCarrinho(false);
                            }
                        } else {
                            LoadCarrinho();
                        }
                    } else {
                        swal({
                            text: data.msg,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        });

                        $("#itemCartProduct_" + idCurrent).remove();

                        if ($('#formas-pagamento').length > 0)
                            atualizaResumoCarrinho(false);
                        else
                            LoadCarrinho();
                    }
                    
                }
            });
            
        });

    })
  
    
}