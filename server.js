const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is working");
});

// 🔥 ВАЖНО: TILDA ЖДЁТ JSON
app.post("/tilda", async (req, res) => {
  try {
    console.log("TILDA:", req.body);

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
      return res.status(500).send("Mono error");
    }

    // 👉 ВОТ КЛЮЧЕВОЕ
    res.status(200).json({
      success: true,
      paymentUrl: data.pageUrl
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

app.post("/mono-webhook", (req, res) => {
  console.log("MONO:", req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
