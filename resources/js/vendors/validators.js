/**
 * Semantic-UI Form Validator Classes
 */
import {validarCPF, validarCNPJ} from "../functions/cpfcnpj";

$.fn.form.settings.rules.cpf = function(value, cpf) {
    return validarCPF(value);
};

$.fn.form.settings.rules.cnpj = function(value, cnpj) {
    return validarCNPJ(value);
};