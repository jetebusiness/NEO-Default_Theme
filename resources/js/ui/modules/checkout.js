import { _alert } from '../../functions/message';
import { isMobile } from '../../functions/mobile';

require("jetcheckout");
require("card/dist/jquery.card");

$(document).ready(function () {

    $("form.jet.checkout.register").jetCheckout({
        onValidateClear: function () {
            $(this).find("i.icon:first").removeClass("checkmark box");
        },
        onValidateSucess: function () {
            $(this).find("i.icon:first").addClass("checkmark box");
        },
        onValidateFail:function () {
            $(this).find("i.icon:first").removeClass("checkmark box");
        },
        onNext: function () {
            $("#progress_checkout").progress('increment');
        },
        onFinishedForm: function(form, fields){
            $(".row.barra-finalizacao").show();
        },
        onUnFinishedForm: function(form, fields){
            $(".row.barra-finalizacao").hide();
        }
    });
    
    $("form.jet.checkout.credit-card").card({
        container: '.card-wrapper', // *required*

        formSelectors: {
            numberInput: "[data-type='number']", // optional — default input[name="number"]
            expiryInput: "[data-type='expiry']",
            cvcInput: "[data-type='cvv']",
            nameInput: "[data-type='name']"
        },

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
     
    $("form.jet.checkout.debit-card").card({
        container: '.card-wrapper-debit', // *required*

        formSelectors: {
            numberInput: "[data-type='debitnumber']", // optional — default input[name="number"]
            expiryInput: "[data-type='debitexpiry']",
            cvcInput: "[data-type='debitcvv']",
            nameInput: "[data-type='debitname']"
        },

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
    
    $('.title').click(function () {
        if ($(this).hasClass('active')) {
            $(this).find('.icon-delivery').removeClass('green-delivery');
        } else {
            $(this).find('.icon-delivery').addClass('green-delivery');
        }
    });	

    $(".termo.aceite").checkbox({
        onChecked:   function () {
            $(".continuar").attr("disabled", true);
        },
        onUnchecked: function () {
            $(".continuar").attr("disabled", false);
        }
    });
    $(".ui.dropdown.estado").dropdown({
        onChange: function(value, text, $selectedItem) {
            $(this).parent().addClass("success");
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
            offset:  20,
            debug:   false,
            context: ".detalhes.compra"
        });
        $(".box.success").sticky({
            offset:  20,
            debug:   false,
            context: ".success.compra"
        });
    }
    if (isMobile()) {
        $(".box.detalhes, .box.success").sticky("destroy");
        $(".ui.accordion.compra div, .ui.accordion.resumo div, .ui.accordion.usuario div").removeClass("active");
    }
});

$(".ui.dropdown").dropdown({
    onChange: function () {
        $(this).closest(".required").addClass("success").data("jet-active", true);
    }
});