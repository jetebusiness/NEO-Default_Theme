import { lazyLoad } from "../../functions/lazy_load";
import { isLoading } from "../api_config";
import { _alert, _confirm } from "../../functions/message";

var configFilter = {
    config: {
        urlEventList: '/product/getproductslistevents/', //url para buscar os produtos        
        father: "#list", //div que recebe o conteudo
        container: '#filtroList', //div responsavel por receber as referencias
        filters: {
            container: '.containerFilter', //div que recebera os filtros selecionados pelo usuario
            types : { //tipos de filtros
                variations: '.checkText, .checkColor, .checkImage', //referencias - cor, tamnho, etc
                brand: '.checkBrand', //filtro de marca
                idAttribute: '.checkAtribute', // filtro de atributos
                idCategories: '.checkCategory', // filtro de categorias
                idGroupingType: '.checkGroupingType', // agrupamento de produtos
                order: '.dropdownorder', //ordenacao de produtos
                pageSize: '.dropdownitens',// quantidade de itens por pagina
                priceFilter: '.pricefilter', // filtro de preco
                viewList: '.viewgrid, .viewlist' //tipo de listagem
            }
        },
        infinity: '#infinityPage', //ativa a rolagem infinita,
        skeleton: { //cria containers fake de produtos para manter uma estrutura
            useLoading: true,
            htmlContent:'<div class="ui three doubling cards centered"></div>',
            htmlProduct: '<div class="ui card produto product-in-card skeleton"><div class="content"><div class="line img"></div><div class="line rating"></div><div class="info"><div class="dados"><div class="line name"></div><div class="line price"></div><div class="line installment"></div></div></div></div></div>'
        },
        cache: true,//armazena o html dos produtos na sessao ao clicar em um produto para aumentar a perfomance. (caso nao utilize essa opcao, as paginas serao chamadas de forma assincrona o que causa uma lentidao no carregamento)
        pageQuantity: '#itensPage', //quantidade de itens por pagina
        initialPrice: '#initialPrice', //preco inicial
        finalPrice: '#finalPrice', //preco final
        viewUrl: '#ViewProductFiltersUrl', //visualiza filtros na url
        currentPage: '#CurrentPage', //pagina atual
        currentValue: '#GenericPageFilter', //valor da pagina atual
        eventList: '#idEventListFilter', //caso seja uma lista de evento
        nameSession: 'filterNew', //nome da sessao dos filtros
        nameSessionPosition: 'scrollPosition', //nome da sessao para armazenar a posicao do usuario
        pagination: {
            prev: '#previousPage',//pagina anterior
            next: '#nextPage',//proxima pagina
            number: '.btnPageNumber', //numero da pagina
            htmlInfinity: '<div class="ui container"><div class="ui button basic primary margin none loading">Carregando...</div></div>' //botao de loading ao rolar a pagina
        }
    }
};


