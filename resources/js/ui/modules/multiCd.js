import { _alert, _confirm } from '../../functions/message';
import { atualizaEnderecos } from '../../api/checkout/payment';

export function atualizaCampos(dados, onlyShow) {
    var obj = $.parseJSON(JSON.stringify(dados));
    if ($("#localidade").length > 0)
        $("#localidade").val(obj.city)
    if ($("#uf").length > 0)
        $("#uf").val(obj.state);
    if (!onlyShow) {
        if ($("#localizacao_old").length > 0)
            $("#localizacao_old").val($("#localizacao").val())
        if ($("#localizacao").length > 0)
            $("#localizacao").val(obj.city + " / " + obj.state + " - ");
    }
}

export async function buscaCepCD(cep, onlyShow = false) {
    await $.ajax({
        method: "GET",
        url: "/customer/LocalizaCep",
        data: {
            cep: cep
        },
        success: function success(response) {
            if (response.success) {
                var obj = $.parseJSON(response.message);
                atualizaCampos(obj, onlyShow);
            } else {
                _alert("", response.message, "warning");
            }
        },
        error: function () {
            alert('Erro');
        }
    });
}

export function showModal() {
    $(".multi-cd-modal").modal({
        closable: false
    }).modal("show");
    setTimeout(function () {
        $(".multi-cd-modal .content").transition({
            animation: 'fade',
            interval: 200
        });
    }, 500)
}

export function hideModal() {
    $(".multi-cd-modal .content").transition({
        animation: 'fade',
        interval: 200
    });
    setTimeout(function () {
        $(".multi-cd-modal").modal("hide");
    }, 500)
}

export async function changeCd(calcShipping = false, redirect = false, shippingButton = "", redirectOnError = false, showMessage = true) {
    if ($("#localizacao").val().length > 0 && ($("#localizacao").val() != $("#localizacao_old").val() || calcShipping) && $("#multiCDActive").val().toLowerCase() == "true") {
        var cep = $("#zipcode").val()
        cep = cep.replace("-", "").replace(" ", "").trim();
        if (cep.length == 8 && $("#localizacao").length > 0) {
            await $.ajax({
                method: "POST",
                url: "/customer/LocateMultiCd",
                data: {
                    cep: cep,
                    localizacao: $("#localizacao").val()
                },
                success: function success(response) {
                    if (response.success == false) {
                        swal({
                            title: 'Indisponível para sua Região!',
                            html: response.message.replaceAll('\"', ""),
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonColor: '#16ab39',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'OK'
                        }).then(function () {
                            if (redirectOnError) {
                                document.location.href = window.location.protocol + "//" + window.location.host + document.location.pathname + (calcShipping ? "?calcShipping=true" : "");
                            } else {
                                hideModal();
                                $.ajax({
                                    method: "POST",
                                    url: "/customer/GetCurrentCD",
                                    success: function success(response) {
                                        if (response) {
                                            $("#shipping").val(response.CEP);
                                            if (shippingButton && shippingButton.length > 0)
                                                $(shippingButton).click()
                                        }
                                    }
                                })
                            }
                            if ($("#updateShippingPayment")) {
                                $("#updateShippingPayment").html("Os produtos não estão disponíveis para sua região.");
                            }
                        })
                    } else {
                        if (response.sameCD == false) {
                            if (showMessage) {
                                swal({
                                    title: 'Região atualizada!',
                                    html: response.message.replaceAll('\"', ""),
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonColor: '#16ab39',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'OK'
                                }).then(function () {
                                    notSameCD(redirect, calcShipping, shippingButton, response.message.replaceAll('\"', ""));
                                }).catch(function () {
                                    notSameCD(redirect, calcShipping, shippingButton, response.message.replaceAll('\"', ""));
                                });
                            } else {
                                notSameCD(redirect, calcShipping, shippingButton, response.message.replaceAll('\"', ""));
                            }
                        } else {
                            $("#headLocation").val($("#localizacao").val())
                            $("#headLocation").text($("#localizacao").val())
                            hideModal()
                            if (shippingButton && shippingButton.length > 0)
                                $(shippingButton).click()
                        }
                    }
                },
                error: function () {
                    swal({
                        title: 'Indisponível para sua Região!',
                        html: response.message.replaceAll('\"', ""),
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#16ab39',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        hideModal();
                        if ($("#updateShippingPayment")) {
                            $("#updateShippingPayment").html("Os produtos não estão disponíveis para sua região.");
                        }
                    });
                }
            });
        }
    } else {
        hideModal()
    }
    $("#selecionar").removeClass('loading');
}

