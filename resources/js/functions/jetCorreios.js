;(function ($) {
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
                    if (key === "numero" && sel[key] !== "") {
                        $(sel[key]).focus();
                    }
                    else {
                        $(sel[key]).val("...");
                    }
                }
            }
            settings.onLoading($this);
        }

        function atualizaCampos(dados) {
            for (let key in sel) {
                if (sel[key] !== "") {
                    if (sel[key].isDropDown) {
                        sel[key].changing(dados[key]);
                    }
                    if (key === "numero" && sel[key] !== "") {
                        $(sel[key]).focus();
                    }
                    else if(key === "complemento"){
                        $(sel[key]).val("");
                    }
                    else {
                        $(sel[key]).val(dados[key]).change();
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
            axios.get("//viacep.com.br/ws/" + cep + "/json/unicode")
                .then(({data}) => {
                    if (data.erro){
                        if (window.swal) {
                            window.swal('Erro', 'CEP não encontrado.', 'error');
                            limpaForm();
                        }
                        else {
                            alert("CEP não encontrado.");
                            limpaForm();
                        }   
                    }else{
                        atualizaCampos(data);
                    }
                })
                .catch(error => {
                    //console.log("JET CORREIOS - Chamada AJAX");
                    //console.log(error);
                    if (window.swal) {
                        window.swal('Erro', 'CEP não encontrado.', 'error');
                        limpaForm();
                    }
                    else {
                        alert("CEP não encontrado.");
                        limpaForm();
                    }
                });
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