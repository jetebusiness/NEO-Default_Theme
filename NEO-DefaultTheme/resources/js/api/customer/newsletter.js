import {_alert, _confirm} from "../../functions/message";
var widgetgCaptchaFooter
function RegisterNews() {
    $.ajax({
        url: '/Customer/RegisterNewsletter/',
        type: 'GET',
        data: {
            email: $("#email_news").val()
        },
        dataType: 'json',
        success: function (response) {
            if (response.Success === true) {
                swal({
                    title: 'Sucesso',
                    text: response.Message,
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then(function () {
                    $("#email_news").val("");
                });
            }
            else {
                swal({
                    title: 'Mensagem',
                    text: response.Message,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then(function () {

                });
            }
        },
        error: function (request, error) {
            console.log("Erro ao realizar cadastro de news letter");
        }
    });
}
$(document).ready(function () {
    $(document).on("click", "#btn_news", function (event) {
        RegisterNews()
    });
});
