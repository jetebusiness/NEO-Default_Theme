import { _alert, _confirm } from "../../functions/message";

$(document).ready(function () {

    $(".cpf_cnpj_checkout").change(function () {
        let field = $(this).val().toString();

        if (field.length > 14) {
            $('.ie_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        } else {
            $('.rg_checkout').trigger({ type: 'keypress', which: 13, keyCode: 13 });
        }
    });


    $("#checkIsento").click(function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (!$(".checkIe").hasClass("disabled")) {
            $(".checkIe").addClass("disabled");
            $("#inscricaoEstadual").val("Isento");
            $("#inscricaoEstadual").attr("placeholder", "Isento");
        } else {
            $(".checkIe").removeClass("disabled");
            $("#inscricaoEstadual").attr("placeholder", "Inscrição Estadual");
            $("#inscricaoEstadual").val("");
        }
    });

    $("#cpf_cnpj").focusout(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let cpf_cnpj = $(this).val();

        $.ajax({
            method: "GET",
            url: "/Customer/ValideClientByCpf?cpf_cnpj=" + cpf_cnpj,
            dataType: "json",
            success: function (data) {
                if (data.success == false) {
                    $("#valid_cpf_cnpj").removeClass("success").addClass("error");
                    if ($("#cpf_cnpj_existente").length == 0) {
                        $("#valid_cpf_cnpj").append("<div id='cpf_cnpj_existente' class='ui basic red pointing prompt label'>" + data.message + "</div>");
                    }
                }
                else {
                    $("#cpf_cnpj_existente").remove();
                }
            },
            error: function (data) {
                _alert("", data.message, "warning");
            }
        });
    });
});


