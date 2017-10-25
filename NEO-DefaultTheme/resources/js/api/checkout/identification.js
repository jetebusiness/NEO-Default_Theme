import {_alert, _confirm} from '../../functions/message';

$(document).ready(function () {
    checkEmail();
});

function checkEmail() {
    $("#checkEmail").on("click", function(event){
        event.preventDefault();
        $(this).addClass("loading");
        var sEmail = $("#email").val();
        // filtros
        var emailFilter = /^.+@.+\..{2,}$/;
        var illegalChars = /[\(\)\ \<\>\,\;\:\\\/\"\[\]]/
        // condição
        if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
            _alert("Ops! Encontramos um problema ..", "Por favor, informe um e-mail válido.", "warning");
            $("#checkEmail").removeClass("loading");
            return (false);
        } else {
            $.ajax({
                method: "POST",
                url: "/checkout/CheckaEmail",
                data:{
                    email : sEmail
                },
                success: function(response){
                    if(response.success){
                        window.location.href = response.action;
                    }
                    else{
                        $("#identificationForm").attr("action", "/checkout/" + response.action);
                        $("#identificationForm").submit();
                    }
                }
            });
        }
    });
}
