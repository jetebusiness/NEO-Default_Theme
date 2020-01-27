import { _alert, _confirm } from '../../functions/message';

$(document).ready(function () {
    $(document).on("click", ".btn-yami", function () {
        //_alert("Troca ou Devolução, Url=" + $(this).attr("href"));

        var iframe = document.createElement('iframe');
        iframe.src = $(this).attr("href");
        iframe.frameBorder = "0";
        iframe.width = "900px";
        iframe.height = "500px";
        //iframe.scrolling = "yes";

        //$('.ui.modal').css({
        //    'background-color': '#fff',
        //    'with': '600px',
        //    'height': '400px'
        //});

        iframe.onload = function () {
            $('.ui.modal.yami').modal('show');
        };

        $('.ui.modal.yami .iframe-modal').empty().append(iframe);

        return false;
    });
});