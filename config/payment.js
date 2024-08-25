require('dotenv').config();
const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

const createOrderPayment = async (amount, ticketId) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const option = {
            amount: amount,
            currency: 'INR',
            receipt: ticketId,
        }
        const paymentResponse = await razorpay.orders.create(option);

        if (paymentResponse.error) {
            return {success: false, error: paymentResponse.error};
        }
        return {
            success: true,
            orderId: paymentResponse.id,
            receipt: paymentResponse.receipt
        }
    }
    catch (error) {
        return {success: false, error: error};
    }
}

const validatePaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isValid = validateWebhookSignature(body, razorpay_signature, secret);
    return isValid;
}

module.exports = {
    createOrderPayment,
    validatePaymentSignature
}