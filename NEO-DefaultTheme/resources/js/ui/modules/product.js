/**
 * JS - Produto (Card e Listas)
 * UI Categorias, Buscas, Marcas etc...
 */

import {isMobile} from '../../functions/mobile';

function checkSrcImage(url, _timeout) {
    return new Promise(function (resolve, reject) {
        var timeout    = _timeout || 5000;
        var timer, img = new Image();
        img.onerror    = img.onabort = function () {
            clearTimeout(timer);
            reject(false);
        };
        img.onload = function () {
            clearTimeout(timer);
            resolve(true);
        };
        timer      = setTimeout(function () {
            // reset .src to invalid URL so it stops previous
            // loading, but doens't trigger new load
            img.src = "//!!!!/noexist.jpg";
            reject("timeout");
        }, timeout);
        img.src    = url;
    });
}

$(document).ready(function () {
    $(".ui.label.imagetag > img.ui.image").each((index, element) => {
        checkSrcImage($(element).attr("src"), 2000)
.catch(error => {
        $(element).parent().remove();
})

});
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