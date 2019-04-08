import { isLoading } from "../api_config";
import { _alert, _confirm } from "../../functions/message";
import { lazyLoad } from "../../functions/lazy_load";

var firstLoad = true;
var genericPageFilter = "";
var idEventListFilter = "";
var viewListGlobal = "g";
var urlBase = "/product/getproducts/";
var ViewProductFiltersUrl = false;
var pageSizeDefault = 12;

$(document).ready(function () {
  if ($("#ViewProductFiltersUrl").val() == "True") {
    ViewProductFiltersUrl = true;
  }

  let filters = window.filterManipulation;
  if ($("#GenericPageFilter").length > 0) {
    genericPageFilter = $("#GenericPageFilter").val();
  }

  if (typeof (window.filterManipulation) !== "undefined") {
    if (window.filterManipulation.idCategory != undefined && window.filterManipulation.idCategory != "") {
      $('#checkCategory_' + window.filterManipulation.idCategory).parent().parent().hide();
    }
  }


  if (window.pageNumber > 1) {
    let data = {
      viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
      pageNumber: window.pageNumber === undefined ? "" : window.pageNumber,
      pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
      order: filters.order === undefined ? "" : filters.order,
      brand: filters.brand === undefined ? "" : filters.brand,
      category: filters.category === undefined ? genericPageFilter : filters.category,
      initialprice: filters.initialprice === undefined ? "" : filters.initialprice,
      finalprice: filters.finalprice === undefined ? "" : filters.finalprice,
      variations: filters.variations === undefined ? "" : filters.variations,
      group: filters.group === undefined ? "" : filters.group,
      keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
      idAttribute: filters.idAttribute === undefined ? "" : filters.idAttribute,
      idEventList: idEventListFilter
    };

    updateAjax(data);
  }

  if ($("#idEventListFilter").length > 0) {
    idEventListFilter = $("#idEventListFilter").val();
    viewListGlobal = "l";
    urlBase = "/product/GetProductsListEvents/";
  }

  if (window.filterManipulation !== undefined) {
    window.filterManipulation.variationSelected = [];
    window.filterManipulation.labelFilter = [];
    window.filterManipulation.atributeSelected = [];
  }

  if (ViewProductFiltersUrl == true && window.location.search != "") {
    let queryString = QueryStringToJSON();

    window.filterManipulation.viewList = queryString.viewList === undefined ? viewListGlobal : queryString.viewList;
    window.filterManipulation.pageNumber = queryString.pageNumber === undefined ? "" : queryString.pageNumber;
    window.filterManipulation.pageSize = queryString.pageSize === undefined ? pageSizeDefault : filters.pageSize;
    window.filterManipulation.order = queryString.order === undefined ? "" : queryString.order;
    window.filterManipulation.brand = queryString.brand === undefined ? "" : queryString.brand;
    window.filterManipulation.category = queryString.category === undefined ? genericPageFilter : queryString.category;
    window.filterManipulation.initialprice = queryString.initialprice === undefined ? "" : queryString.initialprice;
    window.filterManipulation.finalprice = queryString.finalprice === undefined ? "" : queryString.finalprice;
    window.filterManipulation.variations = queryString.variations === undefined ? "" : queryString.variations;
    window.filterManipulation.group = queryString.group === undefined ? "" : queryString.group;
    window.filterManipulation.keyWord = ((queryString.keyWord === undefined) ? ((queryString.n === undefined) ? "" : queryString.n) : queryString.keyWord);
    window.filterManipulation.idAttribute = queryString.idAttribute === undefined ? "" : queryString.idAttribute;
    window.filterManipulation.idEventList = idEventListFilter;
    window.filterManipulation.idCategories = queryString.idCategories === undefined ? "" : queryString.idCategories;
    window.filterManipulation.labelFilter = queryString.labelFilter === undefined ? [] : JSON.parse(queryString.labelFilter);

    makeLabel();
  }

  $(".dropdownorder").dropdown({
    onChange: function () {
      isLoading("#list");

      let filters = window.filterManipulation;

      filters.order = $(this).dropdown("get value");

      let data = {
        viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
        pageNumber: filters.pageNumber === undefined ? "1" : filters.pageNumber,
        pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? genericPageFilter : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
        idAttribute: filters.atributeSelected.toString(),
        idEventList: idEventListFilter
      };

      updateAjax(data);
    }
  });

  $(".dropdownitens").dropdown({
    onChange: function () {
      isLoading("#list");

      let filters = window.filterManipulation;

      filters.pageSize = $(this).dropdown("get value");

      let data = {
        viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
        pageNumber: "1",
        pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? genericPageFilter : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
        idAttribute: filters.atributeSelected.toString(),
        idEventList: idEventListFilter
      };

      updateAjax(data);
    }
  });

});

