
/**
 * Validadores de Formulários - Semantic UI
 */
require('../vendors/validators');
//--------------------[ Correios ]--------------------//
require('../functions/correios');
//--------------------[ Form Starters ]--------------------//
require('./starters/formManipulation');
//--------------------[ Menu ]--------------------//
//Mega Menu
require('./modules/menu');
//Menu Flutuante
require('./modules/floatingMenu.js');
//--------------------[ CheckOut ]--------------------//
require('./modules/checkout');
require('./modules/mini_cart');
//--------------------[ Filters ]--------------------//
require('./modules/filters');
//--------------------[ Product ]--------------------//
require('./modules/product');
require('./modules/product_details');
//--------------------[ Review ]--------------------//
require('./modules/review');
//--------------------[ Slideshow ]--------------------//
require('./modules/slideshow');
//--------------------[ Client Register ]--------------------//
require('./modules/register');
//--------------------[ Client Edit ]--------------------//
require('./modules/editCustomer');
//--------------------[ Start Document ]--------------------//

$(document).ready(function(){
    "use strict";
    $(".footer-wrap").prev().css("cssText", `padding-bottom:${$(".footer-wrap").height()}px !important;`);

    setTimeout(function (){
        $(".intial-loader").fadeOut(800, function(){
            $(this).remove();
        });
    }, 1000);
});