export async function changeCdCheckout() {
    if ($("#multiCDActive").val().toLowerCase() == "true") {
        var cep = $("#zipcode").val()
        cep = cep.replace("-", "").trim();
        if (cep.length == 8 && $("#localizacao").length > 0) {
            await $.ajax({
                method: "POST",
                url: "/checkout/VerifyCDCheckout",
                data: {
                    cep: cep
                },
                success: function success(response) {
                    if (response.replaceAll('\"', "") == "Mesmo CD") {
                        atualizaEnderecos();
                    } else if (response.replaceAll('\"', "").length != 0){
                        changeAddress(response);
                    } else {
                        changeCd(false, true, undefined, false, true);
                    }
                    
                },
                error: function () {
                    changeAddress();
                }
            });
        }
    } else {
        atualizaEnderecos();
    }
}

function changeAddress(response) {
    swal({
        title: 'Indisponível para sua Região!',
        html: response,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16ab39',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Não',
        confirmButtonText: 'Sim'
    }).then(function () {
        localStorage.setItem('multiCdAddress', response);
        $("#listAddressPayment").click()
    }).catch(function () {
        if (response.indexOf('redirecionado') == -1) {
            changeCd(false, true, undefined, false, false)
        } else {
            $.ajax({
                method: "POST",
                url: "/Checkout/ClearCart",
                success: function (data) {
                    window.location.href = "/home";
                }
            });
        }
    });
}

function notSameCD(redirect, calcShipping, shippingButton, response) {
    if (redirect) {
        if (document.location.pathname == '/checkout' && response.indexOf('redirecionado') > -1)
            document.location.href = '/';
        else 
            document.location.href = window.location.protocol + "//" + window.location.host + document.location.pathname + (calcShipping ? "?calcShipping=true" : "");
    } else {
        $("#headLocation").val($("#localizacao").val())
        $("#headLocation").text($("#localizacao").val())
        hideModal()
        if (shippingButton && shippingButton.length > 0)
            $(shippingButton).click()
    }
}

$(function () {
    $("#error-zipcode-multiCd").hide();
    if ($(".multi-cd-modal").length > 0 &&
        $("#showMultiCdModal").attr("data-show-multicd-modal").toLowerCase() == 'true' &&
        (!sessionStorage.getItem("modalMultiCDDismissed") || sessionStorage.getItem("modalMultiCDDismissed") == 'false') &&
        document.location.href.indexOf('checkout') == -1
    ) {
        showModal()
    }
    $("#zipcode").keyup(function (event) {
        var cep = $("#zipcode").val().replace("-", "");
        if (cep.length == 8) {
            $("#error-zipcode-multiCd").hide();
            buscaCepCD(cep, true).then(function () {
                return;
            })
        } else {
            $("#error-zipcode-multiCd").show();
        }
    });
    $("#selecionar").click(function (event) {
        event.preventDefault()
        $("#selecionar").addClass('loading');
        var cep = $("#zipcode").val().replace("-", "");
        if (cep.length == 8) {
            buscaCepCD(cep).then(function () {
                changeCd(false, true, undefined, true, true);
            })
        }
    })
    $("#closeMultiCD").click(function (event) {
        event.preventDefault()
        sessionStorage.setItem('modalMultiCDDismissed', true)
        hideModal()
    })
    $("#changeLocation").click(function (event) {
        if ($(".multi-cd-modal").length > 0) {
            showModal();
        }
    })
})