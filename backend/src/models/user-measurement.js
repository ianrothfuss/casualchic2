import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Customer } from "@medusajs/medusa";

@Entity()
export class UserMeasurement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @OneToOne(() => Customer)
  @JoinColumn({ name: "user_id" })
  user: Customer;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  bust: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  waist: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  hips: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  shoulder_width: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  inseam: number;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deleted_at: Date;
}