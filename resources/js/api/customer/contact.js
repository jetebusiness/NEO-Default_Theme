import {isValidEmail} from "../../functions/validate"
import {_alert,} from "../../functions/message";

$(document).on("click", "#submitContact", function(e){
    if(!isValidEmail($("#email").val())){
        _alert("", "Informe um e-mail válido.", "error")
        return false
    }
})