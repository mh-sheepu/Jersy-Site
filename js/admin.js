document.addEventListener("DOMContentLoaded", () => {
  if (!window.VoidApparelStore) return;

  const { loadProducts, saveProducts } = window.VoidApparelStore;

  const form = document.getElementById("productForm");
  const titleInput = document.getElementById("titleInput");
  const priceInput = document.getElementById("priceInput");
  const categoryInput = document.getElementById("categoryInput");
  const imageInput = document.getElementById("imageInput");
  const topSellingInput = document.getElementById("topSellingInput");
  const saveButton = document.getElementById("saveButton");
  const cancelEdit = document.getElementById("cancelEdit");
  const tableBody = document.getElementById("adminTableBody");
  const uploadStatus = document.getElementById("uploadStatus");
  const productCount = document.getElementById("productCount");

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

  const renderTable = () => {
    const products = loadProducts();
    tableBody.innerHTML = "";
    productCount.textContent = `${products.length} products`;

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.title}</td>
        <td>TK ${product.price.toFixed(2)}</td>
        <td>${product.category}</td>
        <td>${product.editions.join(", ")}</td>
        <td>
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
    categoryInput.value = product.category;
    imageInput.value = product.image;
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
    if (editions.length === 0) {
      showStatus("Select at least one edition");
      return;
    }

    const productData = {
      id: editingId || `${titleInput.value.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: titleInput.value.trim(),
      price: Number(priceInput.value),
      category: categoryInput.value.trim(),
      editions,
      image: imageInput.value.trim(),
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
});
