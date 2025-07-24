export class updateCartCommand {
    constructor(
        public readonly userId: string,
        public readonly productSkuId: string,
        public readonly quantity: number
    ){}
}