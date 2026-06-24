import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wnqxnuwbtpjzefekovmg.supabase.co'
// Remplacez cette clé par votre vraie clé 'anon public' fournie par Supabase.
// La clé actuelle trouvée dans vos fichiers a été utilisée temporairement.
const supabaseKey = 'sb_publishable_hYZfyYpGy9Ef9vmQB0bFMQ_phRj9Dli'

export const supabase = createClient(supabaseUrl, supabaseKey)
