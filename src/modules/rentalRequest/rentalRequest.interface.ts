export type TRentalRequest = {
  propertyId: string;
  moveInDate: string;
  moveOutDate?: string;
  message?: string;
};

export type TRentalRequestStatusUpdate = {
  status: "APPROVED" | "REJECTED";
  rejectReason?: string;
};
