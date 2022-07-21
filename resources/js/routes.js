/**
 * jQuery jetRoute
 * https://github.com/bloodf/jetRoute
 */
require("jetroute");

/**
 * @type {{routes: {@string route name: @url route}}}
 */
$.jetRoute.settings = {
    routes: {
        "checkout": "checkout",
        "produto": "produto",
        "category": "category",
        "home": "home",
        "brand": "brand",
        "group": "group",
        "customer": "customer",
        "search": "search",
    },
    routeType: "cookie",
    cookieName: "PathStorage"
};