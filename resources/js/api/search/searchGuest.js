import {isLoading} from "../api_config";

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

$(document).ready(function () {

$('#divSearchGuest')
  .search({
      type: 'autoComplete',
      minCharacters: 3,
      apiSettings: {
          url: '/search/searchguest?n={query}',
          onResponse: function (searchResponse) {
              let response = {
                  results: [],
                  query: this.urlData.query
              };

              $.each(searchResponse.data.Guests, function (index, item) {
                  response.results.push({
                      title: item.Name,
                      url: "",
                      description: item.Email,
                      email: item.Email,
                      eventListId: searchResponse.eventListId,
                      guestId: item.IdGuest
                  });
              });

              return response;
          }
      },
      onSelect: function (result, response) {
          $.ajax({
              method: "GET",
              url: "/EventList/GetGuestById",
              data: {
                  guestId: result.guestId
              },
              onBegin:function() {
                  isLoading("#divEventList");
              },
              success: function (response) {
                  $("#guestsList").html(response);
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
      },
      error: {
          noResults: "O termo buscado não obteve resultados.",
          serverError: "Erro de conexão no servidor"
      }
  });
});


