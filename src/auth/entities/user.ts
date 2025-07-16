import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
    MERCHANT = "merchant",
    DELIVERY = "delivery"
}

@Entity({name:"users"})
export class User {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id: string;

    @Column({ name: "email", unique: true })
    email: string;

    @Column({ name: "password" })
    password: string;

    @Column({ name: "first_name" })
    firstName: string;

    @Column({ name: "last_name" })
    lastName: string;

    @Column({ name: "is_active", default: true })
    isActive: boolean;

    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({name: "role", type: "enum", enum: UserRole})
    role: UserRole; 

    @Column({ name: "phone_number", nullable: true })
    phoneNumber: string;

    @Column({ name: "address", nullable: true })
    address: string;

    @Column({ name: "profile_picture", nullable: true })
    profilePicture: string;

    @Column({name: "age" , type: "int", nullable: true })
    age: number;

    @Column({ name: "otp", type: "int", nullable: true})
    otp: number | null;

    @Column({ name: "otpExpires_at", type: "timestamp", nullable: true})
    otpExpires_at: Date;

    @Column({name: "isEmailVerified", type: "boolean", default: false})
    isEmailVerified: boolean;

    @Column({ name: "temporaryToken", nullable: true })
    temporaryToken: string | null;

    @Column({ name: "tokenExpiresAt", type: "timestamp", nullable: true })
    tokenExpiresAt: Date | null;
}
