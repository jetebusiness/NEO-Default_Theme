const { mix } = require('laravel-mix-jet');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.browserSync({
    files: ['assets/css/!*.css', 'assets/js/!*.js', 'Views/!*.cshtml'],
    ui: false,
    server: false,
    open: false,
    ghostMode: false,
    injectChanges: true,
    proxy: 'localhost:5001'
});

mix.options({
    publicPath: './',
    uglify: {
        compress: true,
        comment: false
    },
    clearConsole:true
});

mix.js('resources/js/app.js', 'assets/js')
    .sourceMaps()
    .extract(['jquery', 'slick-carousel', 'perfect-scrollbar', 'inputmask', 'sweetalert2', 'easyzoom'])
    .version();

mix.sass('resources/sass/style.scss', 'assets/css')
    .sourceMaps();