-- CreateTable
CREATE TABLE "Affiliates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN DEFAULT true,
    "destination_url" VARCHAR,
    "campaign_id" BIGINT,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaigns" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" VARCHAR,
    "network" VARCHAR,

    CONSTRAINT "Campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "native_id" VARCHAR,
    "properties" JSON,
    "referral_id" UUID,

    CONSTRAINT "conversions_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profiles" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "affiliate_id" UUID,

    CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referrals" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "affiliate_id" UUID,

    CONSTRAINT "Referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCaptchaLogEntries" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "token" VARCHAR,
    "is_success" BOOLEAN,
    "response" JSON,
    "user_id" UUID,

    CONSTRAINT "user_captcha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallets" (
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "user_id" UUID,
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),

    CONSTRAINT "Wallets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Affiliates" ADD CONSTRAINT "Affiliates_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Conversions" ADD CONSTRAINT "Conversions_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "Referrals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Profiles" ADD CONSTRAINT "Profiles_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "Affiliates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Referrals" ADD CONSTRAINT "Referrals_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "Affiliates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
