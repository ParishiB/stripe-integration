const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")("sk_test_51PBFBkSG3M3LxSLlZavfo");
app.use(express.json());
app.use(cors());

app.post("/api/create-checkout-session", async (req, res) => {
  const { cartItems } = req.body;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe requires the price in cents
        },
        quantity: 1, // Assuming each item has a quantity of 1
      })),
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ sessionId: session.id }); // Send session ID back to the client
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating checkout session" });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
