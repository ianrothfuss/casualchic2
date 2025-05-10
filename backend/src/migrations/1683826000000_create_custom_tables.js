const { MigrationInterface } = require("typeorm");

class CreateCustomTables1683826000000 {
  async up(queryRunner) {
    // Create outfit table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outfit" (
        "id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "thumbnail" character varying,
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY ("id")
      )
    `);

    // Create outfit_products join table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outfit_products" (
        "outfit_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        PRIMARY KEY ("outfit_id", "product_id")
      )
    `);

    // Create foreign keys for outfit_products
    await queryRunner.query(`
      ALTER TABLE "outfit_products" ADD CONSTRAINT "FK_outfit_products_outfit" 
      FOREIGN KEY ("outfit_id") REFERENCES "outfit"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "outfit_products" ADD CONSTRAINT "FK_outfit_products_product" 
      FOREIGN KEY ("product_id") REFERENCES "product"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create outfit_creator join table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outfit_creator" (
        "outfit_id" character varying NOT NULL,
        "customer_id" character varying NOT NULL,
        PRIMARY KEY ("outfit_id", "customer_id")
      )
    `);

    // Create foreign keys for outfit_creator
    await queryRunner.query(`
      ALTER TABLE "outfit_creator" ADD CONSTRAINT "FK_outfit_creator_outfit" 
      FOREIGN KEY ("outfit_id") REFERENCES "outfit"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "outfit_creator" ADD CONSTRAINT "FK_outfit_creator_customer" 
      FOREIGN KEY ("customer_id") REFERENCES "customer"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create user_measurement table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_measurement" (
        "id" character varying NOT NULL,
        "user_id" character varying,
        "height" decimal(10,2),
        "weight" decimal(10,2),
        "bust" decimal(10,2),
        "waist" decimal(10,2),
        "hips" decimal(10,2),
        "shoulder_width" decimal(10,2),
        "inseam" decimal(10,2),
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY ("id")
      )
    `);

    // Create foreign key for user_measurement
    await queryRunner.query(`
      ALTER TABLE "user_measurement" ADD CONSTRAINT "FK_user_measurement_customer" 
      FOREIGN KEY ("user_id") REFERENCES "customer"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create virtual_try_on table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "virtual_try_on" (
        "id" character varying NOT NULL,
        "user_id" character varying,
        "product_id" character varying NOT NULL,
        "user_image_url" character varying NOT NULL,
        "result_url" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY ("id")
      )
    `);

    // Create foreign keys for virtual_try_on
    await queryRunner.query(`
      ALTER TABLE "virtual_try_on" ADD CONSTRAINT "FK_virtual_try_on_customer" 
      FOREIGN KEY ("user_id") REFERENCES "customer"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "virtual_try_on" ADD CONSTRAINT "FK_virtual_try_on_product" 
      FOREIGN KEY ("product_id") REFERENCES "product"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner) {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "virtual_try_on" DROP CONSTRAINT "FK_virtual_try_on_product"`);
    await queryRunner.query(`ALTER TABLE "virtual_try_on" DROP CONSTRAINT "FK_virtual_try_on_customer"`);
    await queryRunner.query(`ALTER TABLE "user_measurement" DROP CONSTRAINT "FK_user_measurement_customer"`);
    await queryRunner.query(`ALTER TABLE "outfit_creator" DROP CONSTRAINT "FK_outfit_creator_customer"`);
    await queryRunner.query(`ALTER TABLE "outfit_creator" DROP CONSTRAINT "FK_outfit_creator_outfit"`);
    await queryRunner.query(`ALTER TABLE "outfit_products" DROP CONSTRAINT "FK_outfit_products_product"`);
    await queryRunner.query(`ALTER TABLE "outfit_products" DROP CONSTRAINT "FK_outfit_products_outfit"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "virtual_try_on"`);
    await queryRunner.query(`DROP TABLE "user_measurement"`);
    await queryRunner.query(`DROP TABLE "outfit_creator"`);
    await queryRunner.query(`DROP TABLE "outfit_products"`);
    await queryRunner.query(`DROP TABLE "outfit"`);
  }
}

module.exports = CreateCustomTables1683826000000;