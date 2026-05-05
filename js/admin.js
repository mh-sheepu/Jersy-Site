document.addEventListener("DOMContentLoaded", () => {
  if (!window.VoidApparelStore) return;

  const {
    loadProducts,
    saveProducts,
    loadDeliveryCharges,
    saveDeliveryCharges
  } = window.VoidApparelStore;

  const form = document.getElementById("productForm");
  const titleInput = document.getElementById("titleInput");
  const priceInput = document.getElementById("priceInput");
  const comparePriceInput = document.getElementById("comparePriceInput");
  const categoryInput = document.getElementById("categoryInput");
  const imageInput = document.getElementById("imageInput");
  const imageInput2 = document.getElementById("imageInput2");
  const imageInput3 = document.getElementById("imageInput3");
  const topSellingInput = document.getElementById("topSellingInput");
  const saveButton = document.getElementById("saveButton");
  const cancelEdit = document.getElementById("cancelEdit");
  const tableBody = document.getElementById("adminTableBody");
  const uploadStatus = document.getElementById("uploadStatus");
  const productCount = document.getElementById("productCount");
  const deliveryForm = document.getElementById("deliveryForm");
  const insideDhakaCharge = document.getElementById("insideDhakaCharge");
  const outsideDhakaCharge = document.getElementById("outsideDhakaCharge");
  const deliveryStatus = document.getElementById("deliveryStatus");

  if (!form || !tableBody) return;

  let editingId = null;

  const resetForm = () => {
    form.reset();
    editingId = null;
    saveButton.textContent = "Add product";
    cancelEdit.hidden = true;
  };

  const getEditions = () =>
    Array.from(form.querySelectorAll("fieldset input[type='checkbox']"))
      .filter((input) => input.checked)
      .map((input) => input.value);

  const showStatus = (message) => {
    uploadStatus.textContent = message;
    setTimeout(() => {
      uploadStatus.textContent = "";
    }, 2500);
  };

  const showDeliveryStatus = (message) => {
    if (!deliveryStatus) return;
    deliveryStatus.textContent = message;
    setTimeout(() => {
      deliveryStatus.textContent = "";
    }, 2500);
  };

  const renderTable = () => {
    const products = loadProducts();
    tableBody.innerHTML = "";
    productCount.textContent = `${products.length} products`;

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Title">${product.title}</td>
        <td data-label="Price">TK ${product.price.toFixed(2)}</td>
        <td data-label="Category">${product.category}</td>
        <td data-label="Editions">${product.editions.join(", ")}</td>
        <td data-label="Actions" class="admin-actions-cell">
          <button class="ghost-btn" data-edit="${product.id}">Edit</button>
          <button class="ghost-btn" data-delete="${product.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    tableBody.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => startEdit(button.dataset.edit));
    });
    tableBody.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteProduct(button.dataset.delete));
    });
  };

  const startEdit = (id) => {
    const products = loadProducts();
    const product = products.find((item) => item.id === id);
    if (!product) return;

    editingId = id;
    titleInput.value = product.title;
    priceInput.value = product.price;
    if (comparePriceInput) {
      comparePriceInput.value = Number.isFinite(product.comparePrice)
        ? product.comparePrice
        : "";
    }
    categoryInput.value = product.category;
    const images = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);
    imageInput.value = images[0] || "";
    imageInput2.value = images[1] || "";
    imageInput3.value = images[2] || "";
    topSellingInput.checked = product.topSelling;

    form.querySelectorAll("fieldset input[type='checkbox']").forEach((input) => {
      input.checked = product.editions.includes(input.value);
    });

    saveButton.textContent = "Update product";
    cancelEdit.hidden = false;
  };

  const deleteProduct = (id) => {
    const products = loadProducts().filter((product) => product.id !== id);
    saveProducts(products);
    renderTable();
    showStatus("Product deleted");
  };

  cancelEdit.addEventListener("click", resetForm);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const products = loadProducts();
    const editions = getEditions();
    const compareValue = comparePriceInput ? comparePriceInput.value.trim() : "";
    const comparePrice = compareValue ? Number(compareValue) : null;
    const images = [imageInput.value, imageInput2.value, imageInput3.value]
      .map((value) => value.trim())
      .filter(Boolean);
    if (editions.length === 0) {
      showStatus("Select at least one edition");
      return;
    }

    const productData = {
      id: editingId || `${titleInput.value.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: titleInput.value.trim(),
      price: Number(priceInput.value),
      comparePrice,
      category: categoryInput.value.trim(),
      editions,
      image: images[0],
      images,
      topSelling: topSellingInput.checked
    };

    if (editingId) {
      const updated = products.map((product) =>
        product.id === editingId ? productData : product
      );
      saveProducts(updated);
      showStatus("Product updated OK");
    } else {
      products.push(productData);
      saveProducts(products);
      showStatus("Product uploaded OK");
    }

    renderTable();
    resetForm();
  });

  renderTable();

  if (deliveryForm && insideDhakaCharge && outsideDhakaCharge && loadDeliveryCharges) {
    const charges = loadDeliveryCharges();
    insideDhakaCharge.value = charges.insideDhaka;
    outsideDhakaCharge.value = charges.outsideDhaka;

    deliveryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!saveDeliveryCharges) return;
      const inside = Number(insideDhakaCharge.value) || 0;
      const outside = Number(outsideDhakaCharge.value) || 0;
      saveDeliveryCharges({ insideDhaka: inside, outsideDhaka: outside });
      showDeliveryStatus("Delivery charges saved");
    });
  }
});
