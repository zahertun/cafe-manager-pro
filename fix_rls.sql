-- Ajout de la politique d'insertion pour les administrateurs
CREATE POLICY "Admins can insert their own cafe" 
ON cafes FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

-- Ajout de la politique de suppression (optionnel, pour avoir le contrôle total)
CREATE POLICY "Admins can delete their own cafe" 
ON cafes FOR DELETE 
USING (auth.uid() = admin_id);
