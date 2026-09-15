import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://biouqkmupkuaxgeqloru.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpb3Vxa211cGt1YXhnZXFsb3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM4Mzc5NSwiZXhwIjoyMTA0OTU5Nzk1fQ.BiWOy5AMl9KMdkmKWFY4Mqo7w9EzQ1WYayFGmqMhywY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    console.log('Users:', users?.users?.length);
    
    const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
    console.log('Profiles:', profiles?.length, profError);
    
    // Find users that don't have profiles
    const userIds = users?.users?.map(u => u.id) || [];
    const profileIds = profiles?.map(p => p.id) || [];
    const missing = userIds.filter(id => !profileIds.includes(id));
    
    console.log('Users missing profiles:', missing);
}
test();
