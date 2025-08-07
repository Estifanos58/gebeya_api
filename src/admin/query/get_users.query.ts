import { UserRole } from "@/entities";

export class GetUsersQuery {
  constructor(
    public readonly search: string = '',
    public readonly role: UserRole | null = null,
    public readonly status: string | null = null,
    public readonly order: 'asc' | 'desc' = 'desc',
    public readonly banned: boolean | null = null,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}