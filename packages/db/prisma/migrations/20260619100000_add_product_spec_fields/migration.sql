-- Rich product spec fields (all additive, nullable / defaulted — no data loss)
ALTER TABLE "products"
  ADD COLUMN "releaseYear" INTEGER,
  ADD COLUMN "modelName" TEXT,
  ADD COLUMN "mpn" TEXT,
  ADD COLUMN "warrantyMonths" INTEGER,
  ADD COLUMN "weightGrams" INTEGER,
  ADD COLUMN "highlights" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "specs" JSONB;
