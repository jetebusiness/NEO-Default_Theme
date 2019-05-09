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
});