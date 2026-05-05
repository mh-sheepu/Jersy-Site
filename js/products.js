document.addEventListener("DOMContentLoaded", () => {
  if (!window.VoidApparelStore) return;

  const {
    loadProducts,
    getCategories,
    formatPrice,
    getStrikePrice,
    getDiscountLabel,
    addToCart,
    updateCartUI
  } = window.VoidApparelStore;

  const grid = document.getElementById("productGrid");
  const resultsCount = document.getElementById("resultsCount");
  const categoryFilters = document.getElementById("categoryFilters");
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  const clearFilters = document.getElementById("clearFilters");

  if (!grid || !categoryFilters) return;

  const parsePrice = (value) => {
    const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const products = loadProducts();
  const categories = getCategories(products);
  const highestPrice = Math.max(200, ...products.map((product) => parsePrice(product.price)));

  categoryFilters.innerHTML = "";
  categories.forEach((category) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = category;
    label.append(input, ` ${category}`);
    categoryFilters.appendChild(label);
  });

  const normalizeValue = (value) => String(value || "").trim().toLowerCase();

  const getSelectedValues = (selector) =>
    Array.from(document.querySelectorAll(selector))
      .filter((input) => input.checked)
      .map((input) => normalizeValue(input.value));

  priceRange.max = highestPrice;
  priceRange.value = highestPrice;
  priceValue.textContent = formatPrice(highestPrice);

  const renderProducts = () => {
    const selectedCategories = getSelectedValues("#categoryFilters input");
    const selectedEditions = getSelectedValues(".edition-filters input[type='checkbox']");
    const maxPrice = Number(priceRange.value);

    const filtered = products.filter((product) => {
      const productCategory = normalizeValue(product.category);
      const productEditions = Array.isArray(product.editions)
        ? product.editions.map(normalizeValue)
        : [];
      const productPrice = parsePrice(product.price);
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(productCategory);
      const editionMatch =
        selectedEditions.length === 0 ||
        productEditions.some((edition) => selectedEditions.includes(edition));
      const priceMatch = productPrice <= maxPrice;
      return categoryMatch && editionMatch && priceMatch;
    });

    grid.innerHTML = "";
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state">No products match these filters.</div>`;
    }
    filtered.forEach((product) => {
      const price = parsePrice(product.price);
      const editions = Array.isArray(product.editions) && product.editions.length > 0
        ? product.editions
        : ["Home Kit"];
      const strike = getStrikePrice(price);
      const badge = getDiscountLabel(price);
      const card = document.createElement("div");
      card.className = "product-card";
      const editionOptions = editions
        .map((edition) => `<option value="${edition}">${edition}</option>`)
        .join("");
      card.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}" />
          <span class="product-badge">${badge}</span>
        </div>
        <h3 class="product-title">${product.title}</h3>
        <div class="price-old">${formatPrice(strike)}</div>
        <div class="price-from">From ${formatPrice(price)}</div>
        <select class="edition-select">${editionOptions}</select>
        <button class="primary-btn full-btn" data-add="${product.id}">Add to cart</button>
      `;
      grid.appendChild(card);
    });

    resultsCount.textContent = `${filtered.length} items`;

    grid.querySelectorAll("[data-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const edition = button.parentElement.querySelector(".edition-select").value;
        addToCart(button.dataset.add, edition);
        updateCartUI();
      });
    });
  };

  const attachFilterListeners = () => {
    document.querySelectorAll(".filters input").forEach((input) => {
      input.addEventListener("change", renderProducts);
    });
    priceRange.addEventListener("input", () => {
      priceValue.textContent = formatPrice(Number(priceRange.value));
      renderProducts();
    });
  };

  clearFilters.addEventListener("click", () => {
    document.querySelectorAll(".filters input[type='checkbox']").forEach((input) => {
      input.checked = false;
    });
    priceRange.value = highestPrice;
    priceValue.textContent = formatPrice(highestPrice);
    renderProducts();
  });

  attachFilterListeners();
  renderProducts();
});
