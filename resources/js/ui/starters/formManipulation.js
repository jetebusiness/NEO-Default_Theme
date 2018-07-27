import {montaListaProdutos} from "../../ui/modules/mini_cart";

export const formSettings = {
    debug: false,
    on: "blur",
    inline: true,
    fields: {
        name: {
            identifier: "name",
            rules: [{
                type: "regExp",
                value: /^([A-zÀ-ÿ]{1,}\s[a-zA-z]{1,}'?-?[A-zÀ-ÿ]{1,}\s?([A-zÀ-ÿ]{1,})?)/,
                prompt: "Preencha com seu nome completo. (Ex: João Silva ou Maria Silva)"
            }]
        },
        businessRepresentant: {
            identifier: "businessRepresentant",
            rules: [{
                type: "regExp",
                value: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                prompt: "Preencha com seu nome completo. (Ex: João Silva ou Maria Silva)"
            }]
        },
        businessName: {
            identifier: "businessName",
            rules: [{
                type: "empty",
                prompt: "Razão social não foi preenchido."
            }]
        },
        fantasyName: {
            identifier: "fantasyName",
            rules: [{
                type: "empty",
                prompt: "Nome fantasia não foi preenchido."
            }]
        },
        email: {
            identifier: "email",
            rules: [{
                type: "email",
                prompt: "{name} inválido"
            }]
        },
        cpf: {
            identifier: "cpf",
            rules: [{
                type: 'cpf',
                prompt: "{name} inválido"
            }]
        },
        cnpj: {
            identifier: "cnpj",
            rules: [{
                type: 'cnpj',
                prompt: "{name} inválido"
            }]
        },
        rg: {
            identifier: "rg",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        ie: {
            identifier: "ie",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        birthdate: {
            identifier: "birthdate",
            rules: [{
                type: "regExp",
                value: /((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u,
                prompt: "Data de aniversário inválida"
            }]
        },
        password: {
            identifier: "password",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
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
        zipcode: {
            identifier: "zipcode",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        address: {
            identifier: "address",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        number: {
            identifier: "number",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        neighborhood: {
            identifier: "neighborhood",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        city: {
            identifier: "city",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        state: {
            identifier: "state",
            rules: [{
                type: "empty",
                prompt: "{name} não foi selecionado"
            }]
        },
        zipcode1: {
            identifier: "zipcode1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        address1: {
            identifier: "address1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        number1: {
            identifier: "number1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        neighborhood1: {
            identifier: "neighborhood1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        city1: {
            identifier: "city1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        state1: {
            identifier: "state1",
            rules: [{
                type: "empty",
                prompt: "{name} não foi selecionado"
            }]
        },
        termo: {
            identifier: "termo",
            rules: [{
                type: "checked",
                prompt: "{name} não foi selecionado"
            }]
        },
        matchemail: {
            identifier: "matchemail",
            rules: [{
                type: "match[email]",
                prompt: "{name} não é igual ao email digitado"
            }]
        },
        date: {
            identifier: "date",
            rules: [{
                type: "regExp",
                value: /((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u,
                prompt: "Data inválida"
            }]
        },
        eventdate: {
            identifier: "eventdate",
            rules: [{
                type: "regExp",
                value: /((([0][1-9]|[12][\d])|[3][01])[-/]([0][13578]|[1][02])[-/][1-9]\d\d\d)|((([0][1-9]|[12][\d])|[3][0])[-/]([0][13456789]|[1][012])[-/][1-9]\d\d\d)|(([0][1-9]|[12][\d])[-/][0][2][-/][1-9]\d([02468][048]|[13579][26]))|(([0][1-9]|[12][0-8])[-/][0][2][-/][1-9]\d\d\d)/u,
                prompt: "A data do evento está inválida"
            }]
        },
        bridename: {
            identifier: "bridename",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        groomname: {
            identifier: "groomname",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        babyname: {
            identifier: "babyname",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        fathername: {
            identifier: "fathername",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        mothername: {
            identifier: "mothername",
            rules: [{
                type: "empty",
                prompt: "{name} não foi preenchido"
            }]
        },
        brideemail: {
            identifier: "brideemail",
            rules: [{
                type: "email",
                prompt: "{name} não é um email válido"
            }]
        },
        groomemail: {
            identifier: "groomemail",
            rules: [{
                type: "email",
                prompt: "{name} não é um email válido"
            }]
        }

    }
};

$(document).ready(function () {

    /**
     * Semantic-UI Calendar Call
     */
    $('.field.calendar').calendar({
        monthFirst: false,
        type: 'date',
        text: {
            days: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            today: 'Hoje'
        },
        formatInput: true,
        formatter: {
            date: function (date, settings) {
                if (!date) return '';
                return date.toLocaleString('pt-br', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3');
            }
        },
        onChange:function (date, text, mode) {
            $(this).find("input[placeholder='DD/MM/YYYY']").val(text).blur();
        },
        regExp: {
            dateWords: /[^A-Za-z\u00C0-\u024F]+/g,
            dateNumbers: /[^\d:]+/g
        },
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
    //$(".qtdminus").click(function () {
    //    if (parseInt($(this).next("input").val()) <= 0) {
    //        $(this).next("input").val(1);
    //    }
    //    else {
    //        $(this).next("input").val(parseInt($(this).next("input").val()) - 1);
    //    }
    //});
    //$(".qtdplus").click(function () {
    //    $(this).prev("input").val(parseInt($(this).prev("input").val()) + 1);
    //});
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
        interactive: true,
        initialRating: 1
    });

});

$(document).on("click", ".form_refresh", function () {
    $(".ui.form").form('clear');
})
    .on("click", ".searchcolumn:not(.active)", function () {
        toggleSearch();
    })
    .on("click", ".searchcolumn .icon.remove.circle", function () {
        $(".search .prompt").val("")
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

    })
    .on("click", ".searchMobile>.button", function () {
        $(".blocoBusca").toggleClass("active");
    })




function toggleSearch() {
    $(".searchcolumn").toggleClass("active");
    $(".searchcolumn .icon").toggleClass("remove circle");
}


$(function () {
    if ($(window).innerWidth() < 768) {
        $(".footer .header").on("click", function () {
            $("i", this).toggleClass("right").toggleClass("down")
            $(this).next().slideToggle();
        })
    }
});