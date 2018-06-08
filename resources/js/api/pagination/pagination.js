import {isLoading} from "../api_config";
import {lazyLoad} from "../../functions/lazy_load";

let urlBase = "/product/getproducts/";

let idEventListFilter = "";
let genericPageFilter = "";
let viewListGlobal = "g";
let data;

if($("#GenericPageFilter").length > 0){
    genericPageFilter = $("#GenericPageFilter").val();
}

if($("#idEventListFilter").length > 0){
    idEventListFilter = $("#idEventListFilter").val();
    viewListGlobal = "l";
    urlBase = "/product/GetProductsListEvents/";
}

$(document).on("click", "#previousPage", function() {
    var isdisabled =  $(this).hasClass("disabled");
    if(!isdisabled){
        let page = $(this).data("number");
        window.filterManipulation.pageNumber = page;

        loadData();

        getProducts(data);
    }
});

$(document).on("click", "#nextPage", function() {
    var isdisabled =  $(this).hasClass("disabled");
        if(!isdisabled){
        let page = $(this).data("number");
        window.filterManipulation.pageNumber = page;
    
        loadData();

        getProducts(data);
    }
});

$(document).on("click", ".btnPageNumber", function() {
    let page = $(this).data("number");
    window.filterManipulation.pageNumber = page;

    loadData();

    getProducts(data);
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

function uiReload() {
    $('.ui.accordion').accordion("refresh");
    $(".ui.dropdown").dropdown("refresh");
    $(".ui.checkbox").checkbox("refresh");
}

function loadData() {
    let filters = window.filterManipulation;

    data = {
        viewList: filters.viewList === undefined ? viewListGlobal : filters.viewList,
        pageNumber: filters.pageNumber === undefined ? "1" : filters.pageNumber,
        pageSize: "12",
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
}