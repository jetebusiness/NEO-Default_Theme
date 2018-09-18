import {_alert, _confirm} from "../../functions/message";
import {isValidEmail} from "../../functions/validate"

$(document).ready(function(){
    if($("#email").val() == ""){
        $("#enviar").prop("disabled",true);
    }
    $("#email").keyup(function () {        
        if (isValidEmail($(this).val())) {
            $("#enviar").prop("disabled",false);
        }else{
            $("#enviar").prop("disabled",true);
        }
    })

    function gettoken() {
        var token = $("input[name='__RequestVerificationToken']").val();
        return token;
    }

    $(document).on("click", "#Entrar", function () {
        var userName = $("#UserName").val()
        var password = $("#Password").val()
        var googleSiteKey = $('#googleSiteKey').val();
        $("#googleResponse").val('');
        $.ajaxSetup({ async: false });
        $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
            grecaptcha.ready(function () {
                grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
                    $("#googleResponse").val(tokenGoogleRecaptchaV3);
                    if (password != "") {
                        $.ajax({
                            method: "POST",
                            url: "/Customer/Login",
                            data: {
                                __RequestVerificationToken: gettoken(),
                                UserName: userName,
                                Password: password,
                                googleResponse: tokenGoogleRecaptchaV3
                            },
                            success: function (data) {
                                if (data.success === true) {
                                    window.location = data.redirectUrl
                                } else {
                                    _alert("", data.message, "error")
                                }
                            },
                            error: function (data) {
                                _alert("", data.message, "error")
                            }
                        });
                    } else {
                        _alert("", "Informe sua senha.", "warning")
                    }
                });
            });
        });
    })
})
