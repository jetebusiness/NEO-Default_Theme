import {_alert, _confirm} from "../../functions/message";

export function atualizaCampos(dados) {
    var obj = $.parseJSON(JSON.stringify(dados));
    $("#StreetAddress").val(obj.streetAddress)
    $("#Neighbourhood").val(obj.neighbourhood)
    $("#City").val(obj.city)
    $(".state").dropdown('set value', obj.state)
    $(".state").dropdown('set text', obj.state)
}

export function buscaCep(cep) {
    $("#zipCode").mask("00000-000");

    $("#zipCode").focusout(function() {
        buscaCep($(this), 0);
    });

    $.ajax({
        method: "GET",
        url: "/customer/LocalizaCep",
        data: {
            cep: cep
        },
        success: function success(response) {
            if (response.success) {
                var obj = $.parseJSON(response.message);
                atualizaCampos(obj);
            } else {
                _alert("", response.message, "warning");
            }
        },
        error: function () {
            alert('Erro');
        }
    });
}

$(document).ready(function () {
    $("#zipCode").keyup(function (event) {
        var cep = $("#zipCode").val()
        cep = cep.replace("-", "")
        if (cep.length == 8) {
            buscaCep(cep)
        }
    });

    $(document).on("click", "#delete", function() {
        var idAdressAndType = $(this).val()
        _confirm({
            title: "Deseja realmente remover esse endereço?",
            text: "",
            type: "warning",
            confirm: {
                text: "Remover"
            },
            cancel: {
                text: "Cancelar",
                color: "#95979b"
            },
            callback: function () {
                $.ajax({
                    method: "POST",
                    url: "/Customer/DeleteAddress",
                    data: {id : idAdressAndType.split("|#|")[0],
                        typeAddress : idAdressAndType.split("|#|")[1] } ,
                    success: function (data) {
                        if(data.Message.split("|#|")[1] == "OK")
                        {
                            _alert("Informação", data.Message.split("|#|")[0], "success")        
                            window.setTimeout(function() {
                                location.reload();
                            }, 2000)
                        }else{
                            _alert("Informação", data.Message.split("|#|")[0], "warning")  
                        }
                    },
                    error: function (data) {
                        _alert("Informação", data.Message, "warning")
                    }
                });
            }
        });
    });

    $(document).on("click", "#entrega", function() {
        var idAdress = $(this).val()
        _confirm({
            title: "Deseja adicionar esse endereço para entrega?",
            text: "",
            type: "warning",
            confirm: {
                text: "Sim"
            },
            cancel: {
                text: "Não"
            },
            callback: function () {
                $.ajax({
                    method: "GET",
                    url: "/Customer/ChangeDefaultAddress",
                    data: {id:idAdress} ,
                    success: function (data) {
                        _alert("Informação", data.Message, "success")        
                        window.setTimeout(function() {
                            location.reload();
                        }, 1000)
                    },
                    error: function (data) {
                        _alert("Informação", data.Message, "warning")
                    }
                });
            }
        });
    });

    $(document).on("click", "#cobranca", function() {
        var idAdress = $(this).val()
        _confirm({
            title: "Deseja adicionar esse endereço para cobrança?",
            text: "",
            type: "warning",
            confirm: {
                text: "Sim"
            },
            cancel: {
                text: "Não"
            },
            callback: function () {
                $.ajax({
                    method: "GET",
                    url: "/Customer/ChangeBillingAddress",
                    data: {id:idAdress} ,
                    success: function (data) {
                        _alert("Informação", data.Message, "success")        
                        window.setTimeout(function() {
                            location.reload();
                        }, 1000)
                    },
                    error: function (data) {
                        _alert("Informação", data.Message, "warning")
                    }
                });
            }
        });
    });
});

