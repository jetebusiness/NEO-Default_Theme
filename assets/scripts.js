
$(document).ready(function ($) {
    $('.navigation-todos-item').hover(function () {
        $(this).find('.submenu').addClass('open');
    }, function () {
        $(this).find('.submenu').removeClass('open');
    });

    $('.menu-toggle').click(function () {
        $('.menu-mobile').addClass('open');
    })
    $('.close-menu').click(function () {
        $(this).parent().removeClass('open');
    })

    $('.menu-wrapper li .item').click(function () {
        $(this).children('svg').toggleClass('arrow');
        $(this).next().slideToggle();
    })
    $('.menu .navigation ul').find('li').hover(function () {
        $(this).children('.submenu').addClass('open');
    }, function () {
        $(this).children('.submenu').removeClass('open');
    });

    $('.close-desconto-boleto').click(function () {
        $(this).parent().hide();
    });


    $('#closeModalMiniCart').on('click', function(){
        $('.fecharCarrinho').click();
    });

    $('#barDiscount .mensagem').on('click',function(){
        $('.modal-discount-rules').modal('toggle');
    });

    (function () {

        /** Get main variables on load. */
        let offset = $(window).scrollTop();

        /** Check for offset on load. */
        if (offset > 40) $('.cabecalho').addClass('sticky');

        /** Check for offset on scroll. */
        $(window).on('scroll', () => {

            /** Check current offset. */
            offset = $(window).scrollTop();
            if (offset > 40) {
                $('.cabecalho').addClass('sticky');
            } else {
                $('.cabecalho').removeClass('sticky');
            }

            if($(window).scrollTop() > 100 && $(window).width() > 1300 ){
                /* $('#checkoutColumn3').css({'top': '20px', 'position':'fixed','margin-right':'5%'}); */
            }else if($(window).scrollTop() < 100 && $(window).width() > 1300 ){
                $('#checkoutColumn3').css({'top': 'initial', 'position':'absolute','margin-right':'inherit'});
            }
        });
    }());

});



let maxValParceirAco = 0;
$(document).ready(function () {
    const url = location.pathname

    if (url.toString().split('/')[1] === "produto") {

        insereMsgAlertaVariacao()

        //primeiro click #preco
        $("#variations-container .references:nth-child(1) .variations .variacao").click(function () {
            $('#variacao-preco').hide();
            $("#variations-container .references:nth-child(2) .alert-price-variations").css("display", "block");
            $("#variations-container .references:nth-child(3) .alert-price-variations").hide();

            exibeMsgAlertaCep()
        });

        //segundo click
        $("#variations-container .references:nth-child(2) .variations .variacao").click(function () {
            $('#variacao-preco').hide();
            $("#variations-container .references:nth-child(2) .alert-price-variations").hide();
            $("#variations-container .references:nth-child(3) .alert-price-variations").css("display", "block");
        });

        //terceiro click
        $("#variations-container .references:nth-child(3) .variations .ui.variacao.check").click(function () {
            // console.log($(this).parents('#variations-container').find('.references').length());

            if ($('#variations-container').children('.references').length == 3) {
                $('#variacao-preco').show();
                escondeMsgAlertaCep();
                atualizaQuantidade();
            }

            $("#variations-container .references:nth-child(2) .alert-price-variations").hide();
            $("#variations-container .references:nth-child(3) .alert-price-variations").hide();
            $("#variations-container .references:nth-child(4) .alert-price-variations").css("display", "block");

        });
        //quarto click
        $("#variations-container .references:nth-child(4) .variations .variacao").click(function () {

            if ($('#variations-container').children('.references').length == 4) {
                $('#variacao-preco').show();
                escondeMsgAlertaCep();
                atualizaQuantidade();
            }
            // $('#variacao-preco').css("display", "block");
            $("#variations-container .references:nth-child(3) .alert-price-variations").hide();
            $("#variations-container .references:nth-child(4) .alert-price-variations").hide();



            escondeMsgAlertaCep()
            atualizaQuantidade()
        });



        const lastposition = url.split('/').length

        if (url.split('/')[lastposition - 1] === "3016295-4487074") {
            var testeModal = setInterval(modalVisivel, 200);
        }

        function modalVisivel() {
            if ($('#swal2-content').length) {
                $('div#swal2-content').css({ 'display': 'none!important' })
                setTimeout(() => {
                    $('div#swal2-content').text('A quantidade minima de compra desse produto são 10 itens.');
                }, 200);
                return $('#swal2-content').length
            }
            return $('#swal2-content').length
        }

    }// end-if


    $('.discount-rules').click(function () {
        $('.modal-discount-rules').show()
    })
    $('i.icon.close').click(function () {
        $('.modal-discount-rules').hide()
    })

    if ($('.tela-personalizadas .column-item:nth-child(3)').length) {

        $('.tela-personalizadas .column-item:nth-child(3) ').find('.list').append('<a href="/fale-conosco" class="item" title="Fale Conosco"><h5>Fale Conosco</h5></a>');
        $('.tela-personalizadas .column-item:nth-child(2) ').find('.list').append('<a href="https://blog-solucoes.usiminas.com/ " class="item" title="Blog"><h5>Blog</h5></a>');

    }



    if ($('.menu-mobile .navigation ul.menu-wrapper>li:first-child').length) {
        firstMobileMenu('.menu-mobile .navigation ul.menu-wrapper>li:first-child')
    }


    if ($('#faixaPagamento').length || $('#trocaDevolucao').length || $('#politicaEntrega').length || $('#parceirosUsiminas').length) {
        $("h1").addClass("title-custom");
        $('h1').parent().css({
            'background': "url('https://maissolucoes.usiminas.com/assets/image/banner-pg-personalizada.png')",
            'display': 'flex',
            'width': '100%',
            'height': '350px',
            'justify-content': 'center',
            'align-items': 'center',
        })
    }

    if ($('#programaFidelidade').length) {
        $('h1').parent().parent().hide();
        $('h1').parent().parent().before(`<div class="row">
            <div class="ui container fluid margin bottom large">
                <img src="/assets/image/banner-parceiraco.png" alt="Programa de Fidelidade" class="ui fluid image"
                style="max-width: 1000px; margin: auto;">
            </div>
        </div>`)

    }

    if (url.toString().split('/')[1] === "produto") {
        var testeModalRD = setInterval(modalVisivelRD, 200);
    }

    if (url.toString().split('/')[2] === "Payment") {

        if ($('#checkoutColumn2').length) {
            $('#checkoutColumn2').removeClass('disable_column')
        }

        $('#GetShippping .ui.radio.checkbox').on("click", function () {
            let modal_count = $("body").find(".swal2-show").length;
            let dataMode = $(this).find('input').attr('data-mode')
            let hasRetirada = dataMode.toLowerCase().includes('retirada');
            if (hasRetirada && modal_count === 0){
                $('#modalPoliticaRetirada').modal('show')
            }
        })
    }


    if (url.indexOf('/Order/Details') > -1 || url.indexOf('/Order/LastOrderDetail') > -1) {
        // document.querySelectorAll('#pagePrint .item strong')[4]
        getStatusPedido('#pagePrint .item strong', 4)
    }

    if (url.indexOf('/Order') > -1) {
        var statusPedido = document.querySelectorAll('#statusPedido strong');
        statusPedido.forEach(
            function (currentValue, currentIndex) {
                getStatusPedido('#statusPedido strong', currentIndex)
            }
        );
    }
});



