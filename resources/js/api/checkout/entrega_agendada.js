export function SaveFrete() {
    $.ajax({
        method: "POST",
        url: "SaveFrete",
        data: {
            zipCode: zipcode,
            idShippingMode: new Number(idFrete),
            deliveredByTheCorreiosService: correiosEntrega.toLowerCase()
        },
        success: function (response) {
            atualizaResumoCarrinho();
        }
    });
}

export function BuscaFreteEntregaAgendada() {
    console.log("abrindo");
    isLoading(".ui.accordion.frete");
    $.ajax({
        method: "POST",
        url: "EntregaAgendada",
        data: {
            idShippingMode: new Number(idFrete)
        },
        success: function (response) {
            $(".agendar").hide("slow");
            $("#combo_dataagendada_" + idFrete).show("slow");
            $("#dateAgendada_" + idFrete).show("slow");
            $("#json_dataagendada_" + idFrete).val(response.msg);
            DataPickerEntregaAgendada(response.msg, idFrete);
            console.log("fechando");
            isLoading(".ui.accordion.frete");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            //console.log("fechando com erro");
            isLoading(".ui.accordion.frete");
        }
    })
}

export function DataPickerEntregaAgendada(msg, idFrete) {
    var optionData = "";
    if (msg != "" && msg != "[]") {
        availableDates = [];
        var DataAgendadas = JSON.parse(msg);
        if (DataAgendadas[0].listScheduled != null) {
            for (var i = 0; i < DataAgendadas[0].listScheduled.length; i++) {
                availableDates.push(DataAgendadas[0].listScheduled[i].date.substr(5, 2) + "-" + DataAgendadas[0].listScheduled[i].date.substr(8, 2) + "-" + DataAgendadas[0].listScheduled[i].date.substr(0, 4));
                //optionData = optionData + "<option data-id-frete = '"+idFrete+"' value=" +  DataAgendadas[0].listScheduled[i].date.substr(8,2)+"-"+DataAgendadas[0].listScheduled[i].date.substr(5,2)+"-"+DataAgendadas[0].listScheduled[i].date.substr(0,4) + ">" + DataAgendadas[0].listScheduled[i].dayName + " - " + DataAgendadas[0].listScheduled[i].date.substr(8,2)+"/"+DataAgendadas[0].listScheduled[i].date.substr(5,2)+"/"+DataAgendadas[0].listScheduled[i].date.substr(0,4) + " </option>";
            }
            $("#combo_dataagendada_" + idFrete)
            .find('option')
            .remove()
            .end()
            .append('<option value="">Selecione</option>')
            .val('')
            ;
            //$("#combo_dataagendada_"+idFrete).append(optionData);
            //$("#combo_dataagendada_"+idFrete).trigger("chosen:updated");

            //availableDates = ['2018-04-25'];
            $("#dateAgendada_" + idFrete).show();
            if (availableDates.length == 0)
                _alert("Ops! Nao existem mais entregas disponíveis para essa data!", response.errorMsg, "warning");
            else
                initComponent(availableDates);
        }
    }
}

export function initComponent(availableDates) {
    //availableDates = ['01-25-2018','01-27-2018','01-22-2018'];
    $('.date').datepicker({
        dateFormat: 'dd/mm/yy',
        startDate: availableDates[0],
        endDate: availableDates[availableDates.length - 1],
        beforeShowDay: function (d) {
            var dmy = (d.getMonth() + 1)
            if (d.getMonth() < 9)
                dmy = "0" + dmy;
            dmy += "-";

            if (d.getDate() < 10) dmy += "0";
            dmy += d.getDate() + "-" + d.getFullYear();

            if ($.inArray(dmy, availableDates) != -1) {
                return [true, "", "Available"];
            } else {
                return [false, "", "unAvailable"];
            }
        },
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
    });
}