import { _alert, _confirm } from './message';

; (function ($) {
    $.fn.buscaCep = function (options) {
        var settings    = $.extend({}, $.fn.buscaCep.defaults, options),
            sel         = settings.inputSelector,
            cleanString = (value) => value.replace(/[^\d]+/g, ""),
            $this       = $(this);

        function carregando() {
            for (let key in sel) {
                if (sel[key] !== "") {
                    if (sel[key].isDropDown) {
                        sel[key].loading("...");
                    }

                    if (key === "numero" && sel[key] !== "" && $(sel["logradouro"]).val() !== "") {
                        $(sel[key]).focus();
                    } else if (key === "logradouro" && sel[key] !== "") {
                        $(sel["logradouro"]).val('').focus();
                        $(sel["bairro"]).val('');
                        $(sel["localidade"]).val('');
                        $(sel["uf"]).val('');
                    }
                }
            }
            settings.onLoading($this);
        }

        function atualizaCampos(dados) {
            for (let key in sel) {
                if (sel[key] !== "") {
                    if (sel[key].isDropDown) {
                        sel[key].changing(dados.state);
                    }
                    if (key === "numero" && sel[key] !== "") {
                        $(sel[key]).focus();
                    }
                    else if(key === "complemento"){
                        $(sel[key]).val("");
                    }
                    else {
                        if (key === "logradouro") {
                            $(sel[key]).val(dados.streetAddress).change();
                        } else if (key === "bairro") {
                            $(sel[key]).val(dados.neighbourhood).change();
                        } else if (key === "localidade") {
                            $(sel[key]).val(dados.city).change();
                        }
                    }


                }
            }

            settings.onComplete($this);
        }

        function limpaForm() {
            for (let key in sel) {
                if (sel[key] !== "") {
                    if (sel[key].isDropDown) {
                        sel[key].clearing();
                    }
                    else {
                        $(sel[key]).val("");
                    }
                }
            }

            settings.onClear.call($this);

            return false;
        }

        function buscaCep(cep) {
            cep = cleanString(cep);
            
            if(cep) {
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
            
        }

        carregando();
        buscaCep($(this).val());

        return this;

    };

    $.fn.buscaCep.defaults = {
        inputSelector: {
            logradouro: "",
            bairro: "",
            localidade: "",
            numero: "",
            complemento: "",
            uf: {
                input: "",
                isDropDown: true,
                changing: function (uf) {
                },
                loading: function (text) {
                },
                clearing: function () {

                }
            }
        },
        onComplete: function () {
        },
        onLoading: function () {
        },
        onClear: function () {
        },
        onError: function () {
        }

    };

})(jQuery, window, document);