function openShopline() {
    $("#itauShoplineBoleto").click(function (event) {
        $('.ui.modal.shopline').modal('show');
    });
}

$(document).ready(function () {
    openShopline();

    $("#btnPagSeguroDebito").click(function (event) {
        $('.ui.modal.pagseguro').modal('show', function () {
            $('#openPagSeguro').attr("src", $("#btnPagSeguroDebito").data("url"));
        });
    });
});