var ReadyModalRD = false;

function modalVisivelRD() {
    var inputForm = '[name="cf_porque_voce_esta_saindo_1"]'
    if ($(inputForm).length && !ReadyModalRD) {
        ReadyModalRD = !ReadyModalRD;

        $(inputForm).hide()

        function RdCheckbox() {

            var checkbox = document.createElement("div");
            checkbox.innerHTML = '<div id="RdCheckbox" onclick="verifyCheckbox()"> ' +
                '<div>  ' +
                ' <input type="checkbox" name="nao_encontrado" value="Não encontrei o que procurava"> ' +
                '<label for="nao_encontrado">Não encontrei o material que eu procurava</label> ' +
                '</div> ' +
                ' <div> ' +
                ' <input type="checkbox" name="altos_valores" value="Preços muito altos"> ' +
                '<label for="altos_valores">Preços muito altos</label> ' +
                '</div>' +
                ' <div> ' +
                ' <input type="checkbox" name="prazo_entrega" value="Prazo de entrega"> ' +
                '<label for="prazo_entrega">Prazo de entrega</label> ' +
                '</div>' +
                '<div> ' +
                ' <input type="checkbox" name="metodo_pagamento" value="Métodos de pagamento"> ' +
                '<label for="metodo_pagamento">Métodos de pagamento</label> ' +
                '</div>' +
                '<div> ' +
                ' <input type="checkbox" name="nao_compro_online" value="Não gosto de comprar online"> ' +
                '<label for="nao_compro_online">Não gosto de comprar online</label> ' +
                '</div>' +
                '<br>' +
                '<div> ' +
                '<label for="outros">Outro? Qual?*</label> ' +
                '<input type="text" name="outros" class="bricks-form__input  js-text" value="" required="required">' +
                '</div>' +
                '</div>';

            document.querySelector('.bricks-form__fieldset').appendChild(checkbox);



        } RdCheckbox()


        document.querySelector('input[name="outros"]').onchange = function () {
            document.querySelector(inputForm).value += document.querySelector('input[name="outros"]').value
            console.log(document.querySelector(inputForm).value)
        }
    }//fim if

}// fim function

var verifyCheckbox = () => {
    var input = document.querySelectorAll('input[type="checkbox"]')
    var textInput = ''

    input.forEach(element => {
        if (element.checked) {
            console.log(element.value)
            textInput += element.value + ','
        } else {
            return false
        }
    })

    document.querySelector('[name="cf_porque_voce_esta_saindo_1"]').value = textInput

}


function insereMsgAlertaCep() {

    var textoAlerta = document.createElement("p");
    $(textoAlerta).text("Selecione as variações para calcular o frete.").css('color', 'red');
    $(textoAlerta).toggleClass("alertaSelecao");
    $("#simular-frete-submit").parent().parent().append(textoAlerta);
}

function exibeMsgAlertaCep() {

    $("#simular-frete-submit").attr('disabled', true);
    $(".alertaSelecao").show();
}

function escondeMsgAlertaCep() {

    $("#simular-frete-submit").attr('disabled', false);
    $(".alertaSelecao").hide();
}

function atualizaQuantidade() {

    var quant = $("#quantidade").val();
    if (quant > 1) {
        $("#quantidade").val(quant - 1);
        $('#qtdplus-detalhes').click()
    }
}

function insereMsgAlertaVariacao() {

    var title1 = $("#variations-container .references:nth-child(2) .title").text();
    var title2 = $("#variations-container .references:nth-child(3) .title").text();
    var title3 = $("#variations-container .references:nth-child(4) .title").text();

    $("#variations-container .references:nth-child(2)")
        .append(
            '<span class="alert-price-variations">Selecione ' + title1
            + ' para visualizar o preço</span>'
        );

    $("#variations-container .references:nth-child(3)")
        .append(
            '<span class="alert-price-variations">Selecione ' + title2
            + ' para visualizar o preço</span>'
        );
    $("#variations-container .references:nth-child(4)")
        .append(
            '<span class="alert-price-variations">Selecione ' + title3
            + ' para visualizar o preço</span>'
        );
}

const firstMobileMenu = (item) => {
    var title = document.querySelector(item).textContent.trim();

    document.querySelector(item).innerHTML = `
    <div class="item" title="${title}">
        <a href="/categoria/todos-os-produtos">
            ${title}
        </a>
    </div>
    `
}



