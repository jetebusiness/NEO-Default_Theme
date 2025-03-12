import { updateQuantidadeTopoCarrinho } from "./cart_manipulation";
import { ExibirDicadeFrete } from "../api/checkout/mini_cart";
import { isLoading } from "../api/api_config";
import { CompraRecorrenteStorage, CompraRecorrenteCart } from '../functions/recurringPurchase';

export function LoadCarrinho(showSidebar) {
    $("#ListProductsCheckout").html('<div class="row text center"><img src="/assets/image/loading.svg"></div>')
    
    if (showSidebar === null) showSidebar = false;
    return $.ajax({
        method: "GET",
        url: "/Checkout/LoadProductsMiniCart",
        cache: false,
        success: function (loadProduct) {
            var retornoAjax = loadProduct.split("|$|");
            var listaProdutos = retornoAjax[0];
            $("#ListProductsCheckout").html(listaProdutos);
            UpdateCarrinho(showSidebar);

            var isRecurrent = false;
            var signatureElement = document.querySelector('[data-signature]'); 
            if (signatureElement) {
                var signatureValue = signatureElement.getAttribute('data-signature');
                isRecurrent = (signatureValue === "True"); 
            }
            if (isRecurrent) {
                document.querySelector(".discountCartBlock").style.display = "none";
            } else {
                document.querySelector(".discountCartBlock").style.display = "block";
            }

            updateDiscountUI();
        }
    });
}

export function UpdateUnitPrice(idCartItem, quantity, priceProduct) {
    var precoUnt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceProduct);
    var inputId = "#preco_unitario_" + idCartItem;

    $(inputId).text(quantity > 1 ? quantity + "x " + precoUnt : precoUnt);
}

export function UpdateCarrinho(showSidebar) {
    isLoading("#miniCarrinho");
    isLoading("#ListProductsCheckoutCompleto");
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadPartialCart",
        contentType: "application/json; charset=utf-8",
        cache: false,
        success: function (response) {
            if (response.success === true) {
                let objCarrinho = jQuery.parseJSON(response.cartJson),
                    recurringPurchaseCartObj = objCarrinho.recurringPurchaseCart,
                    isRecurringPurchase = recurringPurchaseCartObj.length > 0 ? true : false;

                for (var i = 0; i < objCarrinho.cartItems.length; i++) {
                    var idCartItem = objCarrinho.cartItems[i].idCartItem;
                    var idCartPersonalization = objCarrinho.cartItems[i].idCartPersonalization;
                    var dataPersonalization;
                    var precoTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceTotalProduct);
                    var precoUnt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceProduct);
                    var quantidade = objCarrinho.cartItems[i].quantity;

                    if (objCarrinho.cartItems[i].flagExhausted === 0 || objCarrinho.cartItems[i].stock === 0) {
                        $("#availability_" + idCartItem).text("Produto Esgotado");
                        $("#itemCartProduct_" + idCartItem).addClass("exhausted");
                    }

                    if (idCartPersonalization && idCartPersonalization > 0) 
                        dataPersonalization = "[data-id-personalization-cart='"+idCartPersonalization+"']";
                        
                    $("#qtd_" + idCartItem + dataPersonalization).val(quantidade);
                    $("#priceProduct_" + idCartItem + dataPersonalization).html(objCarrinho.cartItems[i].quantity > 1 ? objCarrinho.cartItems[i].quantity + "x " + precoUnt : precoUnt)
                    $("#preco_total_" + idCartItem + dataPersonalization).text(precoTotal);
                    $("#preco_unitario_" + idCartItem + dataPersonalization).text(objCarrinho.cartItems[i].quantity > 1 ? objCarrinho.cartItems[i].quantity + "x " + precoUnt : precoUnt);

                    UpdateUnitPrice(idCartItem, quantidade, objCarrinho.cartItems[i].priceProduct);

                    if ($("#itemCartProduct_" + idCartItem).attr("data-signature") != null && $("#itemCartProduct_" + idCartItem).attr("data-signature").toLowerCase() == "false")
                        isRecurringPurchase = false;
                }

                // Habilita select de Compra Recorrente
                if (isRecurringPurchase) {
                    let options = CompraRecorrenteCart.selectBox.dropdown.getDropdownOptions(recurringPurchaseCartObj);
                    if ($(CompraRecorrenteCart.selectBox.id).length > 0) {
                        CompraRecorrenteCart.selectBox.dropdown.updateDropdownOptions(options);
                    } else {
                        let html = CompraRecorrenteCart.selectBox.dropdown.getDropdownHtmlBox(options),
                            value = CompraRecorrenteCart.selectBox.dropdown.getDropdownStorageValue(),
                            valueInOptions = CompraRecorrenteCart.selectBox.dropdown.checkValueInOptions(value, options);

                        $("#ListProductsCheckout").after(html);
                        CompraRecorrenteCart.selectBox.dropdown.instanceDropdown(options);
                        CompraRecorrenteCart.buttonCart(valueInOptions);
                    }
                } else {
                    // Remove select de Compra Recorrente
                    CompraRecorrenteCart.selectBox.dropdown.removeBox();

                    // Faz o controle do botao do mini carrinho (Habilita ou desabilita)
                    CompraRecorrenteCart.buttonCart();

                    // Limpa a Storage
                    CompraRecorrenteStorage.cleanStorage();
                }

                var TotalDesconto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.totalDiscount);
                var SubTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.subTotal);
                var TotalFinal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.total);

                var descontoCarrinho = TotalDesconto;
                var subTotalCarrinho = SubTotal;
                var totalCarrinho = TotalFinal;

                UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho);
                updateQuantidadeTopoCarrinho();

                //RecalcularFrete(cep_selecionado);
                var id_frete = $("#id_frete_selecionado").val();
                var cep_selecionado = $("#cep_selecionado").val();
                //$("#btn_recalcular_frete").click();
                ExibirDicadeFrete(id_frete, cep_selecionado);

                if (response.freteID != 0)
                    $("#id_frete_selecionado").val(response.freteID);
                if (response.cep != 0)
                    $("#cep_selecionado").val(response.cep);

                $(".dados-carrinho, .dividerPaypal").removeClass("hideme")

                $(".buttonsMiniCart").each(function () {
                    $(this).removeClass("hideme");
                })
            }
            else {
                //_alert("Ops ... Seu carrinho agora está vazio!", "Estamos te direcionando para a Home!", "warning");
                //window.location.href = "/home";
                $("#totalCarrinho").text("");
                $("#subTotalCarrinho").text("");
                updateQuantidadeTopoCarrinho();
                $(".buttonsMiniCart").each(function () {
                    $(this).addClass("hideme")
                })


                var emptyCart = '<div class="empty-cart margin top small text center">\n' +
                    '    <img src="/assets/image/cart-empty.png" alt="Sua sacola está Vazia">\n' +
                    '    <div class="msgEmpty margin top small">\n' +
                    '        <strong>Sua sacola está vazia</strong>\n' +
                    '        <p class="margin top small">Você pode voltar a loja e aproveitar nossas ofertas!</p>\n' +
                    '    </div>\n' +
                    '</div>';

                updateDiscountCartEmpty();

                $("#ListProductsCheckout").html(emptyCart)

                $(".dados-carrinho, .dividerPaypal").addClass("hideme")

                // Remove select de Compra Recorrente
                CompraRecorrenteCart.selectBox.dropdown.removeBox();

            }

            $(".qtdActionMiniCart").on("click");

            if ($('.loading-div').hasClass("active")) {
                isLoading("#miniCarrinho");
                isLoading("#ListProductsCheckoutCompleto");
            }

            if (showSidebar === true) {
                $(".carrinho").sidebar('toggle');
            }
        },
        onFailure: function (response) {
            $(".qtdActionMiniCart").on("click");
            //console.log("Erro ao atualizar carrinho");
            isLoading("#miniCarrinho");
            isLoading("#ListProductsCheckoutCompleto");
        }
    });
}

function UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho) {
    $("#descontoCarrinho").text(descontoCarrinho);
    $("#subTotalCarrinho").text(subTotalCarrinho);
    $("#totalCarrinho").text(totalCarrinho);
}


export function LoadCarrinhoEventList(showSidebar) {
    if (showSidebar === null) showSidebar = false;
    isLoading("#miniCarrinho");
    $.ajax({
        method: "GET",
        url: "/EventList/LoadProductsEventListMiniCart",
        success: function (loadProduct) {
            
            var retornoAjax = loadProduct.split("|$|");
            var listaProdutos = retornoAjax[0];
            $("#ListProductsCheckout").html(listaProdutos);
            updateQuantidadeTopoCarrinho();
            $(".qtdActionEventList").on("click");
            if (showSidebar === true) {
                $(".carrinho").sidebar('toggle');
            }

            if(listaProdutos.toString().indexOf('empty-cart') === -1) {
                $(".buttonsMiniCart").each(function () {
                    $(this).removeClass("hideme");
                })
            } else {
                $(".buttonsMiniCart").each(function () {
                    $(this).addClass("hideme")
                })
            }
            isLoading("#miniCarrinho");

        },
        error: function (request, error) {
            //console.log(request);
            isLoading("#miniCarrinho");

        }
    });
}

export function updateDiscountCart() {
    var $discountCart = $(".description.discountCart");
    var $applyButton = $discountCart.find("#applyDiscountCart");
    var $keyInput = $discountCart.find("#key");
    var hasDiscount = $discountCart.data("has-discount") === true;

    updateButtonState(hasDiscount);

    $keyInput.val("");
    hasDiscount = false;
    updateButtonState(hasDiscount);

    LoadCarrinho();
}

