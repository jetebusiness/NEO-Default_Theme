import {isLoading} from "../api_config";
import {_alert, _confirm} from "../../functions/message";
import {openModalQuickView} from "../../functions/modal";
import {openLongModal} from "../../functions/modal";
import {SomenteNumerosPositivos} from "../../functions/form-control";

$(document).on("click", "#product_manager .qtd_change", function(event) {
    $(".qtd_change").off("click");

    var productID = $(this).attr("data-id-product");
    var idListCurrent = $(this).attr("data-id-event-list");
    var action = $(this).attr("data-action");
    var skuCurrent = $(this).attr("data-id-sku");
    var valorInput = new Number($("#qtd_product_"+idListCurrent).val());
    var valorStock = new Number($(this).attr("data-id-stock"));

    if(action == "plus"){
        valorInput += 1;
    }else {
        valorInput -= 1;
    }

    if(valorInput < 1){
      valorInput = 1;
    }

    if(valorInput <= valorStock && valorInput < 1000){
        UpdateProductEventList(productID, skuCurrent, valorInput);
    }
    else{
        _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
        valorInput -= 1
    }
     $("#qtd_product_"+idListCurrent).val(valorInput);
});

$(document).on("click", "#product_manager .removeItemEventList", function(e) {
    var idListCurrent = $(this).attr("data-id-event-list");
    DeleteProductEventList(idListCurrent);
    e.stopPropagation();
});



$(document).on("keyup", "#product_manager input[id^='qtd_product_']", function (e) {
    var valor_final = SomenteNumerosPositivos($(this).val());
    $(this).val(valor_final);


    var productID = $(this).attr("data-id-product");
    var idListCurrent = $(this).attr("data-id-event-list");
    var action = $(this).attr("data-action");
    var skuCurrent = $(this).attr("data-id-sku");
    var valorInput = new Number($("#qtd_product_"+idListCurrent).val());
    var valorStock = new Number($(this).attr("data-id-stock"));


    if(valorInput < 1){
      valorInput = 1;
    }

    if(valorInput <= valorStock && valorInput < 1000){
        UpdateProductEventList(productID, skuCurrent, valorInput);
    }
    else{
        _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
        valorInput -= 1
    }

    $("#qtd_product_"+idListCurrent).val(valorInput);
    e.stopPropagation();
})

$(document).on("click", "button[id^='btnDeleteGuest_']", function(e){
    let idGuest = $(this).data("id");

    deleteGuest(idGuest);
});

function UpdateProductEventList(idCurrent, skuCurrent, valorInput){
  isLoading("#product_manager");
    $.ajax({
        method: "POST",
        url: "/EventList/UpdateProductList",

        data:{
            productID  : idCurrent,
            productSKU  : skuCurrent,
            productQuantity    : valorInput
        },
        success: function(data){
            if(data.success === false){
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
            isLoading("#product_manager");
        },
        onFailure: function(data){
            isLoading("#product_manager");
            console.log('Erro ao atualizar lista de evento');
        }
    });
}

function DeleteProductEventList(eventListIDCurrent){
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
                      $("#"+ eventListIDCurrent).fadeOut( "slow" );
                  }
              }
          });
      }
  });
}

function deleteGuest(idGuest) {
    $.ajax({
        method: "POST",
        url: "/EventList/DeleteGuest",
        data: {
            guestId: idGuest
        },
        success: function (data) {
            let typeMessage = "warning"
            if (data.success === true) {
                $("#guest_" & idGuest).remove();
                typeMessage = "success";
            }

            swal({
                titl: "Mensagem",
                text: data.message,
                type: typeMessage,
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });

        },
        onFailure: function (data) {
            console.log("N�o foi poss�vel excluir o convidado!");

            swal({
                titl: "Mensagem",
                text: data.message,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
}
