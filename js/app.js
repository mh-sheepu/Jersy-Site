const STORAGE_KEY = "jerseyProducts";
const CART_KEY = "jerseyCart";

const DEFAULT_PRODUCTS = [
  {
    id: "arsenal-home-26",
    title: "Arsenal Home 2026",
    price: 120,
    category: "Arsenal",
    editions: ["Home Kit", "Player Edition"],
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80"
    ],
    topSelling: true
  },
  {
    id: "madrid-away-26",
    title: "Madrid Away 2026",
    price: 110,
    category: "Madrid",
    editions: ["Away Kit"],
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80"
    ],
    topSelling: true
  },
  {
    id: "brazil-home-26",
    title: "Brazil Home 2026",
    price: 105,
    category: "Brazil",
    editions: ["Home Kit", "Player Edition"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
    ],
    topSelling: false
  },
  {
    id: "barca-third-26",
    title: "Barca Third 2026",
    price: 95,
    category: "Barcelona",
    editions: ["Third Kit"],
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80"
    ],
    topSelling: false
  },
  {
    id: "juventus-home-26",
    title: "Juventus Home 2026",
    price: 118,
    category: "Juventus",
    editions: ["Home Kit", "Away Kit"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
    ],
    topSelling: true
  }
];

const CATEGORY_BRANDS = {
  Arsenal: { short: "ARS", colors: ["#b31224", "#f3d45b"] },
  Madrid: { short: "RMA", colors: ["#f7f7f2", "#b99d4f"] },
  Brazil: { short: "BRA", colors: ["#f7d917", "#149447"] },
  Barcelona: { short: "FCB", colors: ["#173b83", "#a91528"] },
  Juventus: { short: "JUV", colors: ["#f8f8f8", "#111111"] }
};

function loadProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
}

function saveProducts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getProductImages(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const allImages = [...images, product.image]
    .map((image) => String(image || "").trim())
    .filter(Boolean);
  return [...new Set(allImages)].slice(0, 3);
}

function getCategories(products) {
  const set = new Set(products.map((item) => item.category));
  return [...set];
}

function formatPrice(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  const amount = Number.isFinite(parsed) ? parsed : 0;
  return `TK ${amount.toFixed(2)}`;
}

function getStrikePrice(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  const amount = Number.isFinite(parsed) ? parsed : 0;
  const strike = amount * 1.25;
  return Math.round(strike);
}

function getDiscountLabel(value) {
  const strike = getStrikePrice(value);
  const percent = Math.round((1 - value / strike) * 100);
  return `${percent}% OFF`;
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (error) {
    localStorage.setItem(CART_KEY, "[]");
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, edition) {
  const products = loadProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const cart = loadCart();
  const key = `${productId}-${edition || product.editions[0]}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: productId,
      edition: edition || product.editions[0],
      qty: 1
    });
  }
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(key) {
  const cart = loadCart().filter((item) => item.key !== key);
  saveCart(cart);
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartCount || !cartItems || !cartTotal) return;

  const cart = loadCart();
  const products = loadProducts();
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;
    const productImages = getProductImages(product);
    total += product.price * item.qty;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${productImages[0]}" alt="${product.title}" />
      <div class="cart-item-details">
        <strong>${product.title}</strong>
        <span>${item.edition}</span>
        <span>${item.qty} x ${formatPrice(product.price)}</span>
      </div>
      <button class="ghost-btn" data-remove="${item.key}">Remove</button>
    `;
    cartItems.appendChild(row);
  });

  cartTotal.textContent = formatPrice(total);
  cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
}

function setupCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const openButton = document.getElementById("cartButton");
  const closeButton = document.getElementById("cartClose");
  if (!drawer || !openButton || !closeButton) return;

  openButton.addEventListener("click", () => {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  });

  closeButton.addEventListener("click", () => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  });
}


function setupCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  const openButton = document.getElementById("checkoutButton");
  const closeButton = document.getElementById("checkoutClose");
  const form = modal ? modal.querySelector(".checkout-form") : null;
  const checkoutProducts = document.getElementById("checkoutProducts");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  if (!modal || !openButton || !closeButton) return;

  const updateTotals = () => {
    const cart = loadCart();
    const products = loadProducts();
    if (checkoutProducts) {
      checkoutProducts.innerHTML = "";
    }
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return sum;
      const productImages = getProductImages(product);
      if (checkoutProducts) {
        const row = document.createElement("div");
        row.className = "checkout-product";
        row.innerHTML = `
          <img src="${productImages[0]}" alt="${product.title}" />
          <div>
            <strong>${product.title}</strong>
            <span>${item.edition}</span>
            <small>${item.qty} x ${formatPrice(product.price)}</small>
          </div>
        `;
        checkoutProducts.appendChild(row);
      }
      return sum + product.price * item.qty;
    }, 0);
    if (checkoutProducts && cart.length === 0) {
      checkoutProducts.innerHTML = `<div class="checkout-empty">Your cart is empty.</div>`;
    }
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(subtotal);
  };

  const openModal = () => {
    updateTotals();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveCart([]);
      updateCartUI();
      form.reset();
      closeModal();
      alert("Order placed successfully.");
    });
  }
}

