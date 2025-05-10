import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { Product } from "@medusajs/medusa";
import { Customer } from "@medusajs/medusa";

@Entity()
export class Outfit {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "outfit_products",
    joinColumn: {
      name: "outfit_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "product_id",
      referencedColumnName: "id",
    },
  })
  products: Product[];

  @ManyToOne(() => Customer)
  @JoinTable({
    name: "outfit_creator",
    joinColumn: {
      name: "outfit_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "customer_id",
      referencedColumnName: "id",
    },
  })
  created_by: Customer;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deleted_at: Date;
}