import {_alert, _confirm} from "../../functions/message";

var count = 0;

function gettoken() {
    var token = $("input[name='__RequestVerificationToken']").val();
    return token;
}

function Login() {
    var form = $("#formLogin");
    $.ajax({
        type: "POST",
        url: "/Customer/Login",
        data: form.serialize(),
        dataType: "json",
        success: function (response) {
            if (response.success == false) {
                grecaptcha.reset()
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
            else {
                $("#submitForm").removeClass("loading");
                location.href = response.redirectUrl;
            }
        },
        error: function () {
            if (response.success == false) {
                grecaptcha.reset()
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
        },
        complete: function () {
            $("#submitForm").removeClass("loading");
        }
    });
}

function LoginB2B() {
    var form = $("#formLogin");
    $.ajax({
        type: "POST",
        url: "/Customer/LoginB2B",
        data: form.serialize(),
        dataType: "json",
        success: function (response) {
            if (response.success == false) {
                grecaptcha.reset()
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
            else {
                if(response.showAcceptTerm){
                    window.scrollTo(0, 200)
                    $("#idCustomer").val(response.idCustomer)
                    $("#idTablePrice").val(response.idTablePrice)
                    $("#loginB2B").removeClass("loading");
                    $("#loginB2B").hide()
                    $("#termoAceite").removeClass("hideme")                    
                }
                else{
                    $("#loginB2B").removeClass("loading");
                    location.href = response.redirectUrl;                
                }
            }
        },
        error: function () {
            if (response.success == false) {
                grecaptcha.reset()
                $(".ui.message.form-message p").text(response.message);
                $(".ui.message.form-message").show();
            }
        },
        complete: function () {
            $("#loginB2B").removeClass("loading");
        }
    });
}

$(document).ready(function () {
    $("#gCaptcha").hide()
    $(document).on("click", "#submitForm", function () {
        if ($("#email").val().length > 0 && $("#password").val().length > 0) {
            $("#submitForm").addClass("loading");
            count++
            if (count == 3) {
                $("#submitForm").removeClass("loading");
                $("#gCaptcha").show()
            }
            else if (count > 3) {
                var response = grecaptcha.getResponse()
                if (response.length > 0) {
                    Login()
                }else{
                    $("#submitForm").removeClass("loading");
                }
            }
            else {
                Login()
            }
        }
        else {
            grecaptcha.reset()
            $(".ui.message.form-message p").text("É necessário informar os dados de acesso!");
            $(".ui.message.form-message").show();
        }
    })

    $(document).on("click", "#loginB2B", function () {
        if ($("#userName").val().length > 0 && $("#passwordb2b").val().length > 0) {
            $("#loginB2B").addClass("loading");
            count++
            if (count == 3) {
                $("#loginB2B").removeClass("loading");
                $("#gCaptcha").show()
            }
            else if (count > 3) {
                var response = grecaptcha.getResponse()
                if (response.length > 0) {
                    LoginB2B()
                }else{
                    $("#loginB2B").removeClass("loading");
                }
            }
            else {
                LoginB2B()
            }
        }
        else {
            grecaptcha.reset()
            $(".ui.message.form-message p").text("É necessário informar os dados de acesso!");
            $(".ui.message.form-message").show();
        }
    })


    $(document).on("click", "#btnCancelar", function(e){
        $("#loginB2B").show()
        $("#termoAceite").addClass("hideme")
    })

    $(document).on("click", "#btnContinuar", function(e){
        var form = $("#formLogin");
        if($("#checkAcceptTerm").prop("checked")){
            $.ajax({
                type: "POST",
                url: "/Customer/AcceptTermB2B",
                data: form.serialize(),
                dataType: "json",
                success: function (response) {
                    if (response.success === true) {                   
                        window.location = response.redirectUrl
                    }
                    else {
                        $(".ui.message.form-message p").text(response.message);
                        $(".ui.message.form-message").show();
                    }
                },
                error: function (response) {
                    if (response.success == false) {                    
                        $(".ui.message.form-message p").text(response.message);
                        $(".ui.message.form-message").show();
                    }
                },
                complete: function () {
                    $("#loginB2B").removeClass("loading");
                }
            });    
        }
        else{
            _alert("Mensagem", "Para continuar você precisa aceitar os termos e condições!", "warning")
        }
    })

    $(document).on("keypress", "#email", function (e) {
        if(e.which == 13) {
            return false;    
        }
    })
    $(document).on("keypress", "#password", function (e) {
        if(e.which == 13) {
            return false;    
        }
    })
    $(document).on("keypress", "#password", function (e) {
        if(e.which == 13) {
            if ($("#email").val().length > 0 && $("#password").val().length > 0) {
                $("#submitForm").addClass("loading");
                count++
                if (count == 3) {
                    $("#submitForm").removeClass("loading");
                    $("#gCaptcha").show()
                }
                else if (count > 3) {
                    var response = grecaptcha.getResponse()
                    if (response.length > 0) {
                        Login()
                    }
                    else{
                        $("#submitForm").removeClass("loading");
                    }
                }
                else {
                    Login()
                }
            }
            else {
                grecaptcha.reset()
                $(".ui.message.form-message p").text("É necessário informar os dados de acesso!");
                $(".ui.message.form-message").show();
            }
        }
    })

    $(document).on("keypress", "#passwordb2b", function (e) {
        if(e.which == 13) {
            if ($("#userName").val().length > 0 && $("#passwordb2b").val().length > 0) {
                $("#loginB2B").addClass("loading");
                count++
                if (count == 3) {
                    $("#loginB2B").removeClass("loading");
                    $("#gCaptcha").show()
                }
                else if (count > 3) {
                    var response = grecaptcha.getResponse()
                    if (response.length > 0) {
                        LoginB2B()
                    }
                    else{
                        $("#loginB2B").removeClass("loading");
                    }
                }
                else {
                    LoginB2B()
                }
            }
            else {
                grecaptcha.reset()
                $(".ui.message.form-message p").text("É necessário informar os dados de acesso!");
                $(".ui.message.form-message").show();
            }
        }
    })

    $(document).on("click", "#Google", function (e) {
        e.preventDefault()
        $.ajax({
            type: "POST",
            url: "/Customer/Login",
            data: {__RequestVerificationToken: gettoken(),
                provider: $(this).val()},
            dataType: "json",
            success: function (response) {
                if (response.success == true) {
                    window.location = response.redirectUrl
                }                
            },
            error: function (response) {
                _alert("Mensagem", "Erro: " + response.message, "warning")
            }
        });
    })

    
    $(document).on("click", "#Facebook", function (e) {
        e.preventDefault()
        $.ajax({
            type: "POST",
            url: "/Customer/Login",
            data: {__RequestVerificationToken: gettoken(),
                provider: $(this).val()},
            dataType: "json",
            success: function (response) {
                if (response.success == true) {
                    window.location = response.redirectUrl
                }                
            },
            error: function (response) {
                _alert("Mensagem", "Erro: " + response.message, "warning")
            }
        });
    })
})