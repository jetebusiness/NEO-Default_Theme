import { generateRecaptcha }  from "./recaptcha";
import { isMobile } from '../../functions/mobile';
import { CompraRecorrenteStorage, CompraRecorrenteCheckout } from '../../functions/recurringPurchase';

require("../../functions/jetCheckout");
require("card/dist/jquery.card");

$(document).ready(function () {
    if ($(CompraRecorrenteCheckout.frequenciaBox.id).length > 0)
        CompraRecorrenteCheckout.frequenciaBox.getFrequenciaBoxHtml();

    var form = $("form.jet.checkout.register");

    form.jetCheckout({
        onValidateClear: function () {
            $(this).find("i.icon:first").removeClass("checkmark box");
        },
        onValidateSucess: function () {
            $(this).find("i.icon:first").addClass("checkmark box");
        },
        onValidateFail: function () {
            $(this).find("i.icon:first").removeClass("checkmark box");
        },
        onNext: function () {
            $("#progress_checkout").progress('increment');
        },
        onFinishedForm: function (form, fields) {
            $(".row.barra-finalizacao").show();            
            $(".info-message-mobile").addClass("hideme")
            $("button", ".row.barra-finalizacao").removeClass('disabled');
        },
        onUnFinishedForm: function (form, fields) {
            if($(".info-message-mobile").length === 0) 
                $('<div class="row info-message-mobile text center"><div class="column"><span class="ui label basic">Preencha os campos corretamente para prosseguir</span></div></div>').insertBefore($(".row.barra-finalizacao"))
            else
                $(".info-message-mobile").removeClass("hideme")
            
            $("button", ".row.barra-finalizacao").addClass('disabled');
        }
    });


    $("#goPayment").on("click", function() {

        if($("[id^=googleResponse]", form).length > 0 && $("[id^=googleVersion]", form).val() === '3') {

            var module = $("[id^=googleModule]", form).val();

            window.setTimeout(function() {
                generateRecaptcha(module, form);
            },1500)
        }
    })

    var creditcard_config = {
            numberInput: "[id='CreditCard']", // optional — default input[name="number"]
            cvcInput: "[id='CVV']",
            nameInput: "[id='Name']"
        },
        creditcard_config1 = {
            numberInput: "[id='CreditCard1']", // optional — default input[name="number"]
            cvcInput: "[id='CVV1']",
            nameInput: "[id='Name1']"
        },
        creditcard_config2 = {
            numberInput: "[id='CreditCard2']", // optional — default input[name="number"]
            cvcInput: "[id='CVV2']",
            nameInput: "[id='Name2']"
        },
        debitcard_config = {
            numberInput: "[id='DebitCard']", // optional — default input[name="number"]
            cvcInput: "[id='DebitCVV']",
            nameInput: "[id='DebitName']"
        },
        debitcard_config1 = {
            numberInput: "[id='DebitCard1']", // optional — default input[name="number"]
            cvcInput: "[id='DebitCVV1']",
            nameInput: "[id='DebitName1']"
        },
        debitcard_config2 = {
            numberInput: "[id='DebitCard2']", // optional — default input[name="number"]
            cvcInput: "[id='DebitCVV2']",
            nameInput: "[id='DebitName2']"
        };

    if (isMobile) {
        $("[data-type='expiry']").mask("00/00");
        $("[data-type='debitexpiry']").mask("00/00");
    } else {
        creditcard_config.expiryInput = "[data-type='expiry']";
        debitcard_config.expiryInput = "[data-type='debitexpiry']";
    }

    $("form.jet.checkout.credit-card > .one-card").card({
        container: '.card-wrapper', // *required*

        formSelectors: creditcard_config,

        width: 300, // optional — default 350px
        formatting: true, // optional - default true

        // Strings for translation - optional
        messages: {
            validDate: 'válido\naté', // optional - default 'valid\nthru'
            monthYear: 'mm/aa', // optional - default 'month/year'
        },

        // Default placeholders for rendered fields - optional
        placeholders: {
            number: '•••• •••• •••• ••••',
            name: 'Nome Impresso',
            expiry: '••/••',
            cvc: '•••'
        },

        masks: {
            cardNumber: '•' // optional - mask card number
        },

        // if true, will log helpful messages for setting up Card
        debug: false // optional - default false
    });

    if ($("form.jet.checkout.credit-card > .multi-card > .card-1").length > 0) {
        $("form.jet.checkout.credit-card > .multi-card > .card-1").card({
            container: '.card-wrapper1', // *required*

            formSelectors: creditcard_config1,

            width: 300, // optional — default 350px
            formatting: true, // optional - default true

            // Strings for translation - optional
            messages: {
                validDate: 'válido\naté', // optional - default 'valid\nthru'
                monthYear: 'mm/aa', // optional - default 'month/year'
            },

            // Default placeholders for rendered fields - optional
            placeholders: {
                number: '•••• •••• •••• ••••',
                name: 'Nome Impresso',
                expiry: '••/••',
                cvc: '•••'
            },

            masks: {
                cardNumber: '•' // optional - mask card number
            },

            // if true, will log helpful messages for setting up Card
            debug: false // optional - default false
        });
    }
    if ($("form.jet.checkout.credit-card > .multi-card > .card-2").length > 0) {
        $("form.jet.checkout.credit-card > .multi-card > .card-2").card({
            container: '.card-wrapper2', // *required*

            formSelectors: creditcard_config2,

            width: 300, // optional — default 350px
            formatting: true, // optional - default true

            // Strings for translation - optional
            messages: {
                validDate: 'válido\naté', // optional - default 'valid\nthru'
                monthYear: 'mm/aa', // optional - default 'month/year'
            },

            // Default placeholders for rendered fields - optional
            placeholders: {
                number: '•••• •••• •••• ••••',
                name: 'Nome Impresso',
                expiry: '••/••',
                cvc: '•••'
            },

            masks: {
                cardNumber: '•' // optional - mask card number
            },

            // if true, will log helpful messages for setting up Card
            debug: false // optional - default false
        });
    }

    $("form.jet.checkout.debit-card > .one-debit").card({
        container: '.card-wrapper-debit', // *required*

        formSelectors: debitcard_config,

        width: 300, // optional — default 350px
        formatting: true, // optional - default true

        // Strings for translation - optional
        messages: {
            validDate: 'válido\naté', // optional - default 'valid\nthru'
            monthYear: 'mm/aa', // optional - default 'month/year'
        },

        // Default placeholders for rendered fields - optional
        placeholders: {
            number: '•••• •••• •••• ••••',
            name: 'Nome Impresso',
            expiry: '••/••',
            cvc: '•••'
        },

        masks: {
            cardNumber: '•' // optional - mask card number
        },

        // if true, will log helpful messages for setting up Card
        debug: false // optional - default false
    });

    if ($("form.jet.checkout.debit-card > .multi-debit > .debit-1").length > 0) {
        $("form.jet.checkout.debit-card > .multi-debit > .debit-1").card({
            container: '.card-wrapper-debit1', // *required*

            formSelectors: debitcard_config1,

            width: 300, // optional — default 350px
            formatting: true, // optional - default true

            // Strings for translation - optional
            messages: {
                validDate: 'válido\naté', // optional - default 'valid\nthru'
                monthYear: 'mm/aa', // optional - default 'month/year'
            },

            // Default placeholders for rendered fields - optional
            placeholders: {
                number: '•••• •••• •••• ••••',
                name: 'Nome Impresso',
                expiry: '••/••',
                cvc: '•••'
            },

            masks: {
                cardNumber: '•' // optional - mask card number
            },

            // if true, will log helpful messages for setting up Card
            debug: false // optional - default false
        });
    }

    if ($("form.jet.checkout.debit-card > .multi-debit > .debit-2").length > 0) {
        $("form.jet.checkout.debit-card > .multi-debit > .debit-2").card({
            container: '.card-wrapper-debit2', // *required*

            formSelectors: debitcard_config2,

            width: 300, // optional — default 350px
            formatting: true, // optional - default true

            // Strings for translation - optional
            messages: {
                validDate: 'válido\naté', // optional - default 'valid\nthru'
                monthYear: 'mm/aa', // optional - default 'month/year'
            },

            // Default placeholders for rendered fields - optional
            placeholders: {
                number: '•••• •••• •••• ••••',
                name: 'Nome Impresso',
                expiry: '••/••',
                cvc: '•••'
            },

            masks: {
                cardNumber: '•' // optional - mask card number
            },

            // if true, will log helpful messages for setting up Card
            debug: false // optional - default false
        });
    }

    $('.title').click(function () {
        if ($(this).hasClass('active')) {
            $(this).find('.icon-delivery').removeClass('green-delivery');
        } else {
            $(this).find('.icon-delivery').addClass('green-delivery');
        }
    });

    $(".termo-checkout").checkbox({
        onChecked: function () {
            if(sessionStorage.getItem(".modal-term") === null) {
                $(".modal-term").modal("show")
                sessionStorage.setItem(".modal-term", "true");
            }
        }
    });

    $(".termo.aceite, .politica-privacidade").checkbox({
        onChecked: function () {
            if($(".termo.aceite").checkbox("is checked") && $(".politica-privacidade").checkbox("is checked"))
                $(".row.barra-finalizacao").show();

        },
        onUnchecked: function () {
            $(".row.barra-finalizacao").hide();
        }
    });


    $("a", ".politica-privacidade").on("click", function() {
        $(".modal-policy").modal({
            closable  : false
        }).modal('show')
    })
    
    $(".ui.dropdown.search").dropdown({
        onChange: function (value, text, $selectedItem) {
            if($(".form.jet.checkout").length === 1 && value !== "") {
                $(this).closest(".required").addClass("success").data("jet-active", true)
                $("input", this).blur();
            }
        }
    });
    if (!isMobile()) {
        $('.dadosCliente').addClass('active');
        /**
         * Semantic-UI Sticky
         * Box Detalhes da Compra
         */

        $('.dadosUsuario').addClass('active');

        $(".box.detalhes").sticky({
            offset: 20,
            debug: false,
            context: ".detalhes.compra"
        });
        $(".box.success").sticky({
            offset: 20,
            debug: false,
            context: ".success.compra"
        });
    }
    if (isMobile()) {
        $(".box.detalhes, .box.success").sticky("destroy");
        $(".ui.accordion.compra div, .ui.accordion.resumo div, .ui.accordion.usuario div").removeClass("active");
    }
});