import { _alert, _confirm } from "../../functions/message";
import { generateRecaptcha }  from "../../ui/modules/recaptcha";



function gettoken() {
	var token = $("input[name='__RequestVerificationToken']").val();
	return token;
}

function preLogin() {

    var form = $('#formLogin');    
	var googleRecaptchaStatus = !$("[id^=googleResponse]", form).length;
	

	if ($("#email").val().length > 0 && $("#password").val().length > 0) {
	    
	    
		$("#submitForm").addClass("loading");

		if (googleRecaptchaStatus) {
			Login();			
		} else{

            if($("[id^=googleVersion]", form).val() === "2") {
                if(generateRecaptcha($("[id^=googleModule]", form).val(), form))
                    Login();
                else
                    $("#submitForm").removeClass("loading");
            } else {
                Login();
            }
               
            
		}
	} else {
		if (!googleRecaptchaStatus)
            (typeof grecaptcha !== "undefined" && $("[id^=googleVersion_]").eq(0).val() === "2" ? grecaptcha.reset() : "")
		
		$(".ui.message.form-message p").text("É necessário informar os dados de acesso.");
		$(".ui.message.form-message").show();
	}
}

function preLoginB2B() {
    
    var form = $('#formLogin');
    var googleRecaptchaStatus = !$("[id^=googleResponse]", form).length;

	if ($("#userName").val().length > 0 && $("#passwordb2b").val().length > 0) {
	    
		$("#loginB2B").addClass("loading");

        if (googleRecaptchaStatus) {
            
            LoginB2B();
            
        } else {

            if($("[id^=googleVersion]", form).val() === "2") {
                if(generateRecaptcha($("[id^=googleModule]", form).val(), form))
                    LoginB2B();
                else
                    $("#loginB2B").removeClass("loading");
            } else {
                LoginB2B();
            }
        }
		
	}
	else {
        if (!googleRecaptchaStatus)
            (typeof grecaptcha !== "undefined" && $("[id^=googleVersion_]").eq(0).val() === "2" ? grecaptcha.reset() : "")
        
		$(".ui.message.form-message p").text("É necessário informar os dados de acesso.");
		$(".ui.message.form-message").show();
	}
}

function Login() {

	var form = $("#formLogin");
    
	$.ajax({
		type: "POST",
		url: "/Customer/Login",
		data: form.serialize(),
		dataType: "json",
		success: function (response) {
		    
			if (response.success === false) {
				$(".ui.message.form-message p").html(response.message);
				$(".ui.message.form-message").show();
				
				
				setTimeout(function() {
				    $(".ui.message.form-message", form).hide()
                }, 3000)
			}
			else {
				$("#submitForm").removeClass("loading");
				location.href = response.redirectUrl;
			}
			
		},
		error: function () {
			if (response.success == false) {
				
				$(".ui.message.form-message p").text(response.message);
				$(".ui.message.form-message").show();

                setTimeout(function() {
                    $(".ui.message.form-message", form).hide()
                }, 3000)
                
			}
		},
		complete: function () {
			$("#submitForm").removeClass("loading");
			
			if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
			    if($("[id^=googleVersion_]").eq(0).val() === "2") {
                    (form.parents(".modal-login").length > 0 ? grecaptcha.reset(1) : grecaptcha.reset())
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), form);
                }
            }
			
            
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
			if (response.success === false) {				
			    
				$(".ui.message.form-message p").text(response.message);
				$(".ui.message.form-message").show();

                setTimeout(function() {
                    $(".ui.message.form-message", form).hide()
                }, 3000)
			}
			else {
				if (response.showAcceptTerm) {
					window.scrollTo(0, 200)
					$("#idCustomer").val(response.idCustomer)
					$("#idTablePrice").val(response.idTablePrice)
					$("#loginB2B").removeClass("loading");
					$("#loginB2B").hide()
					$("#termoAceite").removeClass("hideme")
				}
				else {
					$("#loginB2B").removeClass("loading");
					location.href = response.redirectUrl;
				}
			}
		},
		error: function () {
			if (response.success == false) {
				
				$(".ui.message.form-message p").text(response.message);
				$(".ui.message.form-message").show();

                setTimeout(function() {
                    $(".ui.message.form-message", form).hide()
                }, 3000)
			}
		},
		complete: function () {
			$("#loginB2B").removeClass("loading");

            if($("[id^=googleVersion_]").length > 0 && typeof grecaptcha !== "undefined") {
                if($("[id^=googleVersion_]").eq(0).val() === "2") {
                    (form.parents(".modal-login").length > 0 ? grecaptcha.reset(1) : grecaptcha.reset())
                } else {
                    generateRecaptcha($("[id^=googleModule]").val(), form);
                }
            }
		}
	});
}

