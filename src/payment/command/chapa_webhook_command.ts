export class ChapaWebhookCommand {
    constructor(
        public readonly tx_ref: string,
        public readonly status: string
    ){}
}