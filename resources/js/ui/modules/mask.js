$(document).ready(function () {
  getAllMask();
});

export function getAllMask() {
    getMaskMultiplePhone();
    getMaskMultipleDocument();
    getMaskZipCode();
    getMaskDate();
    getAllInlineMask();
    getMaskCPF();
    getMaskCNPJ();
}

export function getMaskMultiplePhone() {
    $('.mask_phone').mask('(00) 0000-0000#');
    $(".mask_phone").keypress(function() {
        var tel = $(".mask_phone").cleanVal();
        if(tel.length>9){
            $(".mask_phone").mask("(00) 00000-0000");
            var valor_ = $(this).val();
            $(this).focus().val('').val(valor_);
        }else{
            $('.mask_phone').mask('(00) 0000-0000#');
        }
    });

    $('.mask_phone1').mask('(00) 00000-0000');

}

export function getMaskMultipleDocument() {
  $('.mask_document').mask('000.000.000-00#');
  $(".mask_document").keypress(function() {
    var doc = $(".mask_document").val();
    if(doc.length>14){
        $(".mask_document").mask("00.000.000/0000-00");
        var valor_ = $(this).val();
        $(this).focus().val('').val(valor_);
    }else{
        $('.mask_document').mask('000.000.000-00#');
    }
  });
}

export function getMaskZipCode() {
   $('.mask_zipcode').mask('00000-0000');
}

export function getMaskDate() {
   $('.mask_date').mask('00/00/0000');
}

export function getMaskCPF(){
  $('.mask_cpf').mask('000.000.000-00');
}

export function getMaskCNPJ(){
  $(".mask_cnpj").mask("00.000.000/0000-00");
}

export function getAllInlineMask() {
    $('[data-mask]').each(function() {
        $(this).mask($(this).attr("data-mask"));
    });
}

export function getMasMoneyRecursive(){
  $('.money2').mask("#.##0,00", {reverse: true});
}
export function getMaskMoney(){
  $('.money').mask('000.000.000.000.000,00', {reverse: true});
}
