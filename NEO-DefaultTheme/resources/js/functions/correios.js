import {_alert} from "./message";

/**
 * Funções Correios
 */

/**
 * Função: limpa_formulario_cep()
 * Retorno: Limpa campos de name [endereco, bairro, cidade, estado]
 */
function limpa_formulario_cep() {
    // Limpa valores do formulário de cep.
    $("input[name=endereco]").val("");
    $("input[name=bairro]").val("");
    $("input[name=cidade]").val("");
    $("#estado").dropdown("clear");
}

/**
 * Função: completaCEP(cep)
 * @param cep
 *
 * Retorno: Preenchimento dos campos de name [endereco, bairro, cidade, estado]
 */
export function completaCEP(cep, fieldEndereco, fieldBairro, fieldCidade, fieldEstado) {

    //Verifica se campo cep possui valor informado.
    if (cep != "") {
        //Expressão regular para validar o CEP.
        var validacep = /^[0-9]{8}$/;
        //Valida o formato do CEP.
        if (validacep.test(cep)) {
            //Preenche os campos com "..." enquanto consulta webservice.
            $(fieldEndereco).val("...");
            $(fieldBairro).val("...");
            $(fieldCidade).val("...");
            $(fieldEstado).dropdown("set text", "...");


            //Consulta o webservice viacep.com.br/
            $.getJSON("//viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {
                if (!("erro" in dados)) {
                    //Atualiza os campos com os valores da consulta.
                    $(fieldEndereco).val(dados.logradouro).focus();
                    $(fieldBairro).val(dados.bairro).focus();
                    $(fieldCidade).val(dados.localidade).focus();
                    $(fieldEstado).dropdown("set selected", dados.uf);
                } //end if.
                else {
                    //CEP pesquisado não foi encontrado.
                    limpa_formulario_cep();
                    _alert('Erro', 'CEP não encontrado!', 'error');

                }
            });
        } //end if.
        else {
            //cep é inválido.
            limpa_formulario_cep();
            _alert('Erro', 'Formato de CEP inválido!', 'error');

        }
    } //end if.
    else {
        //cep sem valor, limpa formulário.
        limpa_formulario_cep();
    }
}