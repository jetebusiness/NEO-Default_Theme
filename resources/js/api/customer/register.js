import {openLongModal} from "../../functions/modal";
import {_alert} from '../../functions/message';

$(document).ready(function () {

    $('#categories_news .ui.checkbox').checkbox({
        onChecked: function () {
            var idCategorySelected = $(this).data("id");
            var namecategorySelected = $(this).data("nome");
            var CategoriesSelectedSTR = $("#categories_selected").val();

            var category = new Object();
            category.idEmailInfoCategory = idCategorySelected;
            category.name = namecategorySelected;

            if (CategoriesSelectedSTR != "" && CategoriesSelectedSTR != "[]") {
                var CategoriesSelectedJSON = JSON.parse(CategoriesSelectedSTR);
                var totalCategorias = CategoriesSelectedJSON.length;
                var flagEncontrado = false;
                for (var i = 0; i < totalCategorias; i++) {
                    if (CategoriesSelectedJSON[i].idEmailInfoCategory == idCategorySelected) {
                        flagEncontrado = true;
                        CategoriesSelectedJSON[i] = category;
                    }
                }

                if (!flagEncontrado) {
                    CategoriesSelectedJSON.push(category)
                }

                var JsonString = JSON.stringify(CategoriesSelectedJSON);
                $("#categories_selected").val(JsonString);
            } else {
                var listCategory = [];
                listCategory.push(category);
                var JsonString = JSON.stringify(listCategory);
                $("#categories_selected").val(JsonString);
            }
        },
        onUnchecked: function () {
            var idCategorySelected = $(this).data("id");
            var namecategorySelected = $(this).data("nome");
            var CategoriesSelectedSTR = $("#categories_selected").val();

            var category = new Object();
            category.idEmailInfoCategory = idCategorySelected;
            category.name = namecategorySelected;

            if (CategoriesSelectedSTR != "") {
                var CategoriesSelectedJSON = JSON.parse(CategoriesSelectedSTR);
                var total = CategoriesSelectedJSON.length;
                for (var i = 0; i < total; i++) {
                    if (CategoriesSelectedJSON[i].idEmailInfoCategory == idCategorySelected) {
                        CategoriesSelectedJSON.splice(i, 1);
                        total = total - 1;
                    }
                }
                var JsonString = JSON.stringify(CategoriesSelectedJSON);
                $("#categories_selected").val(JsonString);
            } 
        }
    });


    $(document).on("click", "#termo_aceite", function () {
        $(".modal-block").append("<div class='ui longer modal register'><i class='close icon'></i><div class='header'>Termo de Aceite</div><div class='image content'><div class='description'>"+$("#termo").html()+"</div></div><div class='actions'><div class='ui button approve'>OK</div></div></div>");
        openLongModal($(this).attr("data-modal-open"));
    });
    
    $('#inputDateBirthRegister').on('blur', function(){
        var dateNow = new Date();
        var dateSplited;
        var dataFinal;

        if(this.value.length == 10){
            dateSplited = this.value.split("/");
            dataFinal = new Date(dateSplited[1] + '/' + dateSplited[0] + '/' + dateSplited[2]);

            if(dataFinal > dateNow){
                _alert("", "Data de Nascimento inválida.", "error");
                $('#inputDateBirthRegister').val(null);
            }
        }
        else
        {
            $('#inputDateBirthRegister').val(null);
        }
    });

    $('#inputDateBirthEdit').on('blur', function(){
        var dateNow = new Date();
        var dateSplited;
        var dataFinal;

        if(this.value.length == 10){
            dateSplited = this.value.split("/");
            dataFinal = new Date(dateSplited[1] + '/' + dateSplited[0] + '/' + dateSplited[2]);

            if(dataFinal > dateNow){
                _alert("", "Data de Nascimento inválida.", "error");
                $('#inputDateBirthEdit').val(null);
            }
        }
        else
        {
            $('#inputDateBirthEdit').val(null);
        }
    });
});