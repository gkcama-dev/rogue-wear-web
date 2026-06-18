// Rogue Wear | Dynamic Core Script

const PRODUCTS = [
    { id: 'tee-yaksha', name: 'Yaksha Cyberpunk Tee', category: 'oversized-tees', categoryLabel: 'Oversized Tee', price: 3800, image: 'assets/images/tee_yaksha.png', badge: 'Best Seller', rating: 4.9, reviews: 42, description: 'Heavyweight 260GSM 100% premium cotton.' },
    { id: 'tee-colombo', name: 'Colombo Souls Type Tee', category: 'oversized-tees', categoryLabel: 'Oversized Tee', price: 3200, image: 'assets/images/tee_colombo.png', badge: 'New Drop', rating: 4.7, reviews: 28, description: '240GSM drop shoulder t-shirt.' }
];

const safeStorage = {
    getItem(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    setItem(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
};

let cart = [];

function initApp() {
    initThemeToggle();
    renderProducts();
    initSideDrawers();
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        safeStorage.setItem('rogue_theme', isDark ? 'dark' : 'light');
    });
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    PRODUCTS.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-brand-card p-4 rounded-custom-lg border border-brand-border shadow-sm flex flex-col justify-between';
        card.innerHTML = `
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-brand-gray-bg mb-4">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <h4 class="font-syne text-md font-bold text-brand-dark">${product.name}</h4>
            <div class="font-outfit text-base font-bold text-brand-dark mt-2">LKR ${product.price}</div>
            <button onclick="addToCart('${product.id}')" class="mt-3 w-full bg-black text-white text-xs font-bold py-2 rounded-xl hover:bg-brand-pink transition-colors">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

function initSideDrawers() {
    const cartBtn = document.getElementById('nav-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('drawer-overlay');

    if(cartBtn && cartDrawer && overlay) {
        cartBtn.addEventListener('click', () => {
            cartDrawer.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
        });
        closeCartBtn.addEventListener('click', () => {
            cartDrawer.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        });
    }
}

window.addToCart = function(id) {
    cart.push({id, quantity: 1});
    const badge = document.querySelector('.cart-count-badge');
    if(badge) { badge.textContent = cart.length; badge.classList.remove('hidden'); }
    alert('Item added to cart!');
};

window.checkoutCart = function() {
    alert('Thank you for shopping with Rogue Wear!');
    cart = [];
    document.querySelector('.cart-count-badge').classList.add('hidden');
    document.getElementById('close-cart-btn').click();
};

document.addEventListener('DOMContentLoaded', initApp);