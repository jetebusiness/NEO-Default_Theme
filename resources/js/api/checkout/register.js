$(document).ready(function () {

    $(".cpf_cnpj_checkout").change(function () {
        let field = $(this).val().toString();

        if (field.length > 14) {
            $('.ie_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        } else {
            $('.rg_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        }      
    });

    $.jetRoute("checkout", function () {
        $("#checkoutRegister input").keypress(function (e) {
            var code = null;
            code = (e.keyCode ? e.keyCode : e.which);
            return (code == 13) ? false : true;
        });
    });

    $("#checkoutRegister").keydown(function (event) {
        if (event.keyCode == 10 || event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

/*



*/