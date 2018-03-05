import {LoadCarrinhoEventList} from "../../functions/mini_cart_generic";
import {_alert, _confirm} from "../../functions/message";
﻿import {isLoading} from "../api_config";
import {SomenteNumerosPositivos} from "../../functions/form-control";

$(document).on("click", ".qtdActionEventList", function(event) {
    $(".qtdActionEventList").off("click");

    var idListCurrent = $(this).attr("data-id");
    var action = $(this).attr("data-action");
    var idCurrent = $(this).attr("data-id-produto");
    var skuCurrent = $(this).attr("data-id-sku");
    var valorInput = new Number($("#qtd_"+idListCurrent).val());
    var valorStock = new Number($("#stock_"+idListCurrent).val());

    if(action == "plus"){
        valorInput += 1;
    }else {
        valorInput -= 1;
    }

    if(valorInput < 1){
      valorInput = 1;
    }

    if(valorInput <= valorStock && valorInput < 1000){
        disparaAjaxUpdateList(idCurrent, skuCurrent, valorInput);
    }
    else{
        _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
        valorInput -= 1
    }
     $("#qtd_"+idCurrent).val(valorInput);
});

$(document).on("click", "#miniCarrinho .removeItemEventList", function(e) {
    var eventListIDCurrent = $(this).attr("data-id");
    excluirProdutoCarrinhoList(eventListIDCurrent);
    e.stopPropagation();
});

$(document).on("keyup", "#miniCarrinho input[id^='qtd_'].event_list", function (e) {
    var valor_final = SomenteNumerosPositivos($(this).val());
    $(this).val(valor_final);

    var idListCurrent = $(this).attr("data-id");
    var idCurrent = $(this).attr("data-id-produto");
    var skuCurrent = $(this).attr("data-id-sku");
    var valorInput = new Number($("#qtd_"+idListCurrent).val());
    var valorStock = new Number($("#stock_"+idListCurrent).val());

    if(valorInput < 1){
      valorInput = 1;
    }

    if(valorInput <= valorStock && valorInput < 1000){
        disparaAjaxUpdateList(idCurrent, skuCurrent, valorInput);
    }
    else{
        _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
        valorInput -= 1
    }

    $("#qtd_"+idCurrent).val(valorInput);
    e.stopPropagation();
})

function disparaAjaxUpdateList(idCurrent, skuCurrent, valorInput){
    $.ajax({
        method: "POST",
        url: "/EventList/UpdateProductList",

        data:{
            productID  : idCurrent,
            productSKU  : skuCurrent,
            productQuantity    : valorInput
        },
        success: function(data){
            if(data.success === true){
                LoadCarrinhoEventList(false);
            }else{
              swal({
                  title: 'Mensagem',
                  text: data.msg,
                  type: 'warning',
                  showCancelButton: false,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'OK'
              });
            }
        },
        onFailure: function(data){
            console.log('Erro ao atualizar lista de evento');
        }
    });
}

function excluirProdutoCarrinhoList(eventListIDCurrent){
  _confirm({
      title: "Deseja realmente remover esse produto da Lista?",
      text: "",
      type: "warning",
      confirm: {
          text: "Remover"
      },
      cancel: {
          text: "Cancelar"
      },
      callback: function () {
          $.ajax({
              method: "POST",
              url: "/EventList/DeleteProductList",
              data: {
                  productEventListID: eventListIDCurrent
              },
              success: function (data) {
                  if (data.success === false) {
                      console.log("Erro ao excluir produto");
                  }else {
                      LoadCarrinhoEventList(false);
                  }
              }
          });
      }
  });
}
