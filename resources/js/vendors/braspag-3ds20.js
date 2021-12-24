export function bpmpi_environment(env) {
	BP.Mpi.environment(env);
	BP.Mpi.debug(env == "SDB");
}

export function bpmpi_config() {
	return {
		onReady: function () {
			console.log("bpmpi_config - onReady");
			bpmpi_authenticate();
		},
		onSuccess: function (e) {
			// Cart\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o, e portador autenticou com sucesso.
			console.log("bpmpi_config - onSuccess");
			var cavv = e.Cavv;
			var xid = e.Xid;
			var eci = e.Eci;
			var version = e.Version;
			var referenceId = e.ReferenceId;

			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "success",
					message: "Cart\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o, e portador autenticou com sucesso.",
					cavv: cavv,
					xid: xid,
					eci: eci,
					version: version,
					referenceId: referenceId
				}
			});
			window.dispatchEvent(event);
		},
		onFailure: function (e) {
			// Cart\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o, por\u00e9m o portador finalizou com falha.
			console.log("bpmpi_config - onFailure");
			var xid = e.Xid;
			var eci = e.Eci;
			var version = e.Version;
			var referenceId = e.ReferenceId;

			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "failure",
					message: "Cart\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o, por\u00e9m o portador finalizou com falha.",
					xid: xid,
					eci: eci,
					version: version,
					referenceId: referenceId
				}
			});
			window.dispatchEvent(event);
		},
		onUnenrolled: function (e) {
			// Cart\u00e3o n\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o (n\u00e3o autentic\u00e1vel).
			console.log("bpmpi_config - onUnenrolled");
			var xid = e.Xid;
			var eci = e.Eci;
			var version = e.Version;
			var referenceId = e.ReferenceId;

			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "unenrolled",
					message: "Cart\u00e3o n\u00e3o eleg\u00edvel para autentica\u00e7\u00e3o (n\u00e3o autentic\u00e1vel).",
					xid: xid,
					eci: eci,
					version: version,
					referenceId: referenceId
				}
			});
			window.dispatchEvent(event);
		},
		onDisabled: function () {
			// Loja n\u00e3o requer autentica\u00e7\u00e3o do portador (classe "bpmpi_auth" false -> autentica\u00e7\u00e3o desabilitada).
			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "disabled",
					message: "Loja n\u00e3o requer autentica\u00e7\u00e3o do portador (classe \"bpmpi_auth\" false -> autentica\u00e7\u00e3o desabilitada)."
				}
			});
			window.dispatchEvent(event);
		},
		onError: function (e) {
			// Erro no processo de autentica\u00e7\u00e3o.
			console.log("bpmpi_config - onError");
			var xid = e.Xid;
			var eci = e.Eci;
			var returnCode = e.ReturnCode;
			var returnMessage = e.ReturnMessage;
			var referenceId = e.ReferenceId;

			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "error",
					message: "Erro no processo de autentica\u00e7\u00e3o.",
					xid: xid,
					eci: eci,
					returnCode: returnCode,
					returnMessage: returnMessage,
					referenceId: referenceId
				}
			});
			window.dispatchEvent(event);
		},
		onUnsupportedBrand: function (e) {
			// Bandeira n\u00e3o suportada para autentica\u00e7\u00e3o.
			console.log("bpmpi_config - onUnsupportedBrand");
			var returnCode = e.ReturnCode;
			var returnMessage = e.ReturnMessage;

			var event = new CustomEvent("jetCheckoutBraspag3DS20", {
				detail: {
					status: "unsupportedBrand",
					message: "Bandeira n\u00e3o suportada para autentica\u00e7\u00e3o.",
					returnCode: returnCode,
					returnMessage: returnMessage
				}
			});
			window.dispatchEvent(event);
		},
		Environment: "SDB",
		Debug: true
	};
}

// minify on http://js-minify.online-domain-tools.com/
export function bpmpi_authenticate() {
	BP.Mpi.authenticate();
}

export function bpmpi_load() {
	BP.Mpi.load();
}

export function bpmpi_unload() {
	BP.Mpi.unload();
}

