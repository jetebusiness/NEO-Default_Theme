/**
 * PLUGIN ZOOM
 *
 **/
export function ZoomReset() {
    let $easyzoom = $(".easyzoom").easyZoom();
    let $thumb = $easyzoom.filter('.easyzoom--with-thumbnails').data('easyZoom');
    $('.thumbnails').on('click', 'a', function (e) {
        let $this = $(this);
        e.preventDefault();
        $thumb.swap($this.data('standard'), $this.attr('href'));
    });
}