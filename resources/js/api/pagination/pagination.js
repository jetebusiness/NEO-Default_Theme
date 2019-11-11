import {isLoading} from "../api_config";
import {lazyLoad} from "../../functions/lazy_load";

let urlBase = "/product/getproducts/";

let idEventListFilter = "";
let genericPageFilter = "";
let viewListGlobal = "g";
let data;
var ViewProductFiltersUrl = false;
var pageSizeDefault = 12;

$(document).ready(function () {
    if ($("#ViewProductFiltersUrl").val() == "True") {
        ViewProductFiltersUrl = true;
    }
    if ($("#GenericPageFilter").length > 0) {
        genericPageFilter = $("#GenericPageFilter").val();
    }
    if ($("#idEventListFilter").length > 0) {
        idEventListFilter = $("#idEventListFilter").val();
        viewListGlobal = "l";
        urlBase = "/product/GetProductsListEvents/";
    }
});


$(document).on("click", "#previousPage", function() {
    var isdisabled =  $(this).hasClass("disabled");
    if(!isdisabled){
        let page = $(this).data("number");
        window.filterManipulation.pageNumber = page;

        loadData();

        getProducts(data);

        window.scrollTo(0, 0);
    }
});

$(document).on("click", "#nextPage", function() {
    var isdisabled =  $(this).hasClass("disabled");
        if(!isdisabled){
        let page = $(this).data("number");
        window.filterManipulation.pageNumber = page;
    
        loadData();

        getProducts(data);

        window.scrollTo(0, 0);
    }
});

$(document).on("click", ".btnPageNumber", function() {
    let page = $(this).data("number");
    window.filterManipulation.pageNumber = page;

    loadData();

    getProducts(data);

    window.scrollTo(0, 0);
});

function getProducts(data) {
    isLoading("#list");

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


function uiReload() {
    $('.ui.accordion').accordion("refresh");
    $(".ui.dropdown").dropdown("refresh");
    $(".ui.checkbox").checkbox("refresh");
}

function loadData() {
    let filters = window.filterManipulation;

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

    data = {
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
        idEventList: idEventListFilter,
        idCategories: idCategories
    };
}