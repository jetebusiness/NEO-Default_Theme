import { isMobile } from '../../functions/mobile';
import { _alert } from '../../functions/message';

const minCharacters = 3,
    mobileResults = () => isMobile() && $(".search").length > 0 ? true : false;

$.fn.search.settings.templates.message = function (message, type) {
    var html = "";
    if (message !== undefined && type !== undefined) {
        html += `<div class="message ${type}">`
        ;
        // message type
        if (type === 'empty') {
            html += `<div class="header">Sem Resultados Encontrados</div class="header">
                        <div class="description">${message}</div class="description">`;
        }
        else {
            html += `<div class="description">${message}</div>`;
        }
        html += "</div>";
    }
    return html;
};
$.fn.search.settings.templates.autoComplete = function (response, fields) {
    var html = '';
    if (response[fields.results] !== undefined) {
        $.each(response[fields.results], function (index, result) {
            if (result[fields.url]) {
                html += `<a class="result" href="${result[fields.url]}">`;
            }
            else {
                html += `<a class="result">`;
            }
            html += `<div class="contents">`;
            if (result[fields.image] !== undefined) {
                html += `<div class="imagem">
                            <img src="${result[fields.image]}" onerror="imgError(this)">
                        </div>`;
            }
            html += `<div class="content text left">`;
            if (result[fields.price] !== undefined) {
                html += `<div class="price">${result[fields.price]}</div>`;
            }
            if (result[fields.title] !== undefined) {
                html += `<div class="title">${result[fields.title]}</div>`;
            }
            if (result[fields.description] !== undefined) {
                html += `<div class="description">${result[fields.description]}</div>`;
            }
            html += `</div>
                    </div>
                    </a>`;
        });

        if (response[fields.action]) {
            html += `<a href="${response[fields.action][fields.actionURL]}" class="action">
                            ${response[fields.action][fields.actionText]}
                     </a>`;
        }
        return html;
    }
    return false;
};

$(document).on("keypress", ".prompt", function (e) {
    let value = encodeURIComponent($(".searchMobile").is(":visible") ? $(".searchMobile .prompt").val() : $(".prompt:visible").val());

    if (e.which === 13) {
        if (value.length >= minCharacters)
            location.href = `/busca?n=${value}&mdf=${$("#metaDataField").val()}&mdv=${$("#metaDataValue").val()}`;
        else
            _alert("Busca", `Informe ao mínimo ${minCharacters} caracteres para efetuar a busca`, "warning");
    }
});


$(document).on("keypress", ".busca_lista", function (e) {
    if (e.which === 13) {
        location.href = `/eventList/managerProducts?n=${$(".busca_lista").val()}`;
    }
});


$(document).on("click", ".busca_lista_btn", function (e) {
    location.href = `/eventList/managerProducts?n=${$(".busca_lista").val()}`;
});


$(document).on("click", ".searchMobile .search-results", function (e) {
    let value = encodeURIComponent($(".searchMobile").is(":visible") ? $(".searchMobile .prompt").val() : $(".prompt:visible").val());

    if (value.length >= minCharacters)
        location.href = `/busca?n=${value}&mdf=${$("#metaDataField").val()}&mdv=${$("#metaDataValue").val()}`;
    else
        _alert("Busca", `Informe ao mínimo ${minCharacters} caracteres para efetuar a busca`, "warning");

});



$(document).on("keypress", ".busca_convidado_lista", function (e) {
    if (e.which === 13) {
        location.href = `/eventList/managerGuest?n=${$(".busca_convidado_lista").val()}`;
    }
});


$(document).on("click", ".btn_convidado_lista", function (e) {
    location.href = `/eventList/managerGuest?n=${$(".busca_convidado_lista").val()}`;
});


$(document).on("click", "#closeResultsMobile", function (e) {
    if (mobileResults)
        hideResultsClone();
});





$(document).ready(function () {

    if (mobileResults)
        $(".results").after("<div class='results hidden results-clone'></div>");

    $('.ui.search').search({
        type: 'autoComplete',
        minCharacters,
        showNoResults: true,
        hideDelay: 1000,
        duration: 300,
        apiSettings: {
            beforeSend: function (settings) {

                settings.data.n = $(".prompt:visible").val();
                // Quando for utilizar a busca com metadata separados por "|"
                // settings.data.mdf = 'feature';
                // settings.data.mdv = 'produto';
                return settings;
            },
            action: 'search products',
            onResponse: function (searchResponse) {
                var response = {
                    results: [],
                    query: decodeURIComponent(this.urlData.query),
                    metadatafield: this.urlData.metadatafield,
                    metadatavalue: this.urlData.metadatavalue
                };
                $.each(searchResponse.data.Products, function (index, item) {
                    var maxResults = 5;
                    if (index >= maxResults) {
                        response.results.push({
                            title: `Exibir todos os resultados`,
                            url: `/busca?n=${response.query}&mdf=${response.metadatafield}&mdv=${response.metadatavalue}`
                        });

                        return false;
                    }
                    response.results.push({
                        title: item.Name,
                        url: item.UrlFriendlyCustom != null ? item.UrlFriendlyCustom : item.UrlFriendly,
                        image: item.ImageHome,
                        purchasetrackingtype: item.PurchaseTracking != undefined && item.PurchaseTracking.Type != undefined ? item.PurchaseTracking.Type : "",
                        purchasetrackingvalue: item.PurchaseTracking != undefined && item.PurchaseTracking.Value != undefined ? item.PurchaseTracking.Value : ""
                    });
                });
                return response;
            }
        },
        onSelect: function (result, response) {
            if (result.purchasetrackingtype != undefined && result.purchasetrackingvalue != undefined) {
                let purchasetracking = { type: result.purchasetrackingtype, value: result.purchasetrackingvalue };
                sessionStorage.setItem('purchasetracking', JSON.stringify(purchasetracking));
            }
        },
        onResultsAdd: function () {
            if (mobileResults)
                showResultsClone();
        },
        onResultsClose: function () {
            if (mobileResults) {
                if ($(".searchMobile .prompt").val().length < minCharacters) {
                    hideResultsClone();
                }
            }
        },
        error: {
            noResults: "O termo buscado não obteve resultados em nossa loja.",
            serverError: "Erro de conexão no servidor"
        }
    });

});

function showResultsClone() {
    $(".results-clone").removeClass("closed");
    $("#closeResultsMobile").removeClass("disabled");
}

function hideResultsClone() {
    $(".results-clone").addClass("closed");
    $("#closeResultsMobile").addClass("disabled");
};