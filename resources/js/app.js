require("@babel/polyfill");
require('./bootstrap');

/**
 * Ações da função API Semantic-UI
 */
require('./api/api_config');

/**
 * Start UI Build
 */
require("./ui/_start");

/**
 * Start API
 */
require("./api/_start");