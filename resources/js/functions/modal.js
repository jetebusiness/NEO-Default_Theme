
/**
 * Semantic-UI Modal
 * Abre Modal QuickView de produto
 * @param modal
 */
export function openModalQuickView(modal, callback) {
    "use strict";
    callback = typeof callback !== 'undefined' ? callback : null;
    //console.log('Modal ID: ' + modal);
    $('.ui.modal')
        .modal({
            transition: 'fade up',
            onShow: function () {

            },
            onVisible: function () {
                $(".ui.modal .dropdown").dropdown("refresh");
            },
            onVisible: () =>{
                if(typeof callback === "function"){
                  callback();
              }
            },
            onHidden: function () {
                //console.log($(this));
                $(this).parent().remove();
                $(this).remove();
            }
        })
        .modal('show');
}


/**
 * Semantic-UI Modal
 * Abre Modal com barra de rolagem
 * @param modal
 */
export function openLongModal(modal) {
    "use strict";
    //console.log('Modal ID: ' + modal);
    $('.longer.modal')
        .modal({
            transition: 'fade up',
            onShow: function () {

            },
            onVisible: function () {
                $(".ui.modal .dropdown").dropdown("refresh");
            },
            onHidden: function () {
                //console.log($(this));
                $(this).parent().remove();
                $(this).remove();
            }
        })
        .modal('show');
}
