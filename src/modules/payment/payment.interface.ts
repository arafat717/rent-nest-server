export type TCreatePayment = {
  rentalRequestId: string;
};

export type TConfirmPayment = {
  paymentIntentId: string;
  paymentMethodId?: string; 
};
