import {isValidEmail} from "../../functions/validate"
import {_alert,} from "../../functions/message";

$(document).on("click", "#alterarEmail", function(e){
    var email = $("#email").val()
    var confirmEmail = $("#confirmEmail").val()

    if(email == "" || confirmEmail == "")
    {
        _alert("", "Informe um e-mail.", "warning")
        return false
    }
    else if(!isValidEmail(email) || !isValidEmail(confirmEmail)){
        _alert("", "Informe um e-mail válido.", "error")
        return false
    }
})