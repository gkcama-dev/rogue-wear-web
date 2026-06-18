const PRODUCTS = [
    { id: 'tee-yaksha', name: 'Yaksha Cyberpunk Tee', category: 'oversized-tees', categoryLabel: 'Oversized Tee', price: 3800, image: 'assets/images/tee_yaksha.png', badge: 'Best Seller', rating: 4.9, reviews: 42, description: 'Heavyweight 260GSM premium cotton.' },
    { id: 'tee-colombo', name: 'Colombo Souls Type Tee', category: 'oversized-tees', categoryLabel: 'Oversized Tee', price: 3200, image: 'assets/images/tee_colombo.png', badge: 'New Drop', rating: 4.7, reviews: 28, description: '240GSM drop shoulder t-shirt.' },
    { id: 'tee-cyber', name: 'Neon Shadows Skull Tee', category: 'oversized-tees', categoryLabel: 'Oversized Tee', price: 3500, image: 'assets/images/tee_cyber.png', badge: 'Hot Product', rating: 4.8, reviews: 35, description: 'Futuristic streetwear oversized tee.' },
    { id: 'tee-minimal', name: 'Rogue Heavyweight Tee', category: 'oversized-tees', categoryLabel: 'Minimal Tee', price: 2900, image: 'assets/images/tee_minimal.png', badge: 'Essentials', rating: 4.6, reviews: 19, description: 'Pure organic combed heavyweight cotton.' },
    { id: 'hoodie-cyber', name: 'Cybernetic Violet Hoodie', category: 'graphic-hoodies', categoryLabel: 'Street Hoodie', price: 6500, image: 'assets/images/hoodie.png', badge: 'Limited Drop', rating: 5.0, reviews: 14, description: 'Ultra-heavy 400GSM organic cotton hoodie.' },
    { id: 'cargo-pants', name: 'Tech Utility Cargo Pants', category: 'cargo-pants', categoryLabel: 'Tech Cargo', price: 5800, image: 'assets/images/cargo.png', badge: 'Utility', rating: 4.8, reviews: 22, description: 'Water-resistant ripstop techwear cargo pants.' }
];

const safeStorage = {
    getItem(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    setItem(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
};

let cart = [], wishlist = [], activeCategory = 'all';

function initApp() {
    initThemeToggle();
    initCountdownTimer();
    renderProducts();
    initSideDrawers();
    initCouponCopy();
    initSearchOverlay();
    initNewsletterForm();
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        safeStorage.setItem('rogue_theme', isDark ? 'dark' : 'light');
    });
}

function initCountdownTimer() {
    const h = document.getElementById('timer-hours'), m = document.getElementById('timer-mins'), s = document.getElementById('timer-secs');
    if (!h) return;
    setInterval(() => {
        let diff = 50000; // static demo countdown step
        h.textContent = "14"; m.textContent = "32"; s.textContent = String(Math.floor(Date.now()/1000)%60).padStart(2,'0');
    }, 1000);
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return; grid.innerHTML = '';
    const filtered = activeCategory === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-brand-card p-4 rounded-custom-lg border border-brand-border flex flex-col justify-between';
        card.innerHTML = `
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-brand-gray-bg mb-4">
                <img src="${product.image}" class="w-full h-full object-cover">
            </div>
            <h4 class="font-syne text-md font-bold text-brand-dark">${product.name}</h4>
            <div class="flex items-center justify-between mt-4">
                <div class="font-outfit text-base font-bold text-brand-dark">LKR ${product.price}</div>
                <button onclick="addToCart('${product.id}')" class="bg-black text-white px-3 py-1.5 text-xs rounded-xl hover:bg-brand-pink cursor-pointer">+</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.filterCategory = function(cat, tab) {
    activeCategory = cat;
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('bg-brand-dark', 'text-brand-light'));
    tab.classList.add('bg-brand-dark', 'text-brand-light');
    renderProducts();
};

function initSideDrawers() {
    const cBtn = document.getElementById('nav-cart-btn'), cClose = document.getElementById('close-cart-btn'), cDrawer = document.getElementById('cart-drawer');
    const wBtn = document.getElementById('nav-wishlist-btn'), wClose = document.getElementById('close-wishlist-btn'), wDrawer = document.getElementById('wishlist-drawer');
    const overlay = document.getElementById('drawer-overlay');

    if (cBtn && cDrawer && overlay) {
        cBtn.addEventListener('click', () => { cDrawer.classList.remove('translate-x-full'); overlay.classList.remove('hidden'); });
        cClose.addEventListener('click', () => { cDrawer.classList.add('translate-x-full'); overlay.classList.add('hidden'); });
        wBtn.addEventListener('click', () => { wDrawer.classList.remove('translate-x-full'); overlay.classList.remove('hidden'); });
        wClose.addEventListener('click', () => { wDrawer.classList.add('translate-x-full'); overlay.classList.remove('hidden'); });
        overlay.addEventListener('click', () => { cDrawer.classList.add('translate-x-full'); wDrawer.classList.add('translate-x-full'); overlay.classList.add('hidden'); });
    }
}

window.addToCart = function(id) {
    cart.push({ id, quantity: 1, size: 'L' });
    document.querySelectorAll('.cart-count-badge').forEach(b => { b.textContent = cart.length; b.classList.remove('hidden'); });
    alert('Added to syndicate drop cart.');
};

function initCouponCopy() {
    const box = document.getElementById('coupon-code-box');
    if (box) box.addEventListener('click', () => { navigator.clipboard.writeText("ROGUE10"); alert('Promo code copied!'); });
}

function initSearchOverlay() {
    const open = document.getElementById('nav-search-btn'), close = document.getElementById('close-search-btn'), layer = document.getElementById('search-overlay');
    if (open) {
        open.addEventListener('click', () => layer.classList.remove('hidden'));
        close.addEventListener('click', () => layer.classList.add('hidden'));
    }
}

function initNewsletterForm() {
    const f = document.getElementById('newsletter-form');
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); alert('Subscribed to Syndicate Drops!'); f.reset(); });
}

window.checkoutCart = function() { alert('Mock API Payment Successful!'); cart = []; document.querySelectorAll('.cart-count-badge').forEach(b => b.classList.add('hidden')); document.getElementById('close-cart-btn').click(); };

document.addEventListener('DOMContentLoaded', initApp);