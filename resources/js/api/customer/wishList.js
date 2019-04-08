import { CancelarCalculoFreteCart } from "../checkout/cart";
import { callAjaxInsertItemInCart } from "../product/card";
import { LoadCarrinho } from "../../functions/mini_cart_generic";
import { _alert, _confirm } from "../../functions/message";
import { getVariationIds } from "../product/card";

$(document).ready(function () {

	$(document).delegate('.wishlist-btn', 'click', function () {
		var _data = {};
		var haveSku = $(this).find(".wishlist-item").attr('data-have-sku');
		var productID = $(this).find(".wishlist-item").attr('data-product-id');
		var userAuthentication = ValidateLogin();
		_data.productID = productID;

		if (haveSku === 'true') {
			var sku = $(this).attr('data-sku');
			var local = $(this).attr('data-wishlist-local');
			if (local == 'detail') {
				_data.skuID = $("#produto-sku").val();
				let loginOk = ValidateWishlist(_data, this, userAuthentication);
				if (loginOk) {
					_data.skuID = sku;
					ValidateReferences(productID, this, _data, userAuthentication);
				}
			} else {
				_data.skuID = sku;
				ValidateReferences(productID, this, _data, userAuthentication);
			}
		} else {
			if (!userAuthentication.success) {
				AddWishListProducWaitLogin(_data)
				$('.ui.modal.login').modal('show');
			}
			else
				ValidateWishlist(_data, this, userAuthentication);
		}
	});


});



$(document).on("click", "#addProducInCart", function (e) {
	e.preventDefault()
	e.stopImmediatePropagation()

	$(this).addClass("loading");
	CancelarCalculoFreteCart(1);
	callAjaxInsertItemInCart($(this).data("idproduct"), $(this).data("variations"), 1, this, true);
})

$(document).on("click", "#deleteProductWishList", function (e) {
	e.preventDefault()
	e.stopImmediatePropagation()

	let idproduct = $(this).data("idproduct")
	let variations = $(this).data("variations") != "" ? $(this).data("variations") : null
	let idSku = $(this).data("idsku")

	_confirm({
		title: "Excluir produto da lista?",
		text: "",
		type: "warning",
		confirm: {
			text: "Excluir"
		},
		cancel: {
			text: "Cancelar",
			color: "#95979b"
		},
		callback: function () {
			let data = {}
			data.productID = idproduct
			data.variations = variations
			data.skuID = idSku

			if (!RemoveWishlist(data).success)
				_alert("", "Erro ao excluir o produto.", "error");
			else {
				location.reload()
				window.scrollTo(0, 0)
			}
		}
	})
})

$(document).on("click", "#addWishListInCart", function (e) {
	e.preventDefault()
	e.stopImmediatePropagation()

	$(this).addClass("loading");
	CancelarCalculoFreteCart(1);

	$("#ListProductWishList #addProducInCart ").each(function (i) {
		callAjaxInsertItemInCart($(this).data("idproduct"), $(this).data("variations"), 1, this, false);
	})
	LoadCarrinho(true)
})

$(document).on("click", "#deleteAllProductsWishList", function (e) {
	e.preventDefault()
	e.stopImmediatePropagation()

	_confirm({
		title: "Excluir todos produtos da lista?",
		text: "",
		type: "warning",
		confirm: {
			text: "Excluir todos"
		},
		cancel: {
			text: "Cancelar",
			color: "#95979b"
		},
		callback: function () {
			$("#ListProductWishList #deleteProductWishList").each(function (i) {
				let idproduct = $(this).data("idproduct")
				let variations = $(this).data("variations") != "" ? $(this).data("variations") : null
				let idSku = $(this).data("idsku")
				let data = {}
				data.productID = idproduct
				data.variations = variations
				data.skuID = idSku

				if (!RemoveWishlist(data).success) {
					_alert("", "Erro ao excluir um ou mais produtos.", "error");
					setTimeout(function () { location.reload() }, 2000)
				}
				else {
					location.reload()
					window.scrollTo(0, 0)
				}
			})
		}
	})
})


function AddWishListProducWaitLogin(_data) {
	$.ajax({
		type: "POST",
		url: "/Customer/AddWishListProducWaitLogin",
		data: _data,
		async: false,
		dataType: "json",
		success: function (response) {
			if (response.success)
				return true
		},
		error: function (ex) {
			return false
		}
	});
}

