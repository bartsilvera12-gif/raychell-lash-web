-- Elimina la tabla de instructores, que ya no se usa.
-- Correr una sola vez en el SQL Editor. Borra lo que haya cargado ahi.

drop table if exists raychelllashweb.instructors;

notify pgrst, 'reload schema';
