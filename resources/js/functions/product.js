export function getProductDetails({ idProduct, variations, idSku }) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/Product/GetProductDetails`,
            method: "GET",
            data: { idProduct, variations, idSku },
            success: function (response) {
                if (response.success) {
                    resolve(response.result);
                } else {
                    reject(response.result);
                }
            },
            error: function (response) {
                reject(response.result);
            }
        });
    });
}