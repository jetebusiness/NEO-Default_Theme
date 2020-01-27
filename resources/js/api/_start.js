/**
 * Product API Calls
 */
require("./product/detail");
require("./product/variations");
require("./product/detail_b2b");
require("./product/card");

/**
 * CheckOut API Calls
 */
require("./checkout/mini_cart");
require("./checkout/mini_cart_event_list");
require("./checkout/cart");
require("./checkout/identification");
require("./checkout/register.js");
require("./checkout/payment.js");
require("./checkout/success.js");
require("./order/reorder.js");
require("./order/index.js");

/**
 * Customers API Calls
 */
require('./customer/AddressManager.js')

/**
 * Order API Calls
 */
require('./order/orderDetail.js')

/**
* Filter API Calls
*/
require("./filter/filterManipulation");

require("./customer/forgot");
require("./customer/register");
require("./customer/newsletter");
require("./customer/AccessKey");
require("./customer/login");
require("./customer/wishlist");
require("./customer/contact");
require("./customer/changeEmail");
require("./product/alertMe");
//--------------------[ Search ]--------------------//
require('./search/search');
require('./search/searchGuest');

//--------------------[ Event List ]----------------//
require('./eventlist/manager_event_list');

//--------------------[ AssistedSale ]----------------//
require('./assistedsale/assistedsale');