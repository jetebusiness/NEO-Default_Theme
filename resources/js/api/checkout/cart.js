import { isLoading } from "../api_config";
import { _alert, _confirm } from '../../functions/message';
import { createModelExhausted, ExibirDicadeFrete, disparaAjaxUpdate, LoadingCart, RecalcularFrete } from "./mini_cart";
import { UpdateCarrinho, UpdateUnitPrice } from "../../functions/mini_cart_generic";
import { SomenteNumerosPositivos } from "../../functions/form-control";
import { CompraRecorrenteStorage, CompraRecorrenteCart } from '../../functions/recurringPurchase';
import { atualizaResumoCarrinho } from './payment'
import { buscaCepCD, changeCd } from "../../ui/modules/multiCd";
import { loading } from "../../functions/loading";
import { debounce } from "../../functions/util"; 
import { isGtmEnabled, getProductAndPushRemoveFromCartEvent } from "../../api/googleTagManager/googleTagManager";

function InserirQuantidadeManual() {
    $(document).on("keyup", "#ListProductsCheckoutCompleto input[id^='qtd_']", debounce(updateQuantity, 1000));
}

function updateQuantity(e) {
    let initialQuantity = $("#qtdInicial_" + $(this).attr("data-id")).val();

    if (initialQuantity == $(this).val()) {
        return;
    }

    if ($(this).val().length > 0) {
        CancelarCalculoFreteCart(1);
        var valor_final = SomenteNumerosPositivos($(this).val());
        $(this).val(valor_final);
        $("#id_frete_selecionado").val("");
        $("#cep_selecionado").val("");
        // $("#btn_recalcular_frete").click();

        var action = $(this).attr("data-action");
        var idCurrent = $(this).attr("data-id");
        var valorInput = new Number($("#qtd_" + idCurrent).val());
        var valorStock = new Number($("#stock_" + idCurrent).val());
        var idCartPersonalization = $(this).attr("data-id-personalization-cart");

        if (valorInput <= valorStock) {
            disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
        }
        else {
            _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
            valorInput -= 1
        }

        $("#qtd_" + idCurrent).val(valorInput);
        e.stopPropagation();
    }
}

function AddMinusProductCart() {
    $(".qtdAction").on("click", function (event) {
        
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
            if (valorInput <= valorStock) {
                isLoading("#ListProductsCheckoutCompleto");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
            else {
                _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
                valorInput -= 1
            }
        }
        else {
            valorInput -= 1;
            if (valorInput <= 0) {
                valorInput = 1;
            }
            else {
                isLoading("#ListProductsCheckoutCompleto");
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
        }
        $("#qtd_" + idCurrent).val(valorInput);
    });
}

function RemoveProductCart() {
    $(".removeCartItem").click(function (event) {
        var idCurrent = $(this).attr("data-id"),
            idCartPersonalization = $(this).data('id-personalization-cart'),
            restrictedDeliveryProduct = $(this).data('restricted-delivery'),
            recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val(),
            $this = $(this);

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
                LoadingCart(loading)
                $.ajax({
                    method: "POST",
                    url: "/Checkout/DeleteProduct",
                    data: {
                        idCartItem: new Number(idCurrent),
                        idCartPersonalization
                    },
                    success: function (data) {
                        LoadingCart(loading)
                        if (data.success === true) {
                            if (isGtmEnabled()) {
                                pushRemoveFromCartEvent(idCurrent)
                            }
                            
                            $this.closest('[id^=itemCartProduct_]').remove();                              
                                
                            if($("[id^=itemCartProduct_]", "#checkout_products_list_cart").length === 0){

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

                            if (recalculatedRestrictedProducts != undefined && restrictedDeliveryProduct.toLowerCase() == 'false' && recalculatedRestrictedProducts.toLowerCase() == 'false') {
                                CancelarCalculoFreteCart(1, 1);
                            }
                        }
                        else {
                            swal({
                                text: data.msg,
                                type: 'warning',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'OK'
                            });

                            $this.closest('[id^=itemCartProduct_]').remove();

                            if ($this.hasClass("payment-cart")) {
                                atualizaResumoCarrinho(false);
                            }
                        }
                    }
                });
            }
        });
    });
}

function pushRemoveFromCartEvent(idCurrent) {
    let cartItem = document.querySelector(`[data-id-cart='${idCurrent}']`);
    let cartButon = cartItem.querySelector("[data-id-produto][data-id-sku]");
    let idSku = cartButon.getAttribute('data-id-sku');
    let idProduct = cartButon.getAttribute('data-id-produto');
    var initialQuantity = Number($("#qtdInicial_" + idCurrent).val());

    getProductAndPushRemoveFromCartEvent({ idProduct: idProduct, idSku: idSku, quantity: initialQuantity })
}

