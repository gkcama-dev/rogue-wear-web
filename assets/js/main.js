// Rogue Wear | main.js

// Mock Products Database
const PRODUCTS = [
    {
        id: 'tee-yaksha',
        name: 'Yaksha Cyberpunk Tee',
        category: 'oversized-tees',
        categoryLabel: 'Oversized Tee',
        price: 3800,
        image: 'assets/image/tee_yaksha.png',
        badge: 'Best Seller',
        rating: 4.9,
        reviews: 42,
        description: 'Heavyweight 260GSM 100% premium cotton oversized t-shirt. Features a vibrant cyber-neon neo-traditional Sri Lankan Yaksha mask graphic print on the back.'
    },
    {
        id: 'tee-colombo',
        name: 'Colombo Souls Type Tee',
        category: 'oversized-tees',
        categoryLabel: 'Oversized Tee',
        price: 3200,
        image: 'assets/image/tee_colombo.png',
        badge: 'New Drop',
        rating: 4.7,
        reviews: 28,
        description: '240GSM drop shoulder t-shirt. Minimalist front print with futuristic graphic layout and Colombo coordinates typography on the back.'
    },
    {
        id: 'tee-cyber',
        name: 'Neon Shadows Skull Tee',
        category: 'oversized-tees',
        categoryLabel: 'Oversized Tee',
        price: 3500,
        image: 'assets/image/tee_cyber.png',
        badge: 'Hot Product',
        rating: 4.8,
        reviews: 35,
        description: 'Futuristic streetwear oversized tee featuring an detailed glowing helmet skull graphic print, engineered for perfect boxy fit.'
    },
    {
        id: 'tee-minimal',
        name: 'Rogue Heavyweight Tee',
        category: 'oversized-tees',
        categoryLabel: 'Minimal Tee',
        price: 2900,
        image: 'assets/image/tee_minimal.png',
        badge: 'Essentials',
        rating: 4.6,
        reviews: 19,
        description: 'Pure organic combed heavyweight cotton t-shirt in concrete gray. Features clean, high-density black embroidered logo on the chest.'
    },
    {
        id: 'hoodie-cyber',
        name: 'Cybernetic Violet Hoodie',
        category: 'graphic-hoodies',
        categoryLabel: 'Street Hoodie',
        price: 6500,
        image: 'assets/image/hoodie.png',
        badge: 'Limited Drop',
        rating: 5.0,
        reviews: 14,
        description: 'Ultra-heavy 400GSM organic cotton hoodie in rich dark violet with neon magenta glowing embroidery accents. Double-layered hood.'
    },
    {
        id: 'cargo-pants',
        name: 'Tech Utility Cargo Pants',
        category: 'cargo-pants',
        categoryLabel: 'Tech Cargo',
        price: 5800,
        image: 'assets/image/cargo.png',
        badge: 'Utility',
        rating: 4.8,
        reviews: 22,
        description: 'Water-resistant ripstop techwear cargo pants with multiple utility buckle pockets, adjustable strap details, and tailored streetwear cuffs.'
    }
];

// Safe localStorage wrapper to prevent SecurityError in sandboxed or file:// environments
const safeStorage = {
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage.getItem blocked or unavailable:', e);
            return null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage.setItem blocked or unavailable:', e);
        }
    }
};

// App State Management (Safe initialization with Array validations)
let cart = [];
let wishlist = [];

try {
    const savedCart = safeStorage.getItem('rogue_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (e) {
    console.error('Failed to parse cart:', e);
    cart = [];
}

try {
    const savedWishlist = safeStorage.getItem('rogue_wishlist');
    wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (!Array.isArray(wishlist)) {
        wishlist = [];
    }
} catch (e) {
    console.error('Failed to parse wishlist:', e);
    wishlist = [];
}

// Initializer function with individual try-catch blocks
function initApp() {
    console.log("Initializing Rogue Wear app...");
    
    const initializers = [
        { name: 'Reveal Animations', fn: initRevealAnimations },
        { name: 'Countdown Timer', fn: initCountdownTimer },
        { name: 'Products Rendering', fn: renderProducts },
        { name: 'Side Drawers', fn: initSideDrawers },
        { name: 'Counters', fn: () => { updateCartCounter(); updateWishlistCounter(); } },
        { name: 'Coupon Copy', fn: initCouponCopy },
        { name: 'Search Overlay', fn: initSearchOverlay },
        { name: 'Mobile Menu', fn: initMobileMenu },
        { name: 'Newsletter Form', fn: initNewsletterForm }
    ];

    initializers.forEach(init => {
        try {
            init.fn();
        } catch (e) {
            console.error(`Failed to initialize ${init.name}:`, e);
        }
    });
}

// Safe DOM Load execution
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Already ready, execute immediately
    initApp();
} else {
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', initApp);
}

