// Casual Chic Boutique 2.0 - Database Migrations

// Backend: Migration for Outfit table (src/migrations/1715380224_create_outfit.js)
const { MigrationInterface } = require("@medusajs/medusa");

module.exports = class CreateOutfit1715380224 {
  static identifier = "CreateOutfit1715380224";

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "outfit" (
        "id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "name" character varying NOT NULL,
        "description" text,
        "thumbnail" character varying,
        "created_by" character varying,
        "metadata" jsonb,
        CONSTRAINT "PK_outfit" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `CREATE TABLE "outfit_products" (
        "outfit_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        CONSTRAINT "PK_outfit_products" PRIMARY KEY ("outfit_id", "product_id")
      )`
    );

    await queryRunner.query(
      `ALTER TABLE "outfit_products" 
       ADD CONSTRAINT "FK_outfit_products_outfit" 
       FOREIGN KEY ("outfit_id") REFERENCES "outfit"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "outfit_products" 
       ADD CONSTRAINT "FK_outfit_products_product" 
       FOREIGN KEY ("product_id") REFERENCES "product"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "outfit_products"`);
    await queryRunner.query(`DROP TABLE "outfit"`);
  }
};

// Backend: Migration for User Measurements table (src/migrations/1715380225_create_user_measurements.js)
const { MigrationInterface } = require("@medusajs/medusa");

module.exports = class CreateUserMeasurements1715380225 {
  static identifier = "CreateUserMeasurements1715380225";

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "user_measurements" (
        "id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" character varying NOT NULL,
        "height" integer,
        "weight" integer,
        "bust" integer,
        "waist" integer,
        "hips" integer,
        "shoulder_width" integer,
        "inseam" integer,
        "metadata" jsonb,
        CONSTRAINT "PK_user_measurements" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `ALTER TABLE "user_measurements" 
       ADD CONSTRAINT "FK_user_measurements_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "user_measurements"`);
  }
};

// Backend: Migration for Virtual Try-On table (src/migrations/1715380226_create_virtual_try_on.js)
const { MigrationInterface } = require("@medusajs/medusa");

module.exports = class CreateVirtualTryOn1715380226 {
  static identifier = "CreateVirtualTryOn1715380226";

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "virtual_try_on" (
        "id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        "user_image_id" character varying NOT NULL,
        "result_image_id" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        CONSTRAINT "PK_virtual_try_on" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `ALTER TABLE "virtual_try_on" 
       ADD CONSTRAINT "FK_virtual_try_on_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "virtual_try_on" 
       ADD CONSTRAINT "FK_virtual_try_on_product" 
       FOREIGN KEY ("product_id") REFERENCES "product"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "virtual_try_on"`);
  }
};

// Backend: Migration for Style Profile table (src/migrations/1715380227_create_style_profile.js)
const { MigrationInterface } = require("@medusajs/medusa");

module.exports = class CreateStyleProfile1715380227 {
  static identifier = "CreateStyleProfile1715380227";

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "style_profile" (
        "id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" character varying NOT NULL,
        "preferred_styles" jsonb,
        "preferred_colors" jsonb,
        "preferred_occasions" jsonb,
        "disliked_styles" jsonb,
        "disliked_colors" jsonb,
        "size_preferences" jsonb,
        "metadata" jsonb,
        CONSTRAINT "PK_style_profile" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `ALTER TABLE "style_profile" 
       ADD CONSTRAINT "FK_style_profile_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "style_profile"`);
  }
};

// Backend: Migration to add boutique-specific fields to Product table (src/migrations/1715380228_add_fashion_fields_to_product.js)
const { MigrationInterface } = require("@medusajs/medusa");

module.exports = class AddFashionFieldsToProduct1715380228 {
  static identifier = "AddFashionFieldsToProduct1715380228";

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "product" 
       ADD COLUMN "fabric_composition" character varying,
       ADD COLUMN "care_instructions" text,
       ADD COLUMN "season" character varying,
       ADD COLUMN "style_tags" jsonb,
       ADD COLUMN "occasion_tags" jsonb,
       ADD COLUMN "fit_type" character varying,
       ADD COLUMN "sustainability_rating" integer`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "product" 
       DROP COLUMN "fabric_composition",
       DROP COLUMN "care_instructions",
       DROP COLUMN "season",
       DROP COLUMN "style_tags",
       DROP COLUMN "occasion_tags",
       DROP COLUMN "fit_type",
       DROP COLUMN "sustainability_rating"`
    );
  }
};

// Backend: User Measurements Entity (src/models/user-measurements.js)
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "@medusajs/medusa";
import { SoftDeletableEntity } from "@medusajs/medusa";

@Entity()
export class UserMeasurements extends SoftDeletableEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
  
  @Column()
  user_id: string;
  
  @Column({ type: "int", nullable: true })
  height: number;
  
  @Column({ type: "int", nullable: true })
  weight: number;
  
  @Column({ type: "int", nullable: true })
  bust: number;
  
  @Column({ type: "int", nullable: true })
  waist: number;
  
  @Column({ type: "int", nullable: true })
  hips: number;
  
  @Column({ type: "int", nullable: true })
  shoulder_width: number;
  
  @Column({ type: "int", nullable: true })
  inseam: number;
  
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;
}

// Backend: Style Profile Entity (src/models/style-profile.js)
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "@medusajs/medusa";
import { SoftDeletableEntity } from "@medusajs/medusa";

@Entity()
export class StyleProfile extends SoftDeletableEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
  
  @Column()
  user_id: string;
  
  @Column({ type: "jsonb", nullable: true })
  preferred_styles: string[];
  
  @Column({ type: "jsonb", nullable: true })
  preferred_colors: string[];
  
  @Column({ type: "jsonb", nullable: true })
  preferred_occasions: string[];
  
  @Column({ type: "jsonb", nullable: true })
  disliked_styles: string[];
  
  @Column({ type: "jsonb", nullable: true })
  disliked_colors: string[];
  
  @Column({ type: "jsonb", nullable: true })
  size_preferences: Record<string, string>;
  
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;
}

// Backend: Virtual Try-On Entity (src/models/virtual-try-on.js)
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User, Product } from "@medusajs/medusa";
import { SoftDeletableEntity } from "@medusajs/medusa";

@Entity()
export class VirtualTryOn extends SoftDeletableEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
  
  @Column()
  user_id: string;
  
  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;
  
  @Column()
  product_id: string;
  
  @Column()
  user_image_id: string;
  
  @Column({ nullable: true })
  result_image_id: string;
  
  @Column({ default: "pending" })
  status: string;
  
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;
}
