/**
 * Funções de Manipulação de Carrinho
 */
export function removeProduct(productID) {
    $(".item[data-id-produto='"+productID+"']").remove();
}

export function LoadUpdateCarrinhoPage(){
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadProductsMiniCart",
        success: function(loadProduct){
            var retornoAjax      = loadProduct.split("|$|");
            var listaProdutos    = retornoAjax[0];
            var descontoCarrinho = retornoAjax[1];
            var subTotalCarrinho = retornoAjax[2];
            var totalCarrinho    = retornoAjax[3];
            $("#ListProductsCheckout").html(listaProdutos);
            updateQuantidadeTopoCarrinho();
            UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho);
            $(".carrinho").sidebar('toggle');
        },
        error : function(request,error)
        {
            console.log(request);
        }
    });
}



function UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho){
    $("#descontoCarrinho").text(descontoCarrinho);
    $("#subTotalCarrinho").text(subTotalCarrinho);
    $("#totalCarrinho").text(totalCarrinho);
}