function shippingCalculateCart(status) {
    $(".qtdAction").prop("disabled", status);
    $(".removeCartItem").prop("disabled", status);
    $(".qtdProduct").prop("disabled", status);
    $("#ClearCart").prop("disabled", status);
}

function LoadServiceShipping() {
    $("#CallServiceShipping").click(function (event) {
        $(".ui.dimmer.modals.page.transition.hidden").html("");
        var zipCode = $("#shipping").val();
        $.ajax({
            method: "POST",
            url: "/Checkout/ChangeZipCode",
            data: {
                zipCode: zipCode
            },
            success: function (response) {
                if (response != "False") {
                    CalculaFreteCarrinho(zipCode, true)
                } else {
                    swal({
                        html: 'Os produtos da loja foram atualizados conforme sua região.',
                        type: 'warning',
                        title: 'Região atualizada!',
                        showCancelButton: false,
                        confirmButtonColor: '#4DA930',
                        confirmButtonText: 'OK',
                    }).then(function () {
                        document.location.reload()
                    }).catch(function () {
                    });
                }
            }
        })
        event.stopPropagation();
    });
}

export function LoadCarrinho() {
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadPartialCart",
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            var objCarrinho;
            if (response.success === true) {
                objCarrinho = jQuery.parseJSON(response.cartJson);

                for (var i = 0; i < objCarrinho.cartItems.length; i++) {
                    var idCartItem = objCarrinho.cartItems[i].idCartItem;
                    var precoTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceTotalProduct);
                    var precoUnt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceProduct);
                    var quantidade = objCarrinho.cartItems[i].quantity;

                    $("#preco_total_" + idCartItem).text(precoTotal);
                    $("#preco_unitario_" + idCartItem).text(precoUnt);
                }

                var descontoCarrinho = objCarrinho.totalDiscount;
                var subTotalCarrinho = objCarrinho.subTotal;
                var totalCarrinho = objCarrinho.total;

                UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho);

                for (var i = 0; i < objCarrinho.cartItems.length; i++) {
                    var idCartItem = objCarrinho.cartItems[i].idCartItem;
                    var quantidade = objCarrinho.cartItems[i].quantity;
                    UpdateUnitPrice(idCartItem, quantidade, objCarrinho.cartItems[i].priceProduct);
                }
                LoadingCart(loading);
            }
            else {
                LoadingCart(loading);
                swal({
                    title: 'Seu carrinho agora está vazio!',
                    html: 'Estamos te direcionando para a pagina inicial!',
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#16ab39',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then(function () {
                    window.location.href = "/";
                });
            }
        }
    });
}

function UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho) {
    descontoCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(descontoCarrinho);
    subTotalCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subTotalCarrinho);
    totalCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCarrinho);

    $("#descontoCarrinho").text(descontoCarrinho);
    $("#subTotalCarrinho").text(subTotalCarrinho);
    $("#totalCarrinho").text(totalCarrinho);
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
            LoadCarrinho();
        }
    });
}

function ChangeFrete() {
    $("#GetShipping .ShippingValueBox").unbind().click(function () {
        var ponteiroCurrent = $(this).find(".ShippingValue");
        $(".ShippingValue").prop("checked", false).removeAttr("checked");
        ponteiroCurrent.prop("checked", true);

        var idCurrent = $(ponteiroCurrent).val();
        var zipCode = $("#shipping").cleanVal();
        var idShippingMode = idCurrent;
        var recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val()

        var deliveredByTheCorreiosService = $("#ship_" + idCurrent).attr("data-correios");
        var carrier = $("#ship_" + idCurrent).data("carrier");
        var mode = $("#ship_" + idCurrent).data("mode");
        var hub = $("#ship_" + idCurrent).data("hub");
        var pickUpStore = $("#ship_" + idCurrent).data("pickupstore");

        if ($("#recalculatedRestrictedProducts").length) {
            if (pickUpStore.toLowerCase() === 'false' && recalculatedRestrictedProducts && $(".productRestrictedMessage").is(":visible")) {
                _alert("Aviso!", "Não é possível selecionar o frete, pois existem produtos que não podem ser entregues para este endereço.", "warning", true);
                ponteiroCurrent.prop("checked", false).removeAttr("checked");
                return;
            }
        }

        isLoading("#ListProductsCheckoutCompleto");

        SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService, carrier, mode, hub, true);
        ExibirDicadeFrete(idShippingMode, zipCode);
    });
}

