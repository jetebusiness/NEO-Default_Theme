/**
 * Mobile Detect
 * http://hgoebl.github.io/mobile-detect.js/
 */
let MobileDetect = require('mobile-detect'),
    md = new MobileDetect(window.navigator.userAgent);

/**
 * Função: isMobile()
 * Retorno: Boolean para se o navegador está em dispositívo móvel
 */
export function isMobile() {
    return md.mobile();
}
