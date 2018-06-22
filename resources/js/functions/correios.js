import {_alert} from "./message";
import axios from "axios";

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

            axios.get("//viacep.com.br/ws/" + cep + "/json/?callback=?")
                .then(response => {
                    //console.log(response);
                        $(fieldEndereco).val(response.logradouro).focus();
                        $(fieldBairro).val(response.bairro).focus();
                        $(fieldCidade).val(response.localidade).focus();
                        $(fieldEstado).dropdown("set selected", response.uf);
                    })
                .catch(error => {
                    //console.log(error);
                    limpa_formulario_cep();
                    _alert('Erro', 'CEP não encontrado.', 'error');
                });
        } //end if.
        else {
            //cep é inválido.
            limpa_formulario_cep();
            _alert('Erro', 'Formato de CEP inválido.', 'error');

        }
    } //end if.
    else {
        //cep sem valor, limpa formulário.
        limpa_formulario_cep();
    }
}