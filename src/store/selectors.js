import { create, get } from "lodash";
import moment from "moment";
import { createSelector } from "reselect";
import { GREEN, RED, ETHER_ADDRESS, tokens, ether } from "../helpers";

// Can see where to get account from redux dev tools state -> web3 -> account
    // get allows us to provide a default value in case such things as web3.account doesn't exist so page won't blow up. 
    // The 1st param is the state object, 2nd param is the path such as state.web3.account but as a string, 3rd param is default value. 
const account = state => get(state, "web3.account", "failed to access account");
// creates accountSelectors using the above account as the 1st param and then the 2nd param as an arrow function which returns param of account
export const accountSelector = createSelector(account, acct => acct);

// Need 2 selectors, 1 for each smart contract we're loading via these selectors -> can see how to get via redux dev tools
    // Default values are false, as not loaded, only loaded if get returns correctly
    // All of these are booleans including tokenLoaded and exchangeLoaded. In which then the ultimate boolean of contractLoaded
        // is based on tokenLoaded and exchangeLoaded boolean.
const tokenLoaded = state => get(state, "token.loaded", false)
// export in same way as accountSelector
export const tokenLoadedSelector = createSelector(tokenLoaded, tkn => tkn);

const exchangeLoaded = state => get(state, "exchange.loaded", false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el);

// access exchange to loadAllOrders
const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e);

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl,el) => (tl && el)
);

// filledOrdersLoaded simialr to the loaded of token and exchange.
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

// access filledOrders and display to table in Trades.js
const filledOrders = state=> get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(
    filledOrders, 
    (orders) => {
        // Sort orders by date ascending for price comparison
        orders = orders.sort((a,b) => {return a.timestamp - b.timestamp});
        // Decorate the orders
        orders = decorateFilledOrders(orders);
        // we will format the fillOrders here to the table format we want
            // sort by date descending as 1st sorting param -> https://tutorial.eyehunts.com/js/sort-array-in-descending-order-javascript-3-ways-code/ 
        orders = orders.sort((a,b) => {return b.timestamp - a.timestamp});
        console.log(orders)
        // Necessary to return orders so that information will show in the JSX conditionl on Trades.js component
        return orders;
    }
);

// Makes call to design specific order from orders.
const decorateFilledOrders = (orders) => {
    // Track previous order to compare history
    let previousOrder = orders[0];
    return(
        orders.map((order) => {
             order = decorateOrder(order);
             order = decorateFilledOrder(order,previousOrder);
             previousOrder = order //update the previous order once it's decorated.
             return order;
        })
    )
}

// Decorate different types of orders to have human readable timestamp,price, making trades green/red and more
const decorateOrder = (order) => {
    let tokenAmount;
    let etherAmount;
    //if tokenGive to show which token is given based on knowing ether address.
    if(order.tokenGive === ETHER_ADDRESS)
    {
        etherAmount = order.amountGive;
        tokenAmount = order.amountGet;
    }
    else {
        etherAmount = order.amountGet;
        tokenAmount = order.amountGive;
    }

    // calculate token price of the order to 5 decimal places
    const precision = 100000;
    let tokenPrice = (etherAmount / tokenAmount);
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    // return order with spread operator and tokenAmount and etherAmount 
    return ({
        ...order,
        tokenAmount: tokens(tokenAmount),
        etherAmount: ether(etherAmount),
        tokenPrice: tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    });
}

//Decorate filled orders specifically
const decorateFilledOrder = (order,previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id,previousOrder)
    })
}

    // will show red price if tokenPrice is less than the previous tokenPrice, will show green price if greater.
const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // Show green price if only 1 order exists
    if(previousOrder.id === orderId)
    {
        return GREEN;
    }
    //previousOrder is just the actual previous order with all the properties
        // thie returns green if the tokenPrice in the previous is 
    if(previousOrder.tokenPrice <= tokenPrice)
    {
        return GREEN; // denoted by success class in bootstrap
    }
    else {
        return RED; // denoted by danger in bootstrap
    }
}