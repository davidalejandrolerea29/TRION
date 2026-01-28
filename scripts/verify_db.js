import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifhbpfjtrimebsodvnlc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaGJwZmp0cmltZWJzb2R2bmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMTMwNDcsImV4cCI6MjA1MzU4OTA0N30.rYc6Z9-N7g5qF0b686e-bB7-0-5-0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying connection to Supabase...');

    try {
        const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection Failed or Table Missing:', error.message);
            if (error.code === '42P01') {
                console.error('NOTE: The "categories" table does not exist. You need to run the migration script.');
            }
        } else {
            console.log('Connection Successful! "categories" table found.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verify();
