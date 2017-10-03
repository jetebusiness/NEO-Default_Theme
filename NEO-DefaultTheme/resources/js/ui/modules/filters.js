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

    $(".filterbutton, .closeFiltros").click(function () {
        $("#filtros, .filterColumn").toggleClass("ativo");
        $(".filterbar").toggle();
    });



});