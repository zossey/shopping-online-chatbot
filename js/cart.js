// ===========================
// SHOPMATE — Cart Logic
// ===========================

let cart = JSON.parse(localStorage.getItem('shopmate_cart') || '[]');

function saveCart() {
  localStorage.setItem('shopmate_cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  updateBadge();
  showToast(`✅ ${product.name} ditambahkan ke keranjang!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  updateBadge();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  renderCart();
  updateBadge();
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Keranjang masih kosong</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Hapus">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');

  totalEl.textContent = formatRupiah(getTotal());
  footer.style.display = 'block';
}

function updateBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function checkout() {
  if (cart.length === 0) {
    showToast('⚠️ Keranjang masih kosong!');
    return;
  }

  const WA_NUMBER = '6281264513583';

  let msg = `Halo SHOPMATE! 👋\n\nSaya ingin memesan:\n\n`;
  cart.forEach((item, i) => {
    msg += `${i + 1}. ${item.emoji} *${item.name}*\n`;
    msg += `   Jumlah: ${item.qty} x ${formatRupiah(item.price)}\n`;
    msg += `   Subtotal: ${formatRupiah(item.price * item.qty)}\n\n`;
  });
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL: ${formatRupiah(getTotal())}*\n\n`;
  msg += `Mohon konfirmasi ketersediaan dan metode pembayaran. Terima kasih! 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
