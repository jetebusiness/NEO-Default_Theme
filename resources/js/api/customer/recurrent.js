import { _alert, } from "../../functions/message";

$(document).ready(function (){
    $(".dropdown-signature").change(function () {
        let Filter = $(this).find(":selected").val();
        location.href = `/Order/ListRecurrentPurchase?status=${Filter}`;
    });
});

$(document).on("click", "#btnDisableRecurrent", function (e) {

    var RecurrentPaymentID = $("#RecurrentPaymentID").val();
    var IdRecurrentClient = $("#IdRecurrentClient").val();

    $.ajax({
        type: "POST",
        url: "/Order/DisableRecurrent",
        data: {
            RecurrentPaymentID: RecurrentPaymentID,
            IdRecurrentClient: IdRecurrentClient
        },
        success: function (response) {
            if (response.Success) {
                swal({
                    title: 'Recorrencia Cancelada',
                    text: response.Message,
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
                location.reload();
            }
            else {
                swal({
                    title: '',
                    text: response.Message,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
                location.reload();
            }

        },
        error: function () {
            swal({
                title: '',
                text: response.Message,
                type: 'error',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
            location.reload();
        }
    });

});