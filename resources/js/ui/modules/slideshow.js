window.addEventListener('load', function () {
  Slideshow($(".slideshow"));
})

export function Slideshow(elements) {
  elements.each(function () {

    if ($(this).closest(".no-slideshow").length == 0) {
      let $sliderCard = jQuery(".card", this).length > 0 ? jQuery(".card", this) : jQuery(".slideshow-item", this),
        $slider = jQuery(this),
        $slidesToShow = ($(this).data("qtd") != null || $(this).data("qtd") != undefined) ? $(this).data("qtd") : 4,
        $arrows = ($(this).data("arrow") != null ? $(this).data("arrow") : true),
        $dots = ($(this).data("dots") != null ? $(this).data("dots") : false),
        $auto = ($(this).data("auto") != null ? true : false),
        $infinite = ($(this).data("qtd") == 1 || $(this).data("infinite") ? true : false),
        breakpoints = [
            { breakpoint: 1319, slides: $slidesToShow == 1 ? 1 : 4 },
            { breakpoint: 1025, slides: $slidesToShow == 1 ? 1 : 3 },
            { breakpoint: 769, slides: $slidesToShow == 1 ? 1 : 2 },
            { breakpoint: 569, slides: $slidesToShow == 1 ? 1 : 1 }
        ],
        settings = {
          prevArrow: '<a class="slick-prev ui mini button basic icon"><i class="chevron left icon"></i></a>',
          nextArrow: '<a class="slick-next ui mini button basic icon"><i class="chevron right icon"></i></a>',
          arrows: $arrows,
          dots: $dots,
          slidesToShow: $sliderCard.hasClass("card") ? $slidesToShow : $sliderCard.length > $slidesToShow ? $slidesToShow : $sliderCard.length,
          accessibility: false,
          autoplay: $auto,
          autoplaySpeed: 6000,
          infinite: $infinite,
          responsive: [
            {
              breakpoint: breakpoints[0].breakpoint,
              settings: {
                slidesToShow: $sliderCard.length >= breakpoints[0].slides ? breakpoints[0].slides : $sliderCard.length
              }
            },
            {
              breakpoint: breakpoints[1].breakpoint,
              settings: {
                slidesToShow: $sliderCard.length >= breakpoints[1].slides ? breakpoints[1].slides : $sliderCard.length
              }
            },
            {
              breakpoint: breakpoints[2].breakpoint,
              settings: {
                slidesToShow: $sliderCard.length >= breakpoints[2].slides ? breakpoints[2].slides : $sliderCard.length
              }
            },
            {
              breakpoint: breakpoints[3].breakpoint,
              settings: {
                slidesToShow: $sliderCard.length >= breakpoints[3].slides ? breakpoints[3].slides : $sliderCard.length
              }
            }
          ]
        };

        // == Tratativa para evitar quebra do carrossel no Edge
        if ($sliderCard.hasClass("product-in-card"))
          $slider.removeAttr("class").addClass("slideshow container-product-cards");

        $slider.slick(settings);
    }
  });
}