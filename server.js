const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Проверка сервера
app.get("/", (req, res) => {
  res.send("Server is working");
});

// 👉 СОЗДАНИЕ ОПЛАТЫ
app.get("/pay", async (req, res) => {
  try {
    const amount = Number(req.query.amount || 100);

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
          destination: "Оплата замовлення Secret Store",
        },
        redirectUrl: "https://secretstore.com.ua/thank-you",
        webHookUrl: "https://mono-tilda.onrender.com/mono-webhook",
      }),
    });

    // 🔥 ВАЖНО: сначала читаем как текст
    const text = await response.text();
    console.log("MONO RESPONSE:", text);

    // потом парсим
    const data = JSON.parse(text);

    if (!data.pageUrl) {
      return res.status(500).send("Mono error: " + text);
    }

    // 👉 РЕДИРЕКТ НА ОПЛАТУ
    res.redirect(data.pageUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 👉 WEBHOOK ОТ MONO
app.post("/mono-webhook", (req, res) => {
  console.log("Webhook:", req.body);
  res.sendStatus(200);
});

// запуск
app.listen(process.env.PORT || 3000);
