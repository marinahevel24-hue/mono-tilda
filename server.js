const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is working");
});

async function createMonoPayment(amount, res) {
  try {
    const finalAmount = Number(amount || 100);

    const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN
      },
      body: JSON.stringify({
        amount: Math.round(finalAmount * 100),
        ccy: 980,
        merchantPaymInfo: {
          reference: "order_" + Date.now(),
          destination: "Оплата замовлення Secret Store"
        },
        redirectUrl: "https://secretstore.com.ua/thank-you",
        webHookUrl: "https://mono-tilda.onrender.com/mono-webhook"
      })
    });

    const data = await response.json();

    if (!data.pageUrl) {
      return res.status(500).send("Mono error: " + JSON.stringify(data));
    }

    return res.redirect(data.pageUrl);
  } catch (err) {
    return res.status(500).send("Server error: " + err.message);
  }
}

app.get("/pay", async (req, res) => {
  return createMonoPayment(req.query.amount, res);
});

app.post("/pay", async (req, res) => {
  const amount =
    req.body.amount ||
    req.body.payment_amount ||
    req.body["payment[amount]"] ||
    req.body.order_sum ||
    req.body.price ||
    100;

  return createMonoPayment(amount, res);
});

app.post("/tilda", async (req, res) => {
  const amount =
    req.body.amount ||
    req.body.payment_amount ||
    req.body["payment[amount]"] ||
    req.body.order_sum ||
    req.body.price ||
    100;

  return createMonoPayment(amount, res);
});

app.post("/mono-webhook", (req, res) => {
  console.log("Mono webhook:", req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
