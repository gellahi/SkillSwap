// This is an example React component for integrating with Stripe
// You can use this as a reference for your frontend implementation

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Styles for the card element
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Payment form component
const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token'); // Get auth token
        const response = await axios.post(
          '/api/payments/stripe/payment-intent',
          { amount },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
        if (onError) onError(err);
      }
    };

    createPaymentIntent();
  }, [amount, onError]);

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
      if (onError) onError(payload.error);
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      if (onSuccess) onSuccess(payload.paymentIntent);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <CardElement
        id="card-element"
        options={cardStyle}
        onChange={handleChange}
      />
      <button
        disabled={processing || !stripe || succeeded}
        id="submit"
        className="pay-button"
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
      {/* Show any error that happens when processing the payment */}
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}
      {/* Show a success message upon completion */}
      {succeeded && (
        <div className="payment-success">
          Payment succeeded! Thank you for your purchase.
        </div>
      )}
    </form>
  );
};

// Main payment component that fetches the Stripe publishable key
const StripePayment = ({ amount, onSuccess, onError }) => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    // Fetch publishable key from your API
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token'); // Get auth token
        const response = await axios.get('/api/payments/stripe/config', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { publishableKey } = response.data;
        setStripePromise(loadStripe(publishableKey));
      } catch (err) {
        console.error('Error fetching Stripe config:', err);
        if (onError) onError(err);
      }
    };

    fetchConfig();
  }, [onError]);

  return (
    <div className="stripe-payment-container">
      <h2>Payment Details</h2>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      ) : (
        <div>Loading payment system...</div>
      )}
    </div>
  );
};

export default StripePayment;
