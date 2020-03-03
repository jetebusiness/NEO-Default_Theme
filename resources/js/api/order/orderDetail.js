import { isLoading } from "../../api/api_config";

function printDiv(divID) {
  var divElements = document.getElementById(divID).innerHTML;
  var oldPage = document.body.innerHTML;

  document.body.innerHTML =
    "<html><head><title></title></head><body>" +
    "<div class='ui eight wide tablet four wide computer column'><a href='/Home'><img class='ui middle aligned image' src='/assets/image/logo/logo.png' alt='' onerror=\"imgError(this)\"></a></div></br>" +
    divElements + "</body>";
  window.print();
  document.body.innerHTML = oldPage;
  if ($("#htmlOrderPrint").length > 0) {
    isLoading("body");
    $("#htmlOrderPrint").html("");
  }
}

function openShopline(clearShopline = false) {
  if (clearShopline) {
    $(".ui.modal").modal({
      onHidden: function () {
        $("#itauShopline").remove();
        $(this).remove();
      }
    }).modal('show');
  } else {
    $(".ui.modal").modal('show')
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
                <div class="ui modal">
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
    openShopline()
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

  $(document).on("keypress", ".prompt_pedidos", function (event) {
    var val = event.target.value;
    var filtered = val.replace(/[^0-9]/g, '');

    if (filtered !== val) {
      event.target.value = filtered;
    }

    //console.log("prompt_pedidos: " + $(".prompt_pedidos").val());

    if (filtered != "") {
      if (event.which === 13) {
        location.href = `/Order/Index?n=${$(".prompt_pedidos").val()}`;
      }
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