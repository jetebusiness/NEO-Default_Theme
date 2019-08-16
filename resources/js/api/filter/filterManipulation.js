import { isLoading } from "../api_config";
import { _alert, _confirm } from "../../functions/message";
import { lazyLoad } from "../../functions/lazy_load";
import { getFromStorage, setInStorage, checkStorage } from "../../functions/storage";

const keyStorage = window.location.host + window.location.pathname;

var firstLoad = true;
var setStorage = false;
var paginationFilter = true;
var idEventListFilter = "";
var viewListGlobal = "g";
var urlBase = "/product/getproducts/";
var storageData = checkStorage(keyStorage) ? JSON.parse(getFromStorage(keyStorage)) : null;
var urlFilter = checkStorage(keyStorage) ? "/product/filtermenunew/" : "/product/filtermenu/";
var pageSizeDefault = 12;
var ViewProductFiltersUrl;
var genericPageFilter;

$(document).ready(function () {

  let filters = window.filterManipulation,
    data;

  ViewProductFiltersUrl = $("#ViewProductFiltersUrl").val() == "True" ? true : false;
  genericPageFilter = $("#GenericPageFilter").length > 0 ? $("#GenericPageFilter").val() : "";

  if (typeof (window.filterManipulation) !== "undefined") {
    if (window.filterManipulation.idCategory != undefined && window.filterManipulation.idCategory != "") {
      $('#checkCategory_' + window.filterManipulation.idCategory).parent().parent().hide();
    }
  }

  if (!ViewProductFiltersUrl && window.filterManipulation !== undefined) {

    // Se tiver algo na sessão,faz um update nos produtos
    if (storageData !== null) {

      //Verificar condições para atualizar os produtos
      let update = false;
      if (typeof (storageData.labelFilter) !== "undefined" ||
        storageData.order !== "" ||
        parseInt(storageData.pageSize) !== parseInt(pageSizeDefault) ||
        parseInt(storageData.pageNumber) > 1 ||
        storageData.viewList !== viewListGlobal )
        update = true;

      if (update) {
        //Antes de atualizar os produtos, sincroniza o filterManipulation com a sessão
        Object.keys(storageData).forEach(function (key) {
          window.filterManipulation[key] = storageData[key];
        });
        data = getParamsFilters(storageData);
        isLoading("#list");
        updateAjax(data);
      }

    }

  } else if (window.pageNumber > 1) {
    data = getParamsFilters(filters);
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
      setStorage = true;
      paginationFilter = false;
      let filters = window.filterManipulation;
      filters.order = $(this).dropdown("get value");
      let data = getParamsFilters(filters);
      updateAjax(data);
    }
  });

  $(".dropdownitens").dropdown({
    onChange: function () {
      isLoading("#list");
      setStorage = true;
      paginationFilter = false;
      let filters = window.filterManipulation;
      filters.pageSize = $(this).dropdown("get value");
      filters.pageNumber = 1;
      let data = getParamsFilters(filters);
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

  if (labelVariation.length === 0) {
    if (storageData !== null)
      labelVariation = typeof (storageData.labelFilter) === "string" ? JSON.parse(storageData.labelFilter) : storageData.labelFilter
  }


  if (uncheck) {
    $("#filter .ui.labels .filters").each(function () {
      idCheck = $(this).attr("data-id");
      verification = window.filterManipulation.labelFilter.filter((item) => {
        return item.id == idCheck
      });
      if (verification.length == 0 && idCheck !== "") {
        $(`.ui.button#${idCheck}`).removeClass("checked selecionado").addClass("basic").removeAttr("disabled");
      }
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
  let data = getParamsFilters(window.filterManipulation);

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

  if (ViewProductFiltersUrl)
    json.labelFilter = getLabelFilter();

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

  var labelFilter = getLabelFilter();
  _data.labelFilter = labelFilter;

  //if (!ViewProductFiltersUrl)
  _data.pageNumber = !paginationFilter ? "1" : _data.pageNumber; // sempre que houver uma atualização no filtro e não é paginação, volto pra pag. 1


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
      } else {
        if (setStorage) {
          setInStorage(keyStorage, JSON.stringify(_data));
          storageData = _data;
        }
      }

      if (window.filterManipulation.labelFilter !== undefined && window.filterManipulation.labelFilter.length === 0)
        window.filterManipulation.labelFilter = typeof (labelFilter) !== "object" ? JSON.parse(labelFilter) : labelFilter;

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

function getLabelFilter() {
  let labelFilter;

  if (ViewProductFiltersUrl) {
    labelFilter = window.filterManipulation.labelFilter !== undefined ? JSON.stringify(window.filterManipulation.labelFilter) : [];
  } else {
    if (!setStorage) {
      if (!ViewProductFiltersUrl && storageData !== null && typeof (storageData.labelFilter) !== "undefined") {
        labelFilter = typeof (storageData.labelFilter) === "string" ? storageData.labelFilter : JSON.stringify((storageData.labelFilter));
      } else {
        labelFilter = [];
      }
    } else {
      labelFilter = window.filterManipulation.labelFilter !== undefined ? JSON.stringify(window.filterManipulation.labelFilter) : [];
    }
  }

  return labelFilter;
}


function updateAjaxPagination(page) {

  isLoading("#list");
  let filters = window.filterManipulation;
  filters.pageNumber = page;
  var data = getParamsFilters(filters);

  $.ajax({
    url: urlBase,
    method: "GET",
    dataType: "html",
    data: data,
    success: function (response) {
      $("#list").html(response);
      lazyLoad();
      $(".ui.rating").rating({
        maxRating: 5,
        interactive: false
      });

      if (ViewProductFiltersUrl == true) {
        updateQueryString(data);
      } else {
        setInStorage(keyStorage, JSON.stringify(data));
        storageData = data;
      }
    },
    onFailure: function onFailure(response) {
      //console.log("Falha ao acessar a página: " + response);
    },
    onError: function onError(response) {
      //console.log("Erro ao acessar a página: " + response);
    },
    complete: function (response) {
      uiReload();
    }
  });
}

function getFilters(callUpdateAjax = false, dataFilter = {}) {

  let data;

  if (urlFilter == "/product/filtermenu/") {
    data = {
      idEventListFilter: "",
      currentPage: ""
    }
  } else {
    let page = $("#CurrentPage").val();
    if (window)
      data = {
        category: page == "category" ? storageData.category : "",
        brand: page == "brand" ? storageData.brand : "",
        group: page == "group" ? storageData.group : "",
        keyword: page == "search" ? storageData.keyWord : ""
      }
  }

  $.ajax({
    url: urlFilter,
    method: "GET",
    dataType: "html",
    data: data,
    success: function (response) {
      $("#filterBlock").html(response);
      if (callUpdateAjax)
        updateAjax(dataFilter)
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
              break;
          case "atributo":
              _.pull(filters.atributeSelected, id.toString());
              break;
      }
      _.pullAt(filters.labelFilter, [key]);
    }
  }

  return filters;
}


function getParamsFilters(filters) {
  return {
    viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
    pageNumber: filters.pageNumber === undefined ? (window.pageNumber === undefined ? "1" : window.pageNumber) : filters.pageNumber,
    pageSize: filters.pageSize === undefined || filters.pageSize === "" ? pageSizeDefault : filters.pageSize,
    order: filters.order === undefined ? "" : filters.order,
    brand: filters.brand === undefined || filters.brand === "" ? (filters.idBrand === undefined ? "" : filters.idBrand) : filters.brand,
    category: filters.category === undefined || filters.category === "" ? (filters.idCategory === undefined ? genericPageFilter : filters.idCategory) : filters.category,
    initialprice: filters.initialprice === undefined ? "" : filters.initialprice,
    finalprice: filters.finalprice === undefined ? "" : filters.finalprice,
    variations: filters.variations === undefined || filters.variations === "" ? (filters.variationSelected !== undefined ? filters.variationSelected.toString() : "") : filters.variations,
    group: filters.group === undefined || filters.group === "" ? (filters.idGroup === undefined ? "" : filters.idGroup) : filters.group,
    keyWord: filters.keyWord === undefined ? "" : filters.keyWord,
    idAttribute: filters.idAttribute === undefined || filters.idAttribute === "" ? (filters.atributeSelected !== undefined ? filters.atributeSelected.toString() : "") : filters.idAttribute,
    idEventList: idEventListFilter,
    idCategories: filters.idCategories === undefined ? "" : filters.idCategories
  }
}

$(document).on("click", "#previousPage", function () {
  var isdisabled = $(this).hasClass("disabled");
  if (!isdisabled) {
    paginationFilter = true
    let page = $(this).data("number");;
    updateAjaxPagination(page);
  }
});

$(document).on("click", "#nextPage", function () {
  var isdisabled = $(this).hasClass("disabled");
  if (!isdisabled) {
    paginationFilter = true;
    let page = $(this).data("number");
    updateAjaxPagination(page);
  }
});

$(document).on("click", ".btnPageNumber", function () {
  paginationFilter = true;
  let page = $(this).data("number");
  updateAjaxPagination(page);
});


$(document).on("click", "#viewgrid", function () {
  isLoading("#list");
  let filters = window.filterManipulation;
  filters.viewList = "g";
  let data = getParamsFilters(filters);


  setStorage = true;
  paginationFilter = false;
  updateAjax(data);
});

$(document).on("click", "#viewlist", function () {
  isLoading("#list");
  let filters = window.filterManipulation;
  filters.viewList = "l";
  let data = getParamsFilters(filters);

  setStorage = true;
  paginationFilter = false;
  updateAjax(data);
});


$(document).on("click", ".checkColor", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
    window.filterManipulation.variationSelected.push($(this).prop("id"));

    if (window.filterManipulation.variations === undefined || window.filterManipulation.variations === "")
      window.filterManipulation.variations = window.filterManipulation.variationSelected.toString();
    else
      window.filterManipulation.variations += "," + $(this).prop("id");
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
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("variation");
});


$(document).on("click", ".checkText", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
    window.filterManipulation.variationSelected.push($(this).prop("id"));

    if (window.filterManipulation.variations === undefined || window.filterManipulation.variations === "")
      window.filterManipulation.variations = window.filterManipulation.variationSelected.toString();
    else
      window.filterManipulation.variations += "," + $(this).prop("id");
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
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("variation");
});


$(document).on("click", ".checkAtribute", function () {
  if ($(this).prop("id") !== undefined && $(this).prop("id") !== "" && jQuery.inArray($(this).prop("id"), window.filterManipulation.atributeSelected)) {
    window.filterManipulation.atributeSelected.push($(this).prop("id"));

    if (window.filterManipulation.idAttribute === undefined || window.filterManipulation.idAttribute === "")
      window.filterManipulation.idAttribute = window.filterManipulation.atributeSelected.toString();
    else
      window.filterManipulation.idAttribute += "," + $(this).prop("id");

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
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("attribute");
});


$(document).on("change", ".checkCategory", function () {
  window.filterManipulation.nameCategory = $(this).attr("name");
  window.filterManipulation.idCategory = $(this).attr("id");

  if (window.filterManipulation.idCategories === undefined || window.filterManipulation.idCategories === "")
    window.filterManipulation.idCategories = $(this).attr("id");
  else
    window.filterManipulation.idCategories += "," + $(this).attr("id");


  if (!ValidateLabel("category", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "category",
      id: window.filterManipulation.idCategory,
      name: "Categorias",
      value: window.filterManipulation.nameCategory
    });
  }
  //ajaxCategory()
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("other");
});


$(document).on("change", ".checkBrand", function () {
  window.filterManipulation.nameBrand = $(this).attr("data-name");
  window.filterManipulation.idBrand = $(this).attr("id");

  if (window.filterManipulation.brand === undefined || window.filterManipulation.brand === "")
    window.filterManipulation.brand = $(this).attr("id");
  else
    window.filterManipulation.brand += "," + $(this).attr("id");


  if (!ValidateLabel("brand", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "brand",
      id: window.filterManipulation.idBrand,
      name: "Marcas",
      value: window.filterManipulation.nameBrand
    });
  }
  //ajaxBrand();
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("other");
});


$(document).on("click", ".pricefilter", function () {
    window.filterManipulation.labelFilter = [];
    window.filterManipulation.initialprice = $("#initialPrice").val().replace(".", "").replace(",", ".");
    window.filterManipulation.finalprice = $("#finalPrice").val().replace(".", "").replace(",", ".");

  if (window.filterManipulation.initialprice === "" || window.filterManipulation.finalprice === "") {
    _alert("Atenção", "Informe preço mínimo e preço máximo!", "warning");

    return;
  }

  if (!ValidateLabel("price", $(this).prop("id"))) {
    window.filterManipulation.labelFilter.push({
      type: "price",
      id: "",
      name: "Preço",
      value: `${window.filterManipulation.initialprice} a ${window.filterManipulation.finalprice}`
    });
  }

  //ajaxPrice();
  firstLoad = false;
  setStorage = true;
  paginationFilter = false;
  callAjaxFunction("other");
});

$(document).on("click", ".ui.label.filters", function () {
  let filters = window.filterManipulation;

  let type = $(this).data("type");
  let id = $(this).data("id");
  let filterType = "";

  if (type == "brand") {
    filters.idBrand = "";
    filters.nameBrand = "";
    filters = labelFilter(filters, "brand", id);
    filterType = "other";

    let brands = window.filterManipulation.brand.split(",").filter((item) => {
      return parseInt(item) !== parseInt(id);
    }).toString();

    filters.brand = brands;
    window.filterManipulation.brand = brands;
  }
  else if (type == "category") {
    filters.idCategory = genericPageFilter;
    filters = labelFilter(filters, "category", id);
    filterType = "other";

    let categories = window.filterManipulation.idCategories.split(",").filter((item) => {
      return parseInt(item) !== parseInt(id);
    }).toString();

    filters.idCategories = categories;
    window.filterManipulation.idCategories = categories;

  }
  else if (type == "price") {
    filters.initialprice = "";
    filters.finalprice = "";
    filters = labelFilter(filters, "price", id);
    filterType = "other";
  }
  else if (type == "atributo") {
    filters.idAtribute = "";
    filters = labelFilter(filters, "atributo", id);
    filterType = "attribute";

    let atribute = window.filterManipulation.idAttribute.split(",").filter((item) => {
      return parseInt(item) !== parseInt(id);
    }).toString();

    filters.idAttribute = atribute;
    window.filterManipulation.idAttribute = atribute;
  }
  else {
    filters.idVariation = "";
    filters = labelFilter(filters, "default", id);
    filterType = "variation";

    let variations = window.filterManipulation.variations.split(",").filter((item) => {
      return parseInt(item) !== parseInt(id);
    }).toString();

    filters.variations = variations;
    window.filterManipulation.variations = variations;
  }

  setStorage = true;
  paginationFilter = false;
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