// --- 1. REVEAL ON SCROLL ---
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.01, // Very low threshold to trigger easily
        rootMargin: '0px 0px 100px 0px' // Trigger ahead of scroll
    });

    reveals.forEach(el => observer.observe(el));
    
    // Failsafe: Force reveal after short delay
    setTimeout(() => {
        reveals.forEach(el => {
            el.classList.add('revealed');
        });
    }, 800);
}

// --- 2. COUNTDOWN TIMER ---
function initCountdownTimer() {
    const hoursEl = document.getElementById('timer-hours');
    const minsEl = document.getElementById('timer-mins');
    const secsEl = document.getElementById('timer-secs');

    if (!hoursEl || !minsEl || !secsEl) return;

    let targetTime = safeStorage.getItem('rogue_timer_target');
    if (!targetTime) {
        targetTime = new Date().getTime() + (14 * 60 * 60 * 1000) + (32 * 60 * 1000) + (10 * 1000); // 14h 32m 10s
        safeStorage.setItem('rogue_timer_target', targetTime);
    } else {
        targetTime = parseInt(targetTime);
        if (isNaN(targetTime)) {
            targetTime = new Date().getTime() + (14 * 60 * 60 * 1000);
            safeStorage.setItem('rogue_timer_target', targetTime);
        }
    }

    function updateTimer() {
        const now = new Date().getTime();
        let diff = targetTime - now;

        // Reset target if expired
        if (diff <= 0) {
            targetTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            safeStorage.setItem('rogue_timer_target', targetTime);
            diff = targetTime - now;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(mins).padStart(2, '0');
        secsEl.textContent = String(secs).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// --- 3. RENDER PRODUCTS ---
let activeCategory = 'all';
let renderRetryCount = 0;

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) {
        // Failsafe: Retry in case DOM parsed after JS execution
        if (renderRetryCount < 10) {
            renderRetryCount++;
            setTimeout(renderProducts, 150);
        }
        return;
    }

    // Double check wishlist and cart types before rendering loop
    if (!Array.isArray(wishlist)) wishlist = [];
    if (!Array.isArray(cart)) cart = [];

    // Filter products
    const filtered = activeCategory === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === activeCategory);

    grid.innerHTML = '';

    filtered.forEach((product) => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = `reveal bg-white rounded-custom-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between streetwear-card`;
        
        card.innerHTML = `
            <div>
                <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group mb-4">
                    ${product.badge ? `<span class="absolute top-3 left-3 bg-black text-white text-[9px] font-syne uppercase tracking-wider font-bold px-3 py-1 rounded-full z-10">${product.badge}</span>` : ''}
                    <button onclick="toggleWishlist('${product.id}')" id="wishlist-btn-${product.id}" class="absolute top-3 right-3 w-9 h-9 bg-white text-black hover:text-[#FF3B97] rounded-full flex items-center justify-center shadow-sm z-10 transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5.5 w-5.5 ${isWishlisted ? 'fill-[#FF3B97] stroke-[#FF3B97]' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                    
                    <!-- Quick Add Hover Overlay -->
                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end hidden sm:flex">
                        <button onclick="addToCart('${product.id}')" class="w-full bg-white hover:bg-black hover:text-white text-black font-syne text-[11px] font-bold tracking-wider uppercase py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
                
                <div class="px-1">
                    <span class="text-[10px] text-gray-400 font-outfit uppercase tracking-wider font-semibold">${product.categoryLabel}</span>
                    <h4 class="font-syne text-md font-bold text-[#0A0A0A] mt-0.5 line-clamp-1 hover:text-[#FF3B97] cursor-pointer" onclick="openProductDetail('${product.id}')">${product.name}</h4>
                    <div class="flex items-center gap-1.5 text-xs mt-1">
                        <span class="text-[#FF3B97] font-bold">★ ${product.rating.toFixed(1)}</span>
                        <span class="text-gray-400">(${product.reviews} reviews)</span>
                    </div>
                </div>
            </div>

            <div class="px-1 mt-4 flex items-center justify-between">
                <div class="font-outfit text-base font-bold text-[#0A0A0A]">LKR ${product.price.toLocaleString()}</div>
                <!-- Mobile Only Add Button -->
                <button onclick="addToCart('${product.id}')" class="sm:hidden w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#FF3B97] transition-all cursor-pointer">
                    +
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    // Re-observe dynamic cards
    setTimeout(initRevealAnimations, 50);
}

// Category Filter Tabs
window.filterCategory = function(category, tabElement) {
    activeCategory = category;
    
    // Style active tab
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.classList.remove('bg-black', 'text-white');
        tab.classList.add('bg-white', 'text-black', 'border-gray-100');
    });

    tabElement.classList.remove('bg-white', 'text-black', 'border-gray-100');
    tabElement.classList.add('bg-black', 'text-white');

    renderProducts();
};

// --- 4. CART & WISHLIST DRAWERS ---
function initSideDrawers() {
    const cartBtn = document.getElementById('nav-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');

    const wishlistBtn = document.getElementById('nav-wishlist-btn');
    const closeWishlistBtn = document.getElementById('close-wishlist-btn');
    const wishlistDrawer = document.getElementById('wishlist-drawer');

    // Open Cart
    if (cartBtn && cartDrawer && drawerOverlay) {
        cartBtn.addEventListener('click', () => {
            cartDrawer.classList.remove('translate-x-full');
            drawerOverlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            renderCartItems();
        });
    }

    // Close Cart
    if (closeCartBtn && cartDrawer && drawerOverlay) {
        closeCartBtn.addEventListener('click', () => {
            cartDrawer.classList.add('translate-x-full');
            if (wishlistDrawer.classList.contains('translate-x-full')) {
                drawerOverlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }

    // Open Wishlist
    if (wishlistBtn && wishlistDrawer && drawerOverlay) {
        wishlistBtn.addEventListener('click', () => {
            wishlistDrawer.classList.remove('translate-x-full');
            drawerOverlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            renderWishlistItems();
        });
    }

    // Close Wishlist
    if (closeWishlistBtn && wishlistDrawer && drawerOverlay) {
        closeWishlistBtn.addEventListener('click', () => {
            wishlistDrawer.classList.add('translate-x-full');
            if (cartDrawer.classList.contains('translate-x-full')) {
                drawerOverlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }

    // Close both when clicking overlay
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', () => {
            if (cartDrawer) cartDrawer.classList.add('translate-x-full');
            if (wishlistDrawer) wishlistDrawer.classList.add('translate-x-full');
            drawerOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }
}

// Render Cart items inside drawer
function renderCartItems() {
    const listContainer = document.getElementById('cart-items-list');
    const summaryContainer = document.getElementById('cart-summary-box');
    
    if (!listContainer || !summaryContainer) return;

    if (!Array.isArray(cart) || cart.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h4 class="font-syne font-bold text-[#0A0A0A] text-lg">Your cart is empty</h4>
                <p class="text-xs text-gray-400 mt-1">Add items to get started on your streetwear style!</p>
            </div>
        `;
        summaryContainer.classList.add('hidden');
        return;
    }

    summaryContainer.classList.remove('hidden');
    listContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const prod = PRODUCTS.find(p => p.id === item.id);
        if (!prod) return;

        subtotal += prod.price * item.quantity;
        const itemLi = document.createElement('div');
        itemLi.className = 'flex items-center gap-4 py-4 border-b border-gray-100';
        itemLi.innerHTML = `
            <img src="${prod.image}" alt="${prod.name}" class="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0">
            <div class="flex-grow">
                <h5 class="font-syne text-sm font-bold text-[#0A0A0A] line-clamp-1">${prod.name}</h5>
                <span class="text-[10px] text-gray-400 font-outfit uppercase tracking-wider">${prod.categoryLabel} / ${item.size}</span>
                
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button onclick="changeCartQuantity('${item.id}', '${item.size}', -1)" class="px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100">-</button>
                        <span class="px-2 py-0.5 text-xs font-bold text-[#0A0A0A] font-outfit min-w-[20px] text-center">${item.quantity}</span>
                        <button onclick="changeCartQuantity('${item.id}', '${item.size}', 1)" class="px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100">+</button>
                    </div>
                    <span class="text-sm font-bold font-outfit text-[#0A0A0A]">LKR ${(prod.price * item.quantity).toLocaleString()}</span>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}', '${item.size}')" class="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;
        listContainer.appendChild(itemLi);
    });

    // Update Subtotal/Totals
    document.getElementById('cart-subtotal').textContent = `LKR ${subtotal.toLocaleString()}`;
    const shipping = subtotal > 15000 ? 'FREE' : 'LKR 350';
    document.getElementById('cart-shipping').textContent = shipping;
    
    const finalTotal = subtotal + (subtotal > 15000 || subtotal === 0 ? 0 : 350);
    document.getElementById('cart-total').textContent = `LKR ${finalTotal.toLocaleString()}`;
}

// Render Wishlist items inside drawer
function renderWishlistItems() {
    const listContainer = document.getElementById('wishlist-items-list');
    if (!listContainer) return;

    if (!Array.isArray(wishlist) || wishlist.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h4 class="font-syne font-bold text-[#0A0A0A] text-lg">Your wishlist is empty</h4>
                <p class="text-xs text-gray-400 mt-1">Save your favorite premium items here!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';

    wishlist.forEach(itemId => {
        const prod = PRODUCTS.find(p => p.id === itemId);
        if (!prod) return;

        const itemLi = document.createElement('div');
        itemLi.className = 'flex items-center gap-4 py-4 border-b border-gray-100';
        itemLi.innerHTML = `
            <img src="${prod.image}" alt="${prod.name}" class="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0">
            <div class="flex-grow">
                <h5 class="font-syne text-sm font-bold text-[#0A0A0A] line-clamp-1">${prod.name}</h5>
                <span class="text-[10px] text-gray-400 font-outfit uppercase tracking-wider">${prod.categoryLabel}</span>
                <div class="text-sm font-bold font-outfit text-[#0A0A0A] mt-1">LKR ${prod.price.toLocaleString()}</div>
            </div>
            <div class="flex flex-col gap-2">
                <button onclick="moveWishlistToCart('${prod.id}')" class="bg-black hover:bg-[#FF3B97] text-white text-[10px] font-syne font-semibold tracking-wider uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Buy
                </button>
                <button onclick="toggleWishlist('${prod.id}'); renderWishlistItems();" class="text-xs text-gray-400 hover:text-red-500 text-center font-outfit cursor-pointer">
                    Remove
                </button>
            </div>
        `;
        listContainer.appendChild(itemLi);
    });
}

// --- CART ACTIONS ---
window.addToCart = function(productId, size = 'L') {
    if (!Array.isArray(cart)) cart = [];
    
    const existing = cart.find(item => item.id === productId && item.size === size);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1, size: size });
    }

    saveCart();
    updateCartCounter();
    showToast('Success', 'Item added to your shopping cart.');
    
    // Automatically open drawer on larger screens
    if (window.innerWidth > 768) {
        document.getElementById('nav-cart-btn').click();
    }
};

window.removeFromCart = function(productId, size) {
    if (!Array.isArray(cart)) cart = [];
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    updateCartCounter();
    renderCartItems();
    showToast('Removed', 'Item removed from your shopping cart.');
};

window.changeCartQuantity = function(productId, size, change) {
    if (!Array.isArray(cart)) cart = [];
    const existing = cart.find(item => item.id === productId && item.size === size);
    if (!existing) return;

    existing.quantity += change;
    if (existing.quantity <= 0) {
        removeFromCart(productId, size);
    } else {
        saveCart();
        updateCartCounter();
        renderCartItems();
    }
};

window.moveWishlistToCart = function(productId) {
    // Add to cart in default size L
    addToCart(productId, 'L');
    // Remove from wishlist
    toggleWishlist(productId);
    // Refresh drawers if open
    renderWishlistItems();
};

function saveCart() {
    safeStorage.setItem('rogue_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const counters = document.querySelectorAll('.cart-count-badge');
    const totalQty = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    counters.forEach(badge => {
        badge.textContent = totalQty;
        if (totalQty > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// --- WISHLIST ACTIONS ---
window.toggleWishlist = function(productId) {
    if (!Array.isArray(wishlist)) wishlist = [];
    const index = wishlist.indexOf(productId);
    const btns = document.querySelectorAll(`[id^="wishlist-btn-${productId}"]`);
    
    let isAdded = false;

    if (index > -1) {
        wishlist.splice(index, 1);
        isAdded = false;
        showToast('Removed', 'Item removed from wishlist.');
    } else {
        wishlist.push(productId);
        isAdded = true;
        showToast('Added', 'Item saved to your wishlist.');
    }

    safeStorage.setItem('rogue_wishlist', JSON.stringify(wishlist));
    updateWishlistCounter();

    // Update hearts inside grids
    btns.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) {
            if (isAdded) {
                svg.classList.add('fill-[#FF3B97]', 'stroke-[#FF3B97]');
            } else {
                svg.classList.remove('fill-[#FF3B97]', 'stroke-[#FF3B97]');
            }
        }
    });
};

function updateWishlistCounter() {
    const counters = document.querySelectorAll('.wishlist-count-badge');
    const totalCount = Array.isArray(wishlist) ? wishlist.length : 0;
    counters.forEach(badge => {
        badge.textContent = totalCount;
        if (totalCount > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// --- 5. CLIPBOARD COUPON COPY ---
function initCouponCopy() {
    const card = document.getElementById('coupon-code-box');
    if (!card) return;

    card.addEventListener('click', () => {
        const text = "ROGUE10";
        navigator.clipboard.writeText(text).then(() => {
            const label = card.querySelector('span');
            const check = card.querySelector('.check-icon');
            
            const originalText = label.textContent;
            label.textContent = "COPIED!";
            if (check) check.classList.remove('hidden');

            showToast('Voucher Copied', '10% discount code ROGUE10 saved to clipboard.');

            setTimeout(() => {
                label.textContent = originalText;
                if (check) check.classList.add('hidden');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
}

// --- 6. SEARCH OVERLAY ---
function initSearchOverlay() {
    const searchOpenBtn = document.getElementById('nav-search-btn');
    const searchCloseBtn = document.getElementById('close-search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchOpenBtn || !searchOverlay) return;

    searchOpenBtn.addEventListener('click', () => {
        searchOverlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        setTimeout(() => searchInput.focus(), 100);
    });

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => {
            searchOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }

    // Dynamic Filter Products in search input
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const matched = PRODUCTS.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.categoryLabel.toLowerCase().includes(query)
            );

            if (matched.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center py-8 text-gray-400 text-sm">
                        No streetwear pieces found for "${query}"
                    </div>
                `;
                return;
            }

            searchResults.innerHTML = '';
            matched.forEach(prod => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors';
                itemDiv.onclick = () => {
                    // Quick add to cart
                    addToCart(prod.id);
                    searchCloseBtn.click();
                };
                itemDiv.innerHTML = `
                    <img src="${prod.image}" alt="${prod.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-50">
                    <div class="flex-grow">
                        <h6 class="font-syne text-xs font-bold text-[#0A0A0A]">${prod.name}</h6>
                        <span class="text-[9px] text-gray-400 font-outfit uppercase tracking-wider">${prod.categoryLabel}</span>
                    </div>
                    <span class="font-outfit text-xs font-bold text-[#0A0A0A]">LKR ${prod.price.toLocaleString()}</span>
                `;
                searchResults.appendChild(itemDiv);
            });
        });
    }
}

