import { compraRecorrenteAjaxUpdate } from '../api/checkout/mini_cart';
import { isLoading } from "../api/api_config";

/**
 * 
 * Compra Recorrente
 * 
*/

export const CompraRecorrenteStorage = {
  keys: {
    termos: "compraRecorrenteTermos",
    dropdownValue: "compraRecorrenteDropdownValue",
    dropdownOptions: "compraRecorrenteDropdownOptions",
  },
  checkStorage: (key) => localStorage.getItem(key) === null ? false : true,
  getStorageValue: key => localStorage.getItem(key),
  getOptionSelectedFromStorage: () => {
    let value = CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue),
      options = CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownOptions) !== null ? JSON.parse(CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownOptions)) : [],
      optionSelected = options.filter((item) => item.value == value);
   
    return optionSelected.length > 0 ? optionSelected[0] : null;
  },
  setStorageValue: (key, value) => { localStorage.setItem(key, value); },
  removeStorageValue: key => localStorage.removeItem(key),
  cleanStorage: () => {
    Object.values(CompraRecorrenteStorage.keys).forEach((key) => {
      CompraRecorrenteStorage.removeStorageValue(key);
    });
  }
}

export const CompraRecorrenteCart = {
  selectBox: {
    id: ".compraRecorrenteSelectBox",
    html: `<div class="compraRecorrenteSelectBox">
            <div class="ui warning message">
              <div class="header">
                <div class="compraRecorrenteTitle">
                  <i class="calendar check outline icon"></i>
                  <span>Frequência de entrega</span>
                </div>
                <div class="compraRecorrenteSelect">
                  <select class="ui dropdown">
                      <option value="">Selecione</option>
                      {OPTIONS}
                  </select>
                </div>
              </div>
            </div>
          </div>`,
    dropdown: {
      id: ".compraRecorrenteSelect .ui.dropdown",
      getDropdownHtmlBox: (options) => {
        let html = "", optionsHtml = "";
        options.forEach((option) => {
          optionsHtml += `<option value="${option.value}">${option.text}</option>`;
        });
        html = CompraRecorrenteCart.selectBox.html.replace("{OPTIONS}", optionsHtml);
        return html;
      },
      getDropdownOptions: (cartObj = []) => {  
        let options = cartObj.map((option) => {
          return { value: option.idCompraAutomaticaTipoEntrega, text: option.tipoEntrega, name: option.tipoEntrega }
        });

        // Atualiza a storage com as opcoes de recorrencia disponiveis
        CompraRecorrenteStorage.setStorageValue(CompraRecorrenteStorage.keys.dropdownOptions, JSON.stringify(options));

        return options;
      }, 
      getDropdownStorageValue: () => CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue) !== null ? CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue) : "",
      updateDropdownOptions: (options = [], select = $(CompraRecorrenteCart.selectBox.dropdown.id)) => {
        try {

          let value = select.dropdown("get value") == "" ? CompraRecorrenteCart.selectBox.dropdown.getDropdownStorageValue() : select.dropdown("get value"),
            valueInOptions = CompraRecorrenteCart.selectBox.dropdown.checkValueInOptions(value, options);

          select.dropdown("setup menu", { values: options }).dropdown("refresh");

          if (!valueInOptions) {
            select.dropdown("set value", "");
            select.dropdown("set text", "Selecione");
          } else {
            select.dropdown("set value", value);
          }

          CompraRecorrenteCart.buttonCart(valueInOptions);

        } catch (e) {
          console.warn(e);
        }
      },
      checkValueInOptions: (value, options) => options.filter(item => item.value == value).length > 0 ? true : false,
      removeBox: () => {
        if ($(CompraRecorrenteCart.selectBox.id).length > 0)
          $(CompraRecorrenteCart.selectBox.id).remove();
      },
      config: () => {
        let config = {
          onChange: function (value, text) {
            let button = $("#btn_finalizar").length > 0 ? $("#btn_finalizar") : $("#finalizePurchase");
            if (value !== "" && value > 0) {
              button.removeAttr("disabled").removeClass("disabled");

              // Atualiza a storage com a opcao de recorrencia selecionada
              CompraRecorrenteStorage.setStorageValue(CompraRecorrenteStorage.keys.dropdownValue, value);
            }
          }
        }
        return config;
      },
      instanceDropdown: (options = [], config = CompraRecorrenteCart.selectBox.dropdown.config()) => {
        $(CompraRecorrenteCart.selectBox.dropdown.id).dropdown(config);

        let value = CompraRecorrenteCart.selectBox.dropdown.getDropdownStorageValue(),
          optionSelected = options.filter(item => item.value == value);

        if (optionSelected.length > 0) {
          $(CompraRecorrenteCart.selectBox.dropdown.id).dropdown("set value", optionSelected[0].value);
          $(CompraRecorrenteCart.selectBox.dropdown.id).dropdown("set text", optionSelected[0].text);
        }
      }
    }
  },
  modalConfig: {
    id: "#compraRecorrenteTermos",
    idCheckbox: ".compra-recorrente-termos-check .ui.checkbox",
    hasModal: () => $(CompraRecorrenteCart.modalConfig.id).length > 0 && $(CompraRecorrenteCart.modalConfig.id).attr("data-active").toLowerCase() == "true" ? true : false,
    showModal: (url = "/checkout/Identification", termos = $(CompraRecorrenteCart.modalConfig.id), check = $(CompraRecorrenteCart.modalConfig.idCheckbox), button = $("#compraRecorrenteTermosInputButton")) => {
      if (CompraRecorrenteStorage.checkStorage(CompraRecorrenteStorage.keys.termos)) {
        CompraRecorrenteCart.itemsCart.updateSignatureCart(url);
      } else {
        termos.modal({
          onApprove: function () {
            localStorage.setItem(CompraRecorrenteStorage.keys.termos, true);
            CompraRecorrenteCart.itemsCart.updateSignatureCart(url);
          }
        }).modal('show');

        check.checkbox({
          onChecked: function () { button.removeClass("disabled"); },
          onUnchecked: function () { button.addClass("disabled"); }
        });
      }
    }
  },
  buttonCart: (valueInOptions = false, button) => {
    if (!button)
      button = $("#btn_finalizar").length > 0 ? $("#btn_finalizar") : $("#finalizePurchase");

    if ($(CompraRecorrenteCart.selectBox.dropdown.id).length > 0 && !valueInOptions)
      button.attr("disabled", true).addClass("disabled");
    else
      button.removeAttr("disabled").removeClass("disabled");
  },
  itemsCart: {
    idMiniCart: "#ListProductsCheckout",
    idCart: "#checkout_products_list_cart",
    updateSignatureCart: (url) => {      
      let origin = $(CompraRecorrenteCart.itemsCart.idMiniCart).length > 0 ? $(CompraRecorrenteCart.itemsCart.idMiniCart) : $(CompraRecorrenteCart.itemsCart.idCart),
        items = origin.find(".item-cart-product"),
        totalItems = items.length,
        idCompraAutomaticaTipoEntrega = CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue) != null ? parseInt(CompraRecorrenteStorage.getStorageValue(CompraRecorrenteStorage.keys.dropdownValue)) : null;

      isLoading("#miniCarrinho");
      CompraRecorrenteCart.itemsCart.updateSignatureItemsCart(items, idCompraAutomaticaTipoEntrega, totalItems, url);
    },
    updateSignatureItemsCart: (items, idCompraAutomaticaTipoEntrega, totalItems, urlRedirect = null, indexItems = 1) => {
      let indexDom = indexItems - 1,
        idCartItem = items.eq(indexDom).attr("data-id-cart"),
        Quantity = $("#itemCartProduct_" + idCartItem + " #qtd_" + idCartItem).val();

      $.ajax({
        method: "POST",
        url: "/Checkout/UpdateProduct",
        data: {
            idCartItem: idCartItem,
            Quantity: Quantity,
            idCompraAutomaticaTipoEntrega: idCompraAutomaticaTipoEntrega
        },
        success: function (data) {
          if (data.success === true) {
            indexItems++;
            if (indexItems > totalItems) {
              isLoading("#miniCarrinho");
              window.location = urlRedirect;
            } else {
              CompraRecorrenteCart.itemsCart.updateSignatureItemsCart(items, idCompraAutomaticaTipoEntrega, totalItems, urlRedirect, indexItems);
            }
          } else {
            isLoading("#miniCarrinho");
            swal({
              text: data.msg,
              type: 'warning',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'OK'
            });
          }
        },
        onFailure: function (data) {
          isLoading("#miniCarrinho");
          swal({
            text: data.msg,
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }
}


export const CompraRecorrenteCheckout = {
  frequenciaBox: {
    id: "#compraRecorrenteFrequencia",
    html: `<div class="ui divider"></div>
          <div class="recurring-frequency-box">
            <div class="recurring-frequency-title">
              <i class="calendar check outline icon"></i>
              <span>Frequência de entrega:</span>
              </div>
              <div class="recurring-frequency-value"> {VALUE}</div>
            </div>
          </div>`,
    getFrequenciaBoxHtml: (option = null) => {
      if (option === null)
        option = CompraRecorrenteStorage.getOptionSelectedFromStorage();

        if (option !== null && $(CompraRecorrenteCheckout.frequenciaBox.id).length > 0) {
            $(CompraRecorrenteCheckout.frequenciaBox.id).attr("data-value", option.value);
            $(CompraRecorrenteCheckout.frequenciaBox.id).html(CompraRecorrenteCheckout.frequenciaBox.html.replace("{VALUE}", option.text));
        }
    }
  }
}