import { isLoading } from "../api_config";
import { moneyPtBR } from "../../functions/money";
import { ZoomReset } from '../../functions/zoom';
import { _alert, _confirm } from "../../functions/message";
import { openModalQuickView } from "../../functions/modal";
import { LoadCarrinho, LoadCarrinhoEventList } from "../../functions/mini_cart_generic";
import { UpdateCarrinho } from "../../functions/mini_cart_generic";
import { montaListaProdutos } from "../../ui/modules/mini_cart";
import { SomenteNumerosPositivos } from "../../functions/form-control";

$(document).ready(function () {
    $(document).on("click", "#mini-carrinho-checkout", function (event) {

        var total_exhausted = 0;
        $(".exhausted").each(function () {
            var id = $(this).data("id-cart");
            total_exhausted++;
            $("#availability_" + id).css("color", "red");
        });

        if (total_exhausted > 0) {
            _alert("Ops...exclua os produtos esgotados do carrinho", "", "warning");
        } else {
            window.location = '/checkout';
        }
    });

    $(document).on("click", "#btn_finalizar", function (event) {

        var total_exhausted = 0;
        var url = $(this).data("user-url");

        var permiteVenda = $('#permiteVenda').val();

        if (permiteVenda == "False") {
            _alert("Ops... vincule um cliente para finalizar a venda", "", "warning");
            return false;
        }

        $(".exhausted").each(function () {
            var id = $(this).data("id-cart");
            total_exhausted++;
            $("#availability_" + id).css("color", "red");
        });

        if (total_exhausted > 0) {
            _alert("Ops...exclua os produtos esgotados do carrinho", "", "warning");
        } else {
            window.location = url;
        }
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
                    $("#CallServiceShippingMiniCart").removeClass("loading");
                    $(".description.frete").hide();
                    //Coloca as infoamções no Bloco HMTL com os valores corretos
                    $(".description.resultado .valor").html(data);
                    //$(".tabela.frete").dropdown('refresh');
                    $(".description.resultado").show();

                    ChangeFrete();
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
        excluirProdutoCarrinho(idCurrent);
        e.stopPropagation();
    });


    $(document).on("keyup", "#miniCarrinho input[id^='qtd_']", function (e) {
        var valor_final = SomenteNumerosPositivos($(this).val());
        $(this).val(valor_final);

        limparFrete();

        // $("#btn_recalcular_frete").click();

        var action = $(this).attr("data-action");
        var idCurrent = $(this).attr("data-id");
        var valorInput = new Number($("#qtd_" + idCurrent).val());
        var valorStock = new Number($("#stock_" + idCurrent).val());

        //console.log(e);

        isLoading("#miniCarrinho");

        if (valorInput <= valorStock && valorInput < 1000) {
            disparaAjaxUpdate(idCurrent, valorInput, action, true);
        }
        else {
            _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
            valorInput -= 1;
            disparaAjaxUpdate(idCurrent, valorInput, action, true);
        }
        e.stopPropagation();
    });


    $(document).on("click", ".qtdActionMiniCart", function (event) {
        // CancelarCalculoFreteCart(1);
        $(".qtdActionMiniCart").off("click");
        var action = $(this).attr("data-action");
        var idCurrent = $(this).attr("data-id");
        var valorInput = new Number($("#qtd_" + idCurrent).val());
        var valorStock = new Number($("#stock_" + idCurrent).val());

        if (action == "plus") {
            valorInput += 1;
            if (valorInput <= valorStock && valorInput < 1000) {
                disparaAjaxUpdate(idCurrent, valorInput, action);
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
                disparaAjaxUpdate(idCurrent, valorInput, action, true);
            }
        }
        $("#qtd_" + idCurrent).val(valorInput);
    });


    $(document).on("click", "#btn_recalcular_frete", function (event) {
        CancelarCalculoFreteCart(1);
        UpdateCarrinho();
    });


});


function excluirProdutoCarrinho(idCurrent) {
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
                    idCartItem: idCurrent
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



export function disparaAjaxUpdate(idCurrent, valorInput, action, loading = false) {
    CancelarCalculoFreteCart(0);
    var qtdInicial = $("#qtdInicial_" + idCurrent).val();
    $.ajax({
        method: "POST",
        url: "/Checkout/UpdateProduct",

        data: {
            idCartItem: idCurrent,
            Quantity: valorInput
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
                $("#CallServiceShippingMiniCart").removeClass("loading");
                $(".description.frete").hide();
                //Coloca as infoam��es no Bloco HMTL com os valores corretos
                $(".description.resultado .valor").html(data);
                //$(".tabela.frete").dropdown('refresh');
                $(".description.resultado").show();

                ChangeFrete();
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