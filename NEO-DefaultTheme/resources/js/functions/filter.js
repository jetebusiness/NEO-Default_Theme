export function getFilter() {
    var htmlFilter = "";

    $.ajax({
        url: "/product/filtermenu/",
        method: "GET",
        dataType: "html",
        success: function (response) {
            htmlFilter = response;
        },
        failure: function (response) {
            alert(response);
        },
        error: function (responseFilter) {
            alert(responseFilter);

        }
    });

    return htmlFilter;
};

//export function refreshLazy(){
//    $('.ui.card.produto .image img, .produtoList .image img').visibility('refresh');
//};