import {_alert, _confirm} from "../../functions/message";

function RegisterNews() {
    var googleResponse = $("[id^=googleResponse]", "body").length > 0 ? $("[id^=googleResponse]", "body").val() : "";
    $.ajax({
        url: '/Customer/RegisterNewsletter/',
        type: 'GET',
        data: {
            email: $("#email_news").val(),
            googleResponse
        },
        dataType: 'json',
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
                    $("#email_news").val("");
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
            //console.log("Erro ao realizar cadastro de news letter");
        },
        complete: function () {
            if ($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                if ($("[id^=googleVersion_]").eq(0).val() === "2") {
                    grecaptcha.reset();
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), "body");
                }
            }
        }
    });
}
$(document).ready(function () {
    $(document).on("click", "#btn_news", function (event) {
        RegisterNews()
    });
});