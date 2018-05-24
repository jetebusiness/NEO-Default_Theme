function printDiv(divID) {
    var divElements = document.getElementById(divID).innerHTML;
    var oldPage = document.body.innerHTML;

    document.body.innerHTML =
      "<html><head><title></title></head><body>" +
      "<div class='ui eight wide tablet four wide computer column'><a href='/Home'><img class='ui middle aligned image' src='/assets/image/logo/logo.png' alt='' onerror=\"imgError(this)\"></a></div></br>" +
     divElements + "</body>";
    window.print();
    document.body.innerHTML = oldPage;
}

function openShopline() {
    $('.ui.modal').modal('show')
}

$(document).ready(function () {
    $(document).on("click", "#print", function () {
        printDiv("pagePrint")
    })

    $(document).on("click", "#reprintBankSlip", function () {
        openShopline()
        $.ajax({
            method: "GET",
            url: "/Checkout/ReprintBankSlip",
            data: {
                id: $("#idOrder").val()
            },
            success: function (data) {
                $("#tokenBankSlip").val(data.msg)
                $("#itauShopline").submit()
                
            },
            error: function (data) {

            }
        })
    })

    $(document).on("click", "#reprintBankSlipMaxiPago", function () {
        $.ajax({
            method: "GET",
            url: "/Checkout/ReturnUrlBankSlipMaxiPago",
            data: {
                idOrder: $("#idOrderMaxiPago").val()
            },
            success: function (data) {
                $("#bankSlipMaxiPago").attr("src", data.urlBoleto)
                $('.ui.modal.maxiPago').modal('show')
            },
            error: function (data) {

            }
        })
    })

    $(document).on("click", "#btnOpenPaymentLink", function () {
        $('.ui.modal.pagseguro').modal('show');
    });

    $(document).on("keypress", ".prompt_pedidos", function (event) {
        var val = event.target.value;
        var filtered = val.replace(/[^0-9]/g, '');

        if (filtered !== val) {
            event.target.value = filtered;
        }

        //console.log("prompt_pedidos: " + $(".prompt_pedidos").val());

        if (filtered != "") {
            if (event.which === 13) {
                location.href = `/Order/Index?n=${$(".prompt_pedidos").val()}`;
            }
        }
    });
})