ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS plan_desde TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS plan_hasta TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS upgrade_solicitado_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS upgrade_nota TEXT;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plan_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_plan_check
    CHECK (plan IN ('free','pro'));
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
