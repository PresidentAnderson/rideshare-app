const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Ride, User, Driver } = require('../models');
const { setToCache } = require('../config/redis');

const createPaymentIntent = async (req, res) => {
  try {
    const { rideId, paymentMethod, tip = 0 } = req.body;
    const userId = req.user.id;

    // Find the ride
    const ride = await Ride.findByPk(rideId, {
      include: [
        {
          model: User,
          as: 'rider',
        },
        {
          model: User,
          as: 'driver',
        },
      ],
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is the rider
    if (ride.riderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this ride',
      });
    }

    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Ride must be completed before payment',
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { rideId } });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this ride',
      });
    }

    const amount = ride.totalFare + tip;
    const platformFee = amount * 0.20; // 20% platform fee
    const driverEarnings = amount - platformFee;

    let payment;
    let paymentIntent;

    if (paymentMethod === 'cash') {
      // Handle cash payment
      payment = await Payment.create({
        rideId,
        userId,
        amount,
        currency: 'USD',
        paymentMethod: 'cash',
        status: 'completed',
        tip,
        platformFee,
        driverEarnings,
        paymentDate: new Date(),
      });
    } else {
      // Handle card payment with Stripe
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: {
            rideId,
            userId,
            tip: tip.toString(),
          },
        });

        payment = await Payment.create({
          rideId,
          userId,
          amount,
          currency: 'USD',
          paymentMethod,
          status: 'pending',
          stripePaymentIntentId: paymentIntent.id,
          tip,
          platformFee,
          driverEarnings,
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.status(400).json({
          success: false,
          message: 'Payment processing failed',
          error: stripeError.message,
        });
      }
    }

    // Update driver earnings if payment is completed
    if (payment.status === 'completed' && ride.driverId) {
      await Driver.update(
        { 
          totalEarnings: require('sequelize').literal(`total_earnings + ${driverEarnings}`)
        },
        { where: { userId: ride.driverId } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment,
        clientSecret: paymentIntent?.client_secret,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentIntentId } = req.body;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Ride,
          as: 'ride',
          include: [
            {
              model: User,
              as: 'driver',
            },
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Verify payment with Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        await payment.update({
          status: 'completed',
          paymentDate: new Date(),
          stripeChargeId: paymentIntent.latest_charge,
        });

        // Update driver earnings
        if (payment.ride.driverId) {
          await Driver.update(
            { 
              totalEarnings: require('sequelize').literal(`total_earnings + ${payment.driverEarnings}`)
            },
            { where: { userId: payment.ride.driverId } }
          );
        }

        // Update ride payment status
        await Ride.update(
          { paymentStatus: 'completed' },
          { where: { id: payment.rideId } }
        );

        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          data: { payment },
        });
      } else {
        await payment.update({
          status: 'failed',
          failureReason: 'Payment not succeeded on Stripe',
        });

        res.status(400).json({
          success: false,
          message: 'Payment failed',
        });
      }
    } catch (stripeError) {
      console.error('Stripe verification error:', stripeError);
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Ride,
          as: 'ride',
          attributes: ['id', 'pickupAddress', 'destinationAddress', 'completedAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    // Only allow admins to process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process refunds',
      });
    }

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Ride,
          as: 'ride',
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments',
      });
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount',
      });
    }

    try {
      // Process refund with Stripe
      if (payment.stripeChargeId) {
        const refund = await stripe.refunds.create({
          charge: payment.stripeChargeId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            paymentId: payment.id,
            adminReason: reason,
          },
        });

        await payment.update({
          status: 'refunded',
          refundAmount,
          refundReason: reason,
          refundDate: new Date(),
          metadata: { ...payment.metadata, refundId: refund.id },
        });
      } else {
        // Handle cash refund (manual process)
        await payment.update({
          status: 'refunded',
          refundAmount,
          refundReason: reason,
          refundDate: new Date(),
        });
      }

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: { payment },
      });
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      res.status(400).json({
        success: false,
        message: 'Refund processing failed',
        error: stripeError.message,
      });
    }
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update payment status in database
      await Payment.update(
        { 
          status: 'completed',
          paymentDate: new Date(),
        },
        { 
          where: { stripePaymentIntentId: paymentIntent.id } 
        }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update payment status in database
      await Payment.update(
        { 
          status: 'failed',
          failureReason: failedPayment.last_payment_error?.message || 'Payment failed',
        },
        { 
          where: { stripePaymentIntentId: failedPayment.id } 
        }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  refundPayment,
  webhookHandler,
};