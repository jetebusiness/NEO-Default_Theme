import { _alert, _confirm } from '../../functions/message';
import { isValidEmail } from "../../functions/validate";

$(document).ready(function () {
    AttachClient();

    $("#recuperarSenhaVendedor").click(function () {
        forgotByEmailToVendor();
    });

    $(document).on("click", "#loginVendaAssistida", function () {
        preLoginVendaAssistida();
    })
});

function AttachClient() {
    $(".btn_AttachClient").on("click", function (event) {
        event.preventDefault();

        $.ajax({
            method: "POST",
            url: "/assistedsale/AttachClient/",
            data: {
                emailClient: $(this).attr('data-emailClient'), 
                nameClient: $(this).attr('data-nameClient')
            },
            success: function (response) {
                if (response.Success === true) {
                    swal({
                        text: response.Message,
                        type: response.type,
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {
                        window.location.href = "/Home/index";
                    });
                }
                else {
                    swal({
                        text: response.Message,
                        type: response.type,
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    }).then(function () {

                    });
                }
            },
            error: function (request, error) {

            }
        });

    });
}

function forgotByEmailToVendor() {

    var _email = $("#email").val();
    if (_email == "") {
        _alert("", "Informe um e-mail.", "warning");
        return false;
    }

    if (isValidEmail(_email)) {
        var _url = "/assistedsale/RecoverPasswordByEmail";

        $.ajax({
            method: "POST",
            dataType: "json",
            url: _url,
            data: { email: _email },
            success: function (data) {
                if (data.Success)
                    _alert("", data.Message, "success");
                else
                    _alert("", data.Message, "error");
            },
            error: function (data) {
                _alert("", data.Message, "error");
            }
        });
    }
    else {
        _alert("", "Informe um e-mail válido.", "error");
    }
}

$(document).on("keypress", ".busca_lista_cliente", function (e) {
    if (e.which === 13) {
        location.href = `/assistedsale?search=${$(".busca_lista_cliente").val()}&page=${$("#metaDataField").val()}&pagesize=${$("#metaDataValue").val()}`;
    }
});

function preLoginVendaAssistida() {
    if ($("#email").val().length > 0 && $("#password").val().length > 0) {
        $("#loginVendaAssistida").addClass("loading");
        LoginVendaAssistida();
    }
    else {
        $(".ui.message.form-message p").text("É necessário informar os dados de acesso.");
        $(".ui.message.form-message").show();
    }
}

function LoginVendaAssistida() {
    var form = $("#formLoginAssistedSale");
    $.ajax({
        type: "POST",
        url: "/AssistedSale/LoginAssistedSale",
        data: form.serialize(),
        dataType: "json",
        success: function (response) {
            if (response.success == false) {
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
            else {
                if (response.showAcceptTerm) {
                    window.scrollTo(0, 200);
                    $("#idCustomer").val(response.idCustomer);
                    $("#idTablePrice").val(response.idTablePrice);
                    $("#loginVendaAssistida").removeClass("loading");
                    $("#loginVendaAssistida").hide();
                }
                else {
                    $("#loginVendaAssistida").removeClass("loading");
                    location.href = response.redirectUrl;
                }
            }
        },
        error: function () {
            if (response.success == false) {
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
        },
        complete: function () {
            $("#loginVendaAssistida").removeClass("loading");
        }
    });
}