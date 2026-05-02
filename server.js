const express = require("express");
const crypto = require("crypto");

const app = express();

function base64(str) {
  return Buffer.from(str).toString("base64");
}

function sign(data) {
  return crypto
    .createHash("sha1")
    .update(process.env.LIQPAY_PRIVATE + data + process.env.LIQPAY_PRIVATE)
    .digest("base64");
}

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.get("/pay", (req, res) => {
  const amount = req.query.amount || 100;

  const json = {
    public_key: process.env.LIQPAY_PUBLIC,
    version: 3,
    action: "pay",
    amount: amount,
    currency: "UAH",
    description: "Оплата заказа",
    order_id: "order_" + Date.now(),
    result_url: "https://your-site.com"
  };

  const data = base64(JSON.stringify(json));
  const signature = sign(data);

  res.send(`
    <form id="liqpay" method="POST" action="https://www.liqpay.ua/api/3/checkout">
      <input type="hidden" name="data" value="${data}" />
      <input type="hidden" name="signature" value="${signature}" />
    </form>
    <script>
      document.getElementById("liqpay").submit();
    </script>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
