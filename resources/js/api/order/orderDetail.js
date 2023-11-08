import { isLoading } from "../../api/api_config";

function printDiv(divID) {
    let printContent = document.getElementById(divID).parentElement.cloneNode(true)

    let newWindow = window.open('', '', 'width=600,height=600')

    newWindow.document.write('<html><head><title>Imprimir Pedido</title>')
    newWindow.document.write("<div class='ui eight wide tablet four wide computer column'><a href='/home'><img class='ui middle aligned image' src='/assets/image/logo/logo.png' alt='' onerror=\"imgError(this)\"></a></div></br>")

    newWindow.document.write("<style>@media print { body { visibility: visible !important; } }</style>")

    let style = newWindow.document.createElement("link")
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('type', 'text/css')
    style.setAttribute('href', '/assets/css/style.css')

    style.onload = function () {

        newWindow.print()
        newWindow.close()
    }

    newWindow.document.head.appendChild(style)

    newWindow.document.write('</head><body style="visibility: hidden">')
    newWindow.document.write(printContent.innerHTML)
    newWindow.document.write('</body></html>')
    newWindow.document.close()

    styleSheet.insertRule("@media print { body { visibility: visible !important; } }", styleSheet.cssRules.length)
}

function openShopline(clearShopline = false) {
    if (clearShopline) {
        $(".ui.modal.itau-shopline").modal({
            onHidden: function () {
                $("#itauShopline").remove();
                $(this).remove();
            }
        }).modal('show');
    } else {
        $(".ui.modal.itau-shopline").modal('show')
    }
}

/*
  * 
  Funcao para criar o HTML do boleto Itaú Shopline na div correspondente
  *
*/
function createHtmlItau(el) {
    return new Promise((resolve, reject) => {
        let html = `<form action="https://shopline.itau.com.br/shopline/shopline.aspx"
                      method="post"
                      name="itauShopline"
                      id="itauShopline"
                      target="openShopline">
                  <input type="hidden" name="DC" id="tokenBankSlip" value="" />
                </form>
                <div class="ui modal itau-shopline">
                  <i class="close icon"></i>
                  <div class="content">
                    <iframe name="openShopline" id="openShopline" style="width: 100%; height: 33em; border: none;"></iframe>
                  </div>
                </div>`;

    el.after(html);
    resolve(el.attr("data-id-order"));
});
}

/*
  * 
  Funcao para criar o HTML do boleto MaxiPago na div correspondente
  *
*/
function createHtmlMaxiPago(el) {
    return new Promise((resolve, reject) => {
        let html = `<div class="ui modal maxiPago">
                  <i class="close icon"></i>
                  <div class="content">
                    <iframe src="" name="openShopline" id="bankSlipMaxiPago" style="width: 100%; height: 50em; border: none;"></iframe>
                  </div>
                </div>`;

    el.after(html);
    resolve(el.attr("data-id-order"));
});
}

