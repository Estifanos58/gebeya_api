export class DeleteCartItemCommand {
    constructor(
        public readonly userId: string,
        public readonly cartItemId: string,
    ) {}
}