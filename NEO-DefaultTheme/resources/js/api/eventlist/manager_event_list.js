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


$(document).on("click", "#view_invited_purchased", function(e){
  var productID = $(this).attr("data-product-id");
  var productSKU = $(this).attr("data-product-id-sku");
  ShowModalEventListPurchased(productID, productSKU);
});

$(document).on("click", "#addGuest", function (e) {
    let nameGuest = $("#NameGuest").val();
    let emailGuest = $("#EmailGuest").val();

    addGuest(nameGuest, emailGuest);
});

$(document).on("click", "button[id^='btnShareEventList_']", function (e) {
    let listId = $(this).data("id");

    shareEventList(listId);
});

$(document).on("click", "#btnSendToMyAddress", function (e) {
    let listId = $(this).data("id");

    sendToMyAddress(listId);
});

$(document).on("click", "#btnSendToGuestAddress", function (e) {
    let listId = $(this).data("id");

    sendToGuestAddress(listId);
});

$(document).on("change", "#fileInvitation", function(e){
    let input = this;

    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            $('#imgInvitation').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
});

$(document).on("change", "#filePicture", function(e){
    let input = this;

    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            $('#imgPicture').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
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

function addGuest(nameGuest, emailGuest) {
    $.ajax({
        method: "POST",
        url: "/EventList/AddGuest",
        data: {
            nameGuest: nameGuest,
            emailGuest: emailGuest
        },
        onBegin: function(){
            isLoading("#divEventList");
        },
        success: function (response) {
            $("#guestsList").html(response);
            $("#NameGuest").val("");
            $("#EmailGuest").val("");

            swal({
                title: "Mensagem",
                text: "Convidado adicionado com sucesso!",
                type: "success",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        },
        onFailure: function (response) {
            swal({
                title: "Mensagem",
                text: "Não foi possível adicionar o convidado!",
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        },
        onComplete: function(response) {
            isLoading("#divEventList");
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
        success: function (response) {
            $("#guestsList").html(response);

            swal({
                title: "Mensagem",
                text: "Convidado excluído com sucesso!",
                type: "success",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });

        },
        onFailure: function (response) {
            swal({
                title: "Mensagem",
                text: "Não foi possível excluir este convidado!",
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
}

function shareEventList(listId) {
    $.ajax({
        method: "POST",
        url: "/EventList/ShareEventList",
        data: {
            listId: listId
        },
        success: function (response) {
            swal({
                title: "Mensagem",
                text: response.message,
                type: "success",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
            document.location = "/EventList/ManagerGuest";
        },
        onFailure: function (response) {
            swal({
                title: "Mensagem",
                text: response.message,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
}

function sendToMyAddress(lisId) {
    $.ajax({
        method: "POST",
        url: "/EventList/UpdateDeliveryAddress",
        data: {
            listId: listId,
            sendToGuest: false
        },
        onFailure: function (response) {
            swal({
                title: "Mensagem",
                text: response.message,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
}

function sendToGuestAddress(listId) {
    $.ajax({
        method: "POST",
        url: "/EventList/UpdateDeliveryAddress",
        data: {
            listId: listId,
            sendToGuest: true
        },
        onFailure: function (response) {
            swal({
                title: "Mensagem",
                text: response.message,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
}


function ShowModalEventListPurchased(productID, skuID){
  $.ajax({
      method: "GET",
      type: "JSON",
      url: "/EventList/GetPurchasedProductbyInvited",
      data: {
          productID: productID,
          skuID: skuID
      },
      success: function (response){
        if(response.success === true){
              let lista_cliente = "";
              let obj_product = $.parseJSON(response.product);
              let obj_customer = $.parseJSON(response.customer);

              $("imagem").attr("src", obj_product.ImageHome);
              $("titulo").text(obj_product.ProductName);

              for (var i = 0; i < obj_customer.length; i++) {

              }
        }else{

        }
        $('#event_list_product.ui.longer.modal').modal('show');
      },
      onFailure: function (response) {
          swal({
              titl: "Mensagem",
              text: response.message,
              type: "error",
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'OK'
          });
      }
  })
}
