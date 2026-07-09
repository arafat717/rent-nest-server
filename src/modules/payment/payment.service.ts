import { TCreatePayment, TConfirmPayment } from "./payment.interface";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe";

// Stripe's official test payment method for card payments that always succeed.
// Docs: https://docs.stripe.com/testing
const DEFAULT_TEST_PAYMENT_METHOD = "pm_card_visa";

const createPaymentIntoDb = async (
  tenantId: string,
  payload: TCreatePayment,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not allowed to pay for this rental request");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new Error("Payment can only be made for an approved rental request");
  }

  if (rentalRequest.payment) {
    throw new Error("A payment already exists for this rental request");
  }

  const amount = rentalRequest.property.price;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects the smallest currency unit (cents)
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: paymentIntent.id,
      amount,
      method: "card",
      provider: "STRIPE",
      status: "PENDING",
      providerRef: paymentIntent.id,
      rentalRequestId: rentalRequest.id,
      tenantId,
    },
  });

  return {
    paymentId: payment.id,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount,
  };
};

const confirmPaymentIntoDb = async (
  tenantId: string,
  payload: TConfirmPayment,
) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: payload.paymentIntentId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.tenantId !== tenantId) {
    throw new Error("You are not allowed to confirm this payment");
  }

  if (payment.status === "COMPLETED") {
    throw new Error("This payment has already been completed");
  }

  const paymentIntent = await stripe.paymentIntents.confirm(
    payload.paymentIntentId,
    {
      payment_method: payload.paymentMethodId || DEFAULT_TEST_PAYMENT_METHOD,
    },
  );

  if (paymentIntent.status === "succeeded") {
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED", paidAt: new Date() },
      }),
      prisma.rentalRequest.update({
        where: { id: payment.rentalRequestId },
        data: { status: "ACTIVE" },
      }),
    ]);

    return updatedPayment;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });

  throw new Error(
    `Payment could not be completed (status: ${paymentIntent.status})`,
  );
};

const getMyPaymentsFromDb = async (tenantId: string) => {
  const payments = await prisma.payment.findMany({
    where: { tenantId },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getSinglePaymentFromDb = async (
  id: string,
  userId: string,
  role: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: { include: { property: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const isTenantOwner = payment.tenantId === userId;
  const isLandlordOwner = payment.rentalRequest.property.landlordId === userId;

  if (role !== "ADMIN" && !isTenantOwner && !isLandlordOwner) {
    throw new Error("You are not allowed to view this payment");
  }

  return payment;
};

export const paymentService = {
  createPaymentIntoDb,
  confirmPaymentIntoDb,
  getMyPaymentsFromDb,
  getSinglePaymentFromDb,
};
