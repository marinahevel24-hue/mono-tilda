const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is working");
});

// 👉 ПРИЕМ ДАННЫХ ОТ TILDA
app.post("/mono-webhook", async (req, res) => {
  try {
    // 👉 Tilda присылает данные заказа
    const amount = Number(req.body.Amount) || 100;

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

    // 👉 ВАЖНО: возвращаем ссылку оплаты
    res.json({
      success: true,
      payment_url: data.pageUrl,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT || 3000);
