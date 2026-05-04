const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.get("/pay", async (req, res) => {
  try {
    const amount = Number(req.query.amount || 100);

    const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        ccy: 980,
        merchantPaymInfo: {
          reference: "order_" + Date.now(),
          destination: "Оплата замовлення Secret Store"
        },
        redirectUrl: "https://secretstore.com.ua",
        webHookUrl: "https://mono-tilda.onrender.com/mono-webhook"
      })
    });

    const data = await response.json();

    if (!data.pageUrl) {
      return res.status(500).send("Mono error: " + JSON.stringify(data));
    }

    res.redirect(data.pageUrl);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.post("/mono-webhook", (req, res) => {
  console.log("Mono webhook:", req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
