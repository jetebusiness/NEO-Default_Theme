import { _alert, _confirm } from "../../functions/message";

$(document).ready(function () {
    if ($('#googleModule').length > 0) {
        if ($('#googleModule').val() == 'Register') {
            var googleRecaptchaVersionRegisterCheckout = "";

            if ($('#googleVersion').length > 0) {
                googleRecaptchaVersionRegisterCheckout = $('#googleVersion').val();
            }

            if (googleRecaptchaVersionRegisterCheckout == '3') {
                var googleSiteKey = $('#googleSiteKey').val();
                grecaptcha.ready(function () {
                    grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (token) {
                        $("#googleResponse").val(token);
                    });
                });
            }
        }
    }

    $(".cpf_cnpj_checkout").change(function () {
        let field = $(this).val().toString();

        if (field.length > 14) {
            $('.ie_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        } else {
            $('.rg_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        }
    });

    $.jetRoute("checkout", function () {
        $("#checkoutRegister input").keypress(function (e) {
            var code = null;
            code = (e.keyCode ? e.keyCode : e.which);
            return (code == 13) ? false : true;
        });
    });

    $("#checkoutRegister").keydown(function (event) {
        if (event.keyCode == 10 || event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    $("#checkIsento").click(function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (!$(".checkIe").hasClass("disabled")) {
            $(".checkIe").addClass("disabled");
            $("#inscricaoEstadual").val("Isento");
            $("#inscricaoEstadual").attr("placeholder", "Isento");
        } else {
            $(".checkIe").removeClass("disabled");
            $("#inscricaoEstadual").attr("placeholder", "Inscrição Estadual");
            $("#inscricaoEstadual").val("");
        }
    });

    $("#cpf_cnpj").focusout(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let cpf_cnpj = $(this).val();

        $.ajax({
            method: "GET",
            url: "/Customer/ValideClientByCpf?cpf_cnpj=" + cpf_cnpj,
            dataType: "json",
            success: function (data) {
                if (data.success == false) {
                    $("#valid_cpf_cnpj").removeClass("success").addClass("error");
                    if ($("#cpf_cnpj_existente").length == 0) {
                        $("#valid_cpf_cnpj").append("<div id='cpf_cnpj_existente' class='ui basic red pointing prompt label'>" + data.message + "</div>");
                    }
                }
                else {
                    $("#cpf_cnpj_existente").remove();
                }
            },
            error: function (data) {
                _alert("", data.message, "warning");
            }
        });
    });
});


function OnBegin(response) {
    var googleRecaptchaVersion = "";

    if ($('#googleVersion').length > 0) {
        googleRecaptchaVersion = $('#googleVersion').val();
    }

    if (googleRecaptchaVersion == '2') {
        if ($("#googleResponse").val() == '') {
            // if error I post a message in a div
            //$('#reCaptchaError').html('<p>Please verify youare human</p>');
            swal({
                title: '',
                html: 'Por favor, verifique que não é um robo.',
                type: 'error',
                showCancelButton: false,
                confirmButtonColor: '#16ab39',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
            return false;
        }
    } else if (googleRecaptchaVersion == '3') {
        if ($("#googleResponse").val() == '') {
            // if error I post a message in a div
            //$('#reCaptchaError').html('<p>Please verify youare human</p>');
            swal({
                title: '',
                html: 'Por favor, ocorreu um erro no google recaptcha.',
                type: 'error',
                showCancelButton: false,
                confirmButtonColor: '#16ab39',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
            return false;
        }
    }
}

function OnComplete() {

}

