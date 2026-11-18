import { createClient } from '@supabase/supabase-js';
import { INITIAL_EXPLORE_DESIGNS } from '../constants/nail-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwfazcaxniogiyyaovau.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZmF6Y2F4bmlvZ2l5eWFvdmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMDAzMDksImV4cCI6MjEwOTg3NjMwOX0.NPa1etJZpxNqMorUrlgRRcDi_PFjQkEk2rMXnJZPYsk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Seeding ${INITIAL_EXPLORE_DESIGNS.length} curated nail sets to Finglora...`);

  for (const set of INITIAL_EXPLORE_DESIGNS) {
    const record = {
      id: set.id,
      passport_code: set.passportCode,
      title: set.title,
      category: set.category,
      subtitle: set.subtitle,
      photo_url: set.photoUrl,
      backdrop: set.backdrop,
      skin_tone_id: set.skinTone.id,
      chair_minutes: set.chairMinutes,
      likes_count: set.likes,
      is_curated: true,
      is_public: true,
      nails: set.nails,
    };

    const { data, error } = await supabase
      .from('nail_sets')
      .upsert(record, { onConflict: 'passport_code' })
      .select();

    if (error) {
      console.error(`Failed to seed ${set.title}:`, error.message);
    } else {
      console.log(`✓ Seeded ${set.title} (${set.passportCode})`);
    }
  }

  console.log('Done seeding!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
