/**
 * Montagem da UI de Filtros do Sistema
 */

$(document).ready(function () {

    /**
     * Semantic-UI - Accordion
     */
    $(".filtros .ui.accordion").accordion({
        "exclusive": false,
    });

    $("body").delegate(".filterbutton, .closeFiltros", "click", function () {
        if (!$(".filterColumn").hasClass("ativo")) {
            $(".filterColumn").toggleClass("ativo");
        }

        $("#filtros").toggleClass("ativo");

        $(".filterbar").toggle();
    });



});