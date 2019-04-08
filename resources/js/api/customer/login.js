import { _alert, _confirm } from "../../functions/message";

var count = 0;

function gettoken() {
	var token = $("input[name='__RequestVerificationToken']").val();
	return token;
}

function preLogin() {
	var googleRecaptchaStatus = $("#formLogin #gCaptcha").length > 0 ? true : false;
	var googleRecaptchaVersion = "";

	if ($('#googleVersion').length > 0)
		googleRecaptchaVersion = $('#googleVersion').val();

	if ($("#email").val().length > 0 && $("#password").val().length > 0) {
		$("#submitForm").addClass("loading");

		if (googleRecaptchaVersion == "") {
			Login();
		}
		else if (googleRecaptchaVersion == "2") {
			count++
			if (count == 3) {
				$("#submitForm").removeClass("loading");
				$("#formLogin #gCaptcha").show();
			}
			else if (count > 3 && googleRecaptchaStatus) {
				if (grecaptcha.getResponse() != "") {
					$("#googleResponse").val(grecaptcha.getResponse())
					Login();
				} else {
					$("#submitForm").removeClass("loading");
				}
			} else {
				Login();
			}
		} else if (googleRecaptchaVersion == "3") {
			var googleSiteKey = $('#googleSiteKey').val();
			grecaptcha.ready(function () {
				grecaptcha.execute(googleSiteKey, { action: 'Login' }).then(function (tokenGoogleRecaptchaV3) {
					$("#googleResponse").val(tokenGoogleRecaptchaV3);
					Login();
				});
			});
		}
	} else {
		if (googleRecaptchaStatus) {
			grecaptcha.reset();
		}
		$(".ui.message.form-message p").text("É necessário informar os dados de acesso.");
		$(".ui.message.form-message").show();
	}
}

function preLoginB2B() {
	var googleRecaptchaStatus = $("#formLogin #gCaptcha").length > 0 ? true : false
	var googleRecaptchaVersion = "";

	if ($('#googleVersion').length > 0) {
		googleRecaptchaVersion = $('#googleVersion').val();
	}

	if ($("#userName").val().length > 0 && $("#passwordb2b").val().length > 0) {
		$("#loginB2B").addClass("loading");

		if (googleRecaptchaVersion == "") {
			LoginB2B();
		}
		else if (googleRecaptchaVersion == "2") {
			count++
			if (count == 3) {
				$("#loginB2B").removeClass("loading");
				$("#formLogin #gCaptcha").show()
			}
			else if (count > 3 && googleRecaptchaStatus) {
				if (grecaptcha.getResponse() != "") {
					$("#googleResponse").val(grecaptcha.getResponse())
					LoginB2B();
				} else {
					$("#loginB2B").removeClass("loading");
				}
			} else {
				LoginB2B();
			}
		} else if (googleRecaptchaVersion == "3") {
			var googleSiteKey = $('#googleSiteKey').val();
			grecaptcha.ready(function () {
				grecaptcha.execute(googleSiteKey, { action: 'Login' }).then(function (tokenGoogleRecaptchaV3) {
					$("#googleResponse").val(tokenGoogleRecaptchaV3);
					LoginB2B();
				});
			});
		}
	}
	else {
		if (googleRecaptchaStatus)
			grecaptcha.reset()
		$(".ui.message.form-message p").text("É necessário informar os dados de acesso.");
		$(".ui.message.form-message").show();
	}
}

function Login() {
	var googleRecaptchaVersion = "";

	if ($('#googleVersion').length > 0) {
		googleRecaptchaVersion = $('#googleVersion').val();
	}

	var form = $("#formLogin").serialize();
	var googleRecaptchaStatus = $("#formLogin #gCaptcha").length > 0 ? true : false
	$.ajax({
		type: "POST",
		url: "/Customer/Login",
		data: form,
		dataType: "json",
		success: function (response) {
			if (response.success == false) {
				if (googleRecaptchaVersion == '2') {
					grecaptcha.reset();
				} else if (googleRecaptchaVersion == '3') {
					var googleSiteKey = $('#googleSiteKey').val();
					$("#googleResponse").val('');
					$.ajaxSetup({ async: false });
					$.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
						grecaptcha.ready(function () {
							grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
								$("#googleResponse").val(tokenGoogleRecaptchaV3);
							});
						}); 
					});
				}
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
				if (googleRecaptchaVersion == '2') {
					grecaptcha.reset();
				} else if (googleRecaptchaVersion == '3') {
					var googleSiteKey = $('#googleSiteKey').val();
					$("#googleResponse").val('');
					$.ajaxSetup({ async: false });
					$.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
						grecaptcha.ready(function () {
							grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
								$("#googleResponse").val(tokenGoogleRecaptchaV3);
							});
						});
					});
				}
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
	var googleRecaptchaVersion = "";

	if ($('#googleVersion').length > 0) {
		googleRecaptchaVersion = $('#googleVersion').val();
	}

	var form = $("#formLogin");
	var googleRecaptchaStatus = $("#formLogin #gCaptcha").length > 0 ? true : false
	$.ajax({
		type: "POST",
		url: "/Customer/LoginB2B",
		data: form.serialize(),
		dataType: "json",
		success: function (response) {
			if (response.success == false) {
				if (googleRecaptchaVersion == '2') {
					grecaptcha.reset();
				} else if (googleRecaptchaVersion == '3') {
					var googleSiteKey = $('#googleSiteKey').val();
					$("#googleResponse").val('');
					$.ajaxSetup({ async: false });
					$.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
						grecaptcha.ready(function () {
							grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
								$("#googleResponse").val(tokenGoogleRecaptchaV3);
							});
						});
					});
				}
				$(".ui.message.form-message p").text(response.message);
				$(".ui.message.form-message").show();
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
				if (googleRecaptchaVersion === '2') {
					grecaptcha.reset();
				} else if (googleRecaptchaVersion === '3') {
					var googleSiteKey = $('#googleSiteKey').val();
					$("#googleResponse").val('');
					$.ajaxSetup({ async: false });
					$.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
						grecaptcha.ready(function () {
							grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
								$("#googleResponse").val(tokenGoogleRecaptchaV3);
							});
						});
					});
				}
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

	$("#formLogin #gCaptcha").hide();


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
        var _googleRecaptchaVersion = null;

        if ($('#googleVersion').length > 0) {
            _googleRecaptchaVersion = $('#googleVersion').val();
        }

        if (_googleRecaptchaVersion == '3') {
            var googleSiteKey = $('#googleSiteKey').val();
            $.ajaxSetup({ async: false });
            $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
                grecaptcha.ready(function () {
                    grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
                        _googleResponse = tokenGoogleRecaptchaV3;

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
                            }
                        });
                    });
                });
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
        var _googleRecaptchaVersion = null;

        if ($('#googleVersion').length > 0) {
            _googleRecaptchaVersion = $('#googleVersion').val();
        }

        if (_googleRecaptchaVersion == '3') {
            var googleSiteKey = $('#googleSiteKey').val();
            $.ajaxSetup({ async: false });
            $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey, function () {
                grecaptcha.ready(function () {
                    grecaptcha.execute(googleSiteKey, { action: 'Register' }).then(function (tokenGoogleRecaptchaV3) {
                        _googleResponse = tokenGoogleRecaptchaV3;

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
                            }
                        });
                    });
                });
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