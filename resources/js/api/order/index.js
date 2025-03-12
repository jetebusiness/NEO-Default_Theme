import { _alert, _confirm } from '../../functions/message';

$(document).ready(function () {
    $(document).on("click", ".btn-aftersale", function (e) {
        e.preventDefault()
        //_alert("Troca ou Devolução, Url=" + $(this).attr("href"));

        var iframe = document.createElement('iframe');
        iframe.src = $(this).attr("href");

        if (window.innerWidth <= 992)
            inframe.minHeight = "initial"

        $('.ui.modal.aftersale > .iframe-modal').empty().html(iframe)

        iframe.onload = function () {
            $('.ui.modal.aftersale').modal('show');
        };

        return false;
    });
});