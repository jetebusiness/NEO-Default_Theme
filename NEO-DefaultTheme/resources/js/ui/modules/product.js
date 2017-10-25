/**
 * JS - Produto (Card e Listas)
 * UI Categorias, Buscas, Marcas etc...
 */

import {isMobile} from '../../functions/mobile';

$(document).ready(function () {
   
    if (!isMobile()) {

        /**
         * Semantic-UI DropDown
         * Monta lista de DropDown Cards e Lista de produtos.
         */
        $(".sku-options .ui.dropdown").dropdown({
            direction: "upward",
        });
    }

});