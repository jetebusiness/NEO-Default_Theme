import {isMobile} from '../../functions/mobile';

$(document).ready(function () {
    /**
     * Monagem do Menu Flutuante
     * Checa se o dispositivo não é Mobile para poder ativar ele
     */
    //if (!isMobile()) {
        $("._header").visibility({
            type: 'fixed',
            refreshOnResize: true,
            checkOnRefresh:true,
            offset: 0
        });
    //}
});