var newFilter = {
    init: function() {

        if(window.location.pathname.indexOf("/produto/") === -1) {
            this.setSession()//verificando sessao para criar ou recuperar valores
            this.actionFilter() //criando acoes dos filtros
            this.pagination() //criando paginacao
        }

    },
    setSession: function(reset) {

        if(sessionStorage.getItem(configFilter.config.nameSession) == null ||
            sessionStorage.getItem(configFilter.config.nameSession) === undefined ||
            sessionStorage.getItem(configFilter.config.nameSessionPosition) === null ||
            sessionStorage.getItem(configFilter.config.nameSessionPosition) === undefined ||
            reset) {
            sessionStorage.setItem(configFilter.config.nameSession, JSON.stringify(this.resetFilter())); //criando valores
            sessionStorage.removeItem(configFilter.config.nameSessionPosition);
        } else
            this.getFilter(); //recuperando valores

    },
    urlProducts: function() {
        return "/product/getproducts"+
            ($(configFilter.config.currentPage).length > 0 
                && $(configFilter.config.currentPage).val() !== "" 
                && $(configFilter.config.currentPage).val() !== "keyWord"
                ? $(configFilter.config.currentPage).val()
            : "")+"/";
    },
    actionFilter: function() { //atribuindo acoes aos filtros das paginas de listagem

        Object.entries(configFilter.config.filters.types).forEach(function (key) { //enquanto existir tipos de filtros
            var drop = (key[0] === "order" || key[0] === "pageSize");

            if(drop) { //se for ordenacao ou quantidade de itens por pagina

                $(key[1]).dropdown({
                    onChange: function () {

                        var params = {
                            [key[0]]: $(this).dropdown("get value"),
                            pageNumber: 1
                        }

                        newFilter.getFilter(params);
                    }
                });

            } else if(key[0] === "viewList") { //se for tipo de lista

                $(key[1]).on("click", function () {

                    var params = {
                        viewList : ($(this).attr("id") === "viewgrid" ? "g" : "l"),
                        pageNumber: 1
                    }

                    newFilter.getFilter(params);

                });

            } else if(key[0] === "priceFilter") { //se for filtro de preco

                $(key[1]).on("click", function () {

                    var initial = $(configFilter.config.initialPrice).val().replace(".", "").replace(",", ".");
                    var final = $(configFilter.config.finalPrice).val().replace(".", "").replace(",", ".");

                    if(initial !== "" || final !== "") {

                        if(initial !== "" && final !== "" && parseFloat(initial) > parseFloat(final))
                            _alert("Atenção", "Preço 'DE' não pode ser maior que o preço 'ATÉ'", "warning");

                        if(initial === "")
                            initial = "0.01"

                        if(final === "")
                            final = "99999999"

                        var params = {
                            initialPrice: initial, //preco inicial
                            finalPrice: final, //preco final
                            pageNumber: 1
                        }

                        newFilter.getFilter(params);

                    } else {
                        _alert("Atenção", "Informe preço mínimo e/ou preço máximo!", "warning");
                    }

                });

            } else {

                $(key[1]).on("click", function () { //filtro por referencia, categoria, agrupamento, etc

                    var selected = {};

                    $(this).toggleClass("filter-selected basic").blur()

                    if($(".filter-selected", configFilter.config.container).length > 0) {

                        $(".filter-selected", configFilter.config.container).each(function () {

                            if (selected[$(this).data("type")] === undefined) {

                                selected[$(this).data("type")] = $(this).attr("id");

                            } else {

                                if (selected[$(this).data("type")].indexOf($(this).attr("id")) === -1) {
                                    selected[$(this).data("type")] = selected[$(this).data("type")] + "," + $(this).attr("id")
                                }

                            }

                        });

                        selected["pageNumber"] = 1;

                        Object.keys(configFilter.config.filters.types).forEach(function (key) {
                            if(selected[key] === undefined && key !== "pageSize")
                                selected[key] = "";
                        });

                        newFilter.getFilter(selected);

                    } else {

                        newFilter.setSession(true);
                        selected["pageNumber"] = 1;
                        newFilter.getFilter(selected);

                    }
                })

            }

        });
    },
    verifyPage: function(url) { //verificando a pagina para manter os filtros na sessao

        var urlClient = window.location.pathname;

        if($(configFilter.config.currentPage).length > 0) { //se for categoria, grupo, busca ou marca, compara com a pagina na sessao

            if(urlClient === url) {//se a pagina atual for igual a sessao continua caso contrario retorna 

                if(urlClient.indexOf("/busca") > -1 && window.location.search !== ""){ //limpando a sessao caso exista novo parametro na busca                    

                    var queryString = window.location.search.slice(1).split('&');

                    if(queryString.length > 1) {

                        var result = "";

                        queryString.forEach(function (query) {
                            query = query.split('=');

                            if(query[0] === "n") {
                                result = query[1];
                            }
                        });
                    }


                    if(JSON.parse(sessionStorage.getItem(configFilter.config.nameSession))["keyWord"].replace(/[^a-z0-9\s+]/gi, '') !==
                        decodeURIComponent(result).replace(/[^a-z0-9\s+]/gi, '').replace(/\+/gi, ' '))
                        return false;
                    else
                        return true;
                } else {
                    return true;
                }

            } else {
                return false;
            }

        } else if($("#produto-id").length > 0) { //se for pagina de produto, mantem os filtros na sessao

            return true;

        } else {

            return false;
        }

    },
    resetFilter: function() { //limpando filtros

        return {
            path : window.location.pathname, //pagina atual
            viewList: "g", //g = grid, l = list
            pageNumber: 1, //pagina inicial
            pageSize: (parseInt($(configFilter.config.pageQuantity).val()) === 0 ? 12 : parseInt($(configFilter.config.pageQuantity).val())) , //quantidade por pagina inicial
            order: "", //ordenacao dos produtos
            brand: ($(configFilter.config.currentPage).val() === "brand" ? $(configFilter.config.currentValue).val() : ""), //recuperando valor da marca se existir
            category: ($(configFilter.config.currentPage).val() === "category" ? $(configFilter.config.currentValue).val() : ""), //recuperando valor da categoria se existir
            group: ($(configFilter.config.currentPage).val() === "group" ? $(configFilter.config.currentValue).val() : ""), //recuperando valor do grupo se existir
            keyWord: ($(configFilter.config.currentPage).val() === "keyWord" ? $(configFilter.config.currentValue).val() : ""), //recuperando valor da busca se existir,
            initialPrice: "", //preco inicial
            finalPrice: "", //preco final
            variations: "", //variacoes selecionadas
            idAttribute : "", //atributos selecionados
            idEventList : ($(configFilter.config.eventList).length > 0 ? $(configFilter.config.eventList).val() : ""), //id da lista de evento
            idCategories : "", //id das categorias selecionadas
            idGroupingType : "" //ids dos agrupamentos selecionados
        }
    },
    checkFilter: function() { //funcao responsavel por recuperar os filtros da sessao e atribuir a classe de ativo

        var filters = JSON.parse(sessionStorage.getItem(configFilter.config.nameSession));

        Object.keys(configFilter.config.filters.types).forEach(function (key) {

            if(filters[key] !== "" && filters[key] !== undefined && key !== "pageSize" && key !== "viewList") {

                if(filters[key].indexOf(",") > -1) {

                    var itens = filters[key].split(","),
                        element = "";

                    for(var i = 0; i < itens.length; i++) {

                        element = $("[data-type='"+key+"'][id='"+itens[i]+"']");

                        if(key === "variations") {

                            element
                                .removeClass("basic")
                                .addClass("checked filter-selected")
                                .next(".checkbox.hideme")
                                .addClass("checked")
                                .find("input")
                                .attr("checked", true)

                        } else {

                            element
                                .addClass("checked filter-selected")
                                .find("input")
                                .attr("checked", true)
                        }

                    }
                } else {

                    element = $("[data-type='"+key+"'][id='"+filters[key]+"']");

                    if(key === "variations") {

                        element
                            .removeClass("basic")
                            .addClass("checked filter-selected")
                            .next(".checkbox.hideme")
                            .addClass("checked")
                            .find("input")
                            .attr("checked", true)

                    } else {

                        element
                            .addClass("checked filter-selected")
                            .find("input")
                            .attr("checked", true)

                    }
                }
            }

        });

    },
    createLabel: function() { //criando o label dos filtros selecionados e ou presentes na sessao

        var filters = JSON.parse(sessionStorage.getItem(configFilter.config.nameSession));

        $(configFilter.config.filters.container).html('')

        Object.keys(configFilter.config.filters.types).forEach(function (key) {

            if(filters[key] !== "" && filters[key] !== undefined && key !== "order" && key !== "pageSize" && key !== "viewList") {

                if(filters[key].indexOf(",") > -1) {

                    var itens = filters[key].split(","),
                        element = "",
                        text = "";

                    for(var i = 0; i < itens.length; i++) {

                        element = $("[data-type='"+key+"'][id='"+itens[i]+"']");

                        text = element.text().trim()

                        if(text.trim() === "") {
                            if(element.attr("style"))
                                text = '<button class="ui button circular icon mini" style="'+element.attr("style")+'"></button>';
                            else
                                text = element.html()
                        }

                        $(configFilter.config.filters.container).append("<label class='ui label basic text capitalize' " +
                            "data-type='"+key+"' " +
                            "data-id='"+itens[i]+"'>" +
                            ""+element.data("reference") + ": " + text +"" +
                            "<i class='icon close'></i>"+
                            "</label>");

                    }

                } else {

                    element = $("[data-type='"+key+"'][id='"+filters[key]+"']");

                    text =  element.text().trim();
                    
                    if(text.trim() === "") {
                        if(element.attr("style"))
                            text = '<button class="ui button circular icon mini" style="'+element.attr("style")+'"></button>';
                        else
                            text = element.html()
                    }

                    $(configFilter.config.filters.container).append("<label class='ui label basic text capitalize' " +
                        "data-type='"+key+"' " +
                        "data-id='"+filters[key]+"'>" +
                        ""+element.data("reference") + ": " + text +"" +
                        "<i class='icon close'></i>"+
                        "</label>");

                }
            }

        });

        if((filters["initialPrice"] !== "" && filters["initialPrice"] !== undefined) || (filters["finalPrice"] !== "" && filters["finalPrice"] !== undefined)) {

            var initial = filters["initialPrice"];
            var final = filters["finalPrice"];

            $(configFilter.config.filters.container).append("<label class='ui label basic' " +
                "data-type='priceFilter' " +
                "data-id='priceFilter'>" +
                "Preço: " + initial +" a " + final +
                "<i class='icon close'></i>"+
                "</label>");

        }


        $("label[data-type][data-id]", configFilter.config.filters.container).one("click", function() {

            var type = $(this).data("type"),
                id = $(this).data("id");

            $(this).remove()

            if(id === "priceFilter") {

                var params = {
                    initialPrice: "", //preco inicial
                    finalPrice: "", //preco final
                    pageNumber: 1
                }  
                
                newFilter.getFilter(params);

            } else {
                $("[data-type='"+type+"'][id='"+id+"']", configFilter.config.container).click()
            }

            $(window).scrollTop($(configFilter.config.father).offset().top - 200)

        });

    },
    filterURL: function() { //funcao responsavel por atribuir os filtros selecionados na url

        if($(configFilter.config.viewUrl).length > 0 && $(configFilter.config.viewUrl).val().toLowerCase() === "true") {

            var filters = JSON.parse(sessionStorage.getItem(configFilter.config.nameSession));

            var queryString = window.location.origin + window.location.pathname + '?' +
                Object.keys(filters).map(function (key) {
                    if (key !== "" && filters[key] !== "" && key !== "path") {
                        return ((key === "keyWord") ? "n" : key) + '=' + filters[key];
                    } else {
                        return "";
                    }
                }).filter(x => typeof x === 'string' && x.length > 0).join('&');

            window.history.pushState(null, null, queryString);


        }
    },
    getFilter: function(params) { //verificando se existe conteudo para atualizar

        var update = true;

        var filters = JSON.parse(sessionStorage.getItem(configFilter.config.nameSession));

        if(params) {

            Object.entries(params).forEach(function (key) {
                if(key[0] !== $(configFilter.config.currentPage).val())
                    filters[key[0]] = key[1];
            });

            update = false;

        }

        if(this.verifyPage(filters.path)) //verificando se a pagina possui filtros
            ((JSON.stringify(filters) !== JSON.stringify(this.resetFilter()) || params) //comparando os valores do filtro com os default
                ? this.updateProducts(filters, update) : //se os filtros na sessao forem diferentes do valor default entao atualizamos os produtos
                "")
        else
            this.setSession(true);

    },
    updateProducts: function(filters, update) {  //atualizando o conteudo 

        if($(configFilter.config.infinity).length > 0 && $(configFilter.config.infinity).val().toLowerCase() === "true") {

            if (update) {

                if(configFilter.config.cache) {

                    if(sessionStorage.getItem(configFilter.config.nameSessionPosition) !== null && sessionStorage.getItem(configFilter.config.nameSessionPosition) !== "") {
                        var html = JSON.parse(sessionStorage.getItem(configFilter.config.nameSessionPosition)).html,
                            position = JSON.parse(sessionStorage.getItem(configFilter.config.nameSessionPosition)).position;

                        $(configFilter.config.father).html(html)

                        setTimeout(function() {
                            lazyLoad()

                            $('html, body').animate({ scrollTop: position}, 1000);

                            $(".ui.dropdown", configFilter.config.father).dropdown();
                            $(".ui.rating", configFilter.config.father).rating()
                        },500)
                    }

                } else {

                    var forPage = parseInt(filters.pageNumber),
                        pageInit = 1,
                        containers = "";

                    for (var i = 1; i <= forPage; i++) {
                        containers += "<div class='content' data-grid-number='" + i + "'></div>";
                    }

                    $(configFilter.config.father).html(containers)

                    if(configFilter.config.skeleton.useLoading) {

                        $("[data-grid-number]", configFilter.config.father).html(configFilter.config.skeleton.htmlContent)

                        for (var i = 1; i <= (parseInt($(configFilter.config.pageQuantity).val()) === 0 ? 12 : parseInt($(configFilter.config.pageQuantity).val())); i++) {
                            $("[data-grid-number]", configFilter.config.father)
                                .find(".cards")
                                .append(configFilter.config.skeleton.htmlProduct);
                        }

                    }

                    while (pageInit <= forPage) {

                        filters.pageNumber = pageInit;

                        $.when(
                            $.ajax({
                                url: ($(configFilter.config.eventList).length > 0 && $(configFilter.config.eventList).val() !== "" ? configFilter.config.urlEventList : this.urlProducts()),
                                method: "GET",
                                dataType: "html",
                                data: filters
                            })
                        ).then(function (data, status, response) {
                            var content = response.responseText.match(/data-grid-number\=\"([0-9]*)\"/i)[1];

                            if (content == 0)
                                $(configFilter.config.father).append(data);
                            else
                                $(".content[data-grid-number='" + content + "']", configFilter.config.father).html(data);



                            if(content < forPage)
                                $("#container-paginate:not(.disabled)", configFilter.config.father).remove()
                            else
                                $("#container-paginate.disabled", configFilter.config.father).remove()


                            lazyLoad()

                            $(".ui.dropdown", configFilter.config.father).dropdown();
                            $(".ui.rating", configFilter.config.father).rating()
                        });

                        pageInit++;
                    }
                }


            } else {

                $.ajax({
                    url: ($(configFilter.config.eventList).length > 0 && $(configFilter.config.eventList).val() !== "" ? configFilter.config.urlEventList : this.urlProducts()),
                    method: "GET",
                    dataType: "html",
                    data: filters,
                    success: function (data) {

                        if(filters.pageNumber === 1) {
                            $(configFilter.config.father).html(data);
                        } else {
                            $(data).insertAfter($(".type-grid, .type-list", configFilter.config.father).last());
                            $("#container-paginate:last-child", configFilter.config.father).remove()
                        }

                        lazyLoad();
                        $(".ui.dropdown", configFilter.config.father).dropdown();
                        $(".ui.rating", configFilter.config.father).rating()
                    }
                })
            }
        } else {

            if($(configFilter.config.father).length)
                $('html, body').animate({ scrollTop: $(configFilter.config.father).offset().top - 200 }, 1000);

            isLoading(configFilter.config.father);

            $.ajax({
                url: ($(configFilter.config.eventList).length > 0 && $(configFilter.config.eventList).val() !== "" ? configFilter.config.urlEventList : this.urlProducts()),
                method: "GET",
                dataType: "html",
                data: filters,
                success: function (response) {
                    $(configFilter.config.father).html(response);
                    lazyLoad();
                    $(".ui.dropdown", configFilter.config.father).dropdown();
                    $(".ui.rating", configFilter.config.father).rating()
                }
            });

        }

        sessionStorage.setItem(configFilter.config.nameSession, JSON.stringify(filters)); //criando valores        
        this.createLabel();
        this.checkFilter();
        this.pagination();
        this.filterURL();
    },
    pagination: function() {

        if($(configFilter.config.infinity).length > 0 && $(configFilter.config.infinity).val().toLowerCase() === "true") {

            this.activeScroll()
            this.position()

        } else {

            $(document).one('click', configFilter.config.pagination.prev, function() {
                var isDisabled = $(this).hasClass("disabled");
                if (!isDisabled) {
                    var params = {
                        pageNumber: $(this).data("number")
                    }
                    $(this).addClass("disabled")
                    newFilter.getFilter(params);
                }
            })

            $(document).one('click', configFilter.config.pagination.next, function() {
                var isDisabled = $(this).hasClass("disabled");
                if (!isDisabled) {
                    var params = {
                        pageNumber: $(this).data("number")
                    }
                    $(this).addClass("disabled")
                    newFilter.getFilter(params);
                }
            })

            $(document).one('click', configFilter.config.pagination.number, function() {
                var isDisabled = $(this).hasClass("disabled"),
                    isActive = $(this).hasClass("active");
                if (!isDisabled && !isActive) {
                    var params = {
                        pageNumber: $(this).data("number")
                    }
                    $(this).addClass("disabled")
                    newFilter.getFilter(params);
                }
            })


            this.position()

        }
    },
    activeScroll: function() {

        $(window).scroll(function() {
            if($(".type-grid, .type-list", configFilter.config.father).length > 0 &&
                $("#container-paginate", configFilter.config.father).length > 0 &&
                $(window).scrollTop() > $(".type-grid, .type-list", configFilter.config.father).last().offset().top - 500) {
                if(!$(configFilter.config.pagination.next).hasClass("disabled")) {
                    $(configFilter.config.pagination.next).addClass("disabled");


                    var lastPage = $(configFilter.config.pagination.next).data("last-page"),
                        page = $(configFilter.config.pagination.next).data("number"),
                        params = {
                            pageNumber: page
                        };

                    $("#container-paginate", configFilter.config.father).html(configFilter.config.pagination.htmlInfinity);

                    if(page !== undefined && page <= lastPage) {

                        newFilter.getFilter(params);

                        setTimeout(function() {
                            $(configFilter.config.pagination.next).removeClass("disabled")

                            if($('img[src^="/assets/image/"][data-src]').length > 0)
                                lazyLoad()

                        },3000)
                    } else {
                        $("#container-paginate.disabled", configFilter.config.father).remove()
                    }

                }
            }
        })

    },
    position: function() {

        $(document).on("click", "[id^=Product_]", function () {

            var content = {
                position : $(window).scrollTop(),
                html : $(configFilter.config.father).html()
            }

            sessionStorage.setItem(configFilter.config.nameSessionPosition, JSON.stringify(content)); //criando valores   
        });

    }

};


$(function () {


    newFilter.init();

})

