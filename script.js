


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

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

function actualizarContador() {
    const count = carrito.length;
    document.getElementById("carrito-count").textContent = count;
}

actualizarContador();

// 3. Cuando se hace clic en "Añadir al carrito"
// Agregar producto
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
        const nombre = btn.dataset.name;
        const precio = btn.dataset.price;

        // Revisar si ya existe
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
    });
});

// función para enviar a whatsapp
function enviarCarrito() {
    abrirCarrito()
}

//Panel de carrito
const carritoIcon = document.getElementById("carrito-icon");
const carritoPanel = document.getElementById("carrito-panel");
const carritoOverlay = document.getElementById("carrito-overlay");
const cerrarBtn = document.querySelector(".cerrar-carrito");
const carritoItemsDiv = document.querySelector(".carrito-items");

// Revisar si ya finalizó compra antes
let finalizoCompra = localStorage.getItem("FinalizoCompra") === "true";


// FUNCIONES DE PANEL
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

carritoIcon.addEventListener("click", abrirCarrito);
cerrarBtn.addEventListener("click", cerrarCarrito);
carritoOverlay.addEventListener("click", cerrarCarrito);

// RENDER DEL CARRITO
function renderCarrito() {
    carritoItemsDiv.innerHTML = "";

    carrito.forEach((item, index) => {
        carritoItemsDiv.innerHTML += `
            <div class="carrito-item">
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">₡${item.precio}</span>

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


// BOTÓN ORDENAR POR WHATSAPP
document.getElementById("btn-ordenar").addEventListener("click", () => {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío 💐");
        return;
    }

    // Mensaje construido correctamente
    const mensaje = carrito
        .map(item => `• ${item.nombre} x${item.cantidad} – ₡${item.precio}`)
        .join(" , ");

    //const url =
    //    `https://api.whatsapp.com/send/?phone=50683551919&text=` +
    //    `Hola+Blum%2C+quiero+ordenar:%0A${mensaje}`;

    const url =
        `https://api.whatsapp.com/send/?phone=50683551919&text=` + encodeURIComponent(`Hola Blum quiero ordenar: ${mensaje}`);

    window.open(url, "_blank");

    // Guardar flag de compra finalizada
    localStorage.setItem("FinalizoCompra", "true");     
});

function limpieza(){
    carrito = [];
    localStorage.removeItem("carrito");
    localStorage.removeItem("FinalizoCompra");
    actualizarContador();
    localStorage.setItem("FinalizoCompra", "false");
}

// Si la compra fue finalizada, limpiar carrito automáticamente
if (finalizoCompra) {
    limpieza()
}