import fs from 'fs';
import { INITIAL_EXPLORE_DESIGNS } from '../constants/nail-data';

const values = INITIAL_EXPLORE_DESIGNS.map((d) => {
  const id = `'${d.id.replace(/'/g, "''")}'`;
  const passport = `'${d.passportCode.replace(/'/g, "''")}'`;
  const title = `'${d.title.replace(/'/g, "''")}'`;
  const category = `'${d.category.replace(/'/g, "''")}'`;
  const subtitle = `'${(d.subtitle || '').replace(/'/g, "''")}'`;
  const photo = `'${d.photoUrl.replace(/'/g, "''")}'`;
  const backdrop = `'${(d.backdrop || '').replace(/'/g, "''")}'`;
  const skin = `'${(d.skinTone.id || 'warm-ivory').replace(/'/g, "''")}'`;
  const chair = d.chairMinutes || 60;
  const likes = d.likes || 100;
  const nailsJson = `'${JSON.stringify(d.nails).replace(/'/g, "''")}'::jsonb`;

  return `(${id}, ${passport}, ${title}, ${category}, ${subtitle}, ${photo}, ${backdrop}, ${skin}, ${chair}, ${likes}, true, true, ${nailsJson})`;
}).join(',\n');

const sql = `
INSERT INTO public.nail_sets (
  id, passport_code, title, category, subtitle, photo_url, backdrop, skin_tone_id, chair_minutes, likes_count, is_curated, is_public, nails
) VALUES
${values}
ON CONFLICT (passport_code) DO UPDATE
SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subtitle = EXCLUDED.subtitle,
  photo_url = EXCLUDED.photo_url,
  backdrop = EXCLUDED.backdrop,
  skin_tone_id = EXCLUDED.skin_tone_id,
  chair_minutes = EXCLUDED.chair_minutes,
  likes_count = EXCLUDED.likes_count,
  is_curated = true,
  is_public = true,
  nails = EXCLUDED.nails;
`;

fs.writeFileSync('/home/alazar/Desktop/Finglora/scripts/seed.sql', sql);
console.log('Generated seed.sql successfully!');
