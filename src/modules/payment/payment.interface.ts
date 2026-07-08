export type TCreatePayment = {
  rentalRequestId: string;
};

export type TConfirmPayment = {
  paymentIntentId: string;
  paymentMethodId?: string; // defaults to Stripe test card if omitted
};
