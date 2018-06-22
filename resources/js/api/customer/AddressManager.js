import {_alert, _confirm} from "../../functions/message";

export function atualizaCampos(dados) {
    var obj = $.parseJSON(JSON.stringify(dados));
    $("#StreetAddress").val(obj.logradouro)
    $("#Neighbourhood").val(obj.bairro)
    $("#City").val(obj.localidade)
    $(".state").dropdown('set value',obj.uf)
    $(".state").dropdown('set text',obj.uf)
}

export function buscaCep(cep) {
    $("#zipCode").mask("00000-000");

    $("#zipCode").focusout(function() {
        buscaCep($(this), 0);
    });

    $.getJSON("//viacep.com.br/ws/" + cep + "/json/unicode", function (dados) {
        if (dados.erro) {
            if (window.swal) {
                window.swal('Erro', 'CEP não encontrado.', 'error');
            } else {
                alert("CEP não encontrado.");
            }
        } else {
            atualizaCampos(dados);
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
                text: "Cancelar"
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

