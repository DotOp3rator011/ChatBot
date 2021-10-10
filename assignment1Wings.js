const Order = require("./assignment1Order");

const OrderState = Object.freeze({
    WELCOMING: Symbol("welcoming"),
    ITEM: Symbol("item"),
    SIZE: Symbol("size"),
    SIDE: Symbol("side"),
    DIPS: Symbol("dips"),
    PAYMENT: Symbol("payment"),
});

module.exports = class WingsOrder extends Order {

    constructor(sNumber, sUrl) {
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sItem = "";
        this.sSize = "";
        this.sSide = "";
        this.sDips = "";
        this.sPrice = "";
    }

    handleInput(sInput) {
        let aReturn = [];
        switch (this.stateCur) {
            case OrderState.WELCOMING:
                this.stateCur = OrderState.ITEM;
                aReturn.push("Welcome to The Chicken Wings Place.");
                aReturn.push("What would you like today? Buffalo Wings or BBQ Wings");
                break;
            case OrderState.ITEM:
                this.stateCur = OrderState.SIZE
                this.sItem = sInput;
                aReturn.push(`How many ${this.sItem} would you like? Half doz - 10$ | One doz - 18$`);
                break;
            case OrderState.SIZE:
                this.stateCur = OrderState.SIDE
                switch (sInput) {
                    case sInput.toLowerCase === "half":
                        this.sSize = "Half doz"
                        this.sPrice = 10;
                        break;
                    default:
                        this.sSize = "One doz"
                        this.sPrice = 18;
                        break;
                }
                aReturn.push("Would you like sides with that? Mashed Potatoes - 3$ | Fries - 3$");
                break;
            case OrderState.SIDE:
                this.stateCur = OrderState.DIPS
                if (sInput.toLowerCase() !== "no") {
                    this.sSide = sInput;
                    this.sPrice += 3
                }
                aReturn.push("Would you like a dip with that? Ranch - 1$ | Hot Sauce - 1$");
                break;
            case OrderState.DIPS:
                this.isDone(true);
                if (sInput.toLowerCase() !== "no") {
                    this.sDips = sInput;
                    this.sPrice += 1
                }
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSize} ${this.sItem} wings${this.sSide ?
                    " with " + this.sSide : ""}${this.sDips ? " and " + this.sDips : ""}`);
                aReturn.push(`You owe ${(this.sPrice * 1.13).toFixed(2)}$.`)
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`<a>${this.sUrl}/payment/${this.sNumber}/</a>`);
                break;
            case OrderState.PAYMENT:
                this.isDone(true);
                const PAYPAL_ADDRESS = sInput.purchase_units[0].shipping.address;
                const deliveryMsg = `Delivery Address: ${PAYPAL_ADDRESS.address_line_1} ${PAYPAL_ADDRESS.address_line_2 ? PAYPAL_ADDRESS.address_line_2 : ""}
                  ${PAYPAL_ADDRESS.admin_area_2} ${PAYPAL_ADDRESS.admin_area_1} ${PAYPAL_ADDRESS.postal_code}`;
                let d = new Date();
                d.setMinutes(d.getMinutes() + 15);
                aReturn.push(`Please pick it up at ${d.toTimeString()}`);
                aReturn.push(deliveryMsg);
                break;
        }
        return aReturn;
    }

    renderForm(sTitle = "-1", sAmount = "-1") {
        if (sTitle !== "-1") {
            this.sItem = sTitle;
        }
        if (sAmount !== "-1") {
            this.nOrder = sAmount;
        }
        const sClientID = process.env.SB_CLIENT_ID ||
            'Ad1yhd5V1eXPX3iBVqwKwuIXURGn-JIimhDVZriHrkp2by5iTw8jD67OjMTM4K6kG1SIolMAGV6Id7Yg';
        return `
            <!DOCTYPE html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
                <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
            </head>
            <body>
                <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
                <script src="https://www.paypal.com/sdk/js?client-id=${sClientID}"></script>
                Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
                <div id="paypal-button-container"></div>
                <script>
                    paypal.Buttons({
                    createOrder: function(data, actions) {
                        return actions.order.create({
                            purchase_units: [{
                            amount: {value: '${this.nOrder}'}
                        }]})
                    },
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                            $.post(".", details, () => {
                                window.open("", "_self");
                                window.close(); 
                            });
                        });
                    }}).render('#paypal-button-container');
                </script>
            </body>
        `;
    }
}