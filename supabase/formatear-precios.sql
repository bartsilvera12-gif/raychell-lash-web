-- Pone el punto de miles a los precios que quedaron guardados como numero
-- suelto, por ejemplo 250000 -> Gs. 250.000.
--
-- Solo toca las filas cuyo precio es unicamente digitos: lo que ya este
-- escrito como "Gs. 150.000" o "Desde 200.000" queda intacto. Se puede
-- correr mas de una vez.

update raychelllashweb.services
set price = 'Gs. ' || reverse(regexp_replace(reverse(price), '(\d{3})(?=\d)', '\1.', 'g'))
where price ~ '^[0-9]{4,}$';

update raychelllashweb.price_items
set price = 'Gs. ' || reverse(regexp_replace(reverse(price), '(\d{3})(?=\d)', '\1.', 'g'))
where price ~ '^[0-9]{4,}$';

-- Los de menos de cuatro cifras solo llevan el prefijo.
update raychelllashweb.services   set price = 'Gs. ' || price where price ~ '^[0-9]{1,3}$';
update raychelllashweb.price_items set price = 'Gs. ' || price where price ~ '^[0-9]{1,3}$';

select 'services'    as tabla, name  as nombre, price from raychelllashweb.services
union all
select 'price_items' as tabla, label as nombre, price from raychelllashweb.price_items
order by 1, 2;
