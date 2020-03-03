import {isValidEmail} from "../../functions/validate"
import { _alert, } from "../../functions/message";
import { generateRecaptcha }  from "../../ui/modules/recaptcha";

$(document).on("click", "#submitContact", function(e){

    var count = 0,
        form = $("#formContact");

    $("textarea:not(.g-recaptcha-response), input:visible:not([type='checkbox']):not(.search)", form).each(function() {
        if($(this).val().trim() === "")
            count++;

        if($(this).val().trim() === "")
            console.log($(this))
    });

    $('.dropdown:not(.icon)', form).each(function() {
        if($(this).dropdown("get value").trim() === "")
            count++;
    });

    if(count === 0) {
        if($("[id^=googleVersion]", form).val() === "2") {
            if (generateRecaptcha($("[id^=googleModule]", form).val(), form))
                sendContact();
        } else {
            sendContact();
        }
    } else {
        swal({
            title: 'Ops...',
            text: "Preencha todos os campos corretamente",
            type: 'error',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
    }
    
    return false;
})



function sendContact() {

    var form = $("#formContact");

    $.ajax({
        type: "POST",
        url: "/Customer/Contact",
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
                $("#submitContact").removeClass("loading");
                $("input, textarea", form).val('')
                $(".dropdown", form).dropdown("clear")

                swal({
                    title: '',
                    text: response.message,
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
                
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
            $("#submitContact").removeClass("loading");

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
