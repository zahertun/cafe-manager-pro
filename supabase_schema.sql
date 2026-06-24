-- 1. Création de la table des Cafés
CREATE TABLE cafes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'EUR',
    tax_rate NUMERIC DEFAULT 20.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Création de la table des Baristas (Comptes sans email, gérés par l'admin)
CREATE TABLE barista_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- Pour simplifier, on stockera le hash ici (ou en clair si c'est un prototype non critique)
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ajout de cafe_id dans les autres tables futures (Exemples)
-- CREATE TABLE products (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
--     name TEXT NOT NULL,
--     price NUMERIC NOT NULL
-- );

-- 4. Activer le Row Level Security (RLS)
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE barista_accounts ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS (Sécurité)
-- Les admins voient et gèrent uniquement leur propre café
CREATE POLICY "Admins can view their own cafe" 
ON cafes FOR SELECT 
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own cafe" 
ON cafes FOR UPDATE 
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can manage baristas" 
ON barista_accounts FOR ALL 
USING (
    cafe_id IN (SELECT id FROM cafes WHERE admin_id = auth.uid())
);

-- Note : Les baristas se connecteront via une fonction RPC ou une vérification côté client
-- et utiliseront un jeton custom, ou l'admin agira comme un master pour le dashboard.
