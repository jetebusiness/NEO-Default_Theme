/**
 * Ações da API - Semantic-UI
 * https://semantic-ui.com/behaviors/api.html
 */

$.fn.api.settings.api = {
    'post cart shipping': '/order/shipping/{zipCode}/{sessionID}',
    'search products' : '/search/searchproduct/',
    'quickview product': '/product/quickview/{code}',
    'remove product': '/cart/remove/{id}',
    'products list': '/product/getproducts/?v={viewList}&p={pageNumber}&o={/order}&m={/brand}&c={/category}&pi={/initialPrice}&pf={/finalPrice}&r={/variations}',
    'slide update': '/Product/SlideCor/',
    'filter': '/product/filtermenu/',
    'alert me' : '/Product/AlertMe/',
    'alert me vw' : '/Product/AlertMeVw/',
    'form alert me' : '/Product/AlertMeForm/',
    'get sku' : '/product/GetSkuByIdProduct/{id}/{/variations}'

};

export function isLoading(seletor = ""){
    let loadingDiv = `<div class="ui active dimmer inverted bluring loading-div">
    <div class="ui indeterminate text loader">Carregando...</div>
  </div>`;
    if ($(seletor).find(".loading-div").length === 1){
        $(".loading-div").remove();
    }
    else{
        $(seletor).append(loadingDiv);
    }
};