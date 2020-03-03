import {_alert} from "../../functions/message";

export function generateRecaptcha(module, container) {
    
    var googleModule = $("[id^=googleModule]", container).val(),
        googleVersion = $("[id^=googleVersion]", container).val(),
        data = {},
        toReturn = true,
        interval = null;
    
    if(googleModule !== "") {

        $("[id^=googleResponse]", container).val('');

        if (googleVersion === '2') {
            
            if(typeof grecaptcha === "undefined") {
                
                $.getScript("https://www.google.com/recaptcha/api.js?render=explicit&hl=pt-BR", function( ) {

                    grecaptcha.ready(function () {

                        $('.g-recaptcha').each(function (index, el) {

                            var widgetId = grecaptcha.render(el, {
                                'sitekey': $("[id^=googleSiteKey]").eq(0).val()
                            });

                            $(this).attr('data-renderID', widgetId);

                        });
                    });
                    
                });

                toReturn = false;
                
            } else {
                
                if(grecaptcha.getResponse() === "" && grecaptcha.getResponse($(".g-recaptcha", container).data("renderid")) === "") {
                    grecaptcha.reset();

                    data = {
                        title : "Ops...",
                        message : 'Marque a caixa de seleção "Não sou um robô"',
                        type : "warning"
                    }


                    toReturn = false;

                } else {

                    $("[id^=googleResponse]", container).val(grecaptcha.getResponse());

                }
            }            
            
        } else if (googleVersion === '3') {

            if(typeof grecaptcha === "undefined" || !interval) {
                getScriptV3()
            }             
                
            interval = window.setInterval(function () {
                getScriptV3();
                
            }, 114000);

        }


        if(!toReturn) {
            
            if(Object.keys(data).length > 1)
                _alert(data.title, data.message, data.type);
            
        }

        return toReturn;
    }  
    
    
    function getScriptV3() {
        
        var googleSiteKey = $("[id^=googleSiteKey]", container).val();

        $.getScript("https://www.google.com/recaptcha/api.js?render=" + googleSiteKey+"&hl=pt-BR", function( ) {

            grecaptcha.ready(function () {

                grecaptcha.execute(googleSiteKey, { action: module }).then(function (token) {
                    
                    $("[id^=googleResponse]", container).val(token);

                }, function (reason) {

                    data = {
                        title : "Ops...",
                        message : reason,
                        type : "warning"
                    }

                    toReturn = false;

                });

            });

        });
        
    }
       
}


$(function() {
    if($("[id^=googleResponse]").length > 0) {
        if($("[id^=googleVersion]").val() === '3')
            generateRecaptcha($("[id^=googleModule]").val(), "body");
        else
            generateRecaptcha($("[id^=googleModule]").val(), $("[id^=googleModule]").parents("form"));
        
    }
})