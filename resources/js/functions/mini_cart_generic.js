import { updateQuantidadeTopoCarrinho } from "./cart_manipulation";
import { ExibirDicadeFrete } from "../api/checkout/mini_cart";
import { isLoading } from "../api/api_config";
import { CompraRecorrenteStorage, CompraRecorrenteCart } from '../functions/recurringPurchase';

export function LoadCarrinho(showSidebar) {
    $("#ListProductsCheckout").html('<div class="row text center"><img src="/assets/image/loading.svg"></div>')
    
    if (showSidebar === null) showSidebar = false;
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadProductsMiniCart",
        cache: false,
        success: function (loadProduct) {
            var retornoAjax = loadProduct.split("|$|");
            var listaProdutos = retornoAjax[0];
            $("#ListProductsCheckout").html(listaProdutos);
            UpdateCarrinho(showSidebar);
        }
    });
}

export function UpdateCarrinho(showSidebar) {
    isLoading("#miniCarrinho");
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
                //window.location.href = "/Home";
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

                $("#ListProductsCheckout").html(emptyCart)

                $(".dados-carrinho, .dividerPaypal").addClass("hideme")

                // Remove select de Compra Recorrente
                CompraRecorrenteCart.selectBox.dropdown.removeBox();

            }

            $(".qtdActionMiniCart").on("click");

            if ($('.loading-div').hasClass("active"))
                isLoading("#miniCarrinho");

            if (showSidebar === true) {
                $(".carrinho").sidebar('toggle');
            }
        },
        onFailure: function (response) {
            $(".qtdActionMiniCart").on("click");
            //console.log("Erro ao atualizar carrinho");
            isLoading("#miniCarrinho");
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
            isLoading("#miniCarrinho");

        },
        error: function (request, error) {
            //console.log(request);
            isLoading("#miniCarrinho");

        }
    });
}