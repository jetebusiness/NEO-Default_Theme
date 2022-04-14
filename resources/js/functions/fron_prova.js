/**
 *  copiaform
 *
 **/

 $(document).ready(function() {
    $("#formulario .change_text").keyup(function() {
        var element = $(this).attr("data-element-change");
        $('#'+element).find('span').html($(this).val());
    });
});