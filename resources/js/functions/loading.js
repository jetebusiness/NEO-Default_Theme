export function loading() {
    let loading = `<div class="ui loader"></div>`;
    $(".pusher").append(loading).addClass('active').addClass('dimmer');

}