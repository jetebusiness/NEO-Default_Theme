import { isLoading } from "../api_config";
import { _alert, _confirm } from "../../functions/message";
import { LoadCarrinho, LoadCarrinhoEventList } from "../../functions/mini_cart_generic";
import { UpdateCarrinho } from "../../functions/mini_cart_generic";
import { montaListaProdutos } from "../../ui/modules/mini_cart";
import { SomenteNumerosPositivos } from "../../functions/form-control";
import { CompraRecorrenteCart, CompraRecorrenteStorage } from '../../functions/recurringPurchase';
import { atualizaResumoCarrinho } from './payment'
import { buscaCepCD, changeCd } from "../../ui/modules/multiCd";

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

        if($(".exhausted").length > 0) {
            createModelExhausted("#ListProductsCheckout");
            return false;
        }
        
        if (CompraRecorrenteCart.modalConfig.hasModal())
            CompraRecorrenteCart.modalConfig.showModal(url);
        else
            window.location = url;
        
    });

    $(document).on("click", "#CallServiceShippingMiniCart", function (event) {
        $(this).addClass("loading");
        var zipCode = $(this).prev('input').cleanVal();
        if (zipCode != "") {
            $.ajax({
                method: "POST",
                url: "/Checkout/GetShippingValues",
                data: { zipCode: zipCode },
                success: function (data) {
                    if (data.indexOf("|@|&RR0RM&SS@G&|@|CD:") > -1)
                    {
                        $("#CallServiceShippingMiniCart").removeClass("loading");
                        $("#zipcode").val(zipCode);
                        buscaCepCD(zipCode).then(function () {
                            changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                                LoadCarrinho();
                            });
                        });
                    }
                    else
                    {
                        $("#CallServiceShippingMiniCart").removeClass("loading");
                        $(".description.frete").hide();
                        //Coloca as infoamções no Bloco HMTL com os valores corretos
                        $(".description.resultado .valor").html(data);
                        //$(".tabela.frete").dropdown('refresh');
                        $(".description.resultado").show();

                        ChangeFrete();
                    }
                },
                error: function (error) {
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    if (error.responseText.indexOf("CD:1") > -1 || error.responseText.indexOf("CD:2") > -1) {
                        $("#zipcode").val(zipCode)
                        buscaCepCD(zipCode).then(function () {
                            changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                                LoadCarrinho()
                            });
                        })
                    }
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
            $(this).removeClass('loading');
        }
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
            window.location.href = "/Checkout";
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
                $.ajax({
                    method: "POST",
                    url: "Checkout/ClearCart",
                    success: function (data) {
                        window.location.href = "/home";
                    }
                });
            }
        });
    });


    $(document).on("click", "#miniCarrinho .removeCartItem", function (e) {
        var idCurrent = new Number($(this).attr("data-id"));
        var idCartPersonalization = new Number($(this).attr("data-id-personalization-cart"));
        excluirProdutoCarrinho(idCurrent, idCartPersonalization);
        e.stopPropagation();
    });


    $(document).on("keyup", "#miniCarrinho input[id^='qtd_']", function (e) {
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
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
            else {
                _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
                valorInput -= 1;
                disparaAjaxUpdate(idCurrent, valorInput, action, idCartPersonalization, true);
            }
            e.stopPropagation();
        }
    });

    $(document).on("blur", "#miniCarrinho input[id^='qtd_']", function (e) {
        if ($(this).val().length == 0) {
            $(this).val(1);

            limparFrete();

            var action = $(this).attr("data-action");
            var idCurrent = $(this).attr("data-id");
            var valorInput = new Number($(this).val());
            var valorStock = new Number($("#stock_" + idCurrent).val());
            var idCartPersonalization = $(this).attr("data-id-personalization-cart");

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
    });

    $(document).on("click", ".qtdActionMiniCart", function (event) {
        // CancelarCalculoFreteCart(1);
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

    //Limpar os Fretes que consta no carrinho a cada refresh
    if ($("#PaymentLinkChangeBrand").val() == undefined || $("#PaymentLinkChangeBrand").val() == "0")
    {
        CancelarCalculoFreteCart(0);
    }

});


function excluirProdutoCarrinho(idCurrent, idCartPersonalization) {
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
            CancelarCalculoFreteCart(0);
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
                        LoadCarrinho();
                    }
                }
            });
        }
    });
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

                if (loading)
                    isLoading("#miniCarrinho");

                UpdateCarrinho();

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

                if (loading)
                    isLoading("#miniCarrinho");
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
            if (loading)
                isLoading("#miniCarrinho");

            UpdateCarrinho();
        }
    });
}

export function RecalcularFrete(zipCode) {
    if (zipCode != "") {
        $.ajax({
            method: "POST",
            url: "/Checkout/GetShippingValues",
            data: { zipCode: zipCode },
            success: function (data) {
                if (data.indexOf("|@|&RR0RM&SS@G&|@|CD:") > -1)
                {
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    $("#zipcode").val(zipCode);
                    buscaCepCD(zipCode).then(function () {
                        changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                            LoadCarrinho();
                        });
                    });
                }
                else
                {
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    $(".description.frete").hide();
                    //Coloca as infoam��es no Bloco HMTL com os valores corretos
                    $(".description.resultado .valor").html(data);
                    //$(".tabela.frete").dropdown('refresh');
                    $(".description.resultado").show();

                    ChangeFrete();
                }
            },
            error: function (error) {
                $("#CallServiceShippingMiniCart").removeClass("loading");
                if (error.responseText.indexOf("Mudanca de CD.") > -1) {
                    $("#zipcode").val(zipCode)
                    buscaCepCD(zipCode).then(function () {
                        changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                            LoadCarrinho()
                        });
                    })
                } else if (error.responseText.indexOf("Nenhum CD configurado.") > -1) {
                    $("#zipcode").val(zipCode)
                    buscaCepCD(zipCode).then(function () {
                        changeCd(true, false, "#CallServiceShippingMiniCart", false, true).then(function (response) {
                            LoadCarrinho()
                        });
                    })
                }
            }
        });
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
                                    window.location.href = "/Home";
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