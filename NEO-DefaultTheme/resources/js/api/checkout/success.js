function openShopline() {
    $("#itauShoplineBoleto").click(function (event) {
        $('.ui.modal').modal('show');
    });
}

$(document).ready(function () {
    openShopline();
});