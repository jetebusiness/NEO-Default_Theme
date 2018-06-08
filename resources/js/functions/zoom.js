/**
 * PLUGIN ZOOM
 *
 **/

/**
 * JS - Detalhes do Produto
 * UI Detalhes do Produto, Quick View
 */
import { isMobile } from '../functions/mobile';

export function ZoomReset() {
    let $easyzoom = $(".easyzoom");
    $('.thumbnails').on('click', 'a', function(e) {
        let $this = $(this);
        let $toggle = $('.toggleZoom');

        e.preventDefault();

        $this.parents(".slick-slide").siblings().removeClass("slick-current")
        $this.parents(".slick-slide").addClass("slick-current")

        if ($toggle.data("active") === true || !isMobile()) {
            $easyzoom.easyZoom().filter('.easyzoom--with-thumbnails').data('easyZoom').swap($this.data('standard'), $this.attr('href'));
        } else {
            $(">a", ".easyzoom").attr("href", $this.data('standard'))
            $(">a>img", ".easyzoom").attr("src", $this.data('standard'))
        }
    });



    $('.toggleZoom').on('click', function() {
        var $this = $(this);

        if ($this.data("active") === true) {
            $this.text("Habilitar Zoom").data("active", false);
            $easyzoom.each(function () {
                $(this).easyZoom().filter('.easyzoom--with-toggle').data('easyZoom').teardown();
            });
        } else {
            $this.text("Desativar Zoom").data("active", true);
            $easyzoom.easyZoom().init();
}
    });

    if (!isMobile()) {
        $easyzoom.easyZoom().init();
    }
}
