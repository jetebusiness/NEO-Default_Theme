import {_alert, _confirm} from '../../functions/message';

$(document).ready(function () {
    checkEmail();
    ConfirmaEmail();
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
        if(sEmail == ""){
            _alert("", "Informe um e-mail.", "warning");
            $("#checkEmail").removeClass("loading");
        }
        else if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
            _alert("", "Informe um e-mail válido.", "error");
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
function ConfirmaEmail() {
    $("#email").unbind().keypress(function (e) {
        if (e.which == 13) {
            event.preventDefault();
            $(this).addClass("loading");
            var sEmail = $("#email").val();
            // filtros
            var emailFilter = /^.+@.+\..{2,}$/;
            var illegalChars = /[\(\)\ \<\>\,\;\:\\\/\"\[\]]/
            // condição
            if (sEmail == "") {
                _alert("", "Informe um e-mail.", "warning");
                $("#checkEmail").removeClass("loading");
            }
            else if (!(emailFilter.test(sEmail)) || sEmail.match(illegalChars)) {
                _alert("", "Informe um e-mail válido.", "error");
                $("#checkEmail").removeClass("loading");
                return (false);
            } else {
                $.ajax({
                    method: "POST",
                    url: "/checkout/CheckaEmail",
                    data: {
                        email: sEmail
                    },
                    success: function (response) {
                        if (response.success) {
                            window.location.href = response.action;
                        }
                        else {
                            $("#identificationForm").attr("action", "/checkout/" + response.action);
                            $("#identificationForm").submit();
                        }
                    }
                });
            }
        }
    });
}
