// entities/activity-log.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ActivityType {
  INFO = 'info',         // Normal event like "User registered"
  WARNING = 'warning',   // Non-critical but notable
  ERROR = 'error',       // Errors caught but not thrown
}

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid', {name: "id"})
  id: string;

  @Column({ type: 'enum', enum: ActivityType, default: ActivityType.INFO })
  type: ActivityType;

  @Column()
  message: string;

  @Column({ nullable: true })
  actorId?: string; // Optional: userId, adminId, etc.

  @Column({ nullable: true })
  actorRole?: string;

  @Column({ nullable: true })
  context?: string; // e.g., 'auth', 'payment', 'product', 'order'

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // Extra payload, productId, storeId, etc.

  @CreateDateColumn({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