// --- 7. MOBILE MENU ---
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-menu');
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (!menuBtn || !drawer || !overlay) return;

    menuBtn.addEventListener('click', () => {
        drawer.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    });

    const closeHandler = () => {
        drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', closeHandler);

    // Close when clicking mobile menu links
    const mobileLinks = drawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeHandler);
    });
}

// --- 8. NEWSLETTER FORM ---
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input || !input.value.trim()) return;

        showToast('Subscribed', 'Thank you! You are now subscribed to the Rogue Syndicate.');
        input.value = '';
    });
}

// --- TOAST NOTIFICATIONS ---
function showToast(title, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-24 left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col pointer-events-auto transition-all duration-300 transform translate-y-10 opacity-0';
    toast.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="font-syne text-xs font-bold tracking-wider uppercase text-[#FF3B97]">${title}</span>
            <button class="text-gray-400 hover:text-white text-[10px]" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <p class="text-xs text-gray-300 mt-1 font-outfit leading-relaxed">${message}</p>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Fade out after 4 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- PRODUCT DETAIL POPUP (Optional visual enhancement) ---
window.openProductDetail = function(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    modal.id = `product-modal-${prod.id}`;
    modal.innerHTML = `
        <div class="bg-white rounded-custom-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-6 animate-float" style="animation-duration: 8s;">
            <button onclick="document.getElementById('product-modal-${prod.id}').remove()" class="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-black flex items-center justify-center hover:bg-gray-50 transition-colors">
                ✕
            </button>
            <div class="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-gray-50">
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover">
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-between py-2">
                <div>
                    <span class="text-[10px] text-gray-400 font-outfit uppercase tracking-wider font-semibold">${prod.categoryLabel}</span>
                    <h3 class="font-syne text-xl font-bold text-[#0A0A0A] mt-1">${prod.name}</h3>
                    <div class="flex items-center gap-1.5 text-xs mt-1.5">
                        <span class="text-[#FF3B97] font-bold">★ ${prod.rating.toFixed(1)}</span>
                        <span class="text-gray-400">(${prod.reviews} reviews)</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 font-outfit leading-relaxed">${prod.description}</p>
                    
                    <div class="mt-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-outfit">Select Size</span>
                        <div class="flex gap-2 mt-1.5" id="size-selector">
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-black bg-black text-white text-xs font-bold font-outfit transition-colors cursor-pointer">M</button>
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-gray-200 hover:border-black text-xs font-bold font-outfit transition-colors cursor-pointer">L</button>
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-gray-200 hover:border-black text-xs font-bold font-outfit transition-colors cursor-pointer">XL</button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div class="font-outfit text-lg font-bold text-[#0A0A0A]">LKR ${prod.price.toLocaleString()}</div>
                    <button onclick="addSelectedToCart('${prod.id}'); document.getElementById('product-modal-${prod.id}').remove();" class="flex-grow bg-black hover:bg-[#FF3B97] text-white text-xs font-syne font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.bg-white').addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', () => modal.remove());
};

window.selectSize = function(btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-black', 'text-white', 'border-black');
        b.classList.add('border-gray-200');
    });
    btn.classList.remove('border-gray-200');
    btn.classList.add('bg-black', 'text-white', 'border-black');
};

window.addSelectedToCart = function(prodId) {
    const selector = document.getElementById('size-selector');
    let size = 'L';
    if (selector) {
        const active = Array.from(selector.querySelectorAll('button')).find(b => b.classList.contains('bg-black'));
        if (active) size = active.textContent;
    }
    addToCart(prodId, size);
};

// Check Out Button Functionality
window.checkoutCart = function() {
    if (cart.length === 0) return;
    
    showToast('Checking Out', 'Proceeding to secure checkout payment gateway...');
    setTimeout(() => {
        alert('Thank you for shopping with Rogue Wear! (This is a mock check-out integration).');
        cart = [];
        saveCart();
        updateCartCounter();
        const closeCartBtn = document.getElementById('close-cart-btn');
        if (closeCartBtn) closeCartBtn.click();
    }, 1500);
};
