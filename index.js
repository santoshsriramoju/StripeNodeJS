const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("security keys from stripe");
const { v4: uuid } = require('uuid');



const app = express();


//middleware 
app.use(express.json());
app.use(cors());


//routes
app.get("/", (req, res) => {
    res.send("It Works");
})

app.post("/payment", (req, res) => {
    const { product, token } = req.body;
    console.log("Product ", product);
    console.log("Price ", product.price);
    const idempotencyKey = uuid();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: product.name,
            shipping: {
                name: token.card.name,
                address:{
                    country: token.card.address_country
                }
            }
        }, { idempotencyKey })
    }).then(result => res.status(200).json(result))
        .catch(err => console.log(err))

})

//listen
app.listen(8282, () => console.log("LISTENING AT PORT 8282"))
