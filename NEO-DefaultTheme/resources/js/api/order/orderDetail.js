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
})