function QueryStringToJSON() {
  var pairs = location.search.slice(1).split('&');

  var result = {};
  pairs.forEach(function (pair) {
    pair = pair.split('=');
    try {
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    } catch (ex) {
      result[pair[0]] = pair[1] || '';
    }
  });

  return JSON.parse(JSON.stringify(result));
}

function uiReload() {
  $('.ui.accordion').accordion("refresh");
  $(".ui.dropdown").dropdown("refresh");
  $(".ui.checkbox").checkbox("refresh");

  $(".ui.rating").rating({
    maxRating: 5,
    interactive: false
  });
}

function makeLabel(uncheck = false) {

  let labelVariation = window.filterManipulation.labelFilter,
      htmlTag = "",
      idCheck,
      verification;

  if (uncheck) {
    $("#filter .ui.labels .filters").each(function () {
      idCheck = $(this).attr("data-id");
      verification = labelVariation.filter((item) => {
        return item.id == idCheck
      });
      if (verification.length == 0)
        $(`.ui.button#${idCheck}`).removeClass("checked selecionado").addClass("basic").removeAttr("disabled");
    });
  }
 
  for (let key in labelVariation) {
    if (labelVariation[key].type === "price") {
      htmlTag += `<a class="ui label filters" data-type="${labelVariation[key].type}" data-id="${labelVariation[key].id}" id="labelPrice">
                            ${labelVariation[key].name}: ${labelVariation[key].value}
                        <i class="icon close close-filter"></i></a>`;
    }
    else {
      htmlTag += `<a class="ui label filters" data-type="${labelVariation[key].type}" data-id="${labelVariation[key].id}" id="labelVariation_${labelVariation[key].id}">
                                ${labelVariation[key].name}: ${labelVariation[key].value}
                            <i id="icon-close-" + ${labelVariation[key].id} class="icon close close-filter"></i></a>`;


      if (firstLoad && (window.location.search != "" && window.location.search != undefined)) {
        $(`.ui.button#${labelVariation[key].id}`).addClass("checked selecionado").removeClass("basic").attr("disabled", "disabled");
      }

    }
  }
  $("#filter>div.ui.labels:first-child").html(htmlTag);

  if (htmlTag.trim() == "") {
    $(".filterColumn").removeClass("ativo")
  }
}

function ValidateLabel(type, id) {
  let labelVariation = window.filterManipulation.labelFilter
  for (let key in labelVariation) {
    if (labelVariation[key].type === type && labelVariation[key].id === id) {
      return true
    }
  }
  return false
}

function callAjaxFunction(filterType) {
  isLoading("#list");
  let filters = window.filterManipulation;

  if (filterType.toLowerCase() === "variation") {
    if (filters.idVariation !== undefined && filters.idVariation !== "") {
      filters.variationSelected.push(filters.idVariation);
    }
  }
  else if (filterType.toLowerCase() === "attribute") {
    if (filters.idAtribute !== undefined && filters.idAtribute !== "") {
      filters.atributeSelected.push(filters.idAtribute);
    }
  }

  let idCategories = "";
  if (filters.labelFilter.length > 0) {
    $.each(filters.labelFilter, function (key, item) {
      if (item.type == "category") {
        idCategories += ((idCategories == "") ? item.id : "," + item.id);
        filters.idCategory = genericPageFilter;
      } else if (item.type == "brand") {
        if (filters.idBrand == undefined || filters.idBrand == "") {
          filters.idBrand = item.id;
        } else if (filters.idBrand != "" && (filters.idBrand + "").search(item.id + "") == -1) {
          filters.idBrand += "," + item.id;
        }
      }
    });
  }

  let data = {
    viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
    pageNumber: "1",
    pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
    order: filters.order === undefined ? "" : filters.order,
    brand: filters.idBrand === undefined ? "" : filters.idBrand,
    category: filters.idCategory === undefined ? genericPageFilter : filters.idCategory,
    initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
    finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
    variations: filters.variationSelected.toString(),
    group: filters.idGroup === undefined ? "" : filters.idGroup,
    keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
    idAttribute: filters.atributeSelected.toString(),
    idEventList: idEventListFilter,
    idCategories: idCategories
  };

  updateAjax(data);
}

