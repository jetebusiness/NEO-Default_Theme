/**
 * Funções de Manipulação de Carrinho
 */

import { _alert } from "./message";

export function updateQuantidadeTopoCarrinho() {

    var _element = $("#MiniCartTitle"),
        _segment = (_element.length === 0 ? "b2c" : _element.data('segment')),
        _url = (_segment === "b2c" ? "/Checkout/TotalItensCart" : "/EventList/TotalItensList");

    $.ajax({
        method: "GET",
        url: _url,
        data: {},
        cache: false,
        success: function (data) {
            if (data !== "") {
                if (data.indexOf("|temporizador|") < 0) {
                    $("#total_itens_card").text(data);
                    _element.text((_segment === "b2c" ? "Meu Carrinho" : "Minha Lista") + " (" + data + ")");
                } else {
                    $("#total_itens_card").text(data.split("|")[0]);
                    _element.text((_segment === "b2c" ? "Meu Carrinho" : "Minha Lista") + " (" + data.split("|")[0] + ")");
                    _alert("Ops! O tempo do Produto (" + data.split("|")[2] + ") expirou e foi removido do carrinho. Adicione o produto novamente no carrinho para realizar a compra.", "Tempo Esgotado", "warning");
                    if ($('#formas-pagamento').length > 0) {
                        location.reload();
                    }
                }
            }
        }
    });
}


$(document).ready(function () {

    window.onload = function () {
        updateQuantidadeTopoCarrinho()
    }();
});