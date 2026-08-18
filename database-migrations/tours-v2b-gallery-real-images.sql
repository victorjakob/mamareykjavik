-- Tours v2b — gallery column + real Reykjadalur photos (Pexels, uploaded to
-- Cloudinary folder mama-tours/reykjadalur; public IDs are flat).
-- Applied to prod via Supabase on 2026-08-06 (Cowork session).

ALTER TABLE tours ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}';

UPDATE tours SET
  image_url = 'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1920/pexels-arthousestudio-4344250_ziwxee.jpg',
  gallery = ARRAY[
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-mark-neal-201020-2725445_x8fodr.jpg',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-andreas-ebner-246992646-34598753_ntpx1i.jpg',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-igor65-5547764_zseoov.jpg',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-the-six-2148199655-38591329_abtsut.jpg',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-kamil-gr-3609723-5465006_aln7cp.jpg',
    'https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto,w_1200/pexels-xavier-mestdag-2230864-3903672_rayl3c.jpg'
  ]
WHERE slug = 'reykjadalur';