var BP = (function () {
	var _configuration = loadConfiguration();
	var _fieldNames = [
		// Dados da transa\u00e7\u00e3o
		"bpmpi_transaction_mode",
		// Dados da loja (merchant)
		"bpmpi_merchant_url",
		"bpmpi_merchant_newcustomer",
		// Dados de checkout
		"bpmpi_ordernumber",
		"bpmpi_currency",
		"bpmpi_totalamount",
		"bpmpi_paymentmethod",
		"bpmpi_installments",
		// Dados de Cart\u00e3o
		"bpmpi_cardnumber",
		"bpmpi_cardexpirationmonth",
		"bpmpi_cardexpirationyear",
		"bpmpi_cardalias",
		"bpmpi_default_card",
		"bpmpi_cardaddeddate",
		// Dados de Giftcard
		"bpmpi_giftcard_amount",
		"bpmpi_giftcard_currency",
		// Dados de cobran\u00e7a
		"bpmpi_billto_customerid",
		"bpmpi_billto_contactname",
		"bpmpi_billto_email",
		"bpmpi_billto_street1",
		"bpmpi_billto_street2",
		"bpmpi_billto_city",
		"bpmpi_billto_state",
		"bpmpi_billto_zipcode",
		"bpmpi_billto_phonenumber",
		"bpmpi_billto_country",
		// Dados de entrega
		"bpmpi_shipto_sameasbillto",
		"bpmpi_shipto_addressee",
		"bpmpi_shipto_email",
		"bpmpi_shipto_street1",
		"bpmpi_shipto_street2",
		"bpmpi_shipto_city",
		"bpmpi_shipto_state",
		"bpmpi_shipto_zipcode",
		"bpmpi_shipto_shippingmethod",
		"bpmpi_shipto_phonenumber",
		"bpmpi_shipto_firstusagedate",
		"bpmpi_shipto_country",
		// Dados do device
		"bpmpi_device_ipaddress",
		"bpmpi_device_#_fingerprint",
		"bpmpi_device_#_provider",
		// Dados do carrinho
		"bpmpi_cart_#_name",
		"bpmpi_cart_#_description",
		"bpmpi_cart_#_sku",
		"bpmpi_cart_#_quantity",
		"bpmpi_cart_#_unitprice",
		// Dados do pedido
		"bpmpi_order_recurrence",
		"bpmpi_order_productcode",
		"bpmpi_order_countlast24hours",
		"bpmpi_order_countlast6months",
		"bpmpi_order_countlast1year",
		"bpmpi_order_cardattemptslast24hours",
		"bpmpi_order_marketingoptin",
		"bpmpi_order_marketingsource",
		// Dados do usu\u00e1rio/conta
		"bpmpi_useraccount_guest",
		"bpmpi_useraccount_createddate",
		"bpmpi_useraccount_changeddate",
		"bpmpi_useraccount_passwordchangeddate",
		"bpmpi_useraccount_authenticationmethod",
		"bpmpi_useraccount_authenticationprotocol",
		"bpmpi_useraccount_authenticationtimestamp",
		// Dados de a\u00e9rea (cole\u00e7\u00e3o de trechos)
		"bpmpi_airline_travelleg_#_carrier",
		"bpmpi_airline_travelleg_#_departuredate",
		"bpmpi_airline_travelleg_#_origin",
		"bpmpi_airline_travelleg_#_destination",
		// Dados de a\u00e9rea (cole\u00e7\u00e3o de passageiros)
		"bpmpi_airline_passenger_#_name",
		"bpmpi_airline_passenger_#_ticketprice",
		// Dados de a\u00e9rea complementares
		"bpmpi_airline_numberofpassengers",
		"bpmpi_airline_billto_passportcountry",
		"bpmpi_airline_billto_passportnumber",
		// Dados adicionais da loja
		"bpmpi_mdd1",
		"bpmpi_mdd2",
		"bpmpi_mdd3",
		"bpmpi_mdd4",
		"bpmpi_mdd5",
		// Dados de autentica\u00e7\u00e3o
		"bpmpi_auth_notifyonly",
		"bpmpi_auth_suppresschallenge",
		// Dados de recorrencia,
		"bpmpi_recurring_enddate",
		"bpmpi_recurring_frequency",
		"bpmpi_recurring_originalpurchasedate",
		"bpmpi_challenge_window_size",
	];
	var _referenceId = null;
	var _version = null;
	var _lastError = {
		"Number": null,
		"Description": null,
		"HasError": function () {
			return this.Number !== null;
		}
	};
	var _loaded = false;

	function unload() {
		_loaded = false;
    }

	function canReadField(fieldName) {
		return document.getElementsByClassName(fieldName).length > 0;
	}

	function readField(fieldName) {
		if (canReadField(fieldName))
			return document.getElementsByClassName(fieldName)[0].value;
		return null;
	}

	function readFieldOrDefault(fieldName, defaultValue) {
		if (canReadField(fieldName))
			return document.getElementsByClassName(fieldName)[0].value;
		return defaultValue;
	}

	function formatFieldName(fieldName) {
		return fieldName
			.replace("bpmpi_", "")
			.replace(/\_/g, "");
	}

	function isEnumerableField(fieldName) {
		return /\#/.test(fieldName);
	}

	function getEnumerableFieldName(fieldName, index) {
		return fieldName.replace(/\#/, index);
	}

	function getEnumerableFields(fieldName) {
		var formattedField = formatFieldName(fieldName);
		var parts = formattedField.split("#");

		return {
			"enumerable": parts[0],
			"field": parts[1]
		};
	}

	function readAllFields() {
		var data = {};

		for (var fieldIndex = 0; fieldIndex < _fieldNames.length; fieldIndex++) {
			var fieldName = _fieldNames[fieldIndex];

			if (isEnumerableField(fieldName) === false) {
				var objFieldName = formatFieldName(fieldName);
				var fieldValue = readField(fieldName);

				if (fieldValue) {
					data[objFieldName] = readField(fieldName);
				}
			}
			else {
				var enumberableFieldIndex = 1;
				var enumerableFieldName = getEnumerableFieldName(fieldName, enumberableFieldIndex);

				while (canReadField(enumerableFieldName)) {
					var enumerableFields = getEnumerableFields(fieldName);

					if (!data[enumerableFields.enumerable])
						data[enumerableFields.enumerable] = [];

					fieldValue = readField(enumerableFieldName);

					if (!data[enumerableFields.enumerable][enumberableFieldIndex - 1])
						data[enumerableFields.enumerable][enumberableFieldIndex - 1] = {};

					data[enumerableFields.enumerable][enumberableFieldIndex - 1][enumerableFields.field] = fieldValue;

					enumberableFieldIndex++;
					enumerableFieldName = getEnumerableFieldName(fieldName, enumberableFieldIndex);
				}
			}
		}

		return data;
	}

	function loadConfiguration() {
		if (typeof bpmpi_config !== "undefined") {
			return bpmpi_config();
		}

		return {
			"Debug": true,
			"Environment": "PRD"
		};
	}

	function getEnvironment() {
		return _configuration.Environment || "PRD";
	}

	function setEnvironment(env) {
		_configuration.Environment = env;
	}

	function setIsDebug(debug) {
		_configuration.Debug = debug;
	}

	function getCardinalScriptUri() {
		var environment = getEnvironment();
		var enviroments = {
			"TST": "https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js",
			"SDB": "https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js",
			"PRD": "https://songbird.cardinalcommerce.com/edge/v1/songbird.js"
		};

		return enviroments[environment];
	}

	function getInitializationParameters() {
		return {
			orderNumber: readField("bpmpi_ordernumber"),
			currency: readField("bpmpi_currency"),
			amount: readField("bpmpi_totalamount")
		};
	}

	function getMpiAbsoluteUri(relativeUri) {
		var environment = getEnvironment();
		var enviroments = {
			"TST": "https://localhost:44351",
			"SDB": "https://mpisandbox.braspag.com.br",
			"PRD": "https://mpi.braspag.com.br"
		};

		return enviroments[environment] + relativeUri;
	}

	function loadScript(url, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	}

	function getIsDebug() {
		if (_configuration.Debug !== "undefined") {
			return _configuration.Debug;
		}

		return false;
	}

	function log() {
		if (getIsDebug())
			console.log.apply(null, arguments);
	}

	function getCardinalLogLevel() {
		return getIsDebug() ? "verbose" : "off";
	}

	function initialize(token, referenceId) {
		_referenceId = referenceId;

		log("[MPI]", "Initializing...");
		log("[MPI]", "Token =", token);
		log("[MPI]", "ReferenceId =", _referenceId);

		Cardinal.configure({
			timeout: "8000",
			maxRequestRetries: "10",
			logging: {
				level: getCardinalLogLevel()
			}
		});

		Cardinal.setup('init', {
			jwt: token
		});

		Cardinal.on('payments.setupComplete', function (data) {
			log("[MPI]", "Setup complete.");
			log("[MPI]", "SetupCompleteData =", data);
			notify("onReady");
		});

		Cardinal.on('payments.validated', function (data) {
			log("[MPI]", "Payment validated.");
			log("[MPI]", "ActionCode =", data.ActionCode);
			log("[MPI]", "Data =", data);

			switch (data.ActionCode) {
				case 'SUCCESS':
				case 'NOACTION':
				case 'FAILURE':
					validate(data.Payment.ProcessorTransactionId);
					break;
				case 'ERROR':
					_lastError.Number = data.ErrorNumber;
					_lastError.Description = data.ErrorDescription;

					if (data.Payment && data.Payment.ProcessorTransactionId) {
						validate(data.Payment.ProcessorTransactionId);
					}
					else {
						notify("onError", {
							"Xid": null,
							"Eci": null,
							"ReturnCode": _lastError.HasError() ? _lastError.Number : "MPI901",
							"ReturnMessage": _lastError.HasError() ? _lastError.Description : "Unexpected error",
							"ReferenceId": null
						});
					}
					break;
				default:
					_lastError.Number = data.ErrorNumber;
					_lastError.Description = data.ErrorDescription;

					if (data.ErrorDescription === "Success" &&
						data.Payment &&
						data.Payment.ProcessorTransactionId) {
						validate(data.Payment.ProcessorTransactionId);
					}
					else {
						notify("onError", {
							"Xid": null,
							"Eci": null,
							"ReturnCode": _lastError.HasError() ? _lastError.Number : "MPI902",
							"ReturnMessage": _lastError.HasError() ? _lastError.Description : "Unexpected authentication response",
							"ReferenceId": null
						});
					}
			}
		});
	}

	function postJsonData(relativeUri, content, successCallback) {
		var jsonRequest = JSON.stringify(content);

		var xmlHttpRequest = new XMLHttpRequest();

		xmlHttpRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					var jsonResponse = JSON.parse(xmlHttpRequest.responseText);
					successCallback(jsonResponse, this);
				}
				else {
					notify("onError", {
						"Xid": null,
						"Eci": null,
						"ReturnCode": "MPI900",
						"ReturnMessage": "An error has occurred (" + this.status + ")",
						"ReferenceId": null
					});
				}
			}
		};

		xmlHttpRequest.open("POST", getMpiAbsoluteUri(relativeUri));
		xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
		xmlHttpRequest.setRequestHeader("Authorization", "Bearer " + readField("bpmpi_accesstoken"));
		xmlHttpRequest.send(jsonRequest);
	}

	function isAuthEnabled() {
		var authEnabled = readFieldOrDefault("bpmpi_auth", "true");

		log("[MPI]", "Authentication Enabled =", authEnabled);

		if (authEnabled === "false") {
			notify("onDisabled");
			return false;
		}

		return true;
	}

	function loadResources() {
		log("[MPI]", "Debug =", getIsDebug());
		log("[MPI]", "Enviroment =", getEnvironment());

		if (!isAuthEnabled()) return;


		if (_loaded) {
			log("[MPI]", "Resources already loaded...");
			bpmpi_authenticate();
			return;
		}

		log("[MPI]", "Loading resources...");

		_loaded = true;

		loadScript(getCardinalScriptUri(), function () {
			log("[MPI]", "Cardinal script loaded.");
			postJsonData("/v2/3ds/init", getInitializationParameters(), function (initialization) {
				initialize(initialization.Token, initialization.ReferenceId);
			});
		});
	}

	function enroll() {
		if (!isAuthEnabled()) return;

		if (!_loaded) {
			log("[MPI]", "Resources not loaded...");
			return;
		}

		log("[MPI]", "Enrolling...");

		Cardinal.trigger("accountNumber.update", readField("bpmpi_cardnumber"));

		postJsonData("/v2/3ds/enroll", readAllFields(), function (enrollment) {
			log("[MPI]", "Enrollment result =", enrollment);

			if (enrollment.Version) {
				_version = enrollment.Version[0];
			}

			var authentication = enrollment.Authentication;

			switch (enrollment.Status) {
				case "ENROLLED":
					challenge(enrollment);
					break;
				case "VALIDATION_NEEDED":
					validate(enrollment.AuthenticationTransactionId);
					break;
				case "AUTHENTICATION_CHECK_NEEDED":
					checkAuthentication(authentication);
					break;
				case "NOT_ENROLLED":
					notify("onUnenrolled", {
						"Xid": authentication.Xid,
						"Eci": authentication.Eci,
						"Version": _version,
						"ReferenceId": authentication.DirectoryServerTransactionId
					});
					break;
				case "FAILED":
					notify("onFailure", {
						"Xid": authentication.Xid,
						"Eci": authentication.Eci || authentication.EciRaw,
						"Version": _version,
						"ReferenceId": authentication.DirectoryServerTransactionId
					});
					break;
				case "UNSUPPORTED_BRAND":
					notify("onUnsupportedBrand", {
						"Xid": null,
						"Eci": null,
						"ReturnCode": enrollment.ReturnCode,
						"ReturnMessage": enrollment.ReturnMessage,
						"ReferenceId": null
					});
					break;
				default:
					notify("onError", {
						"Xid": null,
						"Eci": null,
						"ReturnCode": enrollment.ReturnCode,
						"ReturnMessage": enrollment.ReturnMessage,
						"ReferenceId": null
					});
			}
		});
	}

	function valueOrNull(data, fieldName) {
		return data[fieldName] || null;
	}

	function buildOrder(authenticationTransactionId) {
		log("[MPI] Building order object...");

		var data = readAllFields();

		var order = {
			"OrderDetails": {
				"TransactionId": authenticationTransactionId,
				"OrderNumber": data["ordernumber"],
				"CurrencyCode": valueOrNull(data, "currency"),
				"OrderChannel": data["transactionmode"] || "S"
			},
			"Consumer": {
				"Account": {
					"AccountNumber": data["cardnumber"],
					"ExpirationMonth": data["cardexpirationmonth"],
					"ExpirationYear": data["cardexpirationyear"]
				},
				"Email1": valueOrNull(data, "shiptoemail"),
				"Email2": valueOrNull(data, "billtoemail"),
				"ShippingAddress": {
					"FullName": null,
					"Address1": null,
					"Address2": null,
					"City": null,
					"State": null,
					"PostalCode": null,
					"CountryCode": null,
					"Phone1": null
				},
				"BillingAddress": {
					"FullName": valueOrNull(data, "billtocontactname"),
					"Address1": valueOrNull(data, "billtostreet1"),
					"Address2": valueOrNull(data, "billtostreet2"),
					"City": valueOrNull(data, "billtocity"),
					"State": valueOrNull(data, "billtostate") === null ? null : valueOrNull(data, "billtostate").toUpperCase(),
					"PostalCode": valueOrNull(data, "billtozipcode"),
					"CountryCode": valueOrNull(data, "billtocountry"),
					"Phone1": valueOrNull(data, "billtophonenumber")
				}
			},
			"Cart": []
		};

		if (data["shiptosameasbillto"] === "true") {
			var billingAddress = order.Consumer.BillingAddress;

			order.Consumer.ShippingAddress.FullName = billingAddress.FullName;
			order.Consumer.ShippingAddress.Address1 = billingAddress.Address1;
			order.Consumer.ShippingAddress.Address2 = billingAddress.Address2;
			order.Consumer.ShippingAddress.City = billingAddress.City;
			order.Consumer.ShippingAddress.State = billingAddress.State;
			order.Consumer.ShippingAddress.PostalCode = billingAddress.PostalCode;
			order.Consumer.ShippingAddress.Phone1 = billingAddress.Phone1;
			order.Consumer.ShippingAddress.CountryCode = billingAddress.CountryCode;
		}
		else {
			order.Consumer.ShippingAddress.FullName = valueOrNull(data, "shiptoaddressee");
			order.Consumer.ShippingAddress.Address1 = valueOrNull(data, "shiptostreet1");
			order.Consumer.ShippingAddress.Address2 = valueOrNull(data, "shiptostreet2");
			order.Consumer.ShippingAddress.City = valueOrNull(data, "shiptocity");
			order.Consumer.ShippingAddress.State = valueOrNull(data, "shiptostate") === null ? null : valueOrNull(data, "shiptostate").toUpperCase();
			order.Consumer.ShippingAddress.PostalCode = valueOrNull(data, "shiptozipcode");
			order.Consumer.ShippingAddress.Phone1 = valueOrNull(data, "shiptophonenumber");
			order.Consumer.ShippingAddress.CountryCode = valueOrNull(data, "shiptocountry");
		}

		if (data.cart) {
			for (var cartItem = 0; cartItem < data.cart.length; cartItem++) {
				order.Cart.push({
					"Name": valueOrNull(data.cart[cartItem], "name"),
					"Description": valueOrNull(data.cart[cartItem], "description"),
					"SKU": valueOrNull(data.cart[cartItem], "sku"),
					"Quantity": valueOrNull(data.cart[cartItem], "quantity"),
					"Price": valueOrNull(data.cart[cartItem], "unitprice")
				});
			}
		}

		log("[MPI] Order object =", order);

		return order;
	}

	function challenge(enrollment) {
		var suppression = readField("bpmpi_auth_suppresschallenge");

		log("[MPI] Suppression enabled = " + suppression);

		if (suppression === "true") {
			log("[MPI]", "Challenge supressed...");

			notify("onChallengeSuppression", {
				"Xid": null,
				"Eci": null,
				"ReturnCode": "MPI601",
				"ReturnMessage": "Challenge suppressed",
				"ReferenceId": null
			});

			return;
		}

		log("[MPI]", "Showing challenge...");

		var continueData = {
			"AcsUrl": enrollment.AcsUrl,
			"Payload": enrollment.Pareq,
			"TransactionId": enrollment.AuthenticationTransactionId
		};
		var order = buildOrder(enrollment.AuthenticationTransactionId);

		log("[MPI] Continue object =", continueData);

		Cardinal.continue("cca",
			continueData,
			order);
	}

	function checkAuthentication(authentication) {
		log("[MPI]", "Authentication result =", authentication);

		switch (authentication.Status) {
			case "AUTHENTICATED":
				notify("onSuccess", {
					"Cavv": authentication.Cavv,
					"Xid": authentication.Xid,
					"Eci": authentication.Eci,
					"Version": authentication.Version[0],
					"ReferenceId": authentication.DirectoryServerTransactionId
				});
				break;
			case "UNAVAILABLE":
				notify("onUnenrolled", {
					"Xid": authentication.Xid,
					"Eci": authentication.Eci,
					"Version": authentication.Version[0],
					"ReferenceId": authentication.DirectoryServerTransactionId
				});
				break;
			case "FAILED":
				notify("onFailure", {
					"Xid": authentication.Xid,
					"Eci": authentication.Eci || authentication.EciRaw,
					"Version": authentication.Version[0],
					"ReferenceId": authentication.DirectoryServerTransactionId
				});
				break;
			case "ERROR_OCCURRED":
				notify("onError", {
					"Xid": authentication.Xid,
					"Eci": authentication.Eci || authentication.EciRaw,
					"ReturnCode": authentication.ReturnCode,
					"ReturnMessage": authentication.ReturnMessage,
					"ReferenceId": authentication.DirectoryServerTransactionId
				});
				break;
			default:
				notify("onError", {
					"Xid": authentication.Xid,
					"Eci": authentication.Eci || authentication.EciRaw,
					"ReturnCode": _lastError.HasError() ? _lastError.Number : authentication.ReturnCode,
					"ReturnMessage": _lastError.HasError() ? _lastError.Description : authentication.ReturnMessage,
					"ReferenceId": authentication.DirectoryServerTransactionId
				});
		}
	}

	function validate(transactionId) {
		var data = readAllFields();
		data["transactionId"] = transactionId;

		log("[MPI]", "Validating...");

		postJsonData("/v2/3ds/validate", data, function (validation) {
			checkAuthentication(validation);
		});
	}

	function isSubscribed(eventType) {
		return typeof _configuration[eventType] === "function";
	}

	function notify(eventType, eventData) {
		log("[MPI]", "Notifying...");
		log("[MPI]", "Event type =", eventType);
		log("[MPI]", "Event data =", eventData || "None");
		if (isSubscribed(eventType)) {
			_configuration[eventType](eventData);
		}
	}

	function setEnvironment(env) {
		_configuration.Environment = env;
	}

	function setIsDebug(debug) {
		_configuration.Debug = debug;
	}

	return {
		Mpi: {
			load: function () {
				loadResources();
			},
			authenticate: function () {
				enroll();
			},
			environment: function (env) {
				setEnvironment(env);
			},
			debug: function (debug) {
				setIsDebug(debug);
            }
		}
	};
})();

//bpmpi_load();