function ValidateReferences(productId, element, _data, userAuthentication) {
	let $parent = $(element).closest("div[id^='Product_']"),
		variationSelected = getVariationIds($parent, productId);

	if (variationSelected.status) {
		if (!userAuthentication.success) {
			_data.variations = variationSelected.ids;
			AddWishListProducWaitLogin(_data)
			$('.ui.modal.login').modal('show');
		}
		else {
			_data.variations = variationSelected.ids;
			if (_data.variations != "") {
				ValidateWishlist(_data, element, userAuthentication);
			}
		}
	}
	else {
		_alert("", "Variação não selecionada!", "warning");
	}
}


function ValidateWishlist(_data, element, userAuthentication) {
	if (!userAuthentication.success) {
		AddWishListProducWaitLogin(_data)
		$('.ui.modal.login').modal('show');
		return false
	} else {
		var products = $(element).attr("data-wishlist-local") == "detail" ? $(".wishlistDetails") : $(".ui.card.produto[data-id='Product_" + _data.productID + "']");
		var inlist = $(element).find(".wishlist-item").attr('data-in-list').toLowerCase();
		var result = "";
		if (inlist === 'false') {
			result = AddWishlist(_data);
			if (result.success === true) {
				$("#wishListCount").text(parseInt($("#wishListCount").text()) + 1);
				products.each(function () {
					let el = $(this).find(".wishlist-btn");
					el.find(".wishlist-item").removeClass('grey').addClass('red');
          el.find(".wishlist-item").attr('data-in-list', 'true');

          el.attr("data-tooltip", "Remover da lista de desejos");
				});
			} else {
				products.each(function () {
					let el = $(this).find(".bcg-heart.wishlist-btn");
          el.find(".wishlist-item").removeClass('red').addClass('grey');

          el.attr("data-tooltip", "Adicionar à lista de desejos");
        });

        let message = result.message !== "" && result.message != undefined ? result.message : "Não foi possível adicionar à lista de desejos";
        _alert("", message, "warning");

			}
		} else {
			result = RemoveWishlist(_data);
			if (result.success === true) {
				$("#wishListCount").text(parseInt($("#wishListCount").text()) - 1);
				products.each(function () {
					let el = $(this).find(".bcg-heart.wishlist-btn");
					el.find(".wishlist-item").removeClass('red').addClass('grey');
          el.find(".wishlist-item").attr('data-in-list', 'false');

          el.attr("data-tooltip", "Adicionar à lista de desejos");
				});
			} else {
				let el = $(this).find(".bcg-heart.wishlist-btn");
        el.find(".wishlist-item").removeClass('grey').addClass('red');
        el.attr("data-tooltip", "Remover da lista de desejos");

        let message = result.message !== "" && result.message != undefined ? result.message : "Não foi possível remover da lista de desejos";
        _alert("", message, "warning");
			}
		}

		return true
	}
}


function ValidateLogin() {
	var data = {};

	$.ajax({
		type: "POST",
		url: "/Customer/GetLoginStatus",
		data: {},
		async: false,
		dataType: "json",
		success: function (response) {
			data = response;
		},
		error: function (ex) {
			data.success = false;
		}
	});
	return data;
}


function AddWishlist(_data) {

	var data = {};

	$.ajax({
		type: "POST",
		url: "/Customer/AddWishlist",
		data: _data,
		async: false,
		dataType: "json",
		success: function (response) {
			data = response;
		},
		error: function () {
			data.success = false;
		}
	});
	return data;
}


function RemoveWishlist(_data) {
	var data = {};
	$.ajax({
		type: "DELETE",
		url: "/Customer/RemoveWishlist",
		data: _data,
		async: false,
		dataType: "json",
		success: function (response) {
			data = response;
		},
		error: function (ex) {
			data.success = false;
		}
	});
	return data;
}


export function HaveInWishList(productID, skuID, $parent) {
	var data = {};

	if ($parent == null) {
		$parent = $("body");
	}

	var request = {};
	request.productID = productID;
	request.skuID = skuID;

	$.ajax({
		type: "POST",
		url: "/Customer/HaveInWishList",
		data: request,
		async: false,
		dataType: "json",
		success: function (response) {
			if (response.success === true) {
				$parent.find(".wishlist-item").removeClass('grey');
				$parent.find(".wishlist-item").addClass('red');
				$parent.find(".wishlist-item").attr('data-in-list', 'true');
			} else {
				$parent.find(".wishlist-item").removeClass('red');
				$parent.find(".wishlist-item").addClass('grey');
				$parent.find(".wishlist-item").attr('data-in-list', 'false');
			}
			data = response;
		},
		error: function (ex) {
			data.success = false;
		}
	});
	return data;
}