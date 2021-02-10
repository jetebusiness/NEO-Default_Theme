


$(function() {
    if($(".privacy-police").length > 0) {
        $(".privacy-police").transition("scale");

        $(".privacy-police .content").transition({
            animation : 'slide up',
            interval  : 200
        });
            
        $("#accept-policy").on("click", function() {
            $.ajax({
                method: "POST",
                url: "/Company/SetPrivacyPolicyCookie",
                success: function () {
                    $(".privacy-police").transition('fade');
                }
            });
        })
    }

    $(".check-policy").checkbox({
        onChecked: function () {            
            $(".modal-policy").modal({
                closable  : false
            })
            .modal('show')     
            
            $("#btn-policy").removeClass("disabled")
        },
        onUnchecked: function () {
            $("#btn-policy").addClass("disabled")
        }
    });
    
    
    
})