/*
function updateQueryString(_data) {
    let queryString = window.location.origin + window.location.pathname + "?" + $.param(_data, true);
    window.history.pushState(null, null, queryString);
    return false;
}
*/

function updateQueryString(json) {
  let queryString = window.location.origin + window.location.pathname + '?' +
    Object.keys(json).map(function (key) {
      if (key != "" && json[key] != "") {
        return ((key == "keyWord") ? "n" : encodeURIComponent(key)) + '=' + encodeURIComponent(json[key]);
      } else {
        return "";
      }
    }).filter(x => typeof x === 'string' && x.length > 0).join('&');

  window.history.pushState(null, null, queryString);
  return false;
}

function updateAjax(_data) {
  var data_temp = JSON.stringify(window.filterManipulation.labelFilter);
  _data.labelFilter = data_temp;
  $.ajax({
    url: urlBase,
    method: "GET",
    dataType: "html",
    data: _data,
    success: function (response) {
      $("#list").html(response);
      lazyLoad();

      if (ViewProductFiltersUrl == true) {
        updateQueryString(_data);
      }

      if (window.filterManipulation.labelFilter.length === 0) {
        window.filterManipulation.labelFilter = JSON.parse(data_temp);
      }

      $('#checkCategory_' + _data.category).parent().parent().remove();

      uiReload();
      makeLabel();

      $('input[type=checkbox]').prop('checked', false);
    },
    onFailure: function onFailure(response) {
      //console.log("Falha aplicar filtro: " + response);
    },
    onError: function onError(response) {
      //console.log("Erro aplicar filtro: " + response);
    }
  });
}

function labelFilter(filters, typeFilter, id) {
  for (let key in filters.labelFilter) {
    if (filters.labelFilter[key].id == id) {
      switch (typeFilter) {
        case "default":
          _.pull(filters.variationSelected, id.toString());
        case "atributo":
          _.pull(filters.atributeSelected, id.toString());
      }
      _.pullAt(filters.labelFilter, [key]);
    }
  }

  return filters;
}

$(document).on("click", "#viewgrid", function () {
  isLoading("#list");
  let filters = window.filterManipulation;

  filters.viewList = "g";

  let data = {
    viewList: "g",
    pageNumber: filters.pageNumber === undefined ? "1" : filters.pageNumber,
    pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
    order: filters.order === undefined ? "" : filters.order,
    brand: filters.idBrand === undefined ? "" : filters.idBrand,
    category: filters.idCategory === undefined ? genericPageFilter : filters.idCategory,
    initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
    finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
    variations: filters.variationSelected.toString(),
    group: filters.idGroup === undefined ? "" : filters.idGroup,
    keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
    idAttribute: filters.atributeSelected.toString(),
    idEventList: idEventListFilter
  };

  updateAjax(data);
});

$(document).on("click", "#viewlist", function () {
  isLoading("#list");
  let filters = window.filterManipulation;

  filters.viewList = "l";

  let data = {
    viewList: "l",
    pageNumber: filters.pageNumber === undefined ? "1" : filters.pageNumber,
    pageSize: filters.pageSize === undefined ? pageSizeDefault : filters.pageSize,
    order: filters.order === undefined ? "" : filters.order,
    brand: filters.idBrand === undefined ? "" : filters.idBrand,
    category: filters.idCategory === undefined ? genericPageFilter : filters.idCategory,
    initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
    finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
    variations: filters.variationSelected.toString(),
    group: filters.idGroup === undefined ? "" : filters.idGroup,
    keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
    idAttribute: filters.atributeSelected.toString(),
    idEventList: idEventListFilter
  };

  updateAjax(data);
});

$(document).on("click", ".checkColor", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
    window.filterManipulation.variationSelected.push($(this).prop("id"));
  }
  if (!ValidateLabel("color", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "color",
      id: $(this).prop("id"),
      name: $(this).data("reference"),
      value: $(".fields").find("#variation_" + $(this).prop("id")).prop("name")
    });
  }
  //ajaxColor();
  firstLoad = false;
  callAjaxFunction("variation");
});

