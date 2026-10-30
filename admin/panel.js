/* Panel de administracion de Reychell Lash.
   Lee y escribe el schema raychelllashweb de Supabase. Lo que puede hacer cada
   quien lo decide la base (RLS), no este archivo: aca solo se arma la pantalla. */
(function () {
  'use strict';

  var CFG = window.RL_CONFIG || {};
  var sb = window.supabase.createClient(CFG.url, CFG.anonKey, {
    db: { schema: CFG.schema },
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'rl-admin-auth' }
  });

  // ------------------------------------------------------------------
  //  Que se puede editar
  // ------------------------------------------------------------------
  var SECCIONES = [
    {
      id: 'servicios', nombre: 'Servicios',
      ayuda: 'Los efectos del catálogo. Aparecen en la portada y en la página de Servicios, en este orden.',
      grupos: [{
        tabla: 'services', etiqueta: 'servicio', articulo: 'el',
        titulo: function (f) { return f.name || 'Servicio sin nombre'; },
        subtitulo: function (f) { return f.price || ''; },
        foto: function (f) { return f.image_url; },
        campos: [
          { k: 'name', et: 'Nombre', tipo: 'texto', req: true },
          { k: 'price', et: 'Precio', tipo: 'texto', nota: 'Se muestra tal cual está escrito. Por ejemplo: Gs. 120.000' },
          { k: 'description', et: 'Detalle', tipo: 'area', nota: 'El texto que acompaña al servicio en la página de Servicios.' },
          { k: 'image_url', et: 'Foto', tipo: 'imagen', carpeta: 'servicios', ancho: 1000 },
          { k: 'is_active', et: 'Visible en la página', tipo: 'check' }
        ],
        nuevo: { name: '', description: '', price: '', image_url: '', image_position: 'center', is_active: true }
      }]
    },
    {
      id: 'sobre', nombre: 'Sobre Reychell',
      ayuda: 'Los bloques de texto y las fotos de la página Sobre Reychell.',
      grupos: [
        {
          tabla: 'about_blocks', etiqueta: 'bloque', articulo: 'el', titulo_grupo: 'Textos',
          titulo: function (f) { return f.label || 'Bloque sin título'; },
          subtitulo: function (f) { return (f.body || '').slice(0, 70); },
          campos: [
            { k: 'label', et: 'Título del bloque', tipo: 'texto', req: true, nota: 'Por ejemplo: Su historia' },
            { k: 'body', et: 'Texto', tipo: 'area' },
            { k: 'is_active', et: 'Visible en la página', tipo: 'check' }
          ],
          nuevo: { label: '', body: '', is_active: true }
        },
        {
          tabla: 'about_images', etiqueta: 'foto', articulo: 'la', titulo_grupo: 'Fotos',
          titulo: function (f) { return f.slot === 'retrato' ? 'Foto principal' : 'Foto de la tira'; },
          subtitulo: function (f) { return f.alt || ''; },
          foto: function (f) { return f.image_url; },
          campos: [
            { k: 'image_url', et: 'Foto', tipo: 'imagen', carpeta: 'sobre', ancho: 1000 },
            {
              k: 'slot', et: 'Dónde va', tipo: 'select',
              opciones: [['retrato', 'Foto principal, al lado del texto'], ['tira', 'Fila de fotos del final']],
              nota: 'Si hay más de una foto principal se usa la primera.'
            },
            { k: 'alt', et: 'Descripción de la foto', tipo: 'texto', nota: 'La leen los lectores de pantalla y los buscadores. No se ve en la página.' },
            { k: 'is_active', et: 'Visible en la página', tipo: 'check' }
          ],
          nuevo: { image_url: '', alt: '', slot: 'tira', is_active: true }
        }
      ]
    },
    {
      id: 'galeria', nombre: 'Galería',
      ayuda: 'Las fotos de la sección Galería. Las que marques como destacadas aparecen además en el carrusel del inicio.',
      grupos: [{
        tabla: 'gallery_images', etiqueta: 'foto', articulo: 'la',
        titulo: function (f) { return f.label || 'Foto sin título'; },
        subtitulo: function (f) { return f.is_featured ? 'Destacada en el inicio' : ''; },
        foto: function (f) { return f.thumb_url || f.image_url; },
        campos: [
          { k: 'image_url', et: 'Foto', tipo: 'imagen-doble', carpeta: 'galeria', ancho: 1600,
            tamanos: [{ k: 'thumb_url', ancho: 640 }, { k: 'mini_url', ancho: 200 }] },
          { k: 'label', et: 'Título', tipo: 'texto', nota: 'Se muestra al abrir la foto en grande.' },
          { k: 'is_featured', et: 'Destacada: también va en el carrusel del inicio', tipo: 'check' },
          { k: 'is_wide', et: 'Ocupa el doble de ancho en la grilla', tipo: 'check' },
          { k: 'is_active', et: 'Visible en la página', tipo: 'check' }
        ],
        nuevo: { image_url: '', thumb_url: '', mini_url: '', label: '', is_featured: false, is_wide: false, ratio: '3/4', is_active: true }
      }]
    },
    {
      id: 'instructores', nombre: 'Instructores',
      ayuda: 'Aparecen en la página Sobre Reychell. Mientras no haya ninguno cargado, la sección no se muestra.',
      grupos: [{
        tabla: 'instructors', etiqueta: 'instructor', articulo: 'el',
        titulo: function (f) { return f.name || 'Instructor sin nombre'; },
        subtitulo: function (f) { return f.teaches || ''; },
        foto: function (f) { return f.image_url; },
        campos: [
          { k: 'name', et: 'Nombre', tipo: 'texto', req: true },
          { k: 'teaches', et: 'Qué enseña', tipo: 'texto', nota: 'Por ejemplo: Volumen ruso · Lash lifting' },
          { k: 'bio', et: 'Descripción', tipo: 'area' },
          { k: 'image_url', et: 'Foto', tipo: 'imagen', carpeta: 'instructores', ancho: 800 },
          { k: 'is_active', et: 'Visible en la página', tipo: 'check' }
        ],
        nuevo: { name: '', bio: '', teaches: '', image_url: '', is_active: true }
      }]
    },
    {
      id: 'config', nombre: 'Configuración',
      ayuda: 'La foto de portada y los datos de contacto. El número de WhatsApp que cargues acá es el que usan el botón flotante, los enlaces de los servicios y el pie de página.',
      grupos: [{
        tabla: 'settings', unico: true,
        campos: [
          { k: 'cover_image_url', et: 'Foto de portada', tipo: 'imagen', carpeta: 'portada', ancho: 1600, nota: 'La foto grande que abre el inicio.' },
          { k: 'whatsapp', et: 'WhatsApp', tipo: 'texto', nota: 'Con código de país y sin espacios ni signos. Por ejemplo: 595984053323' },
          { k: 'address', et: 'Ubicación', tipo: 'area' },
          { k: 'hours', et: 'Horarios', tipo: 'texto' },
          { k: 'instagram_url', et: 'Instagram', tipo: 'texto', nota: 'La dirección completa, empezando por https://' },
          { k: 'facebook_url', et: 'Facebook', tipo: 'texto', nota: 'La dirección completa, empezando por https://' }
        ]
      }]
    }
  ];

  // ------------------------------------------------------------------
  //  Utilidades
  // ------------------------------------------------------------------
  function $(sel) { return document.querySelector(sel); }

  function el(tag, props, hijos) {
    var n = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === 'class') n.className = props[k];
      else if (k === 'text') n.textContent = props[k];
      else if (k === 'html') n.innerHTML = props[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), props[k]);
      else if (props[k] !== null && props[k] !== undefined && props[k] !== false) n.setAttribute(k, props[k]);
    });
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }

  var contador = 0;
  function idUnico() { contador += 1; return 'rl-' + contador; }

  // Sin acentos y en minuscula, para que buscar "clasico" encuentre "clásico".
  function normalizar(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function avisar(tipo, texto) {
    var caja = el('div', { class: 'aviso ' + tipo, text: texto });
    $('#mensajes').appendChild(caja);
    setTimeout(function () { caja.remove(); }, tipo === 'error' ? 8000 : 3500);
  }

  // Reemplaza al confirm() del navegador, que sale con el estilo del sistema
  // y el nombre del dominio arriba.
  function confirmar(texto, alAceptar) {
    var si = el('button', { type: 'button', class: 'boton peligro', text: 'Eliminar' });
    var no = el('button', { type: 'button', class: 'boton claro', text: 'Cancelar' });
    var fondo = el('div', { class: 'modal-fondo' }, [
      el('div', { class: 'modal-caja', role: 'alertdialog', 'aria-modal': 'true' }, [
        el('p', { class: 'modal-texto', text: texto }),
        el('div', { class: 'modal-acciones' }, [no, si])
      ])
    ]);

    function cerrar() {
      fondo.remove();
      document.removeEventListener('keydown', tecla);
    }
    function tecla(e) { if (e.key === 'Escape') cerrar(); }

    no.addEventListener('click', cerrar);
    si.addEventListener('click', function () { cerrar(); alAceptar(); });
    fondo.addEventListener('click', function (e) { if (e.target === fondo) cerrar(); });
    document.addEventListener('keydown', tecla);

    document.body.appendChild(fondo);
    no.focus();
  }

  // Traduce los errores mas comunes de Supabase a algo legible.
  function explicar(error) {
    if (!error) return 'Error desconocido.';
    var m = error.message || String(error);
    if (error.code === '42501' || /row-level security/i.test(m)) {
      return 'Esta cuenta no tiene permiso para editar. Revisá que el correo esté en la tabla de administradores.';
    }
    if (error.code === 'PGRST106' || /schema must be one of/i.test(m)) {
      return 'El schema ' + CFG.schema + ' todavía no está expuesto en la API de Supabase.';
    }
    if (error.code === 'PGRST205' || /Could not find the table/i.test(m)) {
      return 'Faltan las tablas: ¿ya corriste supabase/schema.sql en el SQL Editor?';
    }
    if (/Failed to fetch|NetworkError/i.test(m)) return 'No se pudo contactar al servidor de Supabase.';
    return m;
  }

  // ------------------------------------------------------------------
  //  Imagenes: se achican y se pasan a WebP antes de subirlas, para que una
  //  foto sacada con el celular no termine pesando 4 MB en la pagina.
  // ------------------------------------------------------------------
  function achicar(file, maxLado) {
    return Promise.resolve()
      .then(function () {
        return createImageBitmap(file, { imageOrientation: 'from-image' })
          .catch(function () { return createImageBitmap(file); });
      })
      .then(function (bmp) {
        var r = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
        var w = Math.max(1, Math.round(bmp.width * r));
        var h = Math.max(1, Math.round(bmp.height * r));
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
        if (bmp.close) bmp.close();
        return new Promise(function (res, rej) {
          cv.toBlob(function (b) { b ? res(b) : rej(new Error('No se pudo procesar la imagen.')); }, 'image/webp', 0.82);
        });
      });
  }

  function subir(blob, carpeta) {
    var nombre = carpeta + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.webp';
    return sb.storage.from(CFG.bucket).upload(nombre, blob, { contentType: 'image/webp', upsert: false })
      .then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from(CFG.bucket).getPublicUrl(nombre).data.publicUrl;
      });
  }

  // Borra del bucket, si la url apunta ahi. Las fotos que vinieron con la
  // pagina (assets/...) no se tocan.
  function borrarDelBucket(url) {
    if (!url) return Promise.resolve();
    var marca = '/object/public/' + CFG.bucket + '/';
    var i = url.indexOf(marca);
    if (i < 0) return Promise.resolve();
    return sb.storage.from(CFG.bucket).remove([url.slice(i + marca.length)]).then(function () {}, function () {});
  }

  function urlVista(u) {
    if (!u) return '';
    if (/^https?:\/\//.test(u)) return u;
    return '../' + u.replace(/^\/+/, '');
  }

  // ------------------------------------------------------------------
  //  Pantalla de ingreso
  // ------------------------------------------------------------------
  $('#form-ingreso').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = ev.target.querySelector('button');
    var datos = new FormData(ev.target);
    btn.disabled = true;
    $('#error-ingreso').innerHTML = '';
    sb.auth.signInWithPassword({ email: datos.get('email'), password: datos.get('password') })
      .then(function (r) {
        btn.disabled = false;
        if (r.error) {
          var m = /Invalid login/i.test(r.error.message || '')
            ? 'Correo o contraseña incorrectos.' : explicar(r.error);
          $('#error-ingreso').appendChild(el('div', { class: 'aviso error', text: m }));
          return;
        }
        entrar(r.data.session);
      });
  });

  $('#salir').addEventListener('click', function (ev) {
    ev.preventDefault();
    sb.auth.signOut().then(function () { location.reload(); });
  });

  function entrar(sesion) {
    $('#ingreso').hidden = true;
    $('#app').hidden = false;
    $('#quien-email').textContent = sesion.user.email;
    armarPestanas();
    abrir(SECCIONES[0].id);
    // Aviso temprano si la cuenta entro bien pero no es administradora.
    sb.from('admins').select('email').limit(1).then(function (r) {
      if (!r.error && (!r.data || !r.data.length)) {
        avisar('error', 'Entraste, pero esta cuenta no figura como administradora: no vas a poder guardar cambios.');
      }
    });
  }

  // ------------------------------------------------------------------
  //  Navegacion
  // ------------------------------------------------------------------
  var actual = null;

  function armarPestanas() {
    var cont = $('#pestanas');
    cont.innerHTML = '';
    SECCIONES.forEach(function (s) {
      cont.appendChild(el('button', {
        type: 'button', text: s.nombre, 'data-id': s.id,
        onclick: function () { abrir(s.id); }
      }));
    });
  }

  function abrir(id, destacada) {
    actual = id;
    Array.prototype.forEach.call($('#pestanas').children, function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-id') === id ? 'true' : 'false');
    });
    var sec = SECCIONES.filter(function (s) { return s.id === id; })[0];
    var cont = $('#contenido');
    cont.innerHTML = '';
    cont.appendChild(el('div', { class: 'encabezado' }, [el('h2', { text: sec.nombre })]));
    cont.appendChild(el('p', { class: 'ayuda-seccion', text: sec.ayuda }));
    var zona = el('div');
    cont.appendChild(zona);
    zona.appendChild(el('div', { class: 'cargando', text: 'Cargando…' }));

    Promise.all(sec.grupos.map(function (g) {
      var q = sb.from(g.tabla).select('*');
      q = g.unico ? q.eq('id', 1) : q.order('position', { ascending: true });
      return q;
    })).then(function (res) {
      if (actual !== id) return;
      zona.innerHTML = '';
      res.forEach(function (r, i) {
        var g = sec.grupos[i];
        if (r.error) {
          zona.appendChild(el('div', { class: 'aviso error', text: explicar(r.error) }));
          return;
        }
        zona.appendChild(g.unico ? pintarUnico(g, r.data[0] || { id: 1 })
                                 : pintarLista(sec, g, r.data || [], destacada));
      });
    });
  }

  function recargar(destacada) { abrir(actual, destacada); }

  // ------------------------------------------------------------------
  //  Listas
  // ------------------------------------------------------------------
  function pintarLista(sec, g, filas, destacada) {
    var caja = el('section', { style: 'margin-bottom:46px' });

    if (g.titulo_grupo) {
      caja.appendChild(el('h3', { text: g.titulo_grupo, style: 'font-size:26px;margin-bottom:14px' }));
    }

    var lista = el('div');
    var sinResultados = el('div', { class: 'vacio', text: 'Ningún resultado para esa búsqueda.', hidden: 'hidden' });

    var buscador = el('input', {
      type: 'search', class: 'buscador', placeholder: 'Buscar ' + g.etiqueta + '…',
      'aria-label': 'Buscar ' + g.etiqueta
    });

    var agregar = el('button', {
      type: 'button', class: 'boton', text: 'Agregar ' + g.etiqueta,
      onclick: function () {
        agregar.disabled = true;
        // La fila nueva entra primera, debajo del boton, y las que ya estaban
        // corren un lugar. Asi no hay que bajar hasta el final para cargarla.
        var nueva = JSON.parse(JSON.stringify(g.nuevo));
        nueva.position = 0;
        sb.from(g.tabla).insert(nueva).select().then(function (r) {
          if (r.error) {
            agregar.disabled = false;
            return avisar('error', explicar(r.error));
          }
          var nuevoId = r.data && r.data[0] && r.data[0].id;
          Promise.all(filas.map(function (f, i) {
            return sb.from(g.tabla).update({ position: i + 1 }).eq('id', f.id);
          })).then(function (rs) {
            agregar.disabled = false;
            var err = rs.filter(function (x) { return x.error; })[0];
            if (err) return avisar('error', explicar(err.error));
            avisar('ok', 'Se agregó. Completá los datos y guardá.');
            recargar(nuevoId);
          });
        });
      }
    });

    caja.appendChild(el('div', { class: 'barra-grupo' }, [buscador, agregar]));

    if (!filas.length) {
      caja.appendChild(el('div', { class: 'vacio', text: 'Todavía no hay nada cargado acá.' }));
    }

    caja.appendChild(sinResultados);
    caja.appendChild(lista);

    filas.forEach(function (fila, idx) {
      lista.appendChild(pintarFicha(g, fila, idx, filas, destacada));
    });

    buscador.addEventListener('input', function () {
      var q = normalizar(buscador.value).trim();
      var visibles = 0;
      Array.prototype.forEach.call(lista.children, function (ficha) {
        var entra = !q || (ficha.dataset.busca || '').indexOf(q) >= 0;
        ficha.hidden = !entra;
        if (entra) visibles += 1;
      });
      sinResultados.hidden = !(q && visibles === 0);
      // Mientras se filtra, mover de orden confunde: los vecinos de la
      // pantalla no son los vecinos reales.
      lista.classList.toggle('filtrando', !!q);
    });

    return caja;
  }

  function pintarFicha(g, fila, idx, filas, destacada) {
    var ficha = el('details', { class: 'ficha' });

    // Lo que mira el buscador: titulo, subtitulo y el contenido de los campos
    // de texto de esta fila.
    ficha.dataset.busca = normalizar([
      g.titulo(fila),
      g.subtitulo ? g.subtitulo(fila) : '',
      g.campos.filter(function (c) { return c.tipo === 'texto' || c.tipo === 'area'; })
        .map(function (c) { return fila[c.k]; }).join(' ')
    ].join(' '));

    if (destacada && fila.id === destacada) ficha.open = true;
    var foto = g.foto ? g.foto(fila) : null;

    var resumen = el('summary', {}, [
      g.foto ? el('div', {
        class: 'miniatura' + (foto ? '' : ' sin-foto'),
        'aria-hidden': 'true',
        style: foto ? 'background-image:url("' + urlVista(foto) + '")' : ''
      }) : null,
      el('div', { class: 'titulo' }, [
        el('strong', { text: g.titulo(fila) }),
        el('span', { text: g.subtitulo ? g.subtitulo(fila) : '' })
      ]),
      fila.is_active === false ? el('span', { class: 'oculto-pill', text: 'Oculto' }) : null,
      el('button', {
        type: 'button', class: 'mini', text: '↑', title: 'Subir', disabled: idx === 0 || null,
        onclick: function (e) { e.preventDefault(); mover(g, filas, idx, -1); }
      }),
      el('button', {
        type: 'button', class: 'mini', text: '↓', title: 'Bajar', disabled: idx === filas.length - 1 || null,
        onclick: function (e) { e.preventDefault(); mover(g, filas, idx, 1); }
      })
    ]);
    ficha.appendChild(resumen);

    var form = el('form', { class: 'cuerpo', 'data-tabla': g.tabla });
    g.campos.forEach(function (c) { form.appendChild(pintarCampo(c, fila, g)); });

    form.appendChild(el('div', { class: 'acciones' }, [
      el('button', { type: 'submit', class: 'boton', text: 'Guardar' }),
      el('div', { class: 'espacio' }),
      el('button', {
        type: 'button', class: 'boton peligro', text: 'Eliminar',
        onclick: function () {
          confirmar('¿Eliminar ' + g.articulo + ' ' + g.etiqueta + ' "' + g.titulo(fila) + '"? No se puede deshacer.', function () {
            var fotos = g.campos.filter(function (c) { return c.tipo === 'imagen' || c.tipo === 'imagen-doble'; })
              .reduce(function (acc, c) {
                acc.push(fila[c.k]);
                (c.tamanos || []).forEach(function (t) { acc.push(fila[t.k]); });
                return acc;
              }, []);
            sb.from(g.tabla).delete().eq('id', fila.id).then(function (r) {
              if (r.error) return avisar('error', explicar(r.error));
              Promise.all(fotos.map(borrarDelBucket)).then(function () {
                avisar('ok', 'Eliminado.');
                recargar();
              });
            });
          });
        }
      })
    ]));

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      var cambios = leerForm(form, g);
      var falta = g.campos.filter(function (c) { return c.req && !String(cambios[c.k] || '').trim(); });
      if (falta.length) {
        btn.disabled = false;
        return avisar('error', 'Falta completar: ' + falta.map(function (c) { return c.et; }).join(', '));
      }
      sb.from(g.tabla).update(cambios).eq('id', fila.id).then(function (r) {
        btn.disabled = false;
        if (r.error) return avisar('error', explicar(r.error));
        avisar('ok', 'Guardado.');
        recargar();
      });
    });

    ficha.appendChild(form);
    return ficha;
  }

  function pintarUnico(g, fila) {
    var form = el('form', { class: 'ficha', style: 'padding:6px 18px 20px', 'data-tabla': g.tabla });
    g.campos.forEach(function (c) { form.appendChild(pintarCampo(c, fila, g)); });
    form.appendChild(el('div', { class: 'acciones' }, [
      el('button', { type: 'submit', class: 'boton', text: 'Guardar cambios' })
    ]));
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      var cambios = leerForm(form, g);
      cambios.id = 1;
      sb.from(g.tabla).upsert(cambios, { onConflict: 'id' }).then(function (r) {
        btn.disabled = false;
        if (r.error) return avisar('error', explicar(r.error));
        avisar('ok', 'Guardado.');
        recargar();
      });
    });
    return form;
  }

  function leerForm(form, g) {
    var out = {};
    g.campos.forEach(function (c) {
      var n = form.querySelector('[name="' + c.k + '"]');
      if (!n) return;
      out[c.k] = c.tipo === 'check' ? n.checked : n.value;
      (c.tamanos || []).forEach(function (t) {
        var m = form.querySelector('[name="' + t.k + '"]');
        if (m) out[t.k] = m.value;
      });
    });
    return out;
  }

  function mover(g, filas, idx, dir) {
    var otra = filas[idx + dir];
    if (!otra) return;
    var a = filas[idx];
    Promise.all([
      sb.from(g.tabla).update({ position: idx + dir }).eq('id', a.id),
      sb.from(g.tabla).update({ position: idx }).eq('id', otra.id)
    ]).then(function (rs) {
      var err = rs.filter(function (r) { return r.error; })[0];
      if (err) return avisar('error', explicar(err.error));
      recargar();
    });
  }

  // ------------------------------------------------------------------
  //  Campos
  // ------------------------------------------------------------------
  function pintarCampo(c, fila, g) {
    var valor = fila[c.k];
    if (valor === null || valor === undefined) valor = c.tipo === 'check' ? false : '';

    if (c.tipo === 'check') {
      var chk = el('input', { type: 'checkbox', name: c.k });
      chk.checked = !!valor;
      return el('label', { class: 'fila-check' }, [chk, el('span', { text: c.et })]);
    }

    // Estos dos traen su propio control, armado a mano para que no quede el
    // widget gris del sistema operativo en medio del panel.
    if (c.tipo === 'imagen' || c.tipo === 'imagen-doble') return campoImagen(c, fila);
    if (c.tipo === 'select') return campoSelect(c, valor);

    var campo = el('label', { class: 'campo' }, [el('span', { class: 'et', text: c.et })]);
    var entrada;

    if (c.tipo === 'area') {
      entrada = el('textarea', { name: c.k });
      entrada.value = valor;
    } else {
      entrada = el('input', { type: 'text', name: c.k });
      entrada.value = valor;
    }

    campo.appendChild(entrada);
    if (c.nota) campo.appendChild(el('span', { class: 'nota', text: c.nota }));
    return campo;
  }

  // Cierra cualquier desplegable abierto. Va una sola vez sobre el documento
  // en lugar de un listener por campo, porque el panel se redibuja seguido.
  function cerrarDesplegables() {
    Array.prototype.forEach.call(document.querySelectorAll('.select-lista'), function (l) {
      l.hidden = true;
      if (l.previousSibling && l.previousSibling.setAttribute) {
        l.previousSibling.setAttribute('aria-expanded', 'false');
      }
    });
  }
  document.addEventListener('click', cerrarDesplegables);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarDesplegables();
  });

  function campoSelect(c, valor) {
    var campo = el('div', { class: 'campo' }, [el('span', { class: 'et', text: c.et })]);

    var oculto = el('input', { type: 'hidden', name: c.k });
    oculto.value = valor || (c.opciones[0] ? c.opciones[0][0] : '');

    var textoDe = function (v) {
      var o = c.opciones.filter(function (x) { return x[0] === v; })[0];
      return o ? o[1] : v;
    };

    var texto = el('span', { text: textoDe(oculto.value) });
    var boton = el('button', {
      type: 'button', class: 'select-boton',
      'aria-haspopup': 'listbox', 'aria-expanded': 'false'
    }, [texto, el('span', { class: 'select-flecha', text: '▾' })]);

    var lista = el('div', { class: 'select-lista', role: 'listbox', hidden: 'hidden' });

    function marcar() {
      Array.prototype.forEach.call(lista.children, function (op) {
        op.setAttribute('aria-selected', op.dataset.valor === oculto.value ? 'true' : 'false');
      });
    }

    c.opciones.forEach(function (o) {
      var op = el('button', {
        type: 'button', class: 'select-opcion', role: 'option',
        onclick: function () {
          oculto.value = o[0];
          texto.textContent = o[1];
          marcar();
        }
      }, [el('span', { text: o[1] })]);
      op.dataset.valor = o[0];
      lista.appendChild(op);
    });

    boton.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var abierto = !lista.hidden;
      cerrarDesplegables();
      if (!abierto) {
        lista.hidden = false;
        boton.setAttribute('aria-expanded', 'true');
      }
    });

    marcar();
    campo.appendChild(el('div', { class: 'select' }, [boton, lista, oculto]));
    if (c.nota) campo.appendChild(el('span', { class: 'nota', text: c.nota }));
    return campo;
  }

  function campoImagen(c, fila) {
    var campo = el('div', { class: 'campo' }, [el('span', { class: 'et', text: c.et })]);
    // Una foto puede guardarse en varios tamanos: el principal mas los que
    // pida c.tamanos. Cada uno tiene su campo oculto con la URL del bucket.
    var partes = [{ k: c.k, ancho: c.ancho }].concat(c.tamanos || []);
    var ocultos = {};
    partes.forEach(function (t) {
      var h = el('input', { type: 'hidden', name: t.k });
      h.value = fila[t.k] || '';
      ocultos[t.k] = h;
    });

    // Caja con background-image en vez de <img>: sin foto cargada, un <img>
    // con src vacio muestra el icono de imagen rota.
    var vista = el('div', { class: 'vista-foto', 'aria-hidden': 'true' });
    function pintarVista(url) {
      vista.style.backgroundImage = url ? 'url("' + urlVista(url) + '")' : 'none';
      vista.textContent = url ? '' : 'Sin foto';
    }
    pintarVista(ocultos[c.k].value);
    var estado = el('span', { class: 'nota', text: c.nota || '' });

    // El input de archivo nativo se esconde y se dispara desde un label con
    // el mismo estilo que el resto de los botones.
    var idArchivo = idUnico();
    var archivo = el('input', { type: 'file', accept: 'image/*', id: idArchivo, class: 'archivo-real' });
    var elegir = el('label', { class: 'boton claro archivo-boton', 'for': idArchivo, text: 'Elegir foto' });

    archivo.addEventListener('change', function () {
      var f = archivo.files && archivo.files[0];
      if (!f) return;
      var previas = partes.map(function (t) { return ocultos[t.k].value; });
      archivo.disabled = true;
      elegir.classList.add('inactivo');
      estado.textContent = 'Procesando y subiendo…';

      partes.reduce(function (cadena, t) {
        return cadena
          .then(function () { return achicar(f, t.ancho); })
          .then(function (b) { return subir(b, c.carpeta); })
          .then(function (url) {
            ocultos[t.k].value = url;
            if (t.k === c.k) pintarVista(url);
          });
      }, Promise.resolve())
        .then(function () {
          archivo.disabled = false;
          elegir.classList.remove('inactivo');
          archivo.value = '';
          estado.textContent = 'Foto subida. Acordate de guardar.';
          // Si la fila ya existe, se guarda sola: asi no queda una foto
          // subida al bucket que la pagina nunca va a usar.
          if (!fila.id) return;
          var cambios = {};
          partes.forEach(function (t) { cambios[t.k] = ocultos[t.k].value; });
          return guardarFoto(campo, fila, cambios, previas);
        })
        .catch(function (e) {
          archivo.disabled = false;
          elegir.classList.remove('inactivo');
          estado.textContent = '';
          avisar('error', explicar(e));
        });
    });

    campo.appendChild(el('div', { class: 'vista-imagen' }, [
      vista,
      el('div', { class: 'controles' }, [elegir, archivo, estado].concat(partes.map(function (t) { return ocultos[t.k]; })))
    ]));
    return campo;
  }

  // Guarda solo el campo de la foto y limpia del bucket la que acaba de quedar
  // sin uso. La tabla sale del formulario que contiene al campo.
  function guardarFoto(campo, fila, cambios, previas) {
    var form = campo.closest('form');
    var tabla = form && form.dataset.tabla;
    if (!tabla) return;
    return sb.from(tabla).update(cambios).eq('id', fila.id).then(function (r) {
      if (r.error) return avisar('error', explicar(r.error));
      avisar('ok', 'Foto actualizada.');
      return Promise.all(previas.map(borrarDelBucket));
    });
  }

  // ------------------------------------------------------------------
  //  Arranque
  // ------------------------------------------------------------------
  if (!CFG.url || !CFG.anonKey) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">Falta config.js con los datos de Supabase.</p>';
    return;
  }

  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) entrar(r.data.session);
  });
})();
