
$(function(){
	
	
	let frontteste = {
        onChangeInput:function(){
           
                let name = $(this).attr("name");
                $("."+name).html($(this).val())
           
        },
	}

	var operacao = "A"; //"A"=Adição; "E"=Edição

	var indice_selecionado = -1;

	var tbContact = sessionStorage.getItem("tbContact");// Recupera os dados armazenados

	tbContact = JSON.parse(tbContact); // Converte string para objeto

	if(tbContact == null) // Caso não haja conteúdo, iniciamos um vetor vazio
		tbContact = [];

	function Adicionar(){
		

		

		var cliente = JSON.stringify({
			
			
			Nome     : $("#txtNome").val(),
			Telefone : $("#txtTelefone").val(),
			Email    : $("#txtEmail").val(),
			Assunto : $("#txtAssunto").val(),
			Mensagem : $("#txtMensagem").val()
		});

			


		tbContact.push(cliente);

		sessionStorage.setItem("tbContact", JSON.stringify(tbContact));

		alert("Salvo com sucesso");
		return true;
	}

	function Editar(){
		tbContact[indice_selecionado] = JSON.stringify({
				
				Nome     : $("#txtNome").val(),
				Telefone : $("#txtTelefone").val(),
				Email    : $("#txtEmail").val(),
				Assunto : $("#txtAssunto").val(),
				Mensagem : $("#txtMensagem").val()
			});
			

		sessionStorage.setItem("tbContact", JSON.stringify(tbContact));
		alert("Informações editadas.")
		operacao = "A";
		return true;
	}

	function Listar(){
		$("#tblListar").html("");
		$("#tblListar").html(
			"<thead>"+
			"	<tr>"+
			/*"<th></th>"+
			
			"	<th>Nome</th>"+
			"	<th>Telefone</th>"+
			"	<th>Email</th>"+
			"	<th>Assunto</th>"+
			"	<th>Mensagem</th>"+
			"	</tr>"+*/
			"</thead>"+
			"<tbody>"+
			"</tbody>"
			);

		 for(var i in tbContact){
			var cli = JSON.parse(tbContact[i]);
		  	$("#tblListar tbody").append("<div class='ui list'>"+
		
									 	 "	<div class='item'><a alt='"+i+"' class='ui button green small btnEditar' style='cursor: pointer;'><i class='pencil alternate icon'></i></a><a alt='"+i+"' class='ui button red small btnExcluir' style='cursor: pointer;'><i class='trash alternate icon'></i></a></div>" + 
										 "	<div class='item'><h3>"+"Nome: "+"<span>"+cli.Nome+"</span></h3> </div>"+
										 
										 "	<div class='item'><h3>"+"Email: "+"<span>"+cli.Email+"</span></h3> </div>"+ 
										 
										 "	<div class='item'><h3>"+"Telefone: "+"<span>"+cli.Telefone+"</span></h3> </div>"+
										 
										 "	<div class='item'><h3>"+"Assunto: "+"<span>"+cli.Assunto+"</span></h3> </div>"+ 
										
										 "	<div class='item'><h3>"+"Mensagem: "+"<span>"+cli.Mensagem+"</span></h3></div>"+
										  "<p><br><hr></p> " +  
		  								 "</div>");
		 }
	}

	function Excluir(){
		tbContact.splice(indice_selecionado, 1);
		sessionStorage.setItem("tbContact", JSON.stringify(tbContact));
		alert("Contato excluido");
	}

	function GetCliente(propriedade, valor){
		var cli = null;
        for (var item in tbContact) {
            var i = JSON.parse(tbContact[item]);
            if (i[propriedade] == valor)
                cli = i;
        }
        return cli;
	}

	Listar();

	$("#frmCadastro").on("submit",function(){
		if(operacao == "A")
			return Adicionar();
		else
			return Editar();		
	});

	$("#tblListar").on("click", ".btnEditar", function(){
		operacao = "E";
		indice_selecionado = parseInt($(this).attr("alt"));
		var cli = JSON.parse(tbContact[indice_selecionado]);
		
		$("#txtNome").val(cli.Nome);
		$("#txtTelefone").val(cli.Telefone);
		$("#txtEmail").val(cli.Email);
		$("#txtAssunto").val(cli.Assunto);
		$("#txtMensagem").val(cli.Mensagem);
		$("#txtNome").focus();
	});
	$('input, textarea').on('keypress keyup change',frontteste.onChangeInput)
	$("#tblListar").on("click", ".btnExcluir", function(){
		indice_selecionado = parseInt($(this).attr("alt"));
		Excluir();
		Listar();
	});
	
});

