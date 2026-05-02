import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/create-payment", async (req, res) => {
  const amount = Number(req.body.amount  req.body.payment?.amount  0);

  if (!amount) {
    return res.status(400).send("Не отримав суму замовлення");
  }

  const response = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
    method: "POST",
    headers: {
      "X-Token": process.env.MONO_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      ccy: 980,
      merchantPaymInfo: {
        reference: "order_" + Date.now(),
        destination: "Оплата замовлення"
      },
      redirectUrl: "https://secretstore.com.ua"
    })
  });

  const data = await response.json();

  if (!data.pageUrl) {
    return res.status(500).send("Mono не створив оплату");
  }

  res.redirect(data.pageUrl);
});

app.listen(process.env.PORT || 3000);
