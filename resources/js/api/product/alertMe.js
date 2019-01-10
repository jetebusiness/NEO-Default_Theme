import {isValidEmail} from "../../functions/validate.js"
import {_alert} from "../../functions/message";

$(document).on("click", "#alertMe", function (e) {
    var email = $("#form-alert #email").val()
    
    if(!isValidEmail(email)){        
        _alert("", "Informe um e-mail válido.", "error")
        return false
    }
})