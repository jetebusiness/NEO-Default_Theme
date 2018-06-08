import {_alert, _confirm} from '../../functions/message';
/**
 * Função: montaListaProdutos;
 * Atualiza altura dos elementos dentro do carrinho.
 */
export function montaListaProdutos() {
    //Lista de Items
    let listaItems  = $(".listaItems");
    //Bloco de Elementos do Carrinho
    let cartElement = $(".carrinho .elementos");
    //Pega a altura dos elementos sem os items
    let elementos   = cartElement.height() - listaItems.height();
    //Pega nova altura da lista de items
    let novaAltura  = ($(window).height() - elementos) - 30;
    //Atualiza altura da lista de items e inicia comando de update no PS
}

$(window).resize(function () {
    montaListaProdutos();
});

$(document).ready(function () {
    //Implementação Exclusiva do Botão de Diminuir quantidade para o carrinho, removendo o produto caso chegue em zero.
    $(".carrinho .qtdminus").click(function () {
        let item = $(this).closest(".item");
        if (parseInt($(this).next("input").val()) < 1) {
            let message = {
                title: "Remover Produto",
                message: "Você tem certeza que deseja remover este produto do seu carrinho?",
                type: "warning",
                callback: function () {
                    //Deve chamar AJAX para remoção do item do carrinho na sessão
                    //Apaga Item da Lista e Atualiza a lista
                    item.remove();
                    montaListaProdutos();
                }
            };
            _confirm(message);
        }

    });

    //Inicia o sidebar do Carrinho via Swipe e Click
    $(".carrinho").sidebar('setting', 'transition', 'overlay')
        .swiperight(function () {
            $(".carrinho").sidebar('toggle');
        });
    //Botão para Fechar o Carrinho
    //$(".cartbutton, .fecharCarrinho").click(function () {
    //    $(".carrinho").sidebar('toggle');
    //});

    $(".fecharCarrinho").click(function () {
        $(".carrinho").sidebar('toggle');
    });


    //Inicializa o PS
    montaListaProdutos();


});