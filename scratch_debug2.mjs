import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://biouqkmupkuaxgeqloru.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpb3Vxa211cGt1YXhnZXFsb3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM4Mzc5NSwiZXhwIjoyMTA0OTU5Nzk1fQ.BiWOy5AMl9KMdkmKWFY4Mqo7w9EzQ1WYayFGmqMhywY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: triggerDef } = await supabase.rpc('get_triggers'); // If exists
    
    // Attempt to manually create a profile for the missing user
    const { data, error } = await supabase.from('profiles').insert({
        id: '5859cb73-d662-45f1-ac1c-8cd7b4255388',
        email: 'test@rohis.id', // Guessing the email, or just omit if not required
        role: 'user'
    });
    console.log('Insert Profile Result:', data, error);
}
test();