$(document).ready(function () {

	$(document).on("click", "#submitForm", function () {
		preLogin();
	});

	$(document).on("click", "#loginB2B", function () {
		preLoginB2B();
    })

	$(document).on("click", "#btnCancelar", function (e) {
		$("#loginB2B").show()
		$("#termoAceite").addClass("hideme")
	})

	$(document).on("click", "#btnContinuar", function (e) {
		var form = $("#formLogin");
		if ($("#checkAcceptTerm").prop("checked")) {
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
					if (response.success === false) {
						$(".ui.message.form-message p").text(response.message);
						$(".ui.message.form-message").show();
					}
				},
				complete: function () {
					$("#loginB2B").removeClass("loading");
				}
			});
		}
		else {
			_alert("Mensagem", "Para continuar você precisa aceitar os termos e condições!", "warning")
		}
	})

	$(document).on("keypress", "#email", function (e) {
		if (e.which == 13) {
			event.preventDefault();
			return false;
		}
	})

	$(document).on("keypress", "#password", function (e) {
		if (e.which == 13)
			preLogin();
	});

	$(document).on("keypress", "#passwordb2b", function (e) {
		if (e.which == 13)
			preLoginB2B();
    });

    $(document).on("click", "#Google", function (e) {
        $(this).addClass("loading");

        var _googleResponse = null;
        var _googleRecaptchaVersion = false;


        if($("[id^=googleVersion]").val() === "3") {
            _googleResponse = $("[id^=googleResponse]").val()
            _googleRecaptchaVersion = true;
        }

        if (_googleRecaptchaVersion) {
           
            $.ajax({
                type: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: gettoken(),
                    returnUrl: null,
                    provider: $("#Google").val(),
                    googleResponse: _googleResponse
                },
                dataType: "json",
                success: function (response) {
                    if (response.success === true) {
                        $("#Google").removeClass("loading");
                        window.location = response.redirectUrl
                    }
                },
                error: function (response) {
                    $("#Google").removeClass("loading");
                    _alert("Mensagem", "Erro: " + response.message, "warning")
                }, 
                complete: function() {
                    
                    generateRecaptcha($("[id^=googleModule]").val(), "body");
                    
                }
            });
            
        } else {
            
            $.ajax({
                type: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: gettoken(),
                    provider: $(this).val()
                },
                dataType: "json",
                success: function (response) {
                    if (response.success === true) {
                        window.location = response.redirectUrl
                    }
                },
                error: function (response) {
                    _alert("Mensagem", "Erro: " + response.message, "warning")
                }
            });
        }

        return false;
    })


    $(document).on("click", "#Facebook", function (e) {
        $(this).addClass("loading");

        var _googleResponse = null;
        var _googleRecaptchaVersion = false;


        if($("[id^=googleVersion]").val() === "3") {
            _googleResponse = $("[id^=googleResponse]").val()
            _googleRecaptchaVersion = true;
        }

        if (_googleRecaptchaVersion) {
            
            $.ajax({
                type: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: gettoken(),
                    returnUrl: null,
                    provider: $("#Facebook").val(),
                    googleResponse: _googleResponse
                },
                dataType: "json",
                success: function (response) {
                    if (response.success === true) {
                        $("#Facebook").removeClass("loading");
                        window.location = response.redirectUrl
                    }
                },
                error: function (response) {
                    $("#Facebook").removeClass("loading");
                    _alert("Mensagem", "Erro: " + response.message, "warning")
                },
                complete: function() {

                    generateRecaptcha($("[id^=googleModule]").val(), "body");

                }
            });
            
        } else {
            $.ajax({
                type: "POST",
                url: "/Customer/Login",
                data: {
                    __RequestVerificationToken: gettoken(),
                    provider: $(this).val()
                },
                dataType: "json",
                success: function (response) {
                    if (response.success === true) {
                        window.location = response.redirectUrl
                    }
                },
                error: function (response) {
                    _alert("Mensagem", "Erro: " + response.message, "warning")
                }
            });
        }

        return false;
    })
})