// ===========================
// SHOPMATE — App Init
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  renderCart();
  updateBadge();
  initFilters();
});

// ===== Render Products =====
function renderProducts(category) {
  const grid = document.getElementById('productsGrid');
  const filtered = category === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:40px 0;">Tidak ada produk dalam kategori ini.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card" data-category="${product.category}">
      <div class="product-img">${product.emoji}</div>
      <div class="product-body">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.desc}</div>
        <div class="product-rating">
          ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
          <span style="color:var(--gray-500)">${product.rating} (${product.reviews})</span>
        </div>
        <div class="product-price">${formatRupiah(product.price)}</div>
        <button class="btn-add-cart" onclick="addToCart(${product.id})">
          <i class="fa-solid fa-cart-plus"></i> Tambah ke Keranjang
        </button>
      </div>
    </div>
  `).join('');
}

// ===== Filter Buttons =====
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      renderProducts(category);
    });
  });
}
