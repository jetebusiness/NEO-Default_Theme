/**
 * Bootstrap JS do Sistema
 */

/**
 * Lodash
 * lodash.com
 */
window._ = require('lodash');

try {
    /**
     * jQuery + jQuery Touch Events
     */
    window.$ = window.jQuery = require('jquery');
    require('jquery-touch-events')($);

    /**
     * jQuery Ajax Unobstrusive
     * Obrigatório para Aplicação ASP.NET MVC5
     */
    require('jquery-ajax-unobtrusive');

    //Jet Route Manager
    require("./routes");
} catch (e) {}


/**
 * Semantic-UI
 * https://semantic-ui.com
 *
 * Framework Inicial do Tema
 */
require('./vendors/semantic-ui');

/**
 * Plugins e Bibliotecas utilizadas pelo sistema
 */
require('./plugins');


