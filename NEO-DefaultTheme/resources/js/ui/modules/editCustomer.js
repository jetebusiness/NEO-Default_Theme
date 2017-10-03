/**
 * Client Edit View
 */
import{formSettings} from "../starters/formManipulation";

import {hideADDR, showADDR} from "../../functions/form-control";

$(document).ready(function () {

    $("#edicao_cliente").form(formSettings);

    $(".form.change.email").form(formSettings);

    $("#edicao_cliente .endereco").checkbox({
        onChecked: function () {
            hideADDR();
        },
        onUnchecked: function () {
            showADDR();
        }
    });
});