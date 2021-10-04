import { LoadCarrinho } from "../../functions/mini_cart_generic";
import { _alert, _confirm } from '../../functions/message';

$(document).ready(function () {
    $(document).on("click", "#reOrder", function () {
        let order = new Object();
        order.idOrder = parseInt($(this).data("idorder"));

        $.ajax({
            method: "POST",
            url: "/Checkout/ReOrder",
            async: false,
            dataType: "json",
            data: order,
            success: function (response) {
                if (response.success) {
                    LoadCarrinho(true);
                    if (response.message != "")
                        _alert("", response.message, "warning");
                } else {
                    _alert("", response.message, "warning");
                }
            },
            error: function (response) {
                _alert("", response.message, "warning");
            }
        });
    });

    $(document).on("click", "#reOrderSeller", function () {
        let order = new Object();
        order.idOrder = parseInt($(this).data("idorder"));

        $.ajax({
            method: "POST",
            url: "/Checkout/ReOrder",
            async: false,
            dataType: "json",
            data: order,
            success: function (response) {
                if (response.success) {
                    if (response.nameCustomer != "") 
                        var nameCustomer = response.nameCustomer
                    if (response.emailCustomer != "")
                        var emailCustomer = response.emailCustomer
                    LoadCarrinho(true);
                    AttachClientSeller(nameCustomer, emailCustomer);
                    if (response.message != "")
                        _alert("", response.message, "warning");
                } else {
                    _alert("", response.message, "warning");
                }
            },
            error: function (response) {
                _alert("", response.message, "warning");
            }
        });
    });
});

function AttachClientSeller(name, email) {
    $.ajax({
        method: "POST",
        url: "/assistedsale/AttachClient/",
        data: {
            emailClient: email,
            nameClient: name
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
            else if (response.SneezedSession) {
                swal({
                    text: "Você ficou mais que 5 min sem realizar nenhuma atividade e sua sessão expirou, realize o login novamente.",
                    type: response.type,
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                }).then(function () {
                    window.location.href = "/assistedsale/login";
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
}