//Semantic-UI
require('sass-semantic-ui/dist/components/api');
require('sass-semantic-ui/dist/components/site');
require('sass-semantic-ui/dist/components/accordion');
require('sass-semantic-ui/dist/components/checkbox');
require('sass-semantic-ui/dist/components/colorize');
require('sass-semantic-ui/dist/components/dimmer');
require('sass-semantic-ui/dist/components/dropdown');
//require('sass-semantic-ui/dist/components/embed');
require('sass-semantic-ui/dist/components/form');
require('sass-semantic-ui/dist/components/modal');
//require('sass-semantic-ui/dist/components/nag');
require('sass-semantic-ui/dist/components/popup');
require('sass-semantic-ui/dist/components/progress');
require('sass-semantic-ui/dist/components/rating');
require('sass-semantic-ui/dist/components/search');
//require('sass-semantic-ui/dist/components/shape');
require('sass-semantic-ui/dist/components/sidebar');
require('sass-semantic-ui/dist/components/state');
require('sass-semantic-ui/dist/components/sticky');
require('sass-semantic-ui/dist/components/tab');
require('sass-semantic-ui/dist/components/transition');
//require('sass-semantic-ui/dist/components/video');
require('sass-semantic-ui/dist/components/visibility');
//require('sass-semantic-ui/dist/components/visit');

$(document).ready(function () {
    /*
     Semantic-UI Components
     */
    $('.ui.accordion').accordion();
    $(".ui.dropdown").dropdown();
    $(".ui.progress").progress();
    $(".ui.checkbox").checkbox();

    //Tab Area
    $(".tabular.menu .item").tab();

});