$(document).on("click", ".checkText", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
    window.filterManipulation.variationSelected.push($(this).prop("id"));
  }
  if (!ValidateLabel("text", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "text",
      id: $(this).prop("id"),
      name: $(this).data("reference"),
      value: $(".fields").find("#variation_" + $(this).prop("id")).prop("name")
    });
  }
  //ajaxText();
  firstLoad = false;
  callAjaxFunction("variation");
});

$(document).on("click", ".checkAtribute", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "" && jQuery.inArray($(this).prop("id"), window.filterManipulation.atributeSelected)) {
    window.filterManipulation.atributeSelected.push($(this).prop("id"));
  }
  if (!ValidateLabel("atributo", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "atributo",
      id: $(this).prop("id"),
      name: "atributo",
      value: $(".fields").find("#checkAtribute_" + $(this).prop("id")).prop("name")
    });
  }
  //ajaxAttribute();
  firstLoad = false;
  callAjaxFunction("attribute");
});

$(document).on("change", ".checkCategory", function () {
  window.filterManipulation.nameCategory = $(this).attr("name");
  window.filterManipulation.idCategory = $(this).attr("id");
  if (!ValidateLabel("category", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "category",
      id: window.filterManipulation.idCategory,
      name: "Categorias",
      value: window.filterManipulation.nameCategory
    });
  }
  //ajaxCategory();
  callAjaxFunction("other");
});

$(document).on("change", ".checkBrand", function () {
  window.filterManipulation.nameBrand = $(this).attr("data-name");
  window.filterManipulation.idBrand = $(this).attr("id");
  if (!ValidateLabel("brand", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "brand",
      id: window.filterManipulation.idBrand,
      name: "Marcas",
      value: window.filterManipulation.nameBrand
    });
  }
  //ajaxBrand();
  callAjaxFunction("other");
});

$(document).on("click", ".pricefilter", function () {
  window.filterManipulation.initialPrice = $("#initialPrice").val().replace(".", "").replace(",", ".");
  window.filterManipulation.finalPrice = $("#finalPrice").val().replace(".", "").replace(",", ".");

  if (window.filterManipulation.initialprice === "" || window.filterManipulation.finalPrice === "") {
    _alert("Atenção", "Informe preço mínimo e preço máximo!", "warning");

    return;
  }

  if (!ValidateLabel("price", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "price",
      id: "",
      name: "Preço",
      value: `${window.filterManipulation.initialPrice} a ${window.filterManipulation.finalPrice}`
    });
  }

  //ajaxPrice();
  firstLoad = false;
  callAjaxFunction("other");
});

$(document).on("click", ".ui.label.filters", function () {
  let filters = window.filterManipulation;

  let type = $(this).data("type");
  let id = $(this).data("id");
  let filterType = "";

  if (type == "brand") {
    filters.idBrand = "";
    filters = labelFilter(filters, "brand", id);
    filterType = "other";
    //ajaxBrand();
  }
  else if (type == "category") {
    filters.idCategory = genericPageFilter;
    filters = labelFilter(filters, "category", id);
    filterType = "other";
    //ajaxPrice();
  }
  else if (type == "price") {
    filters.initialPrice = "";
    filters.finalPrice = "";
    filters = labelFilter(filters, "price", id);
    filterType = "other";
    //ajaxCategory();
  }
  else if (type == "atributo") {
    filters.idAtribute = "";
    filters = labelFilter(filters, "atributo", id);
    filterType = "attribute";
    //ajaxAttribute();
  }
  else {
    filters.idVariation = "";
    filters = labelFilter(filters, "default", id);
    filterType = "variation";
    //ajaxColor();
  }

  callAjaxFunction(filterType);

  firstLoad = false;
  makeLabel(true);
});

$(document).on("keyup", ".filterListEventsProducts", function (event) {
  var wordCurrent = event.target.value;
  var totalCaracteres = wordCurrent.length;
  wordCurrent = totalCaracteres > 2 ? wordCurrent : "";

  if (totalCaracteres > 2) {
    isLoading("#list");
  }

  let data = {
    viewList: viewListGlobal,
    pageNumber: "1",
    pageSize: pageSizeDefault,
    order: "",
    brand: "",
    category: "",
    initialprice: "",
    finalprice: "",
    variations: "",
    group: "",
    keyWord: wordCurrent,
    idAttribute: "",
    idEventList: idEventListFilter
  };

  updateAjax(data);
});