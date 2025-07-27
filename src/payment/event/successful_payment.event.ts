export class SuccessfulPaymentEvent {
  constructor(
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}