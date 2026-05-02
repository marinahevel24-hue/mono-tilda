const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const public_key = process.env.LIQPAY_PUBLIC;
const private_key = process.env.LIQPAY_PRIVATE;

// 👉 ВОТ ГЛАВНОЕ — маршрут для Tilda
app.post("/tilda", (req, res) => {
    try {
        let amount = 0;

        if (req.body.products) {
            req.body.products.forEach(p => {
                amount += Number(p.price) * Number(p.quantity);
            });
        } else {
            amount = Number(req.body.amount || 1);
        }

        const data = {
            public_key: public_key,
            version: "3",
            action: "pay",
            amount: amount,
            currency: "UAH",
            description: "Оплата заказа",
            order_id: Date.now().toString()
        };

        const data_base64 = Buffer.from(JSON.stringify(data)).toString("base64");

        const signature = crypto
            .createHash("sha1")
            .update(private_key + data_base64 + private_key)
            .digest("base64");

        res.send(`
            <form method="POST" action="https://www.liqpay.ua/api/3/checkout">
                <input type="hidden" name="data" value="${data_base64}" />
                <input type="hidden" name="signature" value="${signature}" />
            </form>
            <script>document.forms[0].submit();</script>
        `);

    } catch (e) {
        res.send("Ошибка");
    }
});

app.get("/", (req, res) => {
    res.send("Server is working");
});

app.listen(3000);