export function CancelarCalculoFreteCart(flagUpdate = 0, loadCarrinho = 0) {
    var existeCep = $("#cep_selecionado").val();
    if (existeCep != "") {
        $("#id_frete_selecionado").val("");
        $("#cep_selecionado").val("");
        $(".description.frete").css("display", "block");
        $(".description.resultado").css("display", "none");
        $.ajax({
            method: "POST",
            url: "/Checkout/CancelarCalculoFrete",
            data: {},
            success: function (data) {
                if (flagUpdate === 1)
                    UpdateCarrinho();

                if (loadCarrinho === 1)
                    LoadCarrinho();
            }
        });
    }
}

function CancelarCalculoFreteClk() {
    $(document).on("click", "#ListProductsCheckoutCompleto #btn_recalcular_frete", function (event) {
        CancelarCalculoFreteCart(1);
    });
}

function loadCompraRecorrente() {
    if ($(CompraRecorrenteCart.selectBox.id).length > 0) {

        let recurringPurchaseCartObj = [],
            options = CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownOptions) !== null ? JSON.parse(CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownOptions)) : [];

        // Caso as opcoes de recorrencia nao estejam na storage, monta o objeto a partir do html
        if (options.length === 0) {
            $(CompraRecorrenteCart.selectBox.id).find("select option").each(function () {
                let idCompraAutomaticaTipoEntrega = $(this).val(),
                    tipoEntrega = $(this).text();

                if (idCompraAutomaticaTipoEntrega != "")
                    recurringPurchaseCartObj.push({ idCompraAutomaticaTipoEntrega, tipoEntrega });
            });
            options = CompraRecorrenteCart.selectBox.dropdown.getDropdownOptions(recurringPurchaseCartObj);
        }

        CompraRecorrenteCart.selectBox.dropdown.instanceDropdown(options);

        let value = CompraRecorrenteCart.selectBox.dropdown.getDropdownStorageValue(),
            valueInOptions = CompraRecorrenteCart.selectBox.dropdown.checkValueInOptions(value, options);

        CompraRecorrenteCart.buttonCart(valueInOptions);
    }
}

function LoadRetirarCart() {
    $('#frete-receber-cart').click(function (e) {
        $("#hdnRetirarCart").val("false");
        $('#CallServiceShipping').trigger('click');
    });
    $('#frete-retirar-cart').click(function (e) {
        $("#hdnRetirarCart").val("true");
        $('#CallServiceShipping').trigger('click');
    });
}

export function limparFrete() {
    $("#id_frete_selecionado").val("");
    $("#cep_selecionado").val("");
}