// document.querySelectorAll('#pagePrint .item strong')[4]
const getStatusPedido = (seletor, position) => {
    const divStatus = document.querySelectorAll(seletor)[position]
    const status = divStatus.textContent.toLocaleLowerCase()
    var statusColor = '';

    switch (status) {
        case 'novo':
            statusColor = 'status-pedido novo';

            break;
        case 'em aprovação':
            statusColor = 'status-pedido em-aprovacao';
            break;
        case 'aprovado':
            statusColor = 'status-pedido aprovado';
            break;
        case 'tracking':
            statusColor = 'status-pedido tracking'
            break;
        case 'despachado':
            statusColor = 'status-pedido despachado'
            break;
        case 'cancelado':
            statusColor = 'status-pedido cancelado'
            break;
        case 'concluido':
            statusColor = 'status-pedido cancelado'
            break;
        default:
            console.log(`Sorry, we are out of ${status}.`);
    }
    divStatus.setAttribute('class', statusColor);

    if ($('.ui.steps .active:last-child').length) {
        document.querySelector('.ui.steps .active:last-child')
            .setAttribute('class', 'active step ' + statusColor);
    }
}

/* Desconto Progressivo */
$('#discount-detail').ready(function () {
    const valueRules = [];
    document.querySelectorAll('#discount-detail .discount-rules-value').forEach((item, index) => {
        let aux = parseFloat(item.textContent.replace('R$', '').replace(',', '.').trim()).toFixed(2)
        valueRules.push(aux);
    });

    const percentageRules = [];
    document.querySelectorAll('#discount-detail .discount-rules-percentual').forEach((item, index) => {
        let aux = parseFloat(item.textContent.replace('%', '')).toFixed(2);
        $('#stepDiscount').append(`<div class="step"><span class="icon">` + item.textContent + `</span></div>`)
        percentageRules.push(aux);
    });

    let valueProdAtual = () => {
        let aux = parseFloat(document.querySelector('#preco').textContent.replace('R$', '').replace('.', '').replace(',', '.').trim())
        return aux + totalCart();
    };

    let totalCart = () => {
        let total = 0;
        let parentProduct = document.querySelector('#produto-id').value;
        let productList = document.querySelectorAll(`div[data-id-produto="${parentProduct}"]`);
        productList.forEach(product => {
            let idCart = product.getAttribute('data-id-cart');
            let valueTotal = document.querySelector(`#priceProduct_${idCart}`).textContent;
            valueTotal = valueTotal.replace('R$', '').replace('.', '').replace(',', '.').trim();
            valueTotal = parseFloat(valueTotal)
            total = total + valueTotal;
        })
        return total;
    }



    var pcentdesc, valcheiodesc, porcbol, nparc;
    if($('#barDiscount').length > 0) {
        $('#variacao-preco').parent().addClass('comprecodesc');
        atualizarValoresPrincipal();
    }

    const updateBarDiscount = (totalCarrinho, valorRegra, porcentagemRegra, indexActive) => {
        let missingValue = (valorRegra - totalCarrinho);
        let activeUnitValue = $('#preco-promocao-unidade').val() > 0 ? $('#preco-promocao-unidade').val(): $('#preco-unidade').val();
        let missingUnits = Math.ceil( missingValue / activeUnitValue );
        let previousDiscount = indexActive > 0 ? ( (100 - percentageRules[indexActive-1])/100 ) : 0;
        let oldValue = parseFloat(document.querySelector('#preco').textContent.replace('R$','').replace('.','').replace(',','.'));
        let newValue = (parseFloat(document.querySelector('#preco').textContent.replace('R$','').replace('.','').replace(',','.')) * previousDiscount)
        let valueDiscount = oldValue - newValue;

        $('#barDiscount .mensagem').attr('data-tooltip','Clique para mais informações');

        if (missingValue > 0) {
            $('#barDiscount').progress({
                value: totalCarrinho,
                total: valorRegra
            })

            $('#barDiscount .mensagem').html(`
			  	<span class="modal-info"><i class="warning circle icon" ></i></span>
				<span class="text color black">Adicione mais <span class="text color green" id="missingUnits">${missingUnits}  unidade(s)
				</span>ou <span class="text color green" id="missingValue">${missingValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }
				</span> para ganhar <span class="text color green" id="percent">${porcentagemRegra}%</span> de desconto neste item.</span>
	        `)

            indexActive > 0 ?
            $('#info-description').html(`
                <div class="row text center">
                    Com o desconto progressivo de <b class="text color usiminas green">${percentageRules[indexActive-1]}%</b>,
                    o valor passou de <span id="oldValue"> ${oldValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})} </span>
                    para <b class="text color usiminas green">${newValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</b>.
                </div>
                <div class="ui header">Nessa compra você economizou <b class="text color usiminas green"> ${valueDiscount.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</b>, entenda como:</div>
            `).removeClass('hideme')
            : 0
        } else {
            $('#barDiscount').progress({
                value: 100,
                total: 100
            })
            $('#barDiscount .mensagem').html(`Você recebeu o <span class="text color green" id="percent">${porcentagemRegra}% </span> de desconto neste item.`)
        }

        updateOrderedStep(indexActive);

        //exibe na página de produto o valor dele com o desconto progressivo aplicado
        atualizarValoresPrincipal();
        if($('#barDiscount').find('.step.completed').length > 0 && $('#variacao-preco').css('display') != 'none') {
            if($('#barDiscount .mensagem').html().match('Você recebeu')) {
                pcentdesc = Number($('#barDiscount').find('.step').last().find('.icon').html().replace('%', ''));
            } else {
                pcentdesc = Number($('#barDiscount').find('.step.completed').last().find('.icon').html().replace('%', ''));
            }
            if($('#precodesc').length == 0) {
                $('#variacao-preco').after(`
                    <div id="precodesc">
                        <span class="title">Com desconto progressivo</span>
                        <span class="price"></span>
                        <span class="descbol"></span>
                        <span class="pricebol"></span>
                        <span class="nparc"></span>
                        <span class="priceparc"></span>
                    </div>
                `);
            }
            atualizarValoresDesc(pcentdesc);
        } else if($('#precodesc').length > 0 || $('#variacao-preco').css('display') == 'none') {
            $('#precodesc').remove();
        }
    }

    //remove da página o elemento com os valores com desconto caso a variação selecionada esteja indisponível ou falte selecionar o último nível de variação
    setInterval(function(){
        if($('#variacao-preco').css('display') == 'none' && $('#precodesc').length > 0) {
            $('#precodesc').remove();
        }
    }, 500)  

    //atualiza os valores apresentados com desconto
    function atualizarValoresDesc(pcent) {
        if($('#preco').html().match(/\d*,*\d*$/)){
            valcheiodesc = Number($('#preco').html().replace('.', '').match(/\d*,*\d*$/)[0].replace('.', '').replace(',', '.'))*(100-pcent)/100;
            $('#precodesc .price').html(formatPreco(valcheiodesc));
    
            if($('#preco_boleto').html().match(/\(\d*/)) {
              porcbol = Number($('#preco_boleto').html().match(/\(\d*,*\d*/)[0].replace('(', '').replace(',', '.'));
              if(Number.isInteger(porcbol)) {
                $('#precodesc .descbol').html(porcbol+',00% de desconto no boleto');
              } else {
                $('#precodesc .descbol').html(porcbol.toString().replace('.', ',')+'% de desconto no boleto');
              }
              $('#precodesc .pricebol').html(formatPreco(valcheiodesc*(100-porcbol)/100));
            }
    
            if($('#max-p').html().match(/\d*x de/i)) {
              nparc = Number($('#max-p').html().match(/\d*x de/i)[0].replace(/x de/i, ''));
              $('#precodesc .nparc').html('até '+nparc+'X (Sem Juros)');
              $('#precodesc .priceparc').html(formatPreco(valcheiodesc/nparc));
            }
        }
    }

    /*
    atualiza os valores apresentados sem o desconto - de acordo com o elemento da plataforma já existente na página.
    foi feito desta forma para não alterar o html do elemento e não impactar os produtos que não tiverem desconto progressivo
    */
    function atualizarValoresPrincipal() {
        if($('.product-b2b').length == 0) {
            if($('#variacao-preco .valsatt').length == 0) {
              $('#variacao-preco').append(`
                <div class="valsatt">
                  <span class="descbol">${$('#preco_boleto').length > 0 && $('#preco_boleto').html().match(/\(\d*,*\d*/) ? $('#preco_boleto').html().match(/\(\d*,*\d*/)[0].replace('(', '')+'% de desconto no boleto' : ''}</span>
                  <span class="pricebol">${$('#preco_boleto').length > 0 && $('#preco_boleto').html().replace('&nbsp;', ' ').match(/R\$ \d*\.*\d*,*\d*/) ? $('#preco_boleto').html().replace('&nbsp;', ' ').match(/R\$ \d*\.*\d*,*\d*/)[0] : ''}</span>
                  <span class="nparc">até ${$('#max-p').html().match(/^\d*/)[0]}X (Sem Juros)</span>
                  <span class="priceparc">${$('#max-value').html()}</span>
                </div>
              `);
            } else {
              $('#variacao-preco .valsatt .pricebol').html($('#preco_boleto').length > 0 && $('#preco_boleto').html().replace('&nbsp;', ' ').match(/R\$ \d*\.*\d*,*\d*/) ? $('#preco_boleto').html().replace('&nbsp;', ' ').match(/R\$ \d*\.*\d*,*\d*/)[0] : '');
              $('#variacao-preco .valsatt .nparc').html('até '+$('#max-p').html().match(/^\d*/)[0]+'X (Sem Juros)');
              $('#variacao-preco .valsatt .priceparc').html($('#max-value').html());
            }
        }
    }

    function formatPreco(n) {
        return n.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    }










    const updateOrderedStep = (indexActive) => {
        document.querySelectorAll('.ui.steps .step').forEach((item, index) => {
            if (index < indexActive) {
                $(item).removeClass('active').removeClass('disabled').addClass('completed')
            }

            if (index === indexActive) {
                $(item).removeClass('completed').removeClass('disabled').addClass('active')
            }

            if (index > indexActive) {
                $(item).removeClass('completed').removeClass('active').addClass('disabled')
            }
        })
    }

    const updateDiscount = (valorCarrinho, valorRegra, porcentagemRegra, index = 0) => {

        if (valorCarrinho < valorRegra[index]) {
            console.log(valorCarrinho, valorRegra[index], porcentagemRegra[index], index)
            updateBarDiscount(valorCarrinho, valorRegra[index], porcentagemRegra[index], index)

        } else {
            if ((valueRules.length - 1) > index) {
                updateDiscount(valorCarrinho, valorRegra, porcentagemRegra, index + 1)
                console.log(valorCarrinho, valorRegra[index], porcentagemRegra[index], index)
            } else {
                updateBarDiscount(valorCarrinho, valorRegra[index], porcentagemRegra[index], index)
            }

        }
    }

    if (location.pathname.split('/')[1] === "produto") {
        updateDiscount((valueProdAtual()), valueRules, percentageRules)
    }

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    const waitCart = valueCart => new Promise(resolve => {
        if (valueCart !== totalCart()) {
            updateDiscount((valueProdAtual()), valueRules, percentageRules)
        } else {
            wait(2000)
                .then(() => waitCart(valueCart))
                .catch();
        }
    });

    $('.comprar-wrapper.btnComprar').on('click', function () {
        let valueCart = valueProdAtual();
        wait(2000)
            .then(() => waitCart(valueCart))
            .catch();
    })
    $('#ListProductsCheckout').on('click', 'tr', function () {
        let valueCart = totalCart() + valueProdAtual();
        wait(1000)
            .then(() => waitCart(valueCart))
            .catch();
    })

    $('#quantidade').on('change', function () {
        let valueCart = valueProdAtual();
        wait(300)
            .then(() => waitCart(valueCart))
            .catch();
    })

    $('#variations-container').on('click', function () {
        let valueCart = valueProdAtual();
        wait(300)
            .then(() => waitCart(valueCart))
            .catch();
    })

    $('#qtdminus-detalhes').on('click', function () {
        let valueCart = valueProdAtual();
        wait(300)
            .then(() => waitCart(valueCart))
            .catch();
    })

    $('#qtdplus-detalhes').on('click', function () {
        let valueCart = valueProdAtual();
        wait(300)
            .then(() => waitCart(valueCart))
            .catch();
    })

});//end updateDiscount


$(window).on("load", function () {

    $('.fixed-whatsapp').hide()
    $('#blip-chat-container').hide()
    $('#fixed-chat').append('<div class="title">Vendedor Online</div>')

    $('#fixed-chat').on('click',function(){


        if($('#fixed-chat.open').length){
            $('#fixed-chat').removeClass('open')
            $('#fixed-chat img')
            .attr('src', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDhweCIgaGVpZ2h0PSI0OHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQ4ICg0NzIzNSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+QkxpUDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJCTGlQIiBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iPgogICAgICAgICAgICA8ZyBpZD0iYnJhbmQtbG9nby0oMSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkuMDAwMDAwLCA5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTExLjE3MTAzMjQsMCBDOC41MDMxMTkzNCwwIDUuNzM4MTQ3MTksMC40MTkwNDc2MTggMy44NTM5ODY3LDEuNTU4MzMzMzMgQzAuNzk3ODM3MTI3LDMuNDA0NzYxOSAtMC4wOTYzMjAxNzAyLDcuMDEwNzE0MjkgMC4wMDgwMTg0MDE2NiwxMC4zMzA5NTI0IEMwLjA5Nzc5ODEwMzIsMTMuMjAyMzgxIDAuODgyNzYzODcsMTYuMjg1NzE0MyAyLjk2ODMyMjA2LDE4LjQwNzE0MjkgQzQuOTU4MDM0MzgsMjAuNDI5NzYxOSA5LjA0OTA3Njk4LDIxLjMzOTI4NTcgMTEuODM4MzEzOSwyMS4zMzkyODU3IEMxMS45NjQ0OTA4LDIxLjMzOTI4NTcgMTIuMDk3OTQ3MSwyMS40Mjg1NzE0IDEyLjA5Nzk0NzEsMjEuNTk0MDQ3NiBMMTIuMDk3OTQ3MSwyNC40OTE2NjY3IEMxMi4wOTc5NDcxLDI0Ljc3NzM4MSAxMi4zMjQ4MjI4LDI1IDEyLjYxNjAwMDIsMjUgQzEyLjYzMjk4NTYsMjUgMTIuNjQ4NzU3NywyNC45OTY0Mjg2IDEyLjY2NDUyOTgsMjQuOTk1MjM4MSBDMTIuNzc0OTM0NiwyNC45ODU3MTQzIDEyLjg3MTk5MzcsMjQuOTQ1MjM4MSAxMi45NDk2NDEsMjQuODgyMTQyOSBDMTQuMzU1Nzg1MywyMy43MDM1NzE0IDE1Ljc2MDcxNjMsMjIuNTAzNTcxNCAxNy4xMTcxMTc3LDIxLjI3MDIzODEgQzE4LjQxNzcxMDEsMjAuMDg2OTA0OCAxOS44OTA1ODI1LDE4Ljg3MTQyODYgMjAuOTA3Mjc3LDE3LjQ1NDc2MTkgQzIzLjA1MjI4MzksMTQuNDY2NjY2NyAyMy4zNzAxNTI2LDEwLjI0MTY2NjcgMjIuNjU5MTk0NCw2LjczOTI4NTcxIEMyMS45NzQ5Mjc1LDMuMzY5MDQ3NjEgMTkuNTM1MTAzNSwxLjE3NSAxNi4xMTQ5ODIxLDAuNDc2MTkwNDc1IEMxNC43MDc2MjQ3LDAuMTg5Mjg1NzE0IDEyLjk2MTc3MzQsMCAxMS4xNzEwMzI0LDAgTTExLjE3MTAzMjQsMS4yMTMwOTUyNCBDMTIuNzczNzIxMywxLjIxMzA5NTI0IDE0LjQzOTQ5ODgsMS4zNzI2MTkwNSAxNS44NjM4NDE2LDEuNjYzMDk1MjQgQzE4Ljg5NDUxMzEsMi4yODIxNDI4NiAyMC44NzY5NDYsNC4xNjkwNDc2MSAyMS40NDcxNjg1LDYuOTc2MTkwNDcgQzIxLjc5NTM2ODEsOC42OTE2NjY2OCAyMS44NTg0NTY1LDEwLjQ3MjYxOSAyMS42MzAzNjc2LDEyLjEyNjE5MDUgQzIxLjM3ODAxMzgsMTMuOTQ4ODA5NSAyMC43OTQ0NDU3LDE1LjUwNTk1MjQgMTkuODk2NjQ4NywxNi43NTU5NTI0IEMxOS4xMjc0NTUxLDE3LjgyODU3MTQgMTguMDE4NTU0NCwxOC44MjAyMzgxIDE2Ljk0NjA1MSwxOS43Nzk3NjE5IEMxNi43MjAzODg1LDE5Ljk4MDk1MjQgMTYuNDk1OTM5MiwyMC4xODIxNDI5IDE2LjI3NjM0MjksMjAuMzgwOTUyNCBDMTUuMjgwMjczNSwyMS4yODgwOTUyIDE0LjI3MjA3MTgsMjIuMTYxOTA0OCAxMy4zMzMwMjQ2LDIyLjk1OTUyMzggTDEzLjMzMzAyNDYsMjEuNTk0MDQ3NiBDMTMuMzMzMDI0NiwyMC43ODQ1MjM4IDEyLjY2MzMxNjYsMjAuMTI3MzgxIDExLjgzODMxMzksMjAuMTI3MzgxIEM5LjE5MTAyNTk3LDIwLjEyNzM4MSA1LjQ5NDI4NjEsMTkuMjI4NTcxNCAzLjg1NzYyNjQsMTcuNTY1NDc2MiBDMS44MjA1OTc3OCwxNS40OTI4NTcxIDEuMzExMDM3MzEsMTIuNDY2NjY2NyAxLjI0MzA5NTkyLDEwLjI5NDA0NzYgQzEuMTc3NTgxLDguMTkxNjY2NjggMS41MTM2NDgyNiw0LjM5NjQyODU3IDQuNTAzMDY5NjYsMi41OTA0NzYxOSBDNS45NzIzMDIzNiwxLjcwMjM4MDk1IDguMzQwNTQ1MjcsMS4yMTMwOTUyNCAxMS4xNzEwMzI0LDEuMjEzMDk1MjQiIGlkPSJGaWxsLTIwIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==')
            .css({
            'width': '64px',
            'height': '64px',
            'border':'2px solid #ffb840',
            'right': '0',
            'bottom': '0'})
            $('.fixed-whatsapp').fadeOut();
            $('#blip-chat-container').fadeOut(600);
            $('.znv-chat .znv-float-button').fadeOut(600)

        }else{
            $('#fixed-chat').addClass('open')
            $('#fixed-chat img')
            .attr('src','data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZS8+PGcgZGF0YS1uYW1lPSJMYXllciA1NyIgaWQ9IkxheWVyXzU3Ij48cGF0aCBkPSJNMTguODMsMTZsOC41OS04LjU5YTIsMiwwLDAsMC0yLjgzLTIuODNMMTYsMTMuMTcsNy40MSw0LjU5QTIsMiwwLDAsMCw0LjU5LDcuNDFMMTMuMTcsMTYsNC41OSwyNC41OWEyLDIsMCwxLDAsMi44MywyLjgzTDE2LDE4LjgzbDguNTksOC41OWEyLDIsMCwwLDAsMi44My0yLjgzWiIvPjwvZz48L3N2Zz4=')
            .css({
            'width': '40px',
            'height': '40px',
            'background': 'transparent',
            'border':' 0',
            'right': '10px',
            'bottom': '10px'})
            $('.fixed-whatsapp').fadeIn();
            $('#blip-chat-container').fadeIn(600)
            $('.znv-chat .znv-float-button').fadeIn(600)
        }


    })

    if (location.pathname.split('/')[2] === "Payment") {
        const tipoCliente = $("#tipoDeCliente").val();
        if(tipoCliente === "juridica"){
            $('#checkoutColumn2').prepend('<span class="block-column">')
            //document.querySelectorAll('#finalidade')[0].click();
        }else{
            $('#checkoutColumn2').addClass('margin top small');
            //document.querySelectorAll('#finalidade')[1].click();
        }
        
        updateMessageNote(tipoCliente)

        $('.contribuinte').on('click',function(){
            updateMessageNote(tipoCliente)
        })
        $('#parcAcoCard').on('click',function(){
            updateMessageNote(tipoCliente)
        })
        

        $('#checkRestricao').on('click',function(){
            if(!! $('#checkRestricao.checked').length ){
                $('#exibeMsgRestricao').show()
            }else{
                $('#exibeMsgRestricao').hide()
           }
        })
        /*
        $('.finalidade').on('change',function(){
            updateMessageNote(tipoCliente)
        })
        */
        $('.restricao').on('change',function(){
            updateMessageNote(tipoCliente)
        })
        
        let valParcCard = 0;
        console.log('pagina de pagamento')

        $('select#parcCard').on('click', function () {
            valParcCard = $(this).val();
        })

        $('#GetShippping').on('click', function () {
            let modal_count = $("body").find(".swal2-show").length;
            valParcCard = $('select#parcCard').val();
            if (modal_count === 0 && valParcCard != '0' && valParcCard != '') {
                swal({
                    title: 'Revisar Parcelamento !!',
                    text: 'Os valores de pagamentos foram atualizados e deve ser verificado o parcelamento antes de fechar o pedido',
                    icon: 'error',
                    confirmButtonText: 'Vou verificar'
                }).then(function (result) {
                    console.log(result)
                    $('select#parcCard').val(valParcCard)
                });
            }
        })

        $('#informacaoTributaria').on('click',function(){
            const isTaxpayer = $('#contribuinte:checked').val() ==='Contribuinte de ICMS/Simples Nacional';
            let disableModal = $("body").find(".swal2-show").length === 0;
            if(isTaxpayer && disableModal){
                $('#triangularOperation').modal('show');
            }
        });

        $('#triangularOperation').on('click',function(){
            if($('#triangularOperation input:checked').val() === 'sim'){
                $('#triangularOperation .content .input').css({'display':'flex'});
            }else{
                $('#triangularOperation .content .input').css({'display':'none'});
                $('#triangularOperation').modal('toggle');
            }
        });
        $('#closeTriangularOperation').on('click',function(){
            $('#triangularOperation').modal('toggle');
        })


        $('#checkoutColumn2').on('click',function(){
            let modal_count = $("body").find(".swal2-show").length;
            let hasChecked = $('#contribuinte:checked').val() === undefined;

            if(modal_count === 0 &&  hasChecked  && tipoCliente === "juridica"){
                swal({
                    title: 'Revisar as informações !!',
                    text: 'Selecione a informação tributárias',
                    icon: 'error',
                    confirmButtonText: 'Vou verificar'
                }).then(function (result) {
                    $('#informacaoTributaria').accordion('open', 0);
                    $('html, body').animate({
                        scrollTop: $('#informacaoTributaria').offset().top
                      }, 2000);
                });
            }else{
                $('#checkoutColumn2 span').removeClass('block-column')
                $('#checkoutColumn2').addClass('margin top small')
            }
        })

    }
    $('#depoimentos .slideshow').slick('unslick');
    $('#depoimentos .slideshow').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        prevArrow: '<a class="slick-prev ui mini button basic icon"><i class="chevron left icon"></i></a>',
        nextArrow: '<a class="slick-next ui mini button basic icon"><i class="chevron right icon"></i></a>',
        responsive: [
            {
                breakpoint: 1301,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    });



    $('.info-produto:not(.comprecodesc) .infoPreco').before('Ou no cartão crédito ')
});

const updateMessageNote = (tipoCliente) => {
    let operationTriangular = $('#triangularOperation input:checked').val() === 'sim' ? $('#triangularOperation .content input').val(): 'Não';
    //let finalidade = $('#finalidade:checked').val() === undefined ? '': $('#finalidade:checked').val();
    //let descricaoFinalidade = $('#mensagemFinalidade').val();
    let restricaoEntrega = $('#mensagemRestricao').val();
    let contribuinte = $("#contribuinte:checked").val() === undefined ? '': $('#contribuinte:checked').val();;
    let parcelaParceirAco = $('#parcAcoCard').val() === undefined ? 'Não usado' : $('#parcAcoCard').val();

    if($('#contribuinte:checked').val() !== undefined ){
        $('#checkoutColumn2 span').removeClass('block-column')
        $('#checkoutColumn2').addClass('margin top small')
    }
    //
    let mensagem = ()=>{
        if(tipoCliente === "juridica"){
                $('.contribuinte').removeClass('hideme');
            return `Operação Triangular: ${operationTriangular},
                    Restrição de entrega:${restricaoEntrega},
                    Cartão ParceirAço: ${parcelaParceirAco},
                    Contribuinte: ${contribuinte}`;
        }else{
            return `Operação Triangular: ${operationTriangular},
                    Restrição de entrega:${restricaoEntrega},
                    Cartão ParceirAço: ${parcelaParceirAco},`;
        }
    }




    /*
    let mensagem = ()=>{
        if(tipoCliente === "juridica"){
                $('.contribuinte').removeClass('hideme');
            return `Operação Triangular: ${operationTriangular},
                    Finalidade do produto: ${finalidade},
                    Descrição da finalidade: ${descricaoFinalidade},
                    Restrição de entrega:${restricaoEntrega},
                    Cartão ParceirAço: ${parcelaParceirAco},
                    Contribuinte: ${contribuinte}`;
        }else{
            return `Operação Triangular: ${operationTriangular},
                    Finalidade do produto: ${finalidade},
                    Descrição da finalidade: ${descricaoFinalidade},
                    Restrição de entrega:${restricaoEntrega},
                    Cartão ParceirAço: ${parcelaParceirAco},`;
        }
    }
    */
    if(location.host === "usiminas.sbx1.plataformaneo.com.br"){
        console.log('informacao atualizada', mensagem());
    }
    $('#exibeMsg textarea').val(mensagem());
}


var dataurlbtn, idcupombtn;

const getCouponParceirAco = () =>{

    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://fmst.fidelizarmais.com/api/v2/public/plugin/search-award/86e0dad1-145e-4921-92db-08e6864f0efd?page=1&type=coupon&search=",
        "method": "GET",
        "headers": {
          //"cookie": "__cfduid=d4d7546f8e552e0346f4259442edc62471620322781",
          "api_key": "\t86e0dad1-145e-4921-92db-08e6864f0efd"
        }
      };

      $.ajax(settings).done(function (response) {
        //console.log(response);
        //console.log(response.data);
        let { data } = response;
        maxValParceirAco = data[data.length-1].order
        console.log(maxValParceirAco)

        if($('#stepParceiraco').length > 0) {
            data.forEach((item)=>{
                    $('#stepParceiraco').append(`<div class="step column"><img src="${item.image}"><span class="icon"><h3>${item.points}<h3></span></div>`)
            })
        } else if($('#stepParceiracoCheck').length > 0) {
            data.forEach((item)=>{
                console.log(item, 'item')
                $('#stepParceiracoCheck').append(`
                    <div class="item dflex acenter jsbetween ui green segment">
                        <img src="${item.image}">
                        <div class="infozin dflex">
                            ${item.name}
                            <span>${item.points}</span>
                        </div>
                        <button type="button" class="redeem ui usiminas positive button"
                        data-url="?awardid=${item.awardsId}&type=${item.type}&onlineredemption=${item.onlineRedemption}&categoryid=${item.categoryId}"
                        points="${item.points}"
                        name="${item.name}"
                        cupom="${item.awardsId}"><i class="fm-ic-gift-1"></i> Resgatar</button>
                        <div class="cuponsredeemed" cupom="${item.awardsId}"></div>
                    </div>
                `);
            });

            $('#stepParceiracoCheck .item .redeem').on('click', function(){
                if($('#amountParceirAco').html() == '') {
                    $('#form-parceiraco-checkout button').click();
                } else {
                    if($("body").find(".swal2-show").length === 0  && Number($('#amountParceirAco').html().replace(' pontos', '')) < Number($(this).attr('points').replace(' pts', ''))) {                        
                        swal({
                            title: 'Pontos insuficientes !!',
                            text: 'Seus pontos não são suficientes para resgatar este cupom.',
                            icon: 'error',
                            confirmButtonText: 'Escolher outro'
                        }).then(function (result) {
                            console.log(result)
                        });
                    } else {
                        dataurlbtn = $(this).attr('data-url');
                        idcupombtn = $(this).attr('cupom');

                        swal({
                            title: 'Deseja realmente gerar o cupom de desconto?',
                            html: 'Quando o cupom é gerado, automaticamente os pontos serão consumidos, impossibilitando o cancelamento ou troca dos pontos utilizados.<br /><br />Para confirmar o resgate deste prêmio:<br /><b style="font-weight: 700;">'+$(this).attr('name')+'</b>,<br />clique em Confirmar.',
                            icon: 'warning',
                            confirmButtonText: 'Confirmar',
                            showCancelButton: true,
                            cancelButtonText: 'Cancelar'
                        }).then(function (result) {
                            redeemCupom(dataurlbtn, $('#cpfcnpjparceiraco').val(), idcupombtn);
                        });
                    }
                }
            });
        }


      });//response
}

const getSaldoParceirAco = (CPF) =>{

    const settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://fmst.fidelizarmais.com/api/v2/public/plugin/my-balance/86e0dad1-145e-4921-92db-08e6864f0efd?document='+CPF,
        "method": "GET",
        "headers": {
          //"cookie": "__cfduid=d4d7546f8e552e0346f4259442edc62471620322781",
          "api_key": "\t86e0dad1-145e-4921-92db-08e6864f0efd"
        }
      };

      $.ajax(settings).done(function (response) {
        if($('#parceiraco-checkout').length > 0) {
            if(response.success){
                $('span#amountParceirAco').text(response.data.balance+' pontos');
            } else {
                $('span#amountParceirAco').text('');
                         
                swal({
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Entendi'
                }).then(function (result) {
                    console.log(result)
                });
            }
        } else {
            $('span#amountParceirAco').text(response.data.balance)
        }
        setDataParceirAco( CPF , response.data.balance)
      });
}

const setDataParceirAco = ( cpf, balance ) => {
    sessionStorage.setItem('@@Usiminas:ParceirAco', JSON.stringify({'token': cpf, 'amount': balance }));
}

const updateBarParceirAco = (currentValue, maximumValue )=>{

    $('#barParceiraco').progress({
        value: currentValue,
        total: maxValParceirAco
    })
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
}

function copyTextToClipboard(text, button) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
      copiado(button);
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
}

