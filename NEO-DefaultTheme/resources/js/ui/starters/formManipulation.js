import {montaListaProdutos} from "../../ui/modules/mini_cart";


export const formSettings = {
    debug: true,
    on: "blur",
    inline: true,
    fields: {
        name: {
            identifier: "name",
            rules: [{
                type: "regExp",
                value: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                prompt: "Preencha com seu nome completo. (Ex: João Silva ou Maria Silva)"
            }]
        },
        email: {
            identifier: "email",
            rules: [{
                type: "email",
                prompt: "{name} não é um email válido"
            }]
        },
        cpf: {
            identifier: "cpf",
            rules: [{
                type: 'cpf',
                prompt: "{name} Inválido"
            }]
        },
        cnpj: {
            identifier: "cnpj",
            rules: [{
                type: 'cnpj',
                prompt: "{name} inválido"
            }]
        },
        date: {
            identifier: "date",
            rules: [{
                type: "regExp",
                value: /((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u,
                prompt: "{name} inválida"
            }]
        },
        phone: {
            identifier: "phone",
            rules: [{
                type: "regExp",
                value: /(^|\()?\s*(\d{2})\s*(\s|\))*(9?\d{4})(\s|-)?(\d{4})($|\n)/u,
                prompt: "Telefone inválido. (Ex: (16) 3645-9857 ou (16) 98764-5316)"
            }]
        },
        empty: {
            identifier: "empty",
            rules: [{
                type: "empty",
                prompt: "O campo não foi preenchido"
            }]
        },
        select: {
            identifier: "select",
            rules: [{
                type: "empty",
                prompt: "O campo não foi selecionado"
            }]
        },
        checkbox: {
            identifier: "checkbox",
            rules: [{
                type: "checked",
                prompt: "{name} não foi selecionado"
            }]
        },
        zipcode: {
            identifier: "zipcode",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        date: {
            identifier: "date",
            rules: [{
                type: "regExp",
                value: /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/g,
                prompt: "Data Inválida"
            }]
        },
        matchemail: {
            identifier: "matchemail",
            rules: [{
                type: "match[email]",
                prompt: "{name} não é igual ao email digitado"
            }]
        }

    }
};

$(document).ready(function () {
    /**
     * InputMask Call
     */
    $(".masked:input").inputmask({
        greedy: false,
        jitMasking: true,
    });
    /**
     * Semantic-UI Calendar Call
     */
    /*  $('.field.calendar').calendar({
     monthFirst: false,
     type: 'date',
     text: {
     days: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
     months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Stembro', 'Outubro', 'Novembro', 'Dezembro'],
     monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
     today: 'Hoje'
     },
     formatInput: true,
     formatter: {
     date: function (date) {
     if (!date) return '';
     var day = date.getDate();
     var month = date.getMonth() + 1;
     var year = date.getFullYear();
     return day + '/' + month + '/' + year;
     }
     },
     onChange:function (date, text, mode) {
     //$(this).find("input[placeholder='DD/MM/YYYY']").val(text).blur();
     }
     });

     /**
     * Form Clear
     */

    /**
     * Password UnHide Button
     */

    /**
     * Quantity Buttons - General
     */
    $(".qtdminus").click(function () {
        if (parseInt($(this).next("input").val()) <= 0) {
            $(this).next("input").val(1);
        }
        else {
            $(this).next("input").val(parseInt($(this).next("input").val()) - 1);
        }
    });
    $(".qtdplus").click(function () {
        $(this).prev("input").val(parseInt($(this).prev("input").val()) + 1);
    });
    /**
     * Variation Buttons , radio and checkout
     */

    /**
     * Frete Recalcular
     */
    $(".button.frete.recalcular").click(function () {
        $(".description.resultado").hide();
        $(".description.resultado .valor").empty();
        $(".description.frete").show();
        $("#dica_frete").addClass("hideme");
        $("#descricao_dica").text("");
        montaListaProdutos();
    });
    /**
     * Semantic-Ui Rating Stars
     */
    $(".ui.rating").rating({
        maxRating: 5,
        interactive: false
    });
    $(".ui.form .ui.rating").rating({
        maxRating: 5,
        interactive: true
    });

});

$(document).on("click", ".form_refresh", function () {
        $(".ui.form").form('clear');
    })
    .on("click", ".searchcolumn:not(.active)", function () {
        toggleSearch();
    })
    .on("click", ".searchcolumn .icon.remove.circle", function () {
        toggleSearch();
    })
    .on("click", ".password_unhide", function () {
        "use strict";
        let $prev = $(this).prev(".password_box");
        if ($prev.attr("type") === "password") {
            $prev.attr("type", "text");
            $(this).find(".icon").removeClass("unhide").addClass("hide");
        } else {
            $prev.attr("type", "password");
            $(this).find(".icon").removeClass("hide").addClass("unhide");
        }

    })
    .on("click", ".button.checkbox", function () {
        $(this).toggleClass("basic").next().checkbox("toggle");
    })
    .on("click", ".button.radio", function () {
        $(this).closest(".field").find(".button.radio:not(.basic)").addClass("basic");
        $(this).toggleClass("basic").next().checkbox("toggle");
    })
    .on("click", ".variacao.cor.checkbox", function () {
        $(this).toggleClass("selecionado").next().checkbox("toggle");
    })
    .on("click", ".variacao.cor.radio", function () {
        $(this).closest(".field").find(".selecionado").removeClass("selecionado");
        $(this).toggleClass("selecionado").next().checkbox("toggle");
    })
    .on("click", ".variacao.image", function () {
        if ($(this).children(".ui.checkbox").find("input[type='radio']").length === 1) {
            $(this.parentElement).find(".img-selecionado").removeClass("img-selecionado");
            $(this).toggleClass("img-selecionado").children(".ui.checkbox").checkbox("toggle");
        } else {
            $(this).toggleClass("img-selecionado").children(".ui.checkbox").checkbox("toggle");
        }

    });

function toggleSearch() {
    $(".searchcolumn").toggleClass("active");
    $(".searchcolumn .icon").toggleClass("remove circle");
}