import { getProductDetails } from "../../functions/product"

export function isGtmEnabled() {
    return window.hasOwnProperty('dataLayer')
}

export function tryPushEvent({ event, data }) {

    try {
        if (!isGtmEnabled()) {
            return;
        }

        dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.

        dataLayer.push({
            'event': event,
            'ecommerce': data
        });
    } catch (e) {
        // apenas para nao quebrar nada se der erro ao tentar enviar o evento
    }
}

export function getProductAndPushAddToCartEvent({ idProduct, idSku, variations, quantity }) {
    getProductDetails({ idProduct: idProduct, idSku: idSku, variations: variations })
        .then((response) => {
            tryPushEvent({
                event: 'add_to_cart',
                data: {
                    'currencyCode': 'BRL',
                    'add': {
                        'products': [{
                            'name': response.name,
                            'id': response.id,
                            'price': response.price,
                            'brand': response.brand,
                            'category': response.category,
                            'variant': response.variant,
                            'quantity': quantity
                        }]
                    }
                }
            });
        })
        .catch((error) => { });
}

export function getProductAndPushRemoveFromCartEvent({ idProduct, idSku, variations, quantity }) {
    getProductDetails({ idProduct: idProduct, idSku: idSku, variations: variations })
        .then((response) => {
            tryPushEvent({
                event: 'remove_from_cart',
                data: {
                    'currencyCode': 'BRL',
                    'remove': {
                        'products': [{
                            'name': response.name,
                            'id': response.id,
                            'price': response.price,
                            'brand': response.brand,
                            'category': response.category,
                            'variant': response.variant,
                            'quantity': quantity
                        }]
                    }
                }
            });
        })
        .catch((error) => { });
}