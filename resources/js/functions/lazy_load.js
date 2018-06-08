
/**
 *  Carregamento das imagens utilizando Lazy load
 *
 **/

export function lazyLoad() {
    $('img[data-src]').visibility({
        type       : 'image',
        transition : 'fade in',
        duration   : 1000,
        observeChanges: true,
        once:true
    });
}

$(function () {
    lazyLoad();
})