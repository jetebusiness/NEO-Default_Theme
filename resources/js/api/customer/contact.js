import {isValidEmail} from "../../functions/validate"
import { _alert, } from "../../functions/message";

$(document).ready(function () {

    var googleRecaptchaVersion = "";
    $("#googleResponse").val('');

    if ($('#googleVersion').length > 0) {
        googleRecaptchaVersion = $('#googleVersion').val();
    }

    if (googleRecaptchaVersion === '3') {
        var googleSiteKey = $('#googleSiteKey').val();   
        $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
            grecaptcha.ready(function () {
                grecaptcha.execute(googleSiteKey, { action: 'Contact' }).then(function (token) {
                    $("#googleResponse").val(token);
                });
            });
        });
    }

});

$(document).on("click", "#submitContact", function(e){
    if(!isValidEmail($("#email").val())){
        _alert("", "Informe um e-mail válido.", "error");
        return false;
    }
})