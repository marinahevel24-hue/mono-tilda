const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// проверка
app.get("/", (req, res) => {
  res.send("Server is working");
});

// 👉 ОСНОВНОЙ ОБРАБОТЧИК ОТ TILDA
app.post("/tilda", async (req, res) => {
  try {
    console.log("TILDA:", req.body);

    // 👉 берём сумму из формы Tilda
    const amount = Number(req.body.Sum) || 100;

    const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": process.env.MONO_TOKEN,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        ccy: 980,
        merchantPaymInfo: {
          reference: "order_" + Date.now(),
          destination: "Оплата заказа Secret Store",
        },
        redirectUrl: "https://secretstore.com.ua",
        webHookUrl: "https://mono-tilda.onrender.com/mono-webhook",
      }),
    });

    const data = await response.json();

    if (!data.pageUrl) {
      console.log("MONO ERROR:", data);
      return res.status(500).send("Mono error");
    }

    // 👉 ГЛАВНОЕ: СРАЗУ РЕДИРЕКТ НА ОПЛАТУ
    res.redirect(data.pageUrl);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).send("Server error");
  }
});

// webhook от mono
app.post("/mono-webhook", (req, res) => {
  console.log("MONO WEBHOOK:", req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
