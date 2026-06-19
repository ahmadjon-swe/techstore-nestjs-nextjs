-- AddressCoordinates: optional lat/lng for map-based location picking
ALTER TABLE "addresses" ADD COLUMN "lat" DOUBLE PRECISION;
ALTER TABLE "addresses" ADD COLUMN "lng" DOUBLE PRECISION;
