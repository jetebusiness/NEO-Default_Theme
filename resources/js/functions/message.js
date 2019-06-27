/**
 * Função: _alert(titulo, texto, tipo)
 * @param titulo
 * @param texto
 * @param tipo
 *
 * Retorno: Monta menssagem de alerta na tela via SweetAlert 2
 */
export function _alert(titulo, texto, tipo, allowOutsideClick = true) {
    var modal_count = $("body").find(".swal2-show").length;
    if (modal_count === 0) {
        swal({
            title: titulo,
            text: texto,
            type: tipo,
            allowOutsideClick: allowOutsideClick
        });
    }
}
/**
 *
 * @object params
 * {
 * title: @string,
 * text: @string,
 * type: @string,
 * confirm:{
 * color:@hexcolor
 * text: @string
 * },
 * cancel:{
 * color:@hexcolor,
 * text:@string
 * }
 * callback: function(){}
 * @private
 */

export function _confirm(params, showCancelButton = true){
    swal({
        title: params.title,
        text: params.text,
        type: params.type,
        showCancelButton: showCancelButton,
        confirmButtonColor: params.confirm.color || "#16ab39",
        cancelButtonColor: params.cancel.color || "#DB2828",
        confirmButtonText: params.confirm.text || "Remover",
        cancelButtonText: params.cancel.text || "Cancelar"
    }).then(function () {
        if (params.callback && typeof (params.callback) === "function") {
            params.callback();
        }
    });
}