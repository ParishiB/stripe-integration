import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51LbY");

const Product = ({ name, price, onAddToCart }) => {
  return (
    <div className="border p-4 mb-4">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-700">${price}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        onClick={onAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};

const ShoppingCart = ({ items }) => {
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="border p-4">
      <h2 className="text-xl font-bold">Shopping Cart</h2>
      <ul className="list-disc pl-4">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">
            {item.name} - ${item.price}
          </li>
        ))}
      </ul>
      <p className="text-gray-700 mt-2">Total: ${totalPrice}</p>
    </div>
  );
};

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState(null); // State to store session ID

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const makePayment = async () => {
    const stripe = await stripePromise;
    const body = { cartItems };
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await fetch(
      "http://localhost:4000/api/create-checkout-session",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    setSessionId(data.sessionId); // Set session ID received from backend

    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId, // Use the session ID received from the backend
    });

    if (result.error) {
      console.error(result.error);
    }
  };

  const products = [
    { name: "Shirt", price: 20 },
    { name: "Pants", price: 30 },
    { name: "Shoes", price: 50 },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Online Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <Product
            key={index}
            name={product.name}
            price={product.price}
            onAddToCart={() => addToCart(product)}
          />
        ))}
      </div>
      <ShoppingCart items={cartItems} />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        onClick={makePayment}
      >
        Checkout
      </button>
    </div>
  );
};

export default App;
