// ---------------- Variables globales ----------------
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ---------------- Al cargar el DOM ----------------
document.addEventListener("DOMContentLoaded", () => {
  // Botón Ver Carrito
  document.getElementById("verCarrito").addEventListener("click", mostrarCarritoEnModal);

  // Botón Vaciar Carrito
  document.getElementById("btnVaciarCarrito").addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarContador();
    mostrarCarritoEnModal();
  });

  // Validación de formulario de contacto
  const form = document.getElementById("contacto");
  form.addEventListener("submit", function (e) {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if (nombre === "" || email === "" || mensaje === "") {
      e.preventDefault();
      alert("Por favor, completa todos los campos.");
    } else if (!email.includes("@")) {
      e.preventDefault();
      alert("El correo electrónico no es válido.");
    }
  });

  actualizarContador(); // Inicializar contador
  cargarProductos();    // Cargar productos al DOM
});

// ---------------- Función para cargar productos ----------------
function cargarProductos() {
  const contenedor = document.getElementById("productos");

  fetch("https://dummyjson.com/products/category/smartphones?limit=8")
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener los productos");
      return response.json();
    })
    .then(data => {
      data.products.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("card", "m-2", "p-2");
        card.style.width = "18rem";

        card.innerHTML = `
          <img src="${producto.thumbnail}" class="card-img-top" alt="${producto.title}">
          <div class="card-body">
            <h5 class="card-title">${producto.title}</h5>
            <p class="card-text">${producto.description.substring(0, 38)}...</p>
            <p><strong>$${producto.price}</strong></p>
            <button class="btn btn-primary btn-agregar">Añadir al carrito</button>
          </div>
        `;

        const botonAgregar = card.querySelector(".btn-agregar");
        botonAgregar.addEventListener("click", () => {
          agregarAlCarrito({
            id: producto.id,
            titulo: producto.title,
            precio: producto.price,
            imagen: producto.thumbnail
          });
        });

        contenedor.appendChild(card);
      });
    })
    .catch(error => {
      contenedor.innerHTML = "<p>Error al cargar los productos.</p>";
      console.error(error);
    });
}

// ---------------- Funciones del carrito ----------------

function agregarAlCarrito(producto) {
  const index = carrito.findIndex(p => p.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
}

function actualizarContador() {
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    contador.textContent = total;
  }
}

// ---------------- Mostrar carrito en modal ----------------

function mostrarCarritoEnModal() {
  const contenido = document.getElementById("contenidoModalCarrito");
  contenido.innerHTML = "";

  if (carrito.length === 0) {
    alert("🛒 El carrito está vacío.");
    return;
  }

  carrito.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto-carrito");
    div.innerHTML = `
      <div class="d-flex align-items-center justify-content-between border-bottom py-2">
        <div class="d-flex align-items-center">
          <img src="${prod.imagen}" alt="${prod.titulo}" width="50" class="me-2 rounded">
          <div>
            <strong>${prod.titulo}</strong><br>
            $${prod.precio} x ${prod.cantidad} = $${prod.precio * prod.cantidad}
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-warning restar" data-id="${prod.id}">➖</button>
          <button class="btn btn-sm btn-success sumar" data-id="${prod.id}">➕</button>
          <button class="btn btn-sm btn-danger eliminar" data-id="${prod.id}">🗑️</button>
        </div>
      </div>
    `;
    contenido.appendChild(div);
  });

  // Delegación de eventos
  contenido.querySelectorAll(".sumar").forEach(btn =>
    btn.addEventListener("click", e => modificarCantidad(+e.target.dataset.id, 1))
  );
  contenido.querySelectorAll(".restar").forEach(btn =>
    btn.addEventListener("click", e => modificarCantidad(+e.target.dataset.id, -1))
  );
  contenido.querySelectorAll(".eliminar").forEach(btn =>
    btn.addEventListener("click", e => eliminarProducto(+e.target.dataset.id))
  );

  const modal = new bootstrap.Modal(document.getElementById("modalCarrito"));
  modal.show();
}

function modificarCantidad(id, cambio) {
  const index = carrito.findIndex(p => p.id === id);
  if (index !== -1) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    mostrarCarritoEnModal();
  }
}

function eliminarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  mostrarCarritoEnModal();
}
