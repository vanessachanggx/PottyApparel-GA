window.paypal
  .Buttons({
    style: {
      shape: "rect",
      layout: "vertical",
      color: "gold",
      label: "paypal",
    },

    createOrder: async function() {
      try {
        let cartProducts = document.getElementById("cartProducts").value;
        cartProducts = JSON.parse(cartProducts);
        console.log("Cart Products:", cartProducts);

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: cartProducts,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();
        console.log("Order Data:", orderData);

        if (orderData.id) {
          return orderData.id;
        } else {
          throw new Error("Order ID not received");
        }
      } catch (error) {
        console.error("Error in createOrder:", error);
        alert("There was an error creating your order. Please try again.");
      }
    },

    onApprove: async function(data, actions) {
      try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();
        console.log("Capture Order Data:", orderData);

        const errorDetail = orderData?.details?.[0];
        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          return actions.restart();
        } else if (errorDetail) {
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else if (!orderData.purchase_units) {
          throw new Error("Invalid order data received");
        } else {
          const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];

          if (transaction) {
            window.location.href = `/checkout/Paypal/${orderData.id}/${transaction.id}`;
          } else {
            throw new Error("Transaction details not found");
          }
        }
      } catch (error) {
        console.error("Error in onApprove:", error);
        alert("There was an error processing your payment. Please try again.");
      }
    },
  })
  .render("#paypal-button-container");
