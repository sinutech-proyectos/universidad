// 1) Buscamos los dos elementos que necesitamos en el HTML.
//      Si la página no tiene alguno de los dos, "menuToggle" o "navLinks"
//      quedarán como "null" y no se entrará al "if" (evita errores).
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', function () {

    // -) "classList.toggle" es un método muy usado en JS:
    //      - si el elemento NO tiene la clase "show", la agrega.
    //      - si el elemento YA tiene la clase "show", la quita.
    //      Así el mismo botón sirve para abrir y cerrar el menú.
    navLinks.classList.toggle('show');
  
    const menuAbierto = navLinks.classList.contains('show');
  
    menuToggle.setAttribute('aria-expanded', menuAbierto ? 'true' : 'false');
  });
}



const contactForm = document.getElementById('contactForm');

if (contactForm) {
  //  Referencias a los campos del formulario y al párrafo donde
  //      vamos a mostrar los mensajes (id="formMsg" en contacto.html).
  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const mensajeInput = document.getElementById('mensaje');
  const formMsg = document.getElementById('formMsg');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function mostrarMensaje(texto, tipo) {
    formMsg.textContent = texto;
    formMsg.classList.remove('error', 'success');
    formMsg.classList.add(tipo);
  }

  contactForm.addEventListener('submit', function (evento) {

    // "preventDefault" evita que el navegador recargue la página,
    // que es lo que pasaría por defecto al enviar un <form>.
    evento.preventDefault();

    // -) ".trim()" quita espacios en blanco al inicio y al final,
    //      así " " (solo espacios) no se cuenta como un campo lleno.
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    // -) Validaciones 
    //      
    if (nombre === '') {
      mostrarMensaje('Por favor escribe tu nombre.', 'error');
      nombreInput.focus();
      return;
    }

    if (!emailRegex.test(email)) {
      mostrarMensaje('Ingresa un correo electrónico válido.', 'error');
      emailInput.focus();
      return;
    }

    if (mensaje === '') {
      mostrarMensaje('Cuéntanos tu mensaje antes de enviar.', 'error');
      mensajeInput.focus();
      return;
    }

    // -) Si llegamos aquí, todos los campos pasaron la validación.

    mostrarMensaje('¡Mensaje enviado! Te responderemos pronto.', 'success');

    // -) "reset()" limpia todos los campos del formulario.
    contactForm.reset();
  });
}


/* ==========================================================================
    CARRITO DE COMPRAS SIMPLE (Usando localStorage)
   --------------------------------------------------------------------------
   Este bloque le da funcionalidad a los botones "Agregar al carrito" de
   productos.html (clase "btn-cart"), y actualiza un contador ("badge")
   visible en el menú de navegación.
   ========================================================================== */

//
const CART_KEY = 'compraya_carrito';

// 3.2) Lee el carrito guardado en localStorage y lo devuelve como array.
//      Si todavía no hay nada guardado, devuelve un array vacío.
function obtenerCarrito() {
  const datosGuardados = localStorage.getItem(CART_KEY);
  return datosGuardados ? JSON.parse(datosGuardados) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

// -) Busca en la página el elemento donde se muestra el número de
//      productos (id="cartCount", dentro del badge del navbar) y lo
//      actualiza con la cantidad de artículos que hay en el carrito.
function actualizarContadorCarrito() {
  const cartCount = document.getElementById('cartCount');
  if (!cartCount) return; // Esta página no tiene badge de carrito (ej: contacto.html)

  const carrito = obtenerCarrito();

  // "reduce" recorre el array y va acumulando un total.
  // Sumamos las cantidades de cada producto (no solo la cantidad de líneas).
  const totalProductos = carrito.reduce(function (total, item) {
    return total + item.cantidad;
  }, 0);

  cartCount.textContent = totalProductos;
}

//  Agrega un producto al carrito (o suma 1 si ya estaba agregado).
function agregarAlCarrito(nombre, precio) {
  const carrito = obtenerCarrito();

  // "find" busca si ya existe un producto con el mismo nombre en el carrito.
  const productoExistente = carrito.find(function (item) {
    return item.nombre === nombre;
  });

  if (productoExistente) {
    // Si ya estaba, solo aumentamos la cantidad.
    productoExistente.cantidad += 1;
  } else {
    // Si es la primera vez que se agrega, lo insertamos como nuevo objeto.
    carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
}

//  NOTIFICACIÓN TEMPORAL ("toast"): un pequeño aviso flotante que
//      aparece en pantalla y se desaparece solo después de unos segundos.
function mostrarNotificacionCarrito(texto) {

  // Creamos un <div> nuevo en memoria (todavía no se ve en la página).
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = texto;

  // Lo insertamos al final del <body> para que quede sobre todo lo demás.
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  setTimeout(function () {
    toast.classList.remove('show');

 
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2500);
}

//  Buscamos TODOS los botones "Agregar al carrito" de la página.
//      "querySelectorAll" devuelve una lista con todos los
//      elementos que tengan la clase "btn-cart".
const botonesCarrito = document.querySelectorAll('.btn-cart');

//  A cada botón le agregamos su propio "click listener".
//      "forEach" recorre la lista uno por uno.
botonesCarrito.forEach(function (boton) {
  boton.addEventListener('click', function () {

    //  Los datos del producto vienen del HTML mediante atributos
    //      "data-*" (ver productos.html: data-nombre y data-precio).
    //      Se leen con la propiedad "dataset".
    const nombre = boton.dataset.nombre;
    const precio = Number(boton.dataset.precio); // texto -> número

    agregarAlCarrito(nombre, precio);

    //  Mostramos la notificación temporal con el nombre del
    //       producto agregado.
    mostrarNotificacionCarrito(nombre + ' se agregó al carrito 🛒');
  });
});

// 3.11) Al cargar cualquier página,
//       actualizamos el contador para que muestre lo que ya había en el
//       carrito guardado, aunque el usuario haya cambiado de página.
actualizarContadorCarrito();
