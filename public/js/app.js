const state = {
  token: localStorage.getItem("ecommerce_token"),
  user: JSON.parse(localStorage.getItem("ecommerce_user") || "null"),
  cart: { items: [] },
  products: [],
  page: 1,
  pages: 1,
  search: "",
  category: ""
};

const $ = (selector) => document.querySelector(selector);
const productsGrid = $("#productsGrid");
const pagination = $("#pagination");
const modalBackdrop = $("#modalBackdrop");
const modalContent = $("#modalContent");
const toast = $("#toast");

const api = async (url, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && state.token) logout(false);
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

const money = (value) => new Intl.NumberFormat("en-PK", {
  style: "currency", currency: "PKR", maximumFractionDigits: 2
}).format(Number(value) || 0);

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

const openModal = (content) => {
  modalContent.innerHTML = content;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
};

const saveAuth = (data) => {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem("ecommerce_token", data.token);
  localStorage.setItem("ecommerce_user", JSON.stringify(data.user));
  updateAuthUI();
};

const logout = (notify = true) => {
  state.token = null;
  state.user = null;
  state.cart = { items: [] };
  localStorage.removeItem("ecommerce_token");
  localStorage.removeItem("ecommerce_user");
  updateAuthUI();
  updateCartCount();
  if (notify) showToast("Logged out successfully");
};

const updateAuthUI = () => {
  $("#authButton").textContent = state.user ? "Logout" : "Login";
  $("#ordersLink").hidden = !state.user;
};

const updateCartCount = () => {
  const count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  $("#cartCount").textContent = count;
};

const loadCategories = async () => {
  try {
    const data = await api("/api/products?limit=100");
    const categories = [...new Set(data.products.map((p) => p.category))].sort();
    $("#categorySelect").insertAdjacentHTML("beforeend",
      categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")
    );
  } catch (_) {}
};

const loadProducts = async () => {
  productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
  const params = new URLSearchParams({ page: state.page, limit: 12 });
  if (state.search) params.set("search", state.search);
  if (state.category) params.set("category", state.category);

  try {
    const data = await api(`/api/products?${params.toString()}`);
    state.products = data.products;
    state.pages = data.pagination.pages || 1;
    renderProducts();
    renderPagination();
  } catch (error) {
    productsGrid.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
};

const renderProducts = () => {
  if (!state.products.length) {
    productsGrid.innerHTML = '<div class="empty-state">No products found.</div>';
    return;
  }

  productsGrid.innerHTML = state.products.map((product) => `
    <article class="product-card">
      <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22600%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23eef0f4%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2222%22%3ENo image%3C/text%3E%3C/svg%3E'">
      <div class="product-body">
        <div class="product-category">${escapeHtml(product.category)}</div>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <div class="product-description">${escapeHtml(product.description.slice(0, 80))}${product.description.length > 80 ? "..." : ""}</div>
        <div class="product-footer">
          <span class="price">${money(product.price)}</span>
          <span class="stock ${product.stock === 0 ? "out" : ""}">${product.stock ? `${product.stock} in stock` : "Out of stock"}</span>
        </div>
        <div class="product-actions">
          <button class="secondary-button" type="button" data-detail="${product._id}">Details</button>
          <button class="secondary-button" type="button" data-add="${product._id}" ${product.stock === 0 ? "disabled" : ""}>Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
};

const renderPagination = () => {
  if (state.pages <= 1) { pagination.innerHTML = ""; return; }
  pagination.innerHTML = Array.from({ length: state.pages }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === state.page ? "active" : ""}" data-page="${page}">${page}</button>`;
  }).join("");
};

const showAuthModal = (mode = "login") => {
  const register = mode === "register";
  openModal(`
    <h2 id="modalTitle">${register ? "Create account" : "Welcome back"}</h2>
    <p>${register ? "Register to start shopping." : "Login to continue shopping."}</p>
    <form id="authForm">
      ${register ? '<div class="form-field"><label for="name">Name</label><input id="name" name="name" required minlength="2" maxlength="100"></div>' : ""}
      <div class="form-field"><label for="email">Email</label><input id="email" name="email" type="email" required></div>
      <div class="form-field"><label for="password">Password</label><input id="password" name="password" type="password" required minlength="6" maxlength="128"></div>
      <div id="authError" class="form-error" role="alert"></div>
      <button class="secondary-button form-submit" type="submit">${register ? "Register" : "Login"}</button>
    </form>
    <div class="switch-auth">${register ? "Already have an account?" : "Don't have an account?"}
      <button type="button" id="switchAuth">${register ? "Login" : "Register"}</button>
    </div>
  `);

  $("#switchAuth").addEventListener("click", () => showAuthModal(register ? "login" : "register"));
  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const error = $("#authError");
    error.textContent = "";
    try {
      const data = await api(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST", body: JSON.stringify(payload)
      });
      saveAuth(data);
      closeModal();
      await loadCart();
      showToast(register ? "Account created successfully" : "Logged in successfully");
    } catch (err) {
      error.textContent = err.message;
    }
  });
};

