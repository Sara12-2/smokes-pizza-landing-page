(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav-links');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  document.querySelector('#year').textContent = new Date().getFullYear();

  /* ---------------- Toast ---------------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  /* ---------------- Cart ---------------- */
  const CART_KEY = 'smokes_cart';
  const WHATSAPP_NUMBER = '923034520333';

  const getStoredCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  };
  const saveCart = () => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ }
  };

  let cart = getStoredCart();

  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountEl = document.getElementById('cart-count');

  function renderCart() {
    if (!cartItemsEl) return;
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    let total = 0;
    let count = 0;

    cart.forEach((item, idx) => {
      total += item.priceNum * item.qty;
      count += item.qty;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item__info"><strong>${item.name}</strong><span>${item.priceLabel} each</span></div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-idx="${idx}" data-action="dec" aria-label="Decrease quantity">&minus;</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-idx="${idx}" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item__remove" data-idx="${idx}" data-action="remove" aria-label="Remove ${item.name}">&times;</button>`;
      cartItemsEl.insertBefore(row, cartEmptyEl);
    });

    if (cartEmptyEl) cartEmptyEl.style.display = cart.length ? 'none' : 'block';
    if (cartTotalEl) cartTotalEl.textContent = 'Rs. ' + total.toLocaleString();
    if (cartCountEl) {
      cartCountEl.textContent = String(count);
      cartCountEl.style.display = count ? 'flex' : 'none';
    }
    saveCart();
  }

  function openCart() {
    cartDrawer?.classList.add('is-open');
    cartOverlay?.classList.add('is-open');
    cartDrawer?.setAttribute('aria-hidden', 'false');
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
  function closeCart() {
    cartDrawer?.classList.remove('is-open');
    cartOverlay?.classList.remove('is-open');
    cartDrawer?.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  document.querySelectorAll('.food-card__order[data-name]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const priceLabel = btn.dataset.price;
      const priceNum = parseFloat(btn.dataset.priceNum) || 0;
      const existing = cart.find((i) => i.name === name);
      if (existing) existing.qty += 1;
      else cart.push({ name, priceLabel, priceNum, qty: 1 });
      renderCart();
      showToast(`${name} added to your order`);
      openCart();
    });
  });

  cartItemsEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-idx]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === 'remove') cart.splice(idx, 1);
    else if (btn.dataset.action === 'inc') cart[idx].qty += 1;
    else if (btn.dataset.action === 'dec') {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    renderCart();
  });

  document.getElementById('cart-clear')?.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  document.getElementById('cart-checkout')?.addEventListener('click', () => {
    if (!cart.length) {
      showToast('Your cart is empty');
      return;
    }
    let message = "Hi Smoke's! I'd like to order:\n";
    cart.forEach((i) => { message += `• ${i.qty} x ${i.name} (${i.priceLabel})\n`; });
    const total = cart.reduce((s, i) => s + i.priceNum * i.qty, 0);
    message += `\nEstimated total: Rs. ${total.toLocaleString()}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  renderCart();
})();
