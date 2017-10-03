import {_alert, _confirm} from "../../functions/message";

$(document).ready(function(){
    if($("#email").val() == ""){
        $("#enviar").prop("disabled",true);
    }
    $("#email").keyup(function () {
        var email = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/u);

        if (email.test($(this).val())) {
            $("#enviar").prop("disabled",false);
        }else{
            $("#enviar").prop("disabled",true);
        }
    })

    function gettoken() {
       var token = $("input[name='__RequestVerificationToken']").val();
        return token;
    }

    $(document).on("click", "#Entrar", function () {
        $.ajax({
            method: "POST",
            url: "/Customer/Login",
            data: {
                __RequestVerificationToken: gettoken(),
                UserName: $("#UserName").val(),
                Password: $("#Password").val()
            },
            success: function (data) {
                if (data.success == true) {
                    window.location = data.redirectUrl
                } else {
                    _alert("", data.message, "warning")
                }
            },
            error: function (data) {
                _alert("", data.message, "warning")
            }
        });
    })
})
