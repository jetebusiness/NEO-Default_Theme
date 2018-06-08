$(function () {

    $(".slideshow").each(function() {
        
        var $arrows = ($(this).data("arrow") != null ? $(this).data("arrow") : true),
            $dots = ($(this).data("dots") != null ? $(this).data("dots") : false),
            $qtd = ($(this).data("qtd") != null || $(this).data("qtd") != undefined) ? $(this).data("qtd") : 4,
            $auto = ($(this).data("auto") != null ? true : false);

        var settings = {
            prevArrow: '<a class="slick-prev ui mini button basic black icon"><i class="chevron left icon"></i></a>',
            nextArrow: '<a class="slick-next ui mini button basic black icon"><i class="chevron right icon"></i></a>',
            arrows: $arrows,
            dots: $dots,
            slidesToShow: ($(this).children().length >= $qtd ? $qtd : $(this).children().length),
            accessibility: false,
            autoplay: $auto,
            autoplaySpeed: 6000,
            infinite:false,
            responsive: [
                {
                    breakpoint: 935,
                    settings: {
                        slidesToShow: ($qtd == 1) ? 1 : 2
                    }
                },
                {
                    breakpoint: 724,
                    settings: {
                        slidesToShow: ($qtd == 1) ? 1 : 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        };
        var $sliderCard = jQuery(".card", this),
            $slider = jQuery(this),
            $width = jQuery(".pusher").width();
        
            $slider.slick(settings);
    });

});