export function updateButtonState(hasDiscount) {
    var $discountCart = $(".description.discountCart");
    var $applyButton = $discountCart.find("#applyDiscountCart");

    if (hasDiscount) {
        $applyButton.addClass("red")
            .find("i").removeClass("tag icon").addClass("trash alternate icon");
        $applyButton.find(".buttonText").text("Remover");
    } else {
        $applyButton.removeClass("red")
            .find("i").removeClass("trash alternate icon").addClass("tag icon");
        $applyButton.find(".buttonText").text("Validar");
    }
}


export function updateDiscountCartEmpty() {
    updateButtonState(false);
    $("#key").val("");
    deleteCookie("DiscountKeyCart");

    $.ajax({
        method: "POST",
        url: `${window.location.origin}/Checkout/ClearDiscountSession`,
        success: function () {}
    });
}

export function initializeDiscountCart() {
    var $discountCart = $(".description.discountCart");
    var $applyButton = $discountCart.find("#applyDiscountCart");
    var $keyInput = $discountCart.find("#key");

    var discountKey = getCookie("DiscountKeyCart") || "";
    var hasDiscount = discountKey !== ""; 

    $keyInput.val(discountKey);
    updateButtonState(hasDiscount);

    $applyButton.click(function (e) {
        e.preventDefault();
        var key = $keyInput.val().trim();

        if (hasDiscount) {
            $.ajax({
                method: "GET",
                url: `${window.location.origin}/Checkout/RemoveDescontoCheckout`,
                success: function (response) {
                    if (response.success) {
                        swal({
                            title: "Cupom removido!",
                            text: `O cupom ${discountKey} foi removido com sucesso.`,
                            icon: "success",
                            timer: 2500,
                            buttons: false
                        });

                        deleteCookie("DiscountKeyCart");
                        $keyInput.val("");
                        hasDiscount = false;
                        updateButtonState(hasDiscount);

                        $.ajax({
                            method: "POST",
                            url: `${window.location.origin}/Checkout/ClearDiscountSession`,
                            success: function () {}
                        });

                    } else {
                        swal({
                            title: "Erro ao remover!",
                            text: "Ocorreu um erro ao tentar remover o cupom.",
                            icon: "error",
                            timer: 2500,
                            buttons: false
                        });
                    }
                    LoadCarrinho();
                },
                error: function () {
                    swal({
                        title: "Erro!",
                        text: "Não foi possível remover o cupom.",
                        icon: "warning",
                        timer: 2500,
                        buttons: false
                    });
                }
            });
            return;
        }

        if (key !== "") {
            setCookie("DiscountKeyCart", key, 1);
            $.ajax({
                method: "POST",
                url: `${window.location.origin}/Checkout/AplicaDescontoCheckout`,
                data: { key },
                success: function (response) {
                    if (response.success) {
                        swal({
                            title: "Cupom aplicado!",
                            text: `O desconto foi aplicado com sucesso para o cupom ${key}.`,
                            icon: "success",
                            timer: 2500,
                            buttons: false
                        });
                        hasDiscount = true;
                        updateButtonState(hasDiscount);
                    } else {
                        swal({
                            title: "Cupom inválido!",
                            text: "Verifique o código e tente novamente.",
                            icon: "error",
                            timer: 2500,
                            buttons: false
                        });

                        deleteCookie("DiscountKeyCart");
                        hasDiscount = false;
                        updateButtonState(hasDiscount);
                    }
                    LoadCarrinho();
                },
                error: function () {
                    swal({
                        title: "Erro!",
                        text: "Não foi possível aplicar o cupom.",
                        icon: "warning",
                        timer: 2500,
                        buttons: false
                    });
                    deleteCookie("DiscountKeyCart");
                    updateButtonState(false);
                }
            });
        } else {
            swal({
                title: "Cupom vazio!",
                text: "Digite um código de desconto antes de aplicar.",
                icon: "info",
                timer: 2500,
                buttons: false
            });
            updateButtonState(false);
        }
    });

    $keyInput.on("input", function () {
        hasDiscount = false;
        updateButtonState(hasDiscount);
    });
}

export function updateDiscountUI() {
    var $discountCart = $(".description.discountCart");
    var $applyButton = $discountCart.find("#applyDiscountCart");
    var $keyInput = $discountCart.find("#key");

    var discountKey = getCookie("DiscountKeyCart");
    var hasDiscount = !!discountKey;

    $keyInput.val(discountKey || "");

    if (hasDiscount) {
        $applyButton.addClass("red")
            .find("i").removeClass("tag icon").addClass("trash alternate icon");
        $applyButton.find(".buttonText").text("Remover");
    } else {
        $applyButton.removeClass("red")
            .find("i").removeClass("trash alternate icon").addClass("tag icon");
        $applyButton.find(".buttonText").text("Validar");
    }
}


export function getCookie(name) {
    let nameEQ = name + "=";
    let cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value}; path=/;${expires}`;
}

export function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
}
