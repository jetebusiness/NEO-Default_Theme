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
    if (e.which === 13) {
        location.href = `/busca?n=${$(".prompt").val()}`;
    }
});


$(document).on("keypress", ".prompt_pedidos", function (e) {
    if (e.which === 13) {
        location.href = `/Order/Index?n=${$(".prompt_pedidos").val()}`;
    }
});


$(document).ready(function () {
    $('.ui.search').search({
        type: 'autoComplete',
        minCharacters: 3,
        showNoResults: true,
        apiSettings: {
            action: 'search products',
            onResponse: function (searchResponse) {
                var response = {
                    results: [],
                    query: this.urlData.query
                };
                $.each(searchResponse.data.Products, function (index, item) {
                    var maxResults = 5;
                    if (index >= maxResults) {
                        response.results.push({
                            title: `Exibir todos os ${searchResponse.data.Products.length} resultados`,
                            url: `/busca?n=${response.query}`
                        });

                        return false;
                    }
                    response.results.push({
                        title: item.Name,
                        url: item.UrlFriendlyCustom != null ? item.UrlFriendlyCustom : item.UrlFriendly,
                        image: item.ImageHome,
                    });
                });
                return response;
            }
        },
        error: {
            noResults: "O termo buscado não obteve resultados em nossa loja.",
            serverError: "Erro de conexão no servidor"
        }
    });

});


