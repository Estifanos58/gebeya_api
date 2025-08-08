export class GetActivitiesQuery {
    constructor(
        public readonly error: boolean | null = null,
        public readonly info: boolean | null = null,
        public readonly warning: boolean | null = null,
        public readonly page: number = 1,
        public readonly limit: number = 10
    ){}
}