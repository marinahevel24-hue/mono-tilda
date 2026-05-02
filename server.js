const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// base64
function base64(str) {
    return Buffer.from(str).toString("base64");
}

// подпись LiqPay
function sign(data) {
    return crypto
        .createHash("sha1")
        .update(process.env.LIQPAY_PRIVATE + data + process.env.LIQPAY_PRIVATE)
        .digest("base64");
}

// создание формы оплаты
function createLiqPayForm(amount) {
    const json = {
        public_key: process.env.LIQPAY_PUBLIC,
        version: 3,
        action: "pay",
        amount: Number(amount),
        currency: "UAH",
        description: "Оплата заказа",
        order_id: "order_" + Date.now(),
        result_url: "https://google.com" // потом поменяем
    };

    const data = base64(JSON.stringify(json));
    const signature = sign(data);

    return `
        <form id="liqpay" method="POST" action="https://www.liqpay.ua/api/3/checkout">
            <input type="hidden" name="data" value="${data}" />
            <input type="hidden" name="signature" value="${signature}" />
        </form>
        <script>
            document.getElementById("liqpay").submit();
        </script>
    `;
}

// главная проверка
app.get("/", (req, res) => {
    res.send("Server is working");
});

// ВАЖНО — маршрут оплаты
app.get("/pay", (req, res) => {
    const amount = req.query.amount || 1;
    res.send(createLiqPayForm(amount));
});

// webhook от тильды (чтобы не было ошибки)
app.post("/tilda", (req, res) => {
    console.log("Tilda data:", req.body);
    res.send("OK");
});

app.listen(process.env.PORT || 3000);
