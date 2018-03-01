import {_alert, _confirm} from '../../functions/message';

function atualizaCampos(dados) {

}

function carregarCep(cep) {

    $.getJSON("//viacep.com.br/ws/" + cep + "/json/unicode", function (dados) {
        if (dados.erro) {
            if (window.swal) {
                window.swal('Erro', 'CEP não encontrado!', 'error');
            } else {
                alert("CEP não encontrado!");
            }
        } else {
            atualizaCampos(dados);
        }
    });
}

function ajaxRemoveAddress(id){

}

function removeAddress(id){
    _confirm({
        title: "Titulo",
        text: "Texto",
        type: "warning",
        callback: function(){
            ajaxRemoveAddress(id);
        }
    });
}


$(document).ready(function () {
    $.jetRoute("customer", function () {

        $("#zipCode").keyup(function () {
            var cep = $("#zipCode").val()
            if (cep.length == 8)
                carregarCep(cep)
        })
    });
});
$(document).on("click", ".remove-address", function(){
    removeAddress($(this).data("address-id"));    
});