$(document).ready(function () {
    $(document).on("click", "#print", function () {
        printDiv("pagePrint")
    })

    $(document).on("click", "#reprintBankSlip", function () {
        $.ajax({
            method: "GET",
            url: "/Checkout/ReprintBankSlip",
            data: {
                id: $("#idOrder").val()
            },
            success: function (data) {
                $("#tokenBankSlip").val(data.msg)
                $("#itauShopline").submit()

            },
            error: function (data) {

            }
        })
    })

    /*
     * 
      Funcao para imprimir o boleto Itaú diretamente na listagem dos pedidos
      *
    */
    $(document).on("click", ".__reprintBankSlip", function () {
        createHtmlItau($(this)).then((idOrder) => {
            openShopline(true);
        $.ajax({
            method: "GET",
            url: "/Checkout/ReprintBankSlip",
            data: {
                id: idOrder
            },
            success: function (data) {
                $("#tokenBankSlip").val(data.msg)
                $("#itauShopline").submit()
            },
            error: function (data) { }
        });
    });
    })

    $(document).on("click", "#reprintBankSlipMaxiPago", function () {
        $.ajax({
            method: "GET",
            url: "/Checkout/ReturnUrlBankSlipMaxiPago",
            data: {
                idOrder: $("#idOrderMaxiPago").val()
            },
            success: function (data) {
                $("#bankSlipMaxiPago").attr("src", data.urlBoleto)
                $('.ui.modal.maxiPago').modal('show')
            },
            error: function (data) {

            }
        })
    })

    /*
     * 
      Funcao para imprimir o boleto MaxiPago diretamente na listagem dos pedidos
      *
    */

    $(document).on("click", ".__reprintBankSlipMaxiPago", function () {
        createHtmlMaxiPago($(this)).then((idOrder) => {
            $.ajax({
                method: "GET",
                url: "/Checkout/ReturnUrlBankSlipMaxiPago",
                data: {
                    idOrder: idOrder
                },
                success: function (data) {
                    $("#bankSlipMaxiPago").attr("src", data.urlBoleto)
                    $(".ui.modal.maxiPago").modal({
                        onHidden: function () {
                            $(this).remove();
                        }
                    }).modal('show');
                },
                error: function (data) {

                }
            })
        });
    })

    $(document).on("click", "#btnOpenPaymentLink", function () {
        $('.ui.modal.pagseguro').modal('show');
    });

    $(document).on("click", "#btnOpenMercadoPagoPix", function () {
        $('.ui.modal.mercadopago-pix').modal('show');
    });

    $(document).on("keypress", ".prompt_pedidos", function (event) {
        var val = event.target.value;
        var filtered = val.replace(/[^0-9]/g, '');

        if (filtered !== val) {
            event.target.value = filtered;
        }

        if (filtered != "") {
            if (event.which === 13) {
                location.href = `/order/index?n=${$(".prompt_pedidos").val()}`;
            }
        }
    });

    $(document).on("keypress", ".prompt_pedidos_vendedor", function (event) {
        var val = event.target.value;
        var filtered = val.replace(/[^0-9]/g, '');

        if (filtered !== val) {
            event.target.value = filtered;
        }

        if (filtered != "") {
            if (event.which === 13) {
                location.href = `/assistedsale/consultarPedidos?n=${$(".prompt_pedidos_vendedor").val()}`;
            }
        }
    });


    $(document).on("keypress", ".prompt_pedidos_recurrent", function (event) {
        if (event.which === 13) {
            location.href = `/order/listRecurrentPurchase?n=${$(".prompt_pedidos_recurrent").val()}`;
        }
    });

    /*
     * 
     Funcao para imprimir pedido na página de listagem de pedidos
     *
    */
    $(document).on("click", ".printOrder", function () {
        $.ajax({
            method: "GET",
            url: "/Order/PrintOrder",
            dataType: "html",
            data: {
                orderId: $(this).attr("data-id-order")
            },
            success: function (data) {
                isLoading("body");
                $("#htmlOrderPrint").html("").append(data);
                printDiv("pagePrint");
            },
            error: function (data) { }
        })
    });

})

$(document).on("click", ".btn-yami", function () {
    var iframe = document.createElement('iframe');
    iframe.src = $(this).attr("href");
    iframe.frameBorder = "0";
    iframe.width = "900px";
    iframe.height = "500px";

    iframe.onload = function () {
        $('.ui.modal.yami').modal('show');
    };

    $('.ui.modal.yami .iframe-modal').empty().append(iframe);

    return false;
});

$(document).on("click", ".btn-yami-acompanha", function () {
    var iframe = document.createElement('iframe');
    iframe.src = $(this).attr("href");
    iframe.frameBorder = "0";
    iframe.width = "900px";
    iframe.height = "500px";

    iframe.onload = function () {
        $('.ui.modal.yami').modal('show');
    };

    $('.ui.modal.yami .iframe-modal').empty().append(iframe);

    return false;
});