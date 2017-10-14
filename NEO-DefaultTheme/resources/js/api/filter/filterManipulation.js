import {isLoading} from "../api_config";
import {urlParam} from "../../functions/urlManipulation";
import {getFilter} from "../../functions/filter";

function uiReload() {
    $('.ui.accordion').accordion("refresh");
    $(".ui.dropdown").dropdown("refresh");
    $(".ui.checkbox").checkbox("refresh");
}

function makeLabel() {
    let labelVariation = window.filterManipulation.labelFilter,
        htmlTag        = "";
    for (let key in labelVariation) {
        if (labelVariation[key].type === "price") {
            htmlTag = `<a class="ui label filters" data-type="${labelVariation[key].type}" data-id="${labelVariation[key].id}" id="labelPrice">
                            ${labelVariation[key].name}: ${labelVariation[key].value}
                        <i class="icon close close-filter"></i></a>`;
        }
        else {
            htmlTag += `<a class="ui label filters" data-type="${labelVariation[key].type}" data-id="${labelVariation[key].id}" id="labelVariation_${labelVariation[key].id}">
                                ${labelVariation[key].name}: ${labelVariation[key].value}
                            <i id="icon-close-" + ${labelVariation[key].id} class="icon close close-filter"></i></a>`;
        }
    }
    $("#filter>div.ui.labels:first-child").html(htmlTag);
}

function ValidateLabel(type, id){
    let labelVariation = window.filterManipulation.labelFilter;

    for (let key in labelVariation) {
        if (labelVariation[key].type === type && labelVariation[key].id === id) {
            return true
        }else{
            return false
        }
    }
}

function ajaxColor() {
    isLoading("#list");
    let filters = window.filterManipulation;

    if (filters.idVariation !== undefined && filters.idVariation !== "") {
        filters.variationSelected.push(filters.idVariation);
    }
    let data = {
        viewList: filters.viewList === undefined ? "g" : filters.viewList,
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };
    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);
            
            $.ajax({
                url: "/product/filtermenu/",
                method: "GET",
                dataType: "html",
                success: function (response) {
                    $("#filter").html(response);
                    makeLabel();
                }
            });
        },
        onFailure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        onError: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
}

function ajaxText() {
    isLoading("#list");

    let filters = window.filterManipulation;

    if (filters.idVariation !== undefined && filters.idVariation !== "") {
        filters.variationSelected.push(filters.idVariation);
    }
    let data = {
        viewList: filters.viewList === undefined ? "g" : filters.viewList,
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function onSuccess(response) {
            $("#list").html(response);

            $.ajax({
                url: "/product/filtermenu/",
                method: "GET",
                dataType: "html",
                success: function (response) {
                    $("#filter").html(response);
                    makeLabel();
                }
            });
        },
        failure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        error: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
}

function ajaxCategory() {
    isLoading("#list");

    let filters = window.filterManipulation;

    let data = {
        viewList: filters.viewList === undefined ? "g" : filters.viewList,
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);

            $.ajax({
                url: "/product/filtermenu/",
                method: "GET",
                dataType: "html",
                success: function (response) {
                    $("#filter").html(response);
                    makeLabel();
                }
            });
        },
        onFailure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        onError: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
}

function ajaxBrand() {
    isLoading("#list");

    let filters = window.filterManipulation;

    let data = {
        viewList: filters.viewList === undefined ? "g" : filters.viewList,
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);

            $.ajax({
                url: "/product/filtermenu/",
                method: "GET",
                dataType: "html",
                success: function (response) {
                    $("#filter").html(response);
                    makeLabel();
                }
            });
        },
        complete: function (response) {
            uiReload();
        }
    });
}

function ajaxPrice() {
    isLoading("#list");
    
    let filters = window.filterManipulation;

    let data = {
        viewList: filters.viewList === undefined ? "g" : filters.viewList,
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);

            $.ajax({
                url: "/product/filtermenu/",
                method: "GET",
                dataType: "html",
                success: function (response) {
                    $("#filter").html(response);

                    makeLabel();
                }
            });
        },
        onFailure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        onError: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
}
$(document).ready(function () {
    if (window.filterManipulation !== undefined) {
        window.filterManipulation.variationSelected = [];
        window.filterManipulation.labelFilter = [];
    }

    $(".dropdownorder").dropdown({
        onChange: function () {
            isLoading("#list");

            let filters = window.filterManipulation;

            filters.order = $(this).dropdown("get value");

            let data = {
                viewList: filters.viewList === undefined ? "g" : filters.viewList,
                pageNumber: "1",
                pageSize: "",
                order: filters.order === undefined ? "" : filters.order,
                brand: filters.idBrand === undefined ? "" : filters.idBrand,
                category: filters.idCategory === undefined ? "" : filters.idCategory,
                initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
                finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
                variations: filters.variationSelected.toString(),
                group: filters.idGroup === undefined ? "" : filters.idGroup,
                keyWord: filters.keyWord === undefined ? "" : filters.keyWord
            };

            $.ajax({
                url: "/product/getproducts/",
                method: "GET",
                dataType: "html",
                data: data,
                success: function (response) {
                    $("#list").html(response);

                    //$("#viewList").val(order);
                },
                onFailure: function onFailure(response) {
                    console.log("Falha aplicar filtro: " + response);
                },
                onError: function onError(response) {
                    console.log("Erro aplicar filtro: " + response);
                },
                complete: function (response) {
                    uiReload();
                }
            });
        }
    });
});

$(document).on("click", "#viewgrid", function () {
    isLoading("#list");
    let filters = window.filterManipulation;

    let data = {
        viewList: "g",
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);

            filters.viewList = "g";
        },
        onFailure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        onError: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
});

$(document).on("click", "#viewlist", function () {
    isLoading("#list");
    let filters = window.filterManipulation;

    let data = {
        viewList: "l",
        pageNumber: "1",
        pageSize: "",
        order: filters.order === undefined ? "" : filters.order,
        brand: filters.idBrand === undefined ? "" : filters.idBrand,
        category: filters.idCategory === undefined ? "" : filters.idCategory,
        initialprice: filters.initialPrice === undefined ? "" : filters.initialPrice,
        finalprice: filters.finalPrice === undefined ? "" : filters.finalPrice,
        variations: filters.variationSelected.toString(),
        group: filters.idGroup === undefined ? "" : filters.idGroup,
        keyWord: filters.keyWord === undefined ? "" : filters.keyWord
    };

    $.ajax({
        url: "/product/getproducts/",
        method: "GET",
        dataType: "html",
        data: data,
        success: function (response) {
            $("#list").html(response);

            filters.viewList = "l";
        },
        onFailure: function onFailure(response) {
            console.log("Falha aplicar filtro: " + response);
        },
        onError: function onError(response) {
            console.log("Erro aplicar filtro: " + response);
        },
        complete: function (response) {
            uiReload();
        }
    });
});

$(document).on("click", ".checkColor", function () {
    if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
        window.filterManipulation.variationSelected.push($(this).prop("id"));
    }

    window.filterManipulation.labelFilter.push({
        type: "color",
        id: $(this).prop("id"),
        name: $(this).data("reference"),
        value: $(".fields").find("#variation_" + $(this).prop("id")).prop("name")
    });
    ajaxColor();
});

$(document).on("click", ".checkText", function () {
    if ($(this).prop("id") !== undefined && $(this).prop("id") !== "") {
        window.filterManipulation.variationSelected.push($(this).prop("id"));
    }

    window.filterManipulation.labelFilter.push({
        type: "text",
        id: $(this).prop("id"),
        name: $(this).data("reference"),
        value: $(".fields").find("#variation_" + $(this).prop("id")).prop("name")
    });
    ajaxText();
});

$(document).on("change", ".checkCategory", function () {
    window.filterManipulation.nameCategory = $(this).attr("name");
    window.filterManipulation.idCategory = $(this).attr("id");
    if(!ValidateLabel("category", window.filterManipulation.idCategory)){
        window.filterManipulation.labelFilter.push({
            type: "category",
            id: window.filterManipulation.idCategory,
            name: "Categorias",
            value: window.filterManipulation.nameCategory
        });          
    }
    ajaxCategory();
});

$(document).on("change", ".checkBrand", function () {
    window.filterManipulation.nameBrand = $(this).attr("data-name");
    window.filterManipulation.idBrand = $(this).attr("id");

    window.filterManipulation.labelFilter.push({
        type: "brand",
        id: window.filterManipulation.idBrand,
        name: "Marcas",
        value: window.filterManipulation.nameBrand
    });

    ajaxBrand();
});

$(document).on("click", ".pricefilter", function () {
    window.filterManipulation.initialPrice = $("#initialPrice").val().replace(".","").replace(",", ".");
    window.filterManipulation.finalPrice = $("#finalPrice").val().replace(".","").replace(",", ".");

    window.filterManipulation.labelFilter.push({
        type: "price",
        id: "",
        name: "Preço",
        value: `${window.filterManipulation.initialPrice} a ${window.filterManipulation.finalPrice}`
    });
    
    ajaxPrice();
})

$(document).on("click", ".ui.label.filters", function () {
    let filters = window.filterManipulation;

    let type = $(this).data("type");
    let id   = $(this).data("id");

    if (type == "brand") {
        filters.idBrand = "";

        for (let key in filters.labelFilter) {
            if (filters.labelFilter[key].id == id) {
                _.pullAt(filters.labelFilter, [key]);
            }
        }

        ajaxBrand();
    }
    else if (type == "category") {
        filters.idCategory = "";

        for (let key in filters.labelFilter) {
            if (filters.labelFilter[key].id == id) {
                _.pullAt(filters.labelFilter, [key]);
            }
        }

        ajaxPrice();
    }
    else if (type == "price")
    {
        filters.initialPrice = "";
        filters.finalPrice = "";

        for (let key in filters.labelFilter) {
            if (filters.labelFilter[key].id == id) {
                _.pullAt(filters.labelFilter, [key]);
            }
        }

        ajaxCategory();
    }
    else {
        filters.idVariation = "";

        for (let key in filters.labelFilter) {
            if (filters.labelFilter[key].id == id) {
                _.pull(filters.variationSelected, id.toString());
                _.pullAt(filters.labelFilter, [key]);
            }
        }

        ajaxColor();
    }

    makeLabel();

});