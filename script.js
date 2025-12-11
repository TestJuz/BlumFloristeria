
// ===========================
// CARGA OPINIONES DE CLIENTES
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const placeId = "ChIJrRE_D4H7oI8RoylPeAX17Qo";

    const service = new google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails(
        {
            placeId: placeId,
            fields: ["reviews"]
        },
        (place, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error("Error cargando reseñas:", status);
                return;
            }

            const container = document.getElementById("reviews-container");
            container.innerHTML = "";

            // 👉 SOLO REVIEWS DE 5 ESTRELLAS
            const fiveStarReviews = place.reviews.filter(r => r.rating === 5);

            // 👉 Mostrar solo 5 reviews, si querés
            fiveStarReviews.slice(0, 5).forEach(r => {
                const card = `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-name">${r.author_name}</div>
                        <div class="review-stars">${"⭐".repeat(r.rating)}</div>
                    </div>
                    <div class="review-text">${r.text}</div>
                </div>
                `;
                container.innerHTML += card;
            });
        }
    );
});
// ===========================
// CARGA DE PRODUCTOS + ADD TO CART
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('productos-grid');

    // 🟣 Delegación de eventos para todos los .btn-add
    grid.addEventListener("click", (event) => {
        const btn = event.target.closest(".btn-add");
        if (!btn) return; // si no clickeaste en un botón, salir

        const nombre = btn.dataset.name;
        const rawPrice = btn.dataset.price;

        // precio: número o null si es personalizable
        const precio = (rawPrice === "" || rawPrice === undefined)
            ? null
            : Number(rawPrice);

        const existente = carrito.find(item => item.nombre === nombre);

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                nombre,
                precio,
                cantidad: 1
            });
        }

        guardarCarrito();
        renderCarrito(); // actualiza panel si está abierto
    });

    // 🟣 Cargar productos y crear las cards
    fetch('./Products.json')
        .then(response => response.json())
        .then(data => {

            Object.keys(data).forEach(categoria => {
                data[categoria].forEach(producto => {

                    const precioTexto = producto.precio === null
                        ? "Personalizable"
                        : `₡${producto.precio.toLocaleString("es-CR")}`;

                    const card = document.createElement('div');
                    card.classList.add('producto-card');

                    card.innerHTML = `
                        <div class="producto-img">
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                        </div>
                        <h3>${producto.nombre}</h3>
                        <p class="producto-descripcion">${categoria.replace(/_/g, " ")}</p>
                        <span class="precio">${precioTexto}</span>
                        <button class="btn-add"
                            data-name="${producto.nombre}"
                            data-price="${producto.precio !== null ? producto.precio : ""}">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            Añadir al carrito
                        </button>
                    `;

                    grid.appendChild(card);
                });
            });
        })
        .catch(error => console.error("Error cargando productos:", error));
});


// ===========================
// FAQ
// ===========================
document.querySelectorAll("#FAQ .faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const item = btn.parentElement;
        const answer = item.querySelector(".faq-answer");

        // Toggle
        if (item.classList.contains("active")) {
            item.classList.remove("active");
            answer.style.maxHeight = null;
        } else {
            // Cerrar los demás
            document.querySelectorAll("#FAQ .faq-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".faq-answer").style.maxHeight = null;
            });

            // Abrir este
            item.classList.add("active");
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});


// ===========================
// CARRITO - DATA & UTILIDADES
// ===========================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

function actualizarContador() {
    const count = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const badge = document.getElementById("carrito-count");
    if (badge) {
        badge.textContent = count;
    }
}

actualizarContador();

// función para enviar a whatsapp (abre panel primero)
function enviarCarrito() {
    abrirCarrito();
}


// ===========================
// PANEL VALIDACIÓN
// ===========================
// Mostrar / ocultar panel
function mostrarPanelConfirmacion() {
    document.getElementById("confirm-panel").classList.remove("hidden");
}

function cerrarPanelConfirmacion() {
    document.getElementById("confirm-panel").classList.add("hidden");
}


// ===========================
// PANEL DE CARRITO
// ===========================
const carritoIcon = document.getElementById("carrito-icon");
const carritoPanel = document.getElementById("carrito-panel");
const carritoOverlay = document.getElementById("carrito-overlay");
const cerrarBtn = document.querySelector(".cerrar-carrito");
const carritoItemsDiv = document.querySelector(".carrito-items");

// Revisar si ya finalizó compra antes
let finalizoCompra = localStorage.getItem("FinalizoCompra") === "true";

function abrirCarrito() {
    carritoPanel.style.right = "0";
    carritoOverlay.style.opacity = "1";
    carritoOverlay.style.pointerEvents = "auto";
    renderCarrito();
}

function cerrarCarrito() {
    carritoPanel.style.right = "-400px";
    carritoOverlay.style.opacity = "0";
    carritoOverlay.style.pointerEvents = "none";
}

if (carritoIcon) carritoIcon.addEventListener("click", abrirCarrito);
if (cerrarBtn) cerrarBtn.addEventListener("click", cerrarCarrito);
if (carritoOverlay) carritoOverlay.addEventListener("click", cerrarCarrito);


// ===========================
// RENDER DEL CARRITO
// ===========================
function renderCarrito() {
    if (!carritoItemsDiv) return;
    carritoItemsDiv.innerHTML = "";

    carrito.forEach((item, index) => {
        // determinar si es personalizable
        const esPersonalizable =
            item.precio === null ||
            item.precio === "" ||
            isNaN(Number(item.precio));

        const precioTexto = esPersonalizable
            ? "Personalizable"
            : `₡${Number(item.precio).toLocaleString("es-CR")}`;

        carritoItemsDiv.innerHTML += `
            <div class="carrito-item">
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">${precioTexto}</span>

                <div class="qty-controls">
                    <button class="qty-btn minus" data-index="${index}">−</button>
                    <span class="qty-number">${item.cantidad}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
            </div>
        `;
    });

    activarBotonesCantidad();
}

function activarBotonesCantidad() {
    document.querySelectorAll(".qty-btn.plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.index;
            carrito[i].cantidad++;
            guardarCarrito();
            renderCarrito();
        });
    });

    document.querySelectorAll(".qty-btn.minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.index;
            carrito[i].cantidad--;

            if (carrito[i].cantidad <= 0) {
                carrito.splice(i, 1);
            }

            guardarCarrito();
            renderCarrito();
        });
    });
}


// ===========================
// BOTÓN ORDENAR POR WHATSAPP
// ===========================
document.getElementById("btn-ordenar").addEventListener("click", () => {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío 💐");
        return;
    }

    const mensaje = carrito
        .map(item => {
            const esPersonalizable =
                item.precio === null ||
                item.precio === "" ||
                isNaN(Number(item.precio));

            if (esPersonalizable) {
                return `• ${item.nombre} x${item.cantidad} – precio personalizable`;
            } else {
                return `• ${item.nombre} x${item.cantidad} – ₡${Number(item.precio).toLocaleString("es-CR")}`;
            }
        })
        .join(" , ");

    const url =
        `https://api.whatsapp.com/send/?phone=50683551919&text=` +
        encodeURIComponent(`Hola Blum quiero ordenar: ${mensaje}`);

    window.open(url, "_blank");

    // Mostrar panel de confirmación
    mostrarPanelConfirmacion();
});


// ===========================
// LIMPIEZA DEL CARRITO
// ===========================
function limpieza() {
    carrito = [];
    localStorage.removeItem("carrito");
    localStorage.removeItem("FinalizoCompra");
    actualizarContador();
    localStorage.setItem("FinalizoCompra", "false");
    cerrarCarrito();
}

// Botón "Sí, completé el pedido"
document.getElementById("btn-confirm-si").addEventListener("click", () => {
    limpieza();
    cerrarPanelConfirmacion();
});

// Botón "Seguir navegando"
document.getElementById("btn-confirm-no").addEventListener("click", () => {
    localStorage.setItem("FinalizoCompra", "false");
    cerrarPanelConfirmacion();
});

document.getElementById("btn-limpiar").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("El carrito ya está vacío 💐");
        return;
    }

    // Mostrar panel de confirmación de limpiar
    document.getElementById("confirm-limpiar").classList.remove("hidden");
});

// Si confirma limpiar
document.getElementById("btn-limpiar-si").addEventListener("click", () => {
    limpieza();
    document.getElementById("confirm-limpiar").classList.add("hidden");
});

// Si cancela
document.getElementById("btn-limpiar-no").addEventListener("click", () => {
    document.getElementById("confirm-limpiar").classList.add("hidden");
});