function copiado(button) {
    $('#'+button).addClass('copiado');

    setTimeout(function(){
        $('#'+button).removeClass('copiado');
    }, 5000)
}

const redeemCupom = (dataurl, doc, idcupom) => {
    $('.ui.accordion.parceiraco .loading').fadeIn(200);

    const settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://fmst.fidelizarmais.com/api/v2/public/plugin/redeem-award/86e0dad1-145e-4921-92db-08e6864f0efd'+dataurl+'&document='+doc,
        "method": "GET",
        "headers": {
          //"cookie": "__cfduid=d4d7546f8e552e0346f4259442edc62471620322781",
          "api_key": "\t86e0dad1-145e-4921-92db-08e6864f0efd"
        }
    };

    $.ajax(settings).done(function (response) {
        $('.ui.accordion.parceiraco .loading').fadeOut(200);
        console.log(response, 'response')
        
        getSaldoParceirAco($('#cpfcnpjparceiraco').val());

        swal({
            html: response.message,
            icon: 'success',
            confirmButtonText: 'Ok'
        });

        //se tiver resgatado o cupom com sucesso, este vai ser apresentado no elemento $('#swal2-content strong')
        if($('#swal2-content strong').length > 0) {
            $('#stepParceiracoCheck .item .redeem').addClass('removed');

            $('#swal2-content').append('<div class="copiarcupom dflex acenter jcenter"><input readonly value="'+$('#swal2-content strong').html()+'" /><button id="cupom-'+idcupom+'-swal" type="button">Copiar</button></div>');
            $('#stepParceiracoCheck .cuponsredeemed[cupom="'+idcupom+'"]').append('<div class="copiarcupom dflex acenter jcenter"><input readonly value="'+$('#swal2-content strong').html()+'" /><button id="cupom-'+idcupom+'" type="button">Copiar</button></div>');
            
            $('.copiarcupom').after('<div class="obscupom">Copie e cole o código acima na área de cupom para validar seu desconto</div>');
            
            $('#cupom-'+idcupom+'-swal, #cupom-'+idcupom).on('click', function(){                
                copyTextToClipboard($(this).siblings('input').val(), $(this).attr('id'));
            });

            $('.discount-coupon').addClass('focus-parceiraco');
        }        
    });
}


