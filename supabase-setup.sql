-- SQL für manuelles Einrichten in Supabase
-- Führe dieses Script im SQL Editor von Supabase aus

-- 1. Tabelle für gespeicherte Berechnungen erstellen
CREATE TABLE IF NOT EXISTS public.calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    input_data JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security aktivieren
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies erstellen
-- Policy: User kann nur eigene Berechnungen sehen
CREATE POLICY "Users can view own calculations"
    ON public.calculations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: User kann eigene Berechnungen erstellen
CREATE POLICY "Users can create own calculations"
    ON public.calculations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Berechnungen aktualisieren
CREATE POLICY "Users can update own calculations"
    ON public.calculations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Berechnungen löschen
CREATE POLICY "Users can delete own calculations"
    ON public.calculations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON public.calculations(created_at DESC);

-- 5. Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calculations_updated_at
    BEFORE UPDATE ON public.calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
