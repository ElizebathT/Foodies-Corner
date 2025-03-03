const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");
const Stripe = require("stripe");
const Order = require("../models/orderModel");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

const paymentController = {
    // Get all payments for a user
    getPayments: asyncHandler(async (req, res) => {
        const Orders = await Order.find({ applicantId: req.user.id });
        const payments = await Payment.find({ adopterId: { $in: Orders.map(Order => Order._id) } }).populate('adadopterId').sort({ createdAt: -1 });
        res.json(payments);
    }),

    // Get a single payment by ID
    getPaymentById: asyncHandler(async (req, res) => {
        const { id } = req.body;
        const payment = await Payment.findById(id);

        if (payment) {
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Update payment status (for admin purposes)
    updatePaymentStatus: asyncHandler(async (req, res) => {
        const { id, status } = req.body;
        const payment = await Payment.findById(id);

        if (payment) {
            payment.paymentStatus = status;
            await payment.save();
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Process payment using Stripe
    processPayment: asyncHandler(async (req, res) => {
        const { id, currency } = req.body;
        const payment = await Payment.findById(id);

        if (!payment) {
            res.status(404);
            throw new Error("Payment not found");
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: payment.amount * 100,
                currency: currency || "usd",
                metadata: {
                    adopterId: payment.adopterId,
                },
            });

            payment.transactionId = paymentIntent.id;
            await payment.save();

            res.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),

    // Handle Stripe webhook events
    webhook: asyncHandler(async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY);
        } catch (err) {
            console.log(err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: 'succeeded' }
                );
                return res.status(200).send('💰 Payment succeeded!');

            case 'checkout.session.completed':
                await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: 'completed' }
                );
                return res.status(200).send('✅ Payment Completed');

            default:
                return res.status(200).send('Webhook received');
        }
    })
};

module.exports = paymentController;