function renderCategoryCards() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  const categories = getCategories(loadProducts());
  grid.innerHTML = "";
  categories.forEach((category) => {
    const brand = CATEGORY_BRANDS[category] || {
      short: category.slice(0, 3).toUpperCase(),
      colors: ["#d7b928", "#1d2028"]
    };
    const card = document.createElement("a");
    card.className = "category-card";
    card.href = "products.html";
    card.style.setProperty("--club-a", brand.colors[0]);
    card.style.setProperty("--club-b", brand.colors[1]);
    card.innerHTML = `
      <span class="category-crest" aria-hidden="true">${brand.short}</span>
      <span class="category-name">${category}</span>
      <span class="category-meta">Club collection</span>
    `;
    grid.appendChild(card);
  });
}

function renderTopSelling() {
  const grid = document.getElementById("topSellingGrid");
  if (!grid) return;
  const products = loadProducts().filter((item) => item.topSelling);
  renderProductCards(grid, products);
}

function renderFifa2026() {
  const grid = document.getElementById("fifa2026Grid");
  if (!grid) return;
  const products = loadProducts().filter((item) => item.title.includes("2026"));
  renderProductCards(grid, products);
}

function renderProductCards(grid, products) {
  grid.innerHTML = "";
  products.forEach((product) => {
    const strike = getStrikePrice(product.price);
    const badge = getDiscountLabel(product.price);
    const images = getProductImages(product);
    const imageControls = images.length > 1
      ? `<div class="product-image-controls" aria-label="Choose image for ${product.title}">
          ${images
            .map(
              (image, index) =>
                `<button type="button" class="product-image-dot${index === 0 ? " is-active" : ""}" data-image="${image}" aria-label="Show image ${index + 1}"></button>`
            )
            .join("")}
        </div>`
      : "";
    const card = document.createElement("div");
    card.className = "product-card";
    const editionOptions = product.editions
      .map((edition) => `<option value="${edition}">${edition}</option>`)
      .join("");
    card.innerHTML = `
      <div class="product-image">
        <img src="${images[0]}" alt="${product.title}" />
        <span class="product-badge">${badge}</span>
        ${imageControls}
      </div>
      <h3 class="product-title">${product.title}</h3>
      <div class="price-old">${formatPrice(strike)}</div>
      <div class="price-from">From ${formatPrice(product.price)}</div>
      <select class="edition-select" aria-label="Choose edition for ${product.title}">
        ${editionOptions}
      </select>
      <button class="primary-btn full-btn" data-add="${product.id}">Add to cart</button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const edition = button.parentElement.querySelector(".edition-select").value;
      addToCart(button.dataset.add, edition);
    });
  });

  grid.querySelectorAll(".product-image-dot").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const image = card.querySelector(".product-image img");
      image.src = button.dataset.image;
      card.querySelectorAll(".product-image-dot").forEach((dot) => {
        dot.classList.toggle("is-active", dot === button);
      });
    });
  });
}

function setupFAQ() {
  document.querySelectorAll("details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (detail.open) {
        document.querySelectorAll("details").forEach((other) => {
          if (other !== detail) other.open = false;
        });
      }
    });
  });
}

function setupMobileNav() {
  const nav = document.getElementById("mobileNav");
  const toggle = document.getElementById("navToggle");
  const closeButton = document.getElementById("navClose");
  if (!nav || !toggle || !closeButton) return;

  const closeNav = () => {
    nav.classList.remove("open");
    nav.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    nav.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  closeButton.addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
}

function setupHeroSlider() {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dotsWrap = document.getElementById("heroDots");
  const prevButton = document.getElementById("heroPrev");
  const nextButton = document.getElementById("heroNext");
  if (slides.length <= 1 || !dotsWrap || !prevButton || !nextButton) return;

  let activeIndex = 0;
  let autoplayId;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show slide ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  };

  const nextSlide = () => showSlide(activeIndex + 1);
  const prevSlide = () => showSlide(activeIndex - 1);
  const startAutoplay = () => {
    autoplayId = window.setInterval(nextSlide, 4500);
  };
  const restartAutoplay = () => {
    window.clearInterval(autoplayId);
    startAutoplay();
  };

  prevButton.addEventListener("click", () => {
    prevSlide();
    restartAutoplay();
  });
  nextButton.addEventListener("click", () => {
    nextSlide();
    restartAutoplay();
  });

  showSlide(0);
  startAutoplay();
}

window.VoidApparelStore = {
  loadProducts,
  saveProducts,
  getCategories,
  getProductImages,
  formatPrice,
  getStrikePrice,
  getDiscountLabel,
  addToCart,
  updateCartUI
};

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupCartDrawer();
  updateCartUI();
  renderCategoryCards();
  renderTopSelling();
  renderFifa2026();
  setupFAQ();
  setupMobileNav();
  setupHeroSlider();
  setupCheckoutModal();
});
