import {isLoading} from "../api_config";
import {_alert, _confirm} from "../../functions/message";
import {openModalQuickView} from "../../functions/modal";
import {isValidEmail} from "../../functions/validate.js"
import {openLongModal} from "../../functions/modal";
import {SomenteNumerosPositivos} from "../../functions/form-control";
import {formSettings} from "../../ui/starters/formManipulation";

$(document).ready(function () {

    $("#formEventList").form(formSettings);
    $("#formAddress").form(formSettings);

});

$(document).on("keydown", "input[name=EventDate]", function(e){
    var keyCodeEntered = e.keyCode ? e.keyCode : e.charCode;
    if (keyCodeEntered == 8) {
        $(this).blur();
        $(this).val("");
        return false;
    }
    return false;
});

$(document).on("change", "div[id^='referencefromproduct_']", function(e){
    var productId = $(this).data("idproduct");
    var $parent = $(this).closest(".item.produtoList");
    var variationSelected = "";
    var keep = false;
    var idEventListFilter = $("#idEventListFilter").val();


    if(idEventListFilter > 0){
        $parent.find(".sku-options [id=referencefromproduct_" + productId + "]").each(function () {
            let idVariation = $(this).dropdown("get value");
            if (idVariation === "") {
                keep = false;
                return false;
            }
            else {
                variationSelected += variationSelected !== "" ? "," + idVariation : idVariation;
                keep = true;
            }
        });
        if (keep) {
            isLoading(".produtoList#Product_"+productId);
            $.ajax({
                method: "GET",
                url: "/Product/GetQtdFromEventListProduct?idEventList="+idEventListFilter+"&idVariation="+variationSelected+"&productID="+productId,
                success: function (response) {
                    if (response.success === true) {
                        var idProduct = response.idProduct;
                        var quantityPurchased = response.quantityPurchased;
                        var quantityRequest = response.quantityRequest;
                        if(quantityPurchased != ""){
                            $("#quantityPurchased_"+idProduct).html("<span>Quantidade Solicitada: "+quantityRequest+"</span>");
                            $("#quantityBuyed_"+idProduct).html("<span>Quantidade Comprada: "+quantityPurchased+"</span>");
                        }
                        isLoading(".produtoList#Product_"+productId);
                    }
                },
                onFailure: function (response) {
                    isLoading(".produtoList#Product_"+productId);
                    swal({                       
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
    }
})














$(document).on("click", "#termoAceiteEventList", function () {
    $(".modal-block").append("<div class='ui longer modal'><i class='close icon'></i><div class='header'>Termo de Aceite</div><div class='image content'><div class='scrolling content'><p>"+$("#termoEventList").html()+"</p></div></div><div class='actions'><div class='ui button approve'>OK</div></div></div>");
    openLongModal($(this).attr("data-modal-open"));
});

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

    if (nameGuest === "") {
        $("#divFieldNameGuest").addClass("error");
        $("#divFieldNameGuest").append(`<div id="divMsgNameGuest" class="ui basic red pointing prompt label transition visible">Preencha o nome do convidado. (Ex: João Silva ou Maria Silva)</div></div>`);

        return false;
    }

    if (!isValidEmail(emailGuest)) {
        $("#divFieldEmailGuest").addClass("error");
        $("#divFieldEmailGuest> #divMsgEmailGuest").remove();
        $("#divFieldEmailGuest").append(`<div id="divMsgEmailGuest" class="ui basic red pointing prompt label transition visible">Preencha o email do convidado. (Ex: email@dominio.com.br)</div></div>`);

        return false;
    }

    addGuest(nameGuest, emailGuest);
});

$(document).on("blur", "#NameGuest", function(e){
    $("#divFieldNameGuest").removeClass("error");
    $("#divMsgNameGuest").remove();
});

$(document).on("blur", "#EmailGuest", function(e){
    $("#divFieldEmailGuest").removeClass("error");
    $("#divMsgEmailGuest").remove();
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

$(document).on("click", "#btnSendInvitation", function (e) {
    $.ajax({
        method: "POST",
        url: "/EventList/SendInvitation",
        success: function (response) {
            if (response.success === true) {
                swal({                   
                    text: response.message,
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }else {
                swal({                 
                    text: response.message,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                })
            }
        },
        onFailure: function (response) {
            swal({             
                text: response.message,
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    })
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
$(document).on('click', '#uploadArea, #changeEventPicture', function () {
    $("#fileInvitation, #filePicture").click();
});

$(document).on("change", "#filePicture", function(e){
    let input = this;

    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function(e) {
            $('#imgPicture').attr('src', e.target.result);
            $("#uploadArea").hide();
            $("#changeEventPicture").show();
        }

        reader.readAsDataURL(input.files[0]);
    }
});

$(document).on("click", "#pesquisar_lista", function(event) {
    var tipo_lista = $("#tipo_lista").val();
    var parametro = $("#parametro").val();
    window.location.href = "/EventList/SeachListByType?type="+tipo_lista+"&parametro=" + parametro;
});

$(document).on("change", "#chkStatus", function(e) {
    $(this).val($(this).prop("checked"));
    $("#lblStatus").text($(this).prop("checked") ? "Ativo" : "Inativo");
});

$(document).on("click", "#adicionarMaisProd", function(e){
    $(".carrinho").sidebar('toggle')
})

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
            //console.log('Erro ao atualizar lista de evento');
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
                        //console.log("Erro ao excluir produto");
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
                text: "Convidado adicionado com sucesso!",
                type: "success",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        },
        error: function (response) {
            swal({        
                text: "Não foi possível adicionar o convidado!",
                type: "error",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        },
        onFailure: function (response) {
            swal({        
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
                text: response.message,
                type: "success",
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            }).then(function () {
                //window.location = "/EventList/ManagerGuest";
                location.reload();
            })
        },
        onFailure: function (response) {
            swal({ 
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
            listId: lisId,
            sendToGuest: false
        },
        success: function (response) {
            $("#divDeliveryMyAddress").removeClass("hideme");
            $("#divDeliveryAddressGuest").addClass("hideme");
        },
        onFailure: function (response) {
            swal({       
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
        success: function (response) {
            $("#divDeliveryMyAddress").addClass("hideme");
            $("#divDeliveryAddressGuest").removeClass("hideme");
        },
        onFailure: function (response) {
            swal({      
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

                $("#imagem").attr("src", obj_product.ImageHome);
                $("#titulo").html(obj_product.ProductName);

                for (var i = 0; i < obj_customer.length; i++) {
                    lista_cliente += "<td>"+obj_customer[i].Name+"</td>"
                    lista_cliente += "<td>"+obj_customer[i].Email+"</td>"
                }

                $("#lista_cliente").html(lista_cliente);
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

$(document).on("click", "#btnEventListDisabled", function(e){
    swal({
        text: "Não existem listas ativas.",
        type: "warning",
        confirmButtonText: 'OK'
    });
})
