import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function base64(str) {
  return Buffer.from(str).toString("base64");
}

function sign(data) {
  return crypto
    .createHash("sha3-256")
    .update(process.env.LIQPAY_PRIVATE + data + process.env.LIQPAY_PRIVATE)
    .digest("base64");
}

app.post("/create-payment", (req, res) => {
  const amount = Number(req.body.amount || 1);

  const json = {
    public_key: process.env.LIQPAY_PUBLIC,
    version: 7,
    action: "pay",
    amount: amount,
    currency: "UAH",
    description: "Оплата замовлення",
    order_id: "order_" + Date.now(),
    result_url: "https://secretstore.com.ua"
  };

  const data = base64(JSON.stringify(json));
  const signature = sign(data);

  res.send(`
    <form id="liqpay" method="POST" action="https://www.liqpay.ua/api/3/checkout">
      <input type="hidden" name="data" value="${data}" />
      <input type="hidden" name="signature" value="${signature}" />
    </form>
    <script>document.getElementById("liqpay").submit();</script>
  `);
});

app.listen(process.env.PORT || 3000);
