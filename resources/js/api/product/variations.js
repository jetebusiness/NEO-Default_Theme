var json,
    container,
    btn = "",
    reference = 0,
    identifier;

variations = {
    config: {
        containerDefault: '#variations-container', //div responsavel por receber as variacoes default
        container: '#variations-container', //div responsavel por receber as variacoes
        references: '#json-detail', //json que contem todas as referencias
        selectedReferences: '#principal-referencias-selecionadas',
        showStockOut: '#hdnShowProductOutOfStock', //exibe ou nao variacoes sem estoque,
        productSKU: '#produto-sku', //hidden que contem o id do SKU para adicionar ao carrinho
        loadedClass: 'loaded', //classe adicionado ao terminar a renderizacao 
        itensDisable: { //itens que receberao a classe 'disabled' quando o stock for 0
            btnBuy: '.btn-comprar',
            btnSignature: '.btn-comprar-assinar',
            btnBuyNow: '.btn-comprar-oneclick'
        },
        alertMe: "#avise_me", //id do avise quando o stock for 0
        stock: { // opcao que contempla a exibicao de uma mensagem com estoque da variacao selecionada
            showMessageStock: true, //se true a mensagem sera exibida
            messageStockContainer: 'messageStock', // div que recebera o html da mensagem
            maxStockValue: 3, //quando o estoque for menor ou igual ao valor, a mensagem sera exibida 
            messageStockHtml: '<i class="icon bell"></i>Temos apenas <strong>0${value}</strong> em estoque', //html da mensagem
        },
        callAjaxImage: true, //ex: se o produto possuir 2 cores e cada cor possuir suas imagens deixar true (se for a mesma imagem para todas as variacoes, deixar false)
        htmlPrice : { //itens que contem os valores da variacao
            containerValues: '#variacao-preco', //div que recebe as informacoes
            oldPrice: '#preco-antigo', //preco antigo
            newPrice: '#preco', //preco promocional e/ou atual
            priceCA: '.signature-value', //preco promocional e/ou atual
            priceBuyTogether: '#price-buy-together',
            installment: {
                containerInstallment: '.infoPreco', //div que recebe o valor do parcelamento
                number: '#max-p', //numero de parcelas
                value: '#max-value', //valor de cada parcela
                description: '#description' //descricao do parcelamento
            },
            discountBillet: "#desconto_boleto", //input que contem o valor de desconto do boleto
            billet_price: "#preco_boleto", //div que recebe valor do desconto,
            quantity: "#quantidade"
        },
        personalization: {
            total: {
                container: '.total-personalization',
                productValue: '.product-value',
                personalizationValue: '.personalization-value',
                totalValue: '.total-value',
                price: '#preco'
            },
        },
        getSession: '.modal.login',
        googleShopping: 'idsku',
        discountPrice: {
            paymentMethodList: [],
            showPriceWithDiscount: false
        }
    },
    init: async function() {

        if($(this.config.references).length > 0 && $(this.config.container).length > 0) {
            this.verifyContent()//iniciamos a criacao das variacoes            
            this.clickBtn($(this.config.container)) //setamos as acoes do click das variacoes               
            this.hideVariations() //escondemos as variacoes que nao pertencem a variacao selecionada           

        } else {
            if($(this.config.selectedReferences).length > 0)
                this.getImageThumbnail()
        }

    },
    //funcao responsavel por verificar se o conteudo esta correto para iniciar
    verifyContent: function() {

        if($(this.config.references).val() != '') {

            if($(this.config.container).length == 0)
                this.error('Container não encontrado')

            else if($(this.config.showStockOut).length == 0)
                this.error('Input"#hdnShowProductOutOfStock" não encontrado')

            else
                //se os itens estiverem ok, siguimos com a criacao das variacoes
                this.createVariations();
        }

    },
    //funcao responsavel por retornar mensagens de qualquer problema encontrado
    error: function(message) {
        console.error('Não foi possível criar as variações: \n' + message)
    },
    //funcao responsavel por percorrer o json e enviar as informacoes do html das variacoes
    createVariations: function() {


        json = JSON.parse($(this.config.references).val()); //recuperando o valor do json

        container = $(this.config.container); //recuperamos o container

        //adicionamos a div inicial para receber as primeiras referencias
        container.append("<div class='references' data-reference='" + json.IdReference +"' data-active='true'><span class='title'>"+ json.Name +"</span><div class='variations'></div></div>")
        
        //enviamos as primeiras variacoes para criacao
        this.getVariations(json.Variations, json.IdReference);

    },
    getGoogleShoppingId: function() {
        const queryString = window.location.search.slice(1).split('&');
        let params = this.config.googleShopping,
            id = 0;

        if(queryString.length > 0) {

            queryString.forEach(function (query) {
                query = query.split('=');

                if(query[0].toLowerCase() === params) {
                    if(Number(query[1]) > 0)
                        id = Number(query[1]);
                }
            });
        }
        return id;
    },
    getDiscountStore: function() {
        var self = this; // Armazena a referência a 'this' em uma variável local 'self'

        return new Promise(function(resolve, reject) {
            $.ajax({
                method: "GET",
                url: "/Company/GetDiscountStoreV2",
                success: function(data) {
                    if (data && data.success && data.showPriceWithDiscount) {
                        self.config.discountPrice.showPriceWithDiscount = data.showPriceWithDiscount;
                        self.config.discountPrice.paymentMethodList = data.result;
                    }
                    resolve(); // Resolve a promessa após o AJAX retornar
                },
                error: function() {
                    reject(); // Rejeita a promessa em caso de erro no AJAX
                }
            });
        });
    },
    //funcao responsavel por retornar todas as variacoes de um objeto
    getVariations: function(obj, idReference) {

        let idGoogle = this.getGoogleShoppingId();
        container = $(this.config.container);

        $.each(obj, function (key, item) {

            //verificamos se ja existe a div com a referencia para adicionarmos as variacoes filhas
            if(idReference != 0 && reference != idReference) {
                reference = idReference;
            }

            //criamos o html da variacao
            variations.generateHTML(
                (item.Image != null && item.Image != "" ? item.Image : null),
                (item.Color != null && item.Color != "" ? item.Color : null),
                item.IdVariation,
                (item.IdVariationFather != null ? "data-reference='"+item.IdVariationFather+"'" : ""), //utilizamos essa informacao para vincular a variacao filha com a referencia
                item.Name,
                reference)


            //verificamos se no item do json existe mais variacoes, caso exista, chama a funcao novamente
            if(obj[key]['SubTreeReference'] != undefined && obj[key]['SubTreeReference'].Variations != null) {

                if(obj[key]['SubTreeReference'].IdReference != null) {
                    reference = obj[key]['SubTreeReference'].IdReference;

                    //criamos a nova div com a nova referencia
                    if($("[data-reference='" + reference +"']", container).length == 0)
                        container.append("<div class='references' data-reference='" + reference +"'><span class='title'>"+ obj[key]['SubTreeReference'].Name +"</span><div class='variations'></div></div>")
                }

                //chamando a funcao com as novas variacoes
                variations.getVariations(obj[key]['SubTreeReference'].Variations, reference)
                //return;
            }

            //verificamos se as variacoes foram criadas e se a informacao de valores existe
            if(obj[key]['SubTreeReference'] == null && obj[key]['Sku'] != null) {
                //setando a variacao default
                if(idGoogle > 0 ? obj[key]['Sku'].IdSku === idGoogle : obj[key]['Sku'].Standard === true) {

                    $.each(obj[key]['Sku'].Variations, function (i, el) {
                        $(variations.config.productSKU).val(obj[key]['Sku'].IdSku)

                        $("[data-variation='"+ el.IdVariation +"']", container).addClass("select")
                    });
                }

                //adicionando as informacoes de valores na ultima variacao
                $.each(obj[key]['Sku'].Variations, function (i, el) {

                    if(obj[key]['Sku'].Variations.length == i+1) {

                        if($('.references', container).length == 1)
                            identifier = "[data-variation='"+ el.IdVariation +"']"
                        else
                            identifier = "[data-reference='"+ obj[key].IdVariationFather +"'][data-variation='"+ el.IdVariation +"']"

                        $(identifier, container).attr({
                            "data-IdSku"             : obj[key]['Sku'].IdSku,
                            "data-Price"             : obj[key]['Sku'].Price,
                            "data-PricePromotion"    : obj[key]['Sku'].PricePromotion,
                            "data-PriceCA"           : obj[key]['Sku'].PricePromotionCA,
                            "data-SkuCode"           : obj[key]['Sku'].SkuCode,
                            "data-Stock"             : obj[key]['Sku'].Stock,
                            "data-Parc"              : obj[key]['Sku'].InstallmentMax.MaxNumber,
                            "data-Description"       : obj[key]['Sku'].InstallmentMax.Description,
                            "data-Value"             : obj[key]['Sku'].InstallmentMax.Value
                        })

                        if(obj[key]['Sku'].Stock == 0) {
                            $(identifier, container).addClass('sold')
                        }
                    }
                });

            }
        });
    },
    //funcao responsavel pela criacao do html
    generateHTML: function(imageURL, Color, IdVariation, IdVariationFather,  Name, reference) {

        //criando o html do tipo imagem
        if(imageURL) {

            btn = '\n\
                <div class="ui variacao img" data-variation="'+ IdVariation +'" '+IdVariationFather+'>\n\
                    <img src="' + imageURL + '" alt="' + Name + '" data-tooltip="' + Name + '" title="' + Name +'">\n\
                    <div class="ui checkbox hideme checked">\n\
                        <input type="radio" name="' + Name + '" class="hidden">\n\
                        <label></label>\n\
                    </div>\n\
                </div>';
        } else {

            //criando o html dos outros tipos
            bg = (Color ? 'style="background-color: '+ Color +' !important"' : "")

            btn = '\n\
                <div class="ui variacao check" data-variation="'+ IdVariation +'" '+IdVariationFather+'>\n\
                    <button class="ui basic button" '+ bg +' data-tooltip="'+ Name +'">'+ (bg == "" ? Name : "") +'</button>\n\
                    <div class="ui checkbox hideme">\n\
                        <input type="radio" name="'+ Name +'" class="hidden">\n\
                        <label></label>\n\
                    </div>\n\
                </div>';
        }

        if(IdVariationFather) {
            if($('.variations [data-variation="'+ IdVariation +'"]['+IdVariationFather+']', this.config.container).length == 0)
                $('.references[data-reference="'+reference+'"] .variations', this.config.container).append(btn)
        } else {
            $('.references[data-reference="'+reference+'"] .variations', this.config.container).append(btn)
        }

    },
    //funcao responsavel por esconder as variacoes iniciais
    hideVariations: function() {

        container = $(this.config.container);

        var selectInitial = new Array(),
            referenceDefault = $('.references:not([data-active])', container);

        //caso nao exista uma grade default, setamos a primeira opcao
        if($('.references .variacao.select', container).length == 0) {

            if($('.references', container).length > 1)
                $(".references[data-active] .variacao:eq(0)", container).click();
            else
                referenceDefault = $(".references[data-active]", container);

            referenceDefault.each(function() {
                if($(this).is(":last-child")) {

                    if($('.variacao:eq(0)', this).data("stock") > 0)
                        $('.variacao:eq(0)', this).click()
                    else
                        $('.variacao', this).each(function(index, el) {
                            if($(el).data("stock") > 0) {
                                $(el).click();
                                return false;
                            }
                        })

                } else {
                    $('.variacao:eq(0)', this).click()
                }

            });

            if($(this.config.getSession).length === 0)
                this.haveInWishList($('#produto-id').val(), $("#produto-sku").val(), null);

        } else {
            //recuperando a grade padrao e escondendo as demais
            $('.references:not([data-active]) .variacao.select', container).each(function() {
                selectInitial.push($(this).data('reference') + ':' + $(this).data('variation'))
            });

            $(".references[data-active] .variacao.select", container).click();

            $.each(selectInitial, function(index, el) {
                $(".references:not([data-active]) .variacao[data-reference='"+ el.split(":")[0] +"'][data-variation='"+ el.split(":")[1] +"']", container).click();
            })
        }

        container.addClass(this.config.loadedClass)

        if(!this.isDevice()) {
            $(".easyzoom").easyZoom().init();
        }
        this.getImageThumbnail();

    },
    //funcao para criar as acoes do click de cada variacao
    clickBtn: function(container) {

        var classLoaded = this.config.loadedClass;

        $('.variacao', container).click(function() {

            //removendo o sku selecionado
            $(variations.config.productSKU).val('')

            reloadVariations = true;
            var elemento = this;
            while (elemento.parentElement) {
                elemento = elemento.parentElement;
                if (elemento.getAttribute('id') === 'variations-buy-together') {
                    reloadVariations = false;
                    break;
                }
            }

            //removendo a mensagem de estoque
            if (reloadVariations)
                $('#' + variations.config.stock.messageStockContainer).remove()

            //se for a ultima variacao, realiza a atualizacao de valores do produto, caso contrario percorre o fluxo para esconder ou mostrar as variacoes
            if($(this).data("skucode")) {
                $(this).siblings().removeClass("select");
                $(this).addClass("select")

                //atualizando valores
                variations.reloadValues($(this), reloadVariations)

            } else {

                $(variations.config.itensDisable.btnBuy).addClass("disabled")
                $(variations.config.itensDisable.btnSignature).addClass("disabled")

                //verificando se e a primeira referencia e recuperando o ID inicial
                if($(this).closest(".references[data-active]").length > 0) {

                    $(".references", container).removeClass("active")

                    var _idFather = "";

                    $('.ui.variacao', container).removeClass('select')
                    _idFather = ($(this).data('variation'))

                    $(this).addClass("select")

                } else {

                    //removendo as referencias ativas e variacoes selecionadas
                    $(this).closest(".references:not([data-active])").removeClass("active").next(".references:not([data-active])").find('.variacao').removeClass("select")

                    //montando o ID da referencia para mostrar ou esconder as variacoes
                    _idFather = $(".references[data-active] .variacao.select", container).data('variation');
                    $(this).siblings().removeClass("select");
                    $(this).addClass("select")
                    $(this).closest(".references").addClass("active")

                    $('.references:not([data-active]) .variacao:not([data-skucode]).select', container).each(function(index, el) {
                        _idFather = _idFather + "-" + ($(this).data('variation'));

                    });

                }

                //mostrando e escondendo variacoes atreladas a referencia
                $(".references:not([data-active]):not(.active)", container).find('.variacao').each(function(index, el) {

                    itens = $(this).attr('data-reference');

                    if(itens.toString() !== _idFather.toString() && itens.toString() !== $(".references[data-active] .variacao.select", container).data('variation').toString()) {
                        $(this).hide();
                    } else {
                        $(this).show()
                    }

                });

            }

            //buscando as imagens da variacao
            if(container.hasClass(classLoaded))
                variations.getImageThumbnail();
        })
    },
    getImageThumbnail: function() {

        if(this.config.callAjaxImage && $(this.config.container).length > 0 && $('.' + this.config.loadedClass + ':eq(0) .variacao.select').length > 0) {
            //setando as variacoes selecionadas para carregar as imagens de multifotos
            var variationSelect = new Array();

            $('.' + this.config.loadedClass + ':eq(0) .references .variacao.select').each(function () {

                variationSelect.push($(this).closest('.references').data('reference') + '-' + $(this).data('variation'))
            });

            $(this.config.selectedReferences).val(variationSelect.join())

            $.ajax({
                url: '/Product/SlideCor/',
                type: 'POST',
                data: {
                    json: $("#lista-imagens-slide").val(),
                    variacao: variationSelect.join()
                },
                dataType: 'html',
                success: function (response) {

                    $("#exibePartial").html(response);

                    if ($("#buy-together .image.medium").length > 0) {
                        $("#buy-together .image.medium")[0].children[0].src = $("#imagem-padrao").attr("data-src")
                    }

                    //aplicando scroll e ativando o zoom
                    variations.slickZoom()

                }
            });
        } else {
            this.slickZoom()
        }
    },
    isDevice: function() {

        var isiDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone|phone/i.test(navigator.userAgent.toLowerCase());
        return isiDevice;
    },
    slickZoom: function() {

        //apos buscar as imagens, aplicamos o lazyload e o slideshow
        $('#exibePartial img[data-src]').visibility({
            type       : 'image',
            transition : 'fade in',
            duration   : 1000,
            observeChanges: true,
            once:true,
            silent: true,
            debug: false
        });

        if(!this.isDevice()) {
            $(".easyzoom").easyZoom().init();
        } else {
            this.toggleZoom()
        }
        this.gallery()

    },
    gallery: function() {
        ($('.car-gallery').hasClass("slick-slider") ? $('.car-gallery').slick('destroy') : "");

        $('.car-gallery').slick({
            prevArrow: '<a class="slick-prev ui mini button basic black icon"><i class="chevron left icon"></i></a>',
            nextArrow: '<a class="slick-next ui mini button basic black icon"><i class="chevron right icon"></i></a>',
            dots: false,
            slidesToShow: 3,
            mobileFirst:true,
            useTransform:false,
            infinite:false
        });

        this.thumbAction()
    },
    thumbAction: function() {

        $('.thumbnails a:not(.slick-arrow)').on('click', function (e) {

            var $this = $(this),
                $toggle = $('.toggleZoom'),
                $easyzoom = $(".easyzoom");

            e.preventDefault();

            $this.parents(".slick-slide").siblings().removeClass("slick-current")
            $this.parents(".slick-slide").addClass("slick-current")

            if ($this.data("video-url").length > 0) {
                $("#imagem-padrao").hide();
                $("#imagem-padrao").attr('style', 'display: none !important');
                $(".seals").attr('style', 'display: none !important');

                $("#video-product").attr('src', $this.data("video-url"));

                $("#video-product").show();
            } else {
                $(".seals").show();
                $("#imagem-padrao").show();
                $("#video-product").hide();
                $("#video-product").attr('src', '');
            }

            // Reset EasyZoom instance
            $easyzoom.each(function () {
                var api = $(this).data('easyZoom');
                if (api) {
                    api.teardown();
                }
            });
 
            if ($toggle.data("active") === true || !variations.isDevice()) {
                $easyzoom.easyZoom().filter('.easyzoom--with-thumbnails').data('easyZoom').swap($this.data('standard'), $this.attr('href'));
            } else {
                $(">a", ".easyzoom").attr("href", $this.data('standard'))
                $(">a>img", ".easyzoom").attr("src", $this.data('standard'))
            }

            // Reinitialize EasyZoom instance
            $easyzoom.easyZoom();

        });
    },
    toggleZoom: function() {
        $('.toggleZoom').on('click', function(e) {

            var $this = $(this),
                $easyzoom = $(".easyzoom");


            if ($this.attr("data-active") === true || $this.attr("data-active") === "true") {
                $this.text("Habilitar Zoom").attr("data-active", false);
                $easyzoom.easyZoom().filter('.easyzoom--with-toggle').data('easyZoom').teardown();
            } else {
                $this.text("Desativar Zoom").attr("data-active", true);
                $easyzoom.easyZoom().init();
            }
        });
    },
    //formatando numeros em moeda
    moneyBR: function(money) {
        money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
        return money;
    },
    //atualizando os valores
    reloadValues: async function (values, reloadValues = true) {

        var IdSku = values.data("idsku");
        var quantity = parseInt($(this.config.htmlPrice.quantity).val());
        var Price = values.data("price") * quantity;
        var PricePromotion = values.data("pricepromotion") * quantity;
        var PriceCA = values.data("priceca") * quantity;
        var SkuCode = values.data("skucode");
        var Stock = values.data("stock");
        var Parc = values.data("parc");
        var Value = values.data("value");
        var Description = values.data("description");
        var Discount = parseFloat($(this.config.htmlPrice.discountBillet).val().replace(',', '.'));
        var personalization = $(this.config.personalization.total.container).length > 0;
        var isLoaded = $(this.config.container).hasClass("loaded");
        var reload = reloadValues;

        if(!isLoaded)
            await this.getDiscountStore();

        if(personalization) {

            if(PricePromotion > 0) {
                $(this.config.personalization.total.productValue).html(this.moneyBR(parseFloat(PricePromotion)))
                $(this.config.personalization.total.totalValue).html(this.moneyBR(parseFloat($(this.config.personalization.total.personalizationValue).text().replace(/[R$\s]/g, '').replace(',', '.')) + parseFloat(PricePromotion)))
            } else {
                $(this.config.personalization.total.productValue).html(this.moneyBR(parseFloat(Price)))
                $(this.config.personalization.total.totalValue).html(this.moneyBR(parseFloat($(this.config.personalization.total.personalizationValue).text().replace(/[R$\s]/g, '').replace(',', '.')) + parseFloat(Price)))
            }
        }

        //atribuindo os valores para utilizacao em compre-junto
        $("#produto-stock").val(Stock);
        if($("#preco-unidade").length)
            $("#preco-unidade").val(values.data("price"));
        else
            $('body').prepend(`<input type="hidden" value="${values.data("price")}" id="preco-unidade" name="preco-unidade" />`)

        if($("#preco-promocao-unidade").length)
            $("#preco-promocao-unidade").val(values.data("pricepromotion"));
        else
            $('body').prepend(`<input type="hidden" value="${values.data("price")}" id="preco-promocao-unidade" name="preco-promocao-unidade" />`)

        $("#preco-promocao-unidade").val(values.data("pricepromotion"));
        $("#parcela-maxima-unidade").val(Value);
        $("#qtd-parcela-maxima-unidade").val(Parc);
        $("#pagamento-descricao").val(Description);

        //setando o sku selecionado para adicionar ao carrinho
        $(this.config.productSKU).val(IdSku)


        //preco De e Por
        let hasPromotion = PricePromotion > 0;
        let finalPrice = hasPromotion
            ? PricePromotion
            : Price
        
        if (hasPromotion) {
            if($(this.config.htmlPrice.oldPrice).length == 0
                ? $(this.config.htmlPrice.containerValues).prepend("<span id='"+ this.config.htmlPrice.oldPrice.replace("#", "") +"'></span>")
                : $(this.config.htmlPrice.oldPrice).show()) {
                
                $(this.config.htmlPrice.oldPrice).html(this.moneyBR(Price)) //'#preco-antigo', //preco antigo
            }
        } else {
            $(this.config.htmlPrice.oldPrice).hide()
        }

        if (this.config.discountPrice.showPriceWithDiscount) {

            let eligibleDiscounts = this.config.discountPrice.paymentMethodList.filter(d => finalPrice >= d.DiscountMinimumValue);

            let element = document.querySelector(this.config.htmlPrice.containerValues);
            let divBaseDiscount = element.querySelector(`.baseDiscount`);

            if (divBaseDiscount) {
                divBaseDiscount.innerHTML = '';
            }

            if (eligibleDiscounts.length > 0) {

                let higherDiscount = _.maxBy(eligibleDiscounts, 'Discount').Discount;

                let higherDisocuntPaymentMethods = eligibleDiscounts
                higherDisocuntPaymentMethods = _.filter(higherDisocuntPaymentMethods, {'Discount': higherDiscount});
                higherDisocuntPaymentMethods = _.orderBy(higherDisocuntPaymentMethods, [d => d.Name.toUpperCase()], ['desc'])
                higherDisocuntPaymentMethods = _.take(higherDisocuntPaymentMethods, 2);

                if (higherDisocuntPaymentMethods.length > 0) {

                    let descriptionHigherDiscount = higherDisocuntPaymentMethods.length == 2
                        ? `${higherDisocuntPaymentMethods[0].Name} ou ${higherDisocuntPaymentMethods[1].Name}`
                        : higherDisocuntPaymentMethods[0].Name;

                    var discountCalc = (finalPrice - ((finalPrice / 100) * Number(higherDiscount)));


                    divBaseDiscount.innerHTML = `
                        <div class="priceDiscount">
                            ${this.moneyBR(discountCalc)}<span class="textDiscount">no ${descriptionHigherDiscount}</span></div>
                        <span class="descriptionDiscount">com ${higherDiscount}% de desconto</span>`;
                }
            }

            if(!isLoaded)
                $(this.config.htmlPrice.newPrice).attr('content', discountCalc) //'#preco', //preco promocional e/ou atual
        }

        $(this.config.htmlPrice.newPrice).html(this.moneyBR(finalPrice))
        $(this.config.htmlPrice.priceBuyTogether).html(this.moneyBR(finalPrice)) //'#preco', //preco promocional e/ou atual
        
        if (PriceCA > 0)
            $(this.config.htmlPrice.priceCA).html(this.moneyBR(PriceCA)) //'#precoCA', //preco Compra Recorrente

        //parcelamento
        $(this.config.htmlPrice.installment.containerInstallment).html(
            'em '
            + '<span id="'+ this.config.htmlPrice.installment.number.replace('#', '') +'">'+ Parc +'x de </span>'
            + '<span id="'+ this.config.htmlPrice.installment.value.replace('#', '') +'">'+ this.moneyBR(Value) +'</span>'
            + '<span id="'+ this.config.htmlPrice.installment.description.replace('#', '') +'"> ('+ Description +')</span>'
        )

        //mensagem de quantidade em estoque
        if (this.config.stock.showMessageStock) {
            if (reload) {
                if (Stock >= 1 && Stock <= this.config.stock.maxStockValue) {
                    $('[id="' + this.config.stock.messageStockContainer + '"]').remove();

                    if ($('#' + this.config.stock.messageStockContainer).length == 0) {
                        if ($(this.config.container).prop('id') !== $(this.config.containerDefault).prop('id')) {
                            $(this.config.containerDefault).append('<div class="ui label text regular basic margin top bottom medium" id="' + this.config.stock.messageStockContainer + '">' + this.config.stock.messageStockHtml.replace('${value}', Stock) + '</div>')
                        }
                        else {
                            $(this.config.container).append('<div class="ui label text regular basic margin top bottom medium" id="' + this.config.stock.messageStockContainer + '">' + this.config.stock.messageStockHtml.replace('${value}', Stock) + '</div>')
                        }
                    }
                    else {
                        $('#' + this.config.stock.messageStockContainer).html(this.config.stock.messageStockHtml.replace('${value}', Stock))
                        if ($(this.config.container).prop('id') !== $(this.config.containerDefault).prop('id')) {
                            $(this.config.containerDefault).append('<div class="ui label text regular basic margin top bottom medium" id="' + this.config.stock.messageStockContainer + '">' + this.config.stock.messageStockHtml.replace('${value}', Stock) + '</div>')
                        }
                        else {
                            $(this.config.container).append('<div class="ui label text regular basic margin top bottom medium" id="' + this.config.stock.messageStockContainer + '">' + this.config.stock.messageStockHtml.replace('${value}', Stock) + '</div>')
                        }
                    }
                }
            }
        }

        //se a variacao estiver esgotada, esconde os itens e exibe o avise-me
        if (Stock == 0) {
            $.each(this.config.itensDisable, function (index, el) {
                $(el).addClass('disabled')
            });
            if ($(this.config.itensDisable.btnBuy).is(":visible"))
                $('.visible', this.config.itensDisable.btnBuy).text('PRODUTO ESGOTADO')
            else
                $('.visible', this.config.itensDisable.btnSignature).text('PRODUTO ESGOTADO')
            $(this.config.alertMe).removeClass("hideme")
        } else {
            if ($(this.config.itensDisable.btnBuy).hasClass('disabled') || $(this.config.itensDisable.btnSignature).hasClass('disabled')) {
                $.each(this.config.itensDisable, function (index, el) {
                    $(el).removeClass('disabled')
                });
                $(this.config.alertMe).addClass("hideme")
            }
            if ($(this.config.itensDisable.btnBuy).is(":visible"))
                $('.visible', this.config.itensDisable.btnBuy).text('ADICIONAR AO CARRINHO')
            else
                $('.visible', this.config.itensDisable.btnSignature).text('ASSINAR PRODUTO')
        }

        this.reloadInstallment(false, PricePromotion > 0 ? PricePromotion : Price);


        //setando as variacoes selecionadas para utilizacao no aviseme
        var variationSelect = new Array();

        $('.references .variacao.select', "#variations-container").each(function() {
            variationSelect.push($(this).data('variation'))
        });

        $("#variacoesSelecionadas").val(variationSelect.join())

        if($(this.config.getSession).length === 0)
            this.haveInWishList($('#produto-id').val(), $("#produto-sku").val(), null);
    },
    haveInWishList: function (productID, skuID, $parent) {
        var data = {};

        if ($parent === null) {
            $parent = $("body");
        }

        var request = {};
        request.productID = productID;
        request.skuID = skuID;

        $.ajax({
            type: "POST",
            url: "/Customer/HaveInWishList",
            data: request,
            async: true,
            dataType: "json",
            success: function (response) {
                if (response.success === true) {
                    $parent.find(".wishlist-item").removeClass('grey');
                    $parent.find(".wishlist-item").addClass('red');
                    $parent.find(".wishlist-item").attr('data-in-list', 'true');
                } else {
                    $parent.find(".wishlist-item").removeClass('red');
                    $parent.find(".wishlist-item").addClass('grey');
                    $parent.find(".wishlist-item").attr('data-in-list', 'false');
                }
                data = response;
            },
            error: function (ex) {
                data.success = false;
            }
        });
        return data;
    },
    reloadInstallment(isB2b, Price) {
        var json = "",
            html = "",
            json_string = "",
            json_content = "",
            detalhes_valorParc = 0,
            detalhes_descricao = "",
            detalhes_maiorParc = 0;

        json_string = this.searchInstallment(isB2b, Price);

        if (json_string != "0") {
            json = JSON.parse(json_string);
            json_content = JSON.parse(json.Content);

            var total_parcelas_exibidas = 0;
            //GATEWAY
            for (var i = 0; i < json_content.length; i++) {
                //METHODS
                for (var j = 0; j < json_content[i].paymentMethods.length; j++) {
                    //BRANDS
                    if (json_content[i].paymentMethods[j].status === true) {
                        for (var k = 0; k < json_content[i].paymentMethods[j].paymentBrands.length; k++) {
                            var total_parcelas = json_content[i].paymentMethods[j].paymentBrands[k].installments.length;

                            if (total_parcelas > 0) {
                                total_parcelas_exibidas++;

                                if (json_content[i].idPaymentGateway == 6) {
                                    html += `
                                    <div class="title">
                                          <i class="dropdown icon"></i>
                                          ${json_content[i].paymentMethods[j].paymentBrands[k].name}
                                    </div>
                                     <div class="content">
                                        <div class="ui list">`
                                    html += `<div class="pagSeguroParcelamento" id="pagSeguroParcelamento" data-paymentbrand="${json_content[i].paymentMethods[j].paymentBrands[k].idPaymentBrand}" data-brand="${json_content[i].paymentMethods[j].paymentBrands[k].name.toLowerCase()}"> </div>`
                                    html += `</div>
                                     </div>`
                                }
                                else {
                                    html += `
                                        <div class="title">
                                            <i class="dropdown icon"></i>
                                            ${json_content[i].paymentMethods[j].paymentBrands[k].name}
                                        </div>
                                        <div class="content">
                                            <div class="ui list">`

                                    let inst = json_content[i].paymentMethods[j].paymentBrands[k].installments;

                                    for (var l = 0; l < json_content[i].paymentMethods[j].paymentBrands[k].installments.length; l++) {

                                        if (detalhes_maiorParc < inst[l].installmentNumber && inst[l].description.toLowerCase().trim() === "sem juros")//maior parcela sem juros
                                        {
                                            detalhes_maiorParc = inst[l].installmentNumber;
                                            detalhes_valorParc = inst[l].value;
                                            detalhes_descricao = inst[l].description;
                                        }

                                        html += `<span class="item parcelamentos">
                                                              <span class="parcelas">${json_content[i].paymentMethods[j].paymentBrands[k].installments[l].installmentNumber} x</span>
                                                              <span class="valor"> ${this.moneyBR(json_content[i].paymentMethods[j].paymentBrands[k].installments[l].value)} </span>
                                                              <span class="modelo">(${json_content[i].paymentMethods[j].paymentBrands[k].installments[l].description})</span>
                                                              <span class="total">Total Parcelado: ${this.moneyBR(json_content[i].paymentMethods[j].paymentBrands[k].installments[l].total)}</span>
                                                          </span>`

                                    }
                                    html += `</div>
                                        </div>`
                                }
                            }
                        }
                    }
                }
            }
        }
        if (total_parcelas_exibidas === 0) {
            html += `
            <div class="title">
               <span>Não existem parcelamento disponíveis</span>
            </div>`;
        }
        $("#parcelamento_info").html(html);
    },
    searchInstallment(isB2b, Price){
        var retorno;
        $.ajax({
            url: '/Product/BuscarParcelamento',
            type: 'POST',
            async: false,
            data: {
                Valor : Price,
                isB2b : isB2b
            },
            dataType: 'json',
            success: function (response) {
                retorno = response;
            },
            error : function(request,error)
            {
                retorno = "";
            }
        });
        return retorno;
    }
};

//variations.config = $.extend({}, defaults, options);