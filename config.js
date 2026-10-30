// Datos de conexion a Supabase. Son valores publicos: la anon key esta pensada
// para vivir en el navegador y lo que protege de verdad son las politicas RLS
// del schema raychelllashweb (ver supabase/schema.sql).
window.RL_CONFIG = {
  url: 'https://api.neura.com.py',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MTAxNDYxLCJleHAiOjE5MzE3ODE0NjF9.7_wAph8IolPMXtgfpezSwS5XR62IdD__qhqCywLDp3Q',
  schema: 'raychelllashweb',
  bucket: 'raychelllash'
};