function CalculaFreteCarrinho(zipCode, recalculaFrete = true) {
    let RetirarLoja = "";
    if ($("#hdnRetirarCart").val() != undefined) {
        RetirarLoja = $("#hdnRetirarCart").val();
    }

    shippingCalculateCart(true)
    $("#CallServiceShipping, #frete-receber-cart, #frete-retirar-cart").addClass("loading");
    var zipCode = $("#shipping").val();
    if (zipCode != "") {
        $.ajax({
            method: "POST",
            url: "/Checkout/GetShippingValuesV2",
            data: {
                zipCode: zipCode,
                RetirarLoja: RetirarLoja
            },
            success: function (data) {
                if (RetirarLoja == "true") {
                    $("#frete-receber-cart").removeClass('primary');
                    $("#frete-retirar-cart").removeClass('basic');
                    $("#frete-receber-cart").addClass('basic');
                    $("#frete-retirar-cart").addClass('primary');
                } else {
                    $("#frete-receber-cart").removeClass('basic');
                    $("#frete-retirar-cart").removeClass('primary');
                    $("#frete-receber-cart").addClass('primary');
                    $("#frete-retirar-cart").addClass('basic');
                }
                const urlParams = new URLSearchParams(window.location.search);
                const zipCodeParam = urlParams.get('zipcode') ? urlParams.get('zipcode').replace("-", "") : "";
                var zipCodeReplace = zipCode.replace("-", "");
                if (data.success == true) {
                    if (zipCodeParam && zipCodeParam.length > 0 && zipCodeParam != zipCodeReplace) {
                        swal({
                            html: 'Os produtos da loja foram atualizados conforme sua região.',
                            type: 'warning',
                            title: 'Região atualizada!',
                            showCancelButton: false,
                            confirmButtonColor: '#4DA930',
                            confirmButtonText: 'OK',
                        }).then(function () {
                            document.location.href = '/checkout?zipcode=' + zipCode
                        }).catch(function () {
                        });
                    } else {
                        $("#CallServiceShipping, #frete-receber-cart, #frete-retirar-cart").removeClass("loading");
                        $(".description.frete").hide();
                        $(".description.resultado .valor").html(data.result); //preenche conteudo HTML
                        $(".description.resultado").show();

                        if ($("#recalculatedRestrictedProducts").length) {
                            var recalculatedRestrictedProducts = $("#recalculatedRestrictedProducts").val()
                            if (recalculatedRestrictedProducts.toLowerCase() == 'true') {
                                $(".productRestrictedMessage").show();
                            }
                        }

                        $(".modal-shipping-button-cart-b2c").on("click", function (e) {
                            e.preventDefault();
                            $(".modal-shipping-description-cart-b2c-" + e.currentTarget.attributes["data-id"].value).modal("show");
                            e.stopPropagation();
                        })

                        ChangeFrete();
                    }
                }
                else {
                    if (data.message == "Direcionar Carrinho") {
                        swal({
                            html: 'Para finalizar sua compra, atualize os itens de seu carrinho conforme disponibilidade em nosso centro de distribuição.',
                            type: '',
                            showCancelButton: false,
                            confirmButtonColor: '#4DA930',
                            confirmButtonText: 'Voltar ao carrinho',
                        }).then(function () {
                            document.location.href = '/checkout?zipcode=' + zipCode
                        }).catch(function () {
                        });
                    } else {
                        if (!data.relocateCD && zipCodeParam && zipCodeParam.length > 0 && zipCodeParam != zipCodeReplace) {
                            swal({
                                html: 'Para finalizar sua compra, atualize os itens de seu carrinho conforme disponibilidade em nosso centro de distribuição.',
                                type: '',
                                showCancelButton: false,
                                confirmButtonColor: '#4DA930',  
                                confirmButtonText: 'Voltar ao carrinho',
                            }).then(function () {
                                document.location.href = '/checkout?zipcode=' + zipCode
                            }).catch(function () {
                            });
                        } else {
                            $("#CallServiceShipping, #frete-receber-cart, #frete-retirar-cart").removeClass("loading");
                            $("#zipcode").val(zipCode);

                            if (data.relocateCD == true) {
                                buscaCepCD(zipCode).then(function () {
                                    changeCd(true, false, "#CallServiceShipping", false, true, true, 0, RetirarLoja);
                                });
                                return false;
                            }

                            if (RetirarLoja == "true") {
                                $(".description.frete").hide();
                                $(".description.resultado .valor").html(data.message);
                                $(".description.resultado").show();
                            } else {
                                $(".description.frete").hide();
                                $(".description.resultado .valor").html(data.message);
                                $(".description.resultado").show();
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
                                $.when(LoadCarrinho()).done(function () {
                                    if (data.recalculateShipping == true && recalculaFrete == true)
                                        window.location.reload(); //atualiza pagina pois carrinho não possui listagem de produtos   
                                });
                            });
                            LoadingCart(loading);
                        }
                        
                    }
                    
                }

                shippingCalculateCart(false);
            },
            error: function (error) {
                $("#CallServiceShipping, #frete-receber-cart, #frete-retirar-cart").removeClass('loading');
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
        $("#CallServiceShipping").removeClass('loading');
    }
}

$(document).ready(function () {
    AddMinusProductCart();
    RemoveProductCart();
    LoadServiceShipping();
    InserirQuantidadeManual();
    CancelarCalculoFreteClk();
    loadCompraRecorrente();
    LoadRetirarCart();

    if ($("#zipcode") != null && $("#zipcode").val().length > 0) {
        $('#shipping').val($("#zipcode").val());
    }
});

$(document).on("click", "#finalizePurchase", function (e) {
    var permiteVenda = $('#permiteVenda').val();

    if (permiteVenda == "False") {
        _alert("Ops... vincule um cliente para finalizar a venda", "", "warning");
        return false;
    }

    if($(".exhausted").length > 0) {
        createModelExhausted("#checkout_products_list_cart");
        return false;
    }

    $.ajax({
        method: "GET",
        url: "/Checkout/CheckoutNext",
        data: {},
        success: function (data) {
            if (data.success === true) {

                if (CompraRecorrenteCart.modalConfig.hasModal())
                    CompraRecorrenteCart.modalConfig.showModal(data.redirect);
                else
                    window.location.href = "/" + data.redirect.toLowerCase()

            } else {
                _alert("Mensagem", data.message, "error")
            }
        }
    });
})

$(document).on("click", ".product-in-card .content > a, .product-in-card .content .info .botoes a.btnDetalhes", function () {
    var div = $(this).parents(".product-in-card");
    var type = $(div).data("purchasetracking-type");
    var value = $(div).data("purchasetracking-value");

    if (type != undefined && value != undefined) {
        let purchasetracking = { type: type, value: value };
        sessionStorage.setItem('purchasetracking', JSON.stringify(purchasetracking));
    }
});