const showProductDetails = async (id) => {
  openModal('<div class="loading">Loading product...</div>');
  try {
    const data = await api(`/api/products/${id}`);
    const p = data.product;
    openModal(`
      <div class="detail-grid">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
        <div>
          <div class="product-category">${escapeHtml(p.category)}</div>
          <h2 id="modalTitle">${escapeHtml(p.name)}</h2>
          <div class="detail-price">${money(p.price)}</div>
          <p>${escapeHtml(p.description)}</p>
          <p class="stock ${p.stock === 0 ? "out" : ""}">${p.stock ? `${p.stock} item(s) available` : "Out of stock"}</p>
          <div class="quantity-row">
            <input id="detailQuantity" type="number" min="1" max="${p.stock}" value="1" ${p.stock === 0 ? "disabled" : ""}>
            <button class="secondary-button" id="detailAdd" type="button" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
          </div>
        </div>
      </div>
    `);
    $("#detailAdd")?.addEventListener("click", () => addToCart(p._id, Number($("#detailQuantity").value)));
  } catch (error) {
    openModal(`<div class="error-state">${escapeHtml(error.message)}</div>`);
  }
};

const loadCart = async () => {
  if (!state.token) {
    state.cart = { items: [] };
    updateCartCount();
    return;
  }
  try {
    const data = await api("/api/cart");
    state.cart = data.cart || { items: [] };
    updateCartCount();
  } catch (error) {
    showToast(error.message);
  }
};

const addToCart = async (productId, quantity = 1) => {
  if (!state.token) {
    closeModal();
    showAuthModal("login");
    showToast("Please login before adding items to your cart");
    return;
  }
  try {
    const data = await api("/api/cart/add", {
      method: "POST", body: JSON.stringify({ productId, quantity })
    });
    state.cart = data.cart;
    updateCartCount();
    closeModal();
    showToast("Product added to cart");
  } catch (error) {
    showToast(error.message);
  }
};

const showCart = async () => {
  if (!state.token) {
    showAuthModal("login");
    return;
  }
  await loadCart();
  const items = state.cart.items || [];
  const total = items.reduce((sum, item) => sum + item.quantity * (item.product?.price || 0), 0);

  openModal(`
    <h2 id="modalTitle">Shopping Cart</h2>
    ${items.length ? items.map((item) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${escapeHtml(item.product?.name || "Unavailable product")}</strong><br>
          <small>${item.quantity} × ${money(item.product?.price || 0)}</small>
        </div>
        <strong>${money(item.quantity * (item.product?.price || 0))}</strong>
        <button class="danger-button" type="button" data-remove="${item.product?._id || item.product}">Remove</button>
      </div>
    `).join("") : '<div class="empty-state">Your cart is empty.</div>'}
    ${items.length ? `
      <div class="cart-total"><span>Total</span><span>${money(total)}</span></div>
      <button class="secondary-button form-submit" id="checkoutButton" type="button">Place Order</button>
    ` : ""}
  `);

  modalContent.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
  $("#checkoutButton")?.addEventListener("click", createOrder);
};

const removeFromCart = async (productId) => {
  try {
    const data = await api(`/api/cart/remove/${productId}`, { method: "DELETE" });
    state.cart = data.cart;
    updateCartCount();
    showCart();
    showToast("Item removed");
  } catch (error) {
    showToast(error.message);
  }
};

const createOrder = async () => {
  const button = $("#checkoutButton");
  if (button) button.disabled = true;
  try {
    const data = await api("/api/orders", { method: "POST", body: JSON.stringify({}) });
    state.cart = { items: [] };
    updateCartCount();
    closeModal();
    showToast(`Order placed successfully. Total: ${money(data.order.totalAmount)}`);
    await loadOrders();
  } catch (error) {
    showToast(error.message);
    if (button) button.disabled = false;
  }
};

const loadOrders = async () => {
  if (!state.token) return;
  try {
    const data = await api("/api/orders");
    $("#ordersList").innerHTML = data.orders.length ? data.orders.map((order) => `
      <article class="order-card">
        <header><strong>Order #${escapeHtml(order._id.slice(-8).toUpperCase())}</strong><span class="status">${escapeHtml(order.status)}</span></header>
        <small>${new Date(order.createdAt).toLocaleString()}</small>
        <p>${order.items.map((item) => `${escapeHtml(item.product?.name || "Product")} × ${item.quantity}`).join(", ")}</p>
        <strong>Total: ${money(order.totalAmount)}</strong>
      </article>
    `).join("") : '<div class="empty-state">No orders yet.</div>';
  } catch (error) {
    $("#ordersList").innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
};

$("#productsGrid").addEventListener("click", (event) => {
  const detail = event.target.closest("[data-detail]");
  const add = event.target.closest("[data-add]");
  if (detail) showProductDetails(detail.dataset.detail);
  if (add) addToCart(add.dataset.add);
});

pagination.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  state.page = Number(button.dataset.page);
  loadProducts();
  $("#products").scrollIntoView({ behavior: "smooth" });
});

let searchTimer;
$("#searchInput").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = event.target.value.trim();
    state.page = 1;
    loadProducts();
  }, 300);
});

$("#categorySelect").addEventListener("change", (event) => {
  state.category = event.target.value;
  state.page = 1;
  loadProducts();
});

$("#cartButton").addEventListener("click", showCart);
$("#authButton").addEventListener("click", () => state.user ? logout() : showAuthModal());
$("#ordersLink").addEventListener("click", async (event) => {
  event.preventDefault();
  $("#orders").hidden = false;
  await loadOrders();
  $("#orders").scrollIntoView({ behavior: "smooth" });
});
$("#modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

updateAuthUI();
loadCategories();
loadProducts();
loadCart();