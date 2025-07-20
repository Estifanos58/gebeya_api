import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity({ name: "credentials" })
export class Credentials {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @OneToOne(() => User, (user) => user.credentials, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  password: string;

  @Column({ name: "otp", type: "int", nullable: true })
  otp: number | null;

  @Column({ name: "otp_expires_at", type: "timestamp", nullable: true })
  otpExpires_at: Date | null;

  @Column({ name: "temporary_token", type: "varchar", nullable: true })
  temporaryToken: string | null;

  @Column({ name: "token_expires_at", type: "timestamp", nullable: true })
  tokenExpiresAt: Date | null;
}
