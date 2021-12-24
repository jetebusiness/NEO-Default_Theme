var json,
    container,
    btn = "",
    reference = 0,
    identifier;

personalization = {
    config: {
        container: '#personalizations', //div responsavel por receber as variacoes
        options: {
            selector: '.option-conditional',
            fields: 'input, select',
            pattern: {
                lettersAndNumbers: /[^a-zà-úÀ-Ú0-9\'\*\-\+\.\$\&\s]/i,
                onlyLetters: /[^a-zà-úÀ-Ú\'\*\-\+\.\$\&\s]/i,
                onlyNumbers: /[^0-9]/i,
            }
        },
        total: {
            container: 'total-personalization',
            productValue: 'product-value',
            personalizationValue: 'personalization-value',
            totalValue: 'total-value',
            price: '#preco'
        },
        error: {
            container: '#personalization-error',
            field: 'ui message tiny error'
        }
    },
    init: function() {

        if($(this.config.container).length > 0) {
            this.clickRadio()
            this.inputMask()
            this.changeDropdown();
            this.renderArray()
            this.totalPersonalization()
        }

    },
    clickRadio: function() {

        var $this = this,
            selector =  this.config.options.selector;

        $('.checkbox', this.config.container).checkbox({
            onChecked: function() {

                if($(this).attr("type") === "radio") {
                    if($(this).parent().siblings(selector).length > 0) {

                        $(selector + "[data-option='" + $(this).data("valid") + "']").hide();
                        $(this).closest(".radio.checkbox").siblings(selector).fadeIn("slow")
                    }

                    $("input[name='" + $(this).attr("name")+ "']").val('');
                }

                $(this).val('jet-true')

                $this.totalPersonalization();
            },
            onUnchecked: function() {
                $(this).val('')

                $this.totalPersonalization();
            }
        })
    },
    inputMask: function() {

        var options = this.config.options.pattern;

        $("input[data-pattern]").on("keyup", function(e) {

            var value = $(this).val(),
                pattern = parseInt($(this).data("pattern")),
                newValue;

            if(pattern === 8) {
                newValue = value.replace(options.lettersAndNumbers, "");
            } else if(pattern === 9) {
                newValue = value.replace(options.onlyLetters, "");
            } else {
                newValue = value.replace(options.onlyNumbers, "");
            }

            $(this).val(newValue)


            if($(this).siblings(".limit-field").length > 0) {
                $(this).siblings(".limit-field").text(value.split('').length + '/' + $(this).attr("maxlength"))
            }
        })
    },
    changeDropdown: function() {

        var $this = this;
        $('.dropdown', this.config.container).dropdown({
            onChange: function(value, text, $selectedItem) {
                $this.totalPersonalization();
            }
        });
    },
    renderArray: function() {

        var config = this.config.options,
            fields = config.fields,
            selector =  config.selector,
            json = [];

        $(fields, this.config.container).each(function() {

            if(($(this).val().trim().length === 0 || ($(this).hasClass(".checkbox") && !$(this).is(":checked"))) || ($(this).closest(selector).length > 0 && $(this).closest(selector).siblings('.checkbox.checked').length > 0)) return ;

            if($(selector+"[data-id='radio-"+ $(this).attr('id') +"']").length > 0){

                var conditions = $(fields, selector+"[data-id='radio-"+ $(this).attr('id') +"']");

                if(conditions.length > 0){
                    conditions.each(function() {
                        if($(this).val().trim().length === 0 || ($(this).hasClass(".checkbox") && !$(this).is(":checked"))) return ;
                        json.push({
                            id: parseInt($(this).attr('id')),
                            idFather: $(this).closest(selector).data('option'),
                            value: ($(this).val() === "jet-true" ? "" : $(this).val())
                        })
                    })
                }
            } else {

                if($(this).closest(selector).length > 0) return;

                json.push({
                    id: parseInt($(this).attr('id')),
                    value: ($(this).val() === "jet-true" ? "" : $(this).val())
                })
            }
        })

        return json;

    },
    validFields: function() {

        var selector = this.config.options.selector,
            inputs = $('[data-valid]:required', this.config.container),
            fields = [],
            valid = [];

        inputs.each(function() {

            if((!$(this).hasClass(".checkbox") && $(this).val().trim().length === 0) || ($(this).hasClass(".checkbox") && !$(this).is(":checked"))) {

                if($(this).closest(selector).length === 0 || $(this).closest(selector).siblings('.checkbox.checked').length > 0) {

                    var index = fields.findIndex(x => x.id === $(this).data('valid'));

                    if (index === -1) {

                        fields.push({
                            id: $(this).data('valid')
                        })

                    }
                }

            } else {

                var index = valid.findIndex(x => x.id === $(this).data('valid'));

                if (index === -1) {

                    valid.push({
                        id: $(this).data('valid')
                    })

                }
            }
        })

        var add = true;

        Object.entries(fields).forEach((value, key) => {

            var index = valid.findIndex(x => x.id === fields[key].id);

            if (index === -1) {

                this.error(fields[key].id)

                add = false;

            }

        });

        return add;

    },
    totalPersonalization: function() {

        var $this = this,
            config = $this.config.options,
            fields = config.fields,
            value = 0,
            price = $(this.config.total.price).text().replace(/[R$\s]/g, '').replace(',', '.');

        $("input, select", this.config.container).each(function(){
            if($(this).is(":checked") || ($(this).prop('nodeName').toLowerCase() === 'select' && $(this).val() !== "")) {
                value += parseFloat($(this).data('price'))
            }
        });

        value = value * Number($("#quantidade").val());

        if($('.' + this.config.total.container, this.config.container).length === 0 && value > 0)
            $(this.config.container).append('<div class="ui grid one column center aligned ' + this.config.total.container + '"><div class="column"></div></div><span class="clear-personalization">Remover Personalizações</span>')

        if(value > 0)
            $('.column', '.' + this.config.total.container).html('Total: '
                + '<span class="'+ this.config.total.productValue +'">' + this.moneyBR(parseFloat(price)) + '</span>'
                + ' + '
                + '<span class="'+ this.config.total.personalizationValue +'">' + this.moneyBR(parseFloat(value)) + '</span>'
                + ' = '
                + '<span class="'+ this.config.total.totalValue +'">' + this.moneyBR(parseFloat(value) + parseFloat(price)) + '</span>')


        $(".clear-personalization").on("click", function() {
            $("input", $this.config.container).val('')
            $('.checkbox', $this.config.container).checkbox('uncheck');
            $('.dropdown', $this.config.container).dropdown('restore defaults');
            $('.'+$this.config.total.container).remove()
            $($this.config.options.selector).hide()
            $(this).remove()
        })


    },
    moneyBR: function(money) {
        money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
        return money;
    },
    error: function(field) {

        var errorContainer = this.config.error.container;

        if($(errorContainer).length ===0)
            $(this.config.container).prepend("<div id='"+errorContainer.split('#').pop()+"' class='margin bottom small'></div>")

        $(errorContainer).append("<div class='"+this.config.error.field+"'>O campo: <strong>"+$("#"+field).data("title")+"</strong> é obrigatório</div>")

        setTimeout(function() {
            $(errorContainer).remove()
        }, 5000)


        //console.error('Não foi possível carregar as informações da personalização:)
    }
};

//variations.config = $.extend({}, defaults, options);