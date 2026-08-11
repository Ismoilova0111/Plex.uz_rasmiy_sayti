/* ==========================================================================
   PLEX_UZ E-COMMERCE INTERACTIVE LOGIC & GEMINI AI CHAT WIDGET
   Cart Drawer, Quick View Modal, Toast Notifications, Gemini AI Client
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE MANAGEMENT ---
  let cart = [];
  let wishlist = new Set();
  let activeCoupon = null;
  const DISCOUNT_RATE = 0.10; // 10% discount for Plex 10

  // Product Database for Quick View & Details
  const productsDb = {
    'silkplex-set': {
      id: 'silkplex-set',
      name: 'SilkPlex™ Silk & Vitamin Namlantiruvchi To\'plam',
      price: 320000,
      oldPrice: 400000,
      img: 'assets/media_1785779094475.jpg',
      volume: 'Shampoo 380ml + Conditioner 380ml + Serum 100ml',
      formula: 'USA Formulated Silk & Vitamins',
      desc: 'Silk oqsillari va vitaminlar bilan boyitilgan to\'plam sochlarni chuqur namlaydi, hurpayish va qattiqlikni yo\'qotadi hamda 230°C issiqlikdan himoya qiladi.',
      benefits: ['100% Termo-himoya', 'Ipakdek yaltirash', 'Suvsizlanishni to\'xtatish', 'Oson taralish']
    },
    'keraplex-set': {
      id: 'keraplex-set',
      name: 'KeraPlex™ Silk & Keratin Renewing To\'plam',
      price: 340000,
      oldPrice: 420000,
      img: 'assets/media_1785779094480.jpg',
      volume: 'Shampoo 380ml + Conditioner 380ml + Serum 100ml',
      formula: 'USA Formulated Silk & Keratin Complex',
      desc: 'Bo\'yalgan, kraskadan rangi o\'zgargan va zararlangan sochlar uchun maxsus keratin qayta tiklash formulasi. Rang yorqinligini saqlaydi va sinuvchanlikni davolaydi.',
      benefits: ['Bo\'yalgan soch rangini saqlash', 'Keratin zanjirini tiklash', '230°C Termo-zashita', 'Egiluvchanlik berish']
    },
    'arganplex-set': {
      id: 'arganplex-set',
      name: 'ArganPlex™ Silk & Argan Oil Oziqlantiruvchi To\'plam',
      price: 330000,
      oldPrice: 410000,
      img: 'assets/media_1785779094512.jpg',
      volume: 'Shampoo 380ml + Conditioner 380ml + Serum 100ml',
      formula: 'USA Formulated Cold-Pressed Argan Oil',
      desc: 'Quruq va suvsizlangan sochlarga chuqur ozuqa beruvchi Morokko Argan moyi va Ipak peptidlar majmuasi. Sochni ipakdek silliq va ko\'zgu dek yaltiroq qiladi.',
      benefits: ['Chuqur oziqlantirish', 'Suvsizlanishga qarshi', 'Yaltirash va silliqlik', 'Bosh terisi parvarishi']
    },
    'manplex-3in1': {
      id: 'manplex-3in1',
      name: 'ManPlex™ 3-in-1 Shampoo, Conditioner & Body Wash',
      price: 160000,
      oldPrice: 210000,
      img: 'assets/manplex_hero.jpg',
      volume: 'Aloe Vera & Krapiva ekstrakti — 380 ml',
      formula: 'USA Formulated Male Care Formula',
      desc: 'Erkaklar uchun 3 in 1 universal shampun, konditsioner va dush geli. Sochni chuqur tozalaydi, o\'sishini quvvatlaydi, va badanga tetiklik beradi.',
      benefits: ['Soch to\'kilishiga qarshi', 'Vaqt va pulni tejaydi', 'Sayohat uchun qulay', 'Kun bo\'yi xushbo\'ylik']
    }
  };

  // --- GEMINI AI CHAT WIDGET CLIENT LOGIC ---
  const aiChatToggleBtn = document.getElementById('aiChatToggleBtn');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const aiChatInput = document.getElementById('aiChatInput');
  const aiSendBtn = document.getElementById('aiSendBtn');

  if (aiChatToggleBtn && aiChatWindow) {
    aiChatToggleBtn.addEventListener('click', () => {
      aiChatWindow.classList.toggle('active');
      if (aiChatWindow.classList.contains('active')) {
        aiChatInput.focus();
      }
    });

    aiChatCloseBtn?.addEventListener('click', () => {
      aiChatWindow.classList.remove('active');
    });

    function appendMessage(text, sender = 'bot') {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-message ${sender}`;
      msgDiv.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
      aiChatMessages.appendChild(msgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    async function sendAiMessage(messageText) {
      if (!messageText) return;
      
      appendMessage(messageText, 'user');
      aiChatInput.value = '';

      // Typing Indicator
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-message bot typing';
      typingDiv.innerHTML = `<div class="msg-bubble"><em>Javob tayyorlanmoqda... ✨</em></div>`;
      aiChatMessages.appendChild(typingDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText })
        });
        
        typingDiv.remove();

        if (response.ok) {
          const data = await response.json();
          appendMessage(data.message, 'bot');
        } else {
          appendMessage("Server ulanishida xatolik yuz berdi. Backend server running ekanligini tekshiring.", 'bot');
        }
      } catch (err) {
        typingDiv.remove();
        appendMessage("Ulanish xatosi. Iltimos, Flask server (python app.py) ishga tushirilganligini va 5000-portda ishlayotganini tekshiring.", 'bot');
      }
    }

    aiSendBtn?.addEventListener('click', () => {
      sendAiMessage(aiChatInput.value.trim());
    });

    aiChatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendAiMessage(aiChatInput.value.trim());
      }
    });

    // Handle suggestion chips
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-chip');
      if (chip) {
        const msg = chip.dataset.msg;
        sendAiMessage(msg);
      }
    });
  }

  // --- UI ELEMENTS ---
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBody = document.getElementById('cartBody');
  const cartCountEl = document.querySelector('.cart-count');
  const wishlistCountEl = document.querySelector('.wishlist-count');
  const subtotalVal = document.getElementById('subtotalVal');
  const discountVal = document.getElementById('discountVal');
  const totalVal = document.getElementById('totalVal');
  const discountRow = document.getElementById('discountRow');
  const couponInput = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // --- TOAST FUNCTION ---
  function showToast(message, icon = 'fa-circle-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- CART FUNCTIONS ---
  function toggleCart(show) {
    if (show) {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
    } else {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    }
  }

  cartBtn?.addEventListener('click', () => toggleCart(true));
  closeCartBtn?.addEventListener('click', () => toggleCart(false));
  cartOverlay?.addEventListener('click', () => toggleCart(false));

  function addToCart(id, name, price, img) {
    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ id, name, price: Number(price), img, qty: 1 });
    }
    updateCartUI();
    showToast(`"${name}" savatga qo'shildi!`);
    toggleCart(true);
  }

  // Delegate Add to Cart Click
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const { id, name, price, img } = addBtn.dataset;
      addToCart(id, name, price, img);
    }

    const wishBtn = e.target.closest('.wishlist-heart-btn');
    if (wishBtn) {
      wishBtn.classList.toggle('active');
      const icon = wishBtn.querySelector('i');
      if (wishBtn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        wishlist.add(wishBtn);
        showToast('Saralanganlarga qo\'shildi!', 'fa-heart');
      } else {
        icon.className = 'fa-regular fa-heart';
        wishlist.delete(wishBtn);
      }
      wishlistCountEl.textContent = wishlist.size;
    }
  });

  function updateCartUI() {
    cartBody.innerHTML = '';

    if (cart.length === 0) {
      cartBody.innerHTML = '<p class="cart-empty-text">Savat hali bo\'sh. Mahsulotlarni tanlang!</p>';
      cartCountEl.textContent = '0';
      subtotalVal.textContent = '0 so\'m';
      totalVal.textContent = '0 so\'m';
      if (discountRow) discountRow.classList.add('hidden');
      return;
    }

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.style.cssText = 'display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #eee;';
      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
        <div style="flex-grow:1;">
          <h4 style="font-size:0.9rem; margin-bottom:4px;">${item.name}</h4>
          <span style="font-weight:700; color:var(--brand-dark-cream);">${(item.price).toLocaleString()} so'm</span>
          <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
            <button class="qty-minus" data-id="${item.id}" style="padding:2px 8px; border:1px solid #ccc; border-radius:4px;">-</button>
            <span>${item.qty}</span>
            <button class="qty-plus" data-id="${item.id}" style="padding:2px 8px; border:1px solid #ccc; border-radius:4px;">+</button>
          </div>
        </div>
        <button class="item-remove" data-id="${item.id}" style="color:#e74c3c;"><i class="fa-solid fa-trash"></i></button>
      `;
      cartBody.appendChild(itemEl);
    });

    cartCountEl.textContent = totalItems;

    let discount = 0;
    if (activeCoupon === 'PLEX 10' || activeCoupon === 'PLEX10') {
      discount = subtotal * DISCOUNT_RATE;
      if (discountRow) discountRow.classList.remove('hidden');
      if (discountVal) discountVal.textContent = `-${discount.toLocaleString()} so'm`;
    }

    const grandTotal = subtotal - discount;
    subtotalVal.textContent = `${subtotal.toLocaleString()} so'm`;
    totalVal.textContent = `${grandTotal.toLocaleString()} so'm`;
  }

  // Cart quantity controls
  cartBody.addEventListener('click', (e) => {
    const minusBtn = e.target.closest('.qty-minus');
    const plusBtn = e.target.closest('.qty-plus');
    const removeBtn = e.target.closest('.item-remove');

    if (minusBtn) {
      const id = minusBtn.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      }
      updateCartUI();
    }

    if (plusBtn) {
      const id = plusBtn.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) item.qty += 1;
      updateCartUI();
    }

    if (removeBtn) {
      const id = removeBtn.dataset.id;
      cart = cart.filter(i => i.id !== id);
      updateCartUI();
    }
  });

  // Apply Coupon Code
  applyCouponBtn?.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    if (code === 'PLEX 10' || code === 'PLEX10') {
      activeCoupon = 'PLEX10';
      showToast('10% Chegirma muvaffaqiyatli qo\'llandi!', 'fa-tags');
      updateCartUI();
    } else if (code === '') {
      showToast('Promo-kodni kiriting!', 'fa-triangle-exclamation');
    } else {
      showToast('Noto\'g\'ri promo-kod kiritildi', 'fa-circle-xmark');
    }
  });

  // Telegram Checkout
  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Savatingiz bo\'sh!', 'fa-triangle-exclamation');
      return;
    }

    let message = `*Plex_uz Yangi Buyurtma:*%0A%0A`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* x ${item.qty} dona - ${(item.price * item.qty).toLocaleString()} so'm%0A`;
    });

    if (activeCoupon === 'PLEX10' || activeCoupon === 'PLEX 10') {
      message += `%0A*Promo-kod:* Plex 10 (-10%%20Chegirma)%0A`;
    }

    message += `%0A*Yakuniy Summa:* ${totalVal.textContent}%0A*Yetkazib berish:* Bepul (O'zbekiston)%0A%0AIltimos, buyurtmani tasdiqlash uchun aloqaga chiqing!`;

    const telegramUrl = `https://t.me/plex_uz_bot?text=${message}`;
    window.open(telegramUrl, '_blank');
  });

});