$(window).on("load", function () {
        document.querySelectorAll('.ui.segment.box-shadow:not(.hideme)  .ui.usiminas.positive.button').forEach((element, index)=>{
            element.setAttribute('data-order', index+1)
            element.parentElement.parentElement.setAttribute('data-order', index+1)
         })

         $('#checkoutColumn1 button.ui.positive.button').on('click',function(){
            let current = parseInt($(this).attr('data-order'))
            let last = $('button.ui.usiminas.positive.button[data-order]').length;//5 para pj 4 para pf
            let next = current +1;

            if(current <= last){
                $(`.ui.accordion[data-order="${current}"]`).accordion('close', 0);
                $(`.ui.accordion[data-order="${next}"]`).accordion('open', 0);
            }

            if(current == 6){
                $(`.ui.accordion[data-order="${current}"]`).accordion('open', 0);
            }
        })

        $('#inscricaoEstadual').on('keyup',function(){
            console.log('tecla precionada', $(this).val());
            let valueInput = $(this).val()
            valueInput = valueInput.replace(/\D/g, '')
            $(this).val(valueInput)
        })






        // PARCEIRAÇO NO CHECKOUT //
        if($('#amountParceirAco').attr('cpfcnpj')) {
            getSaldoParceirAco($('#amountParceirAco').attr('cpfcnpj'));
        }

        if($('#form-parceiraco-checkout').length > 0) {
            $('#form-parceiraco-checkout').on('submit', function(e){
                e.preventDefault();
                $('span#amountParceirAco').text('Carregando...');
                getSaldoParceirAco($('#cpfcnpjparceiraco').val());
            });

            getCouponParceirAco();    
            
            $('.ui.accordion.parceiraco .title.title-checkout .btninfo').on('click', function(){
                swal({
                    title: 'ParceirAço',
                    html: 'Só é válido um cupom ParceirAço por compra.',
                    confirmButtonText: 'Ver regras',
                    showCancelButton: true,
                    cancelButtonText: 'Entendi',
                    reverseButtons: true
                }).then(function (result) {
                    window.open('https://maissolucoes.usiminas.com/institucional/1265/6399', '_blank');
                });

                $('.swal2-buttonswrapper .swal2-cancel').addClass('parceiraco-entendi');
                $('.swal2-buttonswrapper .swal2-confirm').addClass('parceiraco-vermais');
            })
        }
})
