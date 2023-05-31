window.addEventListener('load', function () {
    Slideshow($(".slideshow"));
})

var players = []; // Array para armazenar os objetos dos players do YouTube
var videoIds = {}; // Objeto para armazenar os IDs dos vídeos

// When the slide is changing
function playPauseVideo(slick, control) {
    var currentSlide, slideType, player;

    currentSlide = slick.find(".slick-current");
    slideType = currentSlide.attr("class").split(" ")[1];
    player = players.find(function (p) {
        return p.getIframe().id === currentSlide.find("iframe").attr("id");
    });

    if (player && player.getPlayerState() === YT.PlayerState.ENDED) {
        var playerId = player.getIframe().id;
        var videoId = videoIds[playerId];
        player.cueVideoById(videoId, 0);
        player.playVideo();
    }
}

function obterIdentificadorVideo(embedCode) {
    // Expressão regular para extrair o identificador do vídeo do código de incorporação
    var regex = /youtube\.com\/embed\/([^"?]+)/;

    // Buscar o valor do identificador usando a expressão regular
    var match = embedCode.match(regex);

    // Se o valor for encontrado, retornar o identificador do vídeo
    if (match && match[1]) {
        return match[1];
    }

    // Se o valor não for encontrado, retornar null ou uma mensagem de erro, conforme necessário
    return null;
}

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubePlayerAPIReady() {
    const inputsVideo = document.querySelectorAll('.ytplayer');
    inputsVideo.forEach(function (input) {
        var UrlVideo = input.getAttribute('data-src');
        if (input.getAttribute('id').length > 0) {
            var playerId = input.getAttribute('id');
            var videoId = obterIdentificadorVideo(UrlVideo);
            videoIds[playerId] = videoId;

            var player = new YT.Player(playerId, {
                videoId: videoId,
                fitToBackground: true,
                pauseOnScroll: false,
                playerVars: {
                    autoplay: 1, // Auto-play the video on load
                    controls: 0, // Show pause/play buttons in player
                    showinfo: 0, // Hide the video title
                    modestbranding: 1, // Hide the Youtube Logo
                    fs: 0, // Hide the full screen button
                    cc_load_policy: 0, // Hide closed captions
                    iv_load_policy: 3, // Hide the Video Annotations
                    autohide: 0, // Hide video controls when playing
                    disablekb: 1,
                    start: 0, // Set loop start time
                    rel: 0, // Hide video recommendations
                    playsinline: 1,
                    loop: 1, // Loop video
                    mute: 1 // Video mute
                },
                events: {
                    'onReady': function (event) {
                        event.target.mute(); // Mute o vídeo quando estiver pronto
                    },
                    'onStateChange': function (event) {
                        if (event.data === YT.PlayerState.ENDED) {
                            var videoId = videoIds[playerId];
                            var newSrc = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&loop=1&playlist=' + videoId;
                            input.setAttribute('src', newSrc);
                        }
                    }
                }
            });

            players.push(player);
        }
    });
}


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
                    lazyLoad: "progressive",
                    speed: 600,
                    cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
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
            onYouTubePlayerAPIReady();
        }
    });
}