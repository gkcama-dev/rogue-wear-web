// Rogue Wear | shop.js
// Dedicated Shop Page Logic and State Management

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

// App State Management (Safe initialization)
let cart = [];
let wishlist = [];

try {
    const savedCart = safeStorage.getItem('rogue_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(cart)) cart = [];
} catch (e) {
    console.error('Failed to parse cart:', e);
    cart = [];
}

try {
    const savedWishlist = safeStorage.getItem('rogue_wishlist');
    wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (!Array.isArray(wishlist)) wishlist = [];
} catch (e) {
    console.error('Failed to parse wishlist:', e);
    wishlist = [];
}

// Shop Filter & Sort State
let currentCategory = 'all';
let maxPrice = 7000;
let selectedSizes = [];
let selectedColors = [];
let minRating = 0;
let searchQuery = '';
let sortOrder = 'featured';

// Parse URL parameters for initial category filter
try {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
        currentCategory = catParam;
    }
} catch (e) {
    console.error("Failed to parse URL params:", e);
}

// Initializer function
function initApp() {
    console.log("Initializing Rogue Wear Shop...");
    
    const initializers = [
        { name: 'Reveal Animations', fn: initRevealAnimations },
        { name: 'Shop Rendering', fn: () => setFilterCategory(currentCategory) },
        { name: 'Side Drawers', fn: initSideDrawers },
        { name: 'Counters', fn: () => { updateCartCounter(); updateWishlistCounter(); } },
        { name: 'Delivery Fields', fn: initDeliveryFields },
        { name: 'Search Overlay', fn: initSearchOverlay },
        { name: 'Mobile Menu', fn: initMobileMenu },
        { name: 'Mobile Filters', fn: initMobileFilters },
        { name: 'Newsletter Form', fn: initNewsletterForm },
        { name: 'Theme Toggle', fn: initThemeToggle },
        { name: 'Custom Cursor', fn: initCustomCursor }
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
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

// --- SHOP PRODUCTS FILTERING & RENDERING LOGIC ---

function renderShopProducts() {
    const grid = document.getElementById('shop-product-grid');
    const emptyState = document.getElementById('shop-empty-state');
    const countDisplay = document.getElementById('shop-product-count');

    if (!grid) return;

    // Filter products
    let filtered = PRODUCTS.filter(product => {
        // Category Filter
        if (currentCategory !== 'all' && product.category !== currentCategory) {
            return false;
        }

        // Price Filter
        if (product.price > maxPrice) {
            return false;
        }

        // Sizes Filter (product must have at least one of selected sizes)
        if (selectedSizes.length > 0) {
            const hasSize = product.sizes.some(size => selectedSizes.includes(size));
            if (!hasSize) return false;
        }

        // Colors Filter
        if (selectedColors.length > 0 && !selectedColors.includes(product.color)) {
            return false;
        }

        // Rating Filter
        if (product.rating < minRating) {
            return false;
        }

        // Search Query Filter
        if (searchQuery.length > 0) {
            const q = searchQuery.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(q);
            const matchesDesc = product.description.toLowerCase().includes(q);
            if (!matchesName && !matchesDesc) return false;
        }

        return true;
    });

    // Sort products
    if (sortOrder === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } // 'featured' keeps the default order in products.js

    // Update count display
    if (countDisplay) {
        countDisplay.textContent = `Displaying ${filtered.length} of ${PRODUCTS.length} premium pieces.`;
    }

    // Render grid
    grid.innerHTML = '';
    
    if (filtered.length === 0) {
        grid.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    filtered.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = `reveal bg-brand-card rounded-xl sm:rounded-custom-lg p-2.5 sm:p-4 border border-brand-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between streetwear-card`;
        
        card.innerHTML = `
            <div>
                <div class="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden bg-brand-gray-bg group mb-2 sm:mb-4">
                    ${product.badge ? `<span class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black text-white text-[8px] sm:text-[9px] font-syne uppercase tracking-wider font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full z-10">${product.badge}</span>` : ''}
                    <button onclick="toggleWishlist('${product.id}')" id="wishlist-btn-${product.id}" class="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 bg-brand-card text-brand-dark hover:text-[#FF3B97] rounded-full flex items-center justify-center shadow-sm z-10 transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5.5 sm:w-5.5 ${isWishlisted ? 'fill-[#FF3B97] stroke-[#FF3B97]' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                    
                    <!-- Quick Add Hover Overlay -->
                    <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end hidden lg:flex">
                        <button onclick="openProductDetail('${product.id}')" class="w-full bg-white hover:bg-black hover:text-white text-black font-syne text-[11px] font-bold tracking-wider uppercase py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
                
                <div class="px-1">
                    <span class="text-[8px] sm:text-[10px] text-gray-400 font-outfit uppercase tracking-wider font-semibold">${product.genderFit || product.categoryLabel}</span>
                    <h4 class="font-syne text-xs sm:text-sm font-bold text-brand-dark mt-0.5 sm:mt-1 line-clamp-2 h-8 sm:h-10 leading-tight hover:text-[#FF3B97] cursor-pointer" onclick="openProductDetail('${product.id}')">${product.name}</h4>
                    <div class="flex items-center gap-1 text-[9px] sm:text-xs mt-0.5 sm:mt-1">
                        <span class="text-[#FF3B97] font-bold">★ ${product.rating.toFixed(1)}</span>
                        <span class="text-gray-400 hidden min-[360px]:inline">(${product.reviews})</span>
                    </div>
                </div>
            </div>

            <div class="px-1 mt-2 sm:mt-4 flex items-center justify-between">
                <div class="font-outfit text-xs sm:text-base font-bold text-brand-dark">LKR ${product.price.toLocaleString()}</div>
                <!-- Mobile Only Add Button -->
                <button onclick="openProductDetail('${product.id}')" class="lg:hidden w-8 h-8 bg-brand-dark text-brand-light rounded-full flex items-center justify-center shadow-md hover:bg-[#FF3B97] transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    setTimeout(initRevealAnimations, 55);
}

// --- FILTER BUTTON TRIGGERS ---

window.setFilterCategory = function(category) {
    currentCategory = category;
    
    // Update active tab styles
    const buttons = document.querySelectorAll('.cat-filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('font-bold', 'text-brand-pink');
    });

    const activeBtn = document.getElementById(`cat-btn-${category}`);
    if (activeBtn) {
        activeBtn.classList.add('font-bold', 'text-brand-pink');
    }

    renderShopProducts();
};

window.handlePriceFilter = function(val) {
    maxPrice = parseInt(val);
    
    // Update value text
    const display = document.getElementById('price-value');
    if (display) {
        display.textContent = `LKR ${maxPrice.toLocaleString()}`;
    }

    renderShopProducts();
};

window.toggleFilterSize = function(size) {
    const idx = selectedSizes.indexOf(size);
    if (idx > -1) {
        selectedSizes.splice(idx, 1);
        document.getElementById(`size-btn-${size}`).classList.remove('bg-black', 'text-white', 'border-black');
        document.getElementById(`size-btn-${size}`).classList.add('border-brand-border');
    } else {
        selectedSizes.push(size);
        document.getElementById(`size-btn-${size}`).classList.add('bg-black', 'text-white', 'border-black');
        document.getElementById(`size-btn-${size}`).classList.remove('border-brand-border');
    }

    renderShopProducts();
};

window.toggleFilterColor = function(color) {
    const idx = selectedColors.indexOf(color);
    const btn = document.getElementById(`color-btn-${color}`);
    const check = btn ? btn.querySelector('span') : null;

    if (idx > -1) {
        selectedColors.splice(idx, 1);
        if (check) check.classList.add('hidden');
    } else {
        selectedColors.push(color);
        if (check) check.classList.remove('hidden');
    }

    renderShopProducts();
};

window.setFilterRating = function(rating) {
    minRating = rating;

    // Update active styles
    const buttons = document.querySelectorAll('.rating-filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('font-bold', 'text-brand-pink');
    });

    const idMap = {
        0: 'rating-btn-0',
        5: 'rating-btn-5',
        4.8: 'rating-btn-48',
        4.6: 'rating-btn-46'
    };

    const activeBtn = document.getElementById(idMap[rating]);
    if (activeBtn) {
        activeBtn.classList.add('font-bold', 'text-brand-pink');
    }

    renderShopProducts();
};

window.handleSortChange = function(sort) {
    sortOrder = sort;
    renderShopProducts();
};

window.resetAllFilters = function() {
    currentCategory = 'all';
    maxPrice = 7000;
    selectedSizes = [];
    selectedColors = [];
    minRating = 0;
    searchQuery = '';
    sortOrder = 'featured';

    // Reset Category buttons
    const catButtons = document.querySelectorAll('.cat-filter-btn');
    catButtons.forEach(btn => btn.classList.remove('font-bold', 'text-brand-pink'));
    const catAll = document.getElementById('cat-btn-all');
    if (catAll) catAll.classList.add('font-bold', 'text-brand-pink');

    // Reset Price range slider
    const slider = document.getElementById('price-range');
    if (slider) slider.value = 7000;
    const priceVal = document.getElementById('price-value');
    if (priceVal) priceVal.textContent = 'LKR 7,000';

    // Reset Size buttons
    const sizeButtons = document.querySelectorAll('.size-filter-btn');
    sizeButtons.forEach(btn => {
        btn.classList.remove('bg-black', 'text-white', 'border-black');
        btn.classList.add('border-brand-border');
    });

    // Reset Color buttons
    const colorButtons = document.querySelectorAll('.color-filter-btn');
    colorButtons.forEach(btn => {
        const check = btn.querySelector('span');
        if (check) check.classList.add('hidden');
    });

    // Reset Rating buttons
    const ratingButtons = document.querySelectorAll('.rating-filter-btn');
    ratingButtons.forEach(btn => btn.classList.remove('font-bold', 'text-brand-pink'));
    const ratingAll = document.getElementById('rating-btn-0');
    if (ratingAll) ratingAll.classList.add('font-bold', 'text-brand-pink');

    // Reset Sort select
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) sortSelect.value = 'featured';

    renderShopProducts();
};


// --- REVEAL ON SCROLL ---
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
        threshold: 0.01,
        rootMargin: '0px 0px 100px 0px'
    });

    reveals.forEach(el => observer.observe(el));
    
    // Failsafe
    setTimeout(() => {
        reveals.forEach(el => {
            el.classList.add('revealed');
        });
    }, 800);
}

// --- SIDE DRAWERS ---
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

// --- RENDER CART ITEMS ---
function renderCartItems() {
    const list = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-summary-box');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (!list) return;

    list.innerHTML = '';

    const delivery = document.getElementById('cart-delivery-box');

    if (cart.length === 0) {
        list.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');
        if (delivery) delivery.classList.add('hidden');
        return;
    }

    list.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');
    if (delivery) delivery.classList.remove('hidden');

    let subtotal = 0;

    cart.forEach(item => {
        const prod = PRODUCTS.find(p => p.id === item.id);
        if (!prod) return;

        const priceTotal = prod.price * item.quantity;
        subtotal += priceTotal;

        const li = document.createElement('div');
        li.className = 'flex gap-4 p-4 border border-brand-border bg-brand-card rounded-2xl animate-item-fade';
        li.innerHTML = `
            <div class="w-20 h-20 bg-brand-gray-bg rounded-xl overflow-hidden shrink-0">
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start gap-1">
                        <h5 class="font-syne text-xs font-bold text-brand-dark line-clamp-1">${prod.name}</h5>
                        <button onclick="removeFromCart('${item.id}', '${item.size}')" class="text-gray-400 hover:text-brand-pink text-[11px] transition-colors cursor-pointer">✕</button>
                    </div>
                    <span class="text-[9px] text-gray-400 font-outfit uppercase tracking-wider font-semibold">Size: ${item.size}</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center border border-brand-border rounded-lg bg-brand-gray-bg overflow-hidden h-7">
                        <button onclick="updateCartQty('${item.id}', '${item.size}', ${item.quantity - 1})" class="px-2 text-xs font-bold text-brand-dark hover:bg-brand-border transition-colors cursor-pointer">-</button>
                        <span class="px-2 text-xs font-mono font-bold text-brand-dark">${item.quantity}</span>
                        <button onclick="updateCartQty('${item.id}', '${item.size}', ${item.quantity + 1})" class="px-2 text-xs font-bold text-brand-dark hover:bg-brand-border transition-colors cursor-pointer">+</button>
                    </div>
                    <span class="font-outfit text-xs font-bold text-brand-dark">LKR ${priceTotal.toLocaleString()}</span>
                </div>
            </div>
        `;
        list.appendChild(li);
    });

    // Update Subtotal/Totals
    if (cart.length === 0) {
        appliedPromo = null;
        const input = document.getElementById('promo-code-input');
        const msg = document.getElementById('promo-status-msg');
        if (input) input.value = '';
        if (msg) msg.classList.add('hidden');
    }

    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) {
        subtotalEl.textContent = `LKR ${subtotal.toLocaleString()}`;
    }
    
    // Calculate and render promo discount
    let discount = 0;
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    
    if (appliedPromo && subtotal > 0) {
        discount = Math.round(subtotal * appliedPromo.rate);
        if (discountRow && discountEl) {
            discountEl.textContent = `-LKR ${discount.toLocaleString()}`;
            discountRow.classList.remove('hidden');
        }
    } else {
        if (discountRow) discountRow.classList.add('hidden');
    }
    
    const shippingVal = (subtotal - discount) > 15000 || subtotal === 0 ? 0 : 350;
    if (shippingEl) {
        shippingEl.textContent = shippingVal === 0 ? (subtotal === 0 ? 'LKR 0' : 'FREE') : 'LKR 350';
    }
    
    const finalTotal = subtotal - discount + shippingVal;
    if (totalEl) {
        totalEl.textContent = `LKR ${finalTotal.toLocaleString()}`;
    }
}

// --- RENDER WISHLIST ITEMS ---
function renderWishlistItems() {
    const list = document.getElementById('wishlist-items-list');
    const emptyState = document.getElementById('wishlist-empty-state');

    if (!list) return;

    list.innerHTML = '';

    if (wishlist.length === 0) {
        list.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    wishlist.forEach(itemId => {
        const prod = PRODUCTS.find(p => p.id === itemId);
        if (!prod) return;

        const li = document.createElement('div');
        li.className = 'flex gap-4 p-4 border border-brand-border bg-brand-card rounded-2xl animate-item-fade';
        li.innerHTML = `
            <div class="w-16 h-16 bg-brand-gray-bg rounded-xl overflow-hidden shrink-0">
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow flex flex-col justify-between">
                <div class="flex justify-between items-start gap-1">
                    <div>
                        <h5 class="font-syne text-xs font-bold text-brand-dark line-clamp-1">${prod.name}</h5>
                        <span class="font-outfit text-[11px] font-bold text-brand-dark mt-0.5 block">LKR ${prod.price.toLocaleString()}</span>
                    </div>
                    <button onclick="toggleWishlist('${prod.id}')" class="text-gray-400 hover:text-brand-pink text-[11px] transition-colors cursor-pointer">✕</button>
                </div>
                <div class="mt-2">
                    <button onclick="moveToCart('${prod.id}')" class="w-full bg-brand-dark hover:bg-brand-pink text-brand-light text-[9px] font-syne font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer">
                        Move to Cart
                    </button>
                </div>
            </div>
        `;
        list.appendChild(li);
    });
}



// --- CART STATE ACTIONS ---
window.addToCart = function(productId, size = 'L') {
    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, size: size, quantity: 1 });
    }
    saveCart();
    updateCartCounter();
    renderCartItems();

    const prod = PRODUCTS.find(p => p.id === productId);
    showToast('Added to Cart', `${prod ? prod.name : 'Item'} (${size}) has been successfully added to your shopping bag.`);

    // Trigger cart drawer open automatically
    const cartBtn = document.getElementById('nav-cart-btn');
    if (cartBtn) cartBtn.click();
};

window.removeFromCart = function(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    updateCartCounter();
    renderCartItems();
};

window.updateCartQty = function(productId, size, qty) {
    if (qty <= 0) {
        removeFromCart(productId, size);
        return;
    }
    const item = cart.find(i => i.id === productId && i.size === size);
    if (item) {
        item.quantity = qty;
    }
    saveCart();
    renderCartItems();
    updateCartCounter();
};

function saveCart() {
    safeStorage.setItem('rogue_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    badges.forEach(badge => {
        badge.textContent = totalQty;
        if (totalQty > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function initDeliveryFields() {
    const savedName = safeStorage.getItem('rogue_checkout_name');
    const savedAddress = safeStorage.getItem('rogue_checkout_address');
    const savedPhone = safeStorage.getItem('rogue_checkout_phone');
    
    const nameInput = document.getElementById('checkout-name');
    const addrInput = document.getElementById('checkout-address');
    const phoneInput = document.getElementById('checkout-phone');
    
    if (nameInput && savedName) nameInput.value = savedName;
    if (addrInput && savedAddress) addrInput.value = savedAddress;
    if (phoneInput && savedPhone) phoneInput.value = savedPhone;
}

// --- WISHLIST STATE ACTIONS ---
window.toggleWishlist = function(productId) {
    const idx = wishlist.indexOf(productId);
    const prod = PRODUCTS.find(p => p.id === productId);

    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast('Removed from Wishlist', `${prod ? prod.name : 'Item'} has been removed from your wishlist collection.`);
    } else {
        wishlist.push(productId);
        showToast('Added to Wishlist', `${prod ? prod.name : 'Item'} has been saved to your wishlist collection.`);
    }

    safeStorage.setItem('rogue_wishlist', JSON.stringify(wishlist));
    updateWishlistCounter();
    renderWishlistItems();

    // Toggle button icon highlights immediately
    const btns = document.querySelectorAll(`[id^="wishlist-btn-${productId}"]`);
    btns.forEach(btn => {
        const svg = btn.querySelector('svg');
        if (svg) {
            if (wishlist.includes(productId)) {
                svg.classList.remove('fill-none', 'stroke-current');
                svg.classList.add('fill-[#FF3B97]', 'stroke-[#FF3B97]');
            } else {
                svg.classList.remove('fill-[#FF3B97]', 'stroke-[#FF3B97]');
                svg.classList.add('fill-none', 'stroke-current');
            }
        }
    });
};

window.moveToCart = function(productId) {
    wishlist = wishlist.filter(id => id !== productId);
    safeStorage.setItem('rogue_wishlist', JSON.stringify(wishlist));
    updateWishlistCounter();
    renderWishlistItems();
    addToCart(productId, 'L');
};

function updateWishlistCounter() {
    const badges = document.querySelectorAll('.wishlist-count-badge');
    const count = wishlist.length;

    badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// --- SEARCH OVERLAY ---
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

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            
            // Sync search query with main page filter if they search
            searchQuery = query;
            renderShopProducts();

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
                itemDiv.className = 'flex items-center gap-4 p-3 hover:bg-brand-gray-bg rounded-xl cursor-pointer transition-colors';
                itemDiv.onclick = () => {
                    openProductDetail(prod.id);
                    searchCloseBtn.click();
                };
                itemDiv.innerHTML = `
                    <img src="${prod.image}" alt="${prod.name}" class="w-12 h-12 rounded-lg object-cover bg-brand-gray-bg">
                    <div class="flex-grow">
                        <h6 class="font-syne text-xs font-bold text-brand-dark">${prod.name}</h6>
                        <span class="text-[9px] text-gray-400 font-outfit uppercase tracking-wider">${prod.categoryLabel}</span>
                    </div>
                    <span class="font-outfit text-xs font-bold text-brand-dark">LKR ${prod.price.toLocaleString()}</span>
                `;
                searchResults.appendChild(itemDiv);
            });
        });
    }
}

// --- MOBILE MENU ---
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-menu');
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (!menuBtn || !drawer || !overlay) return;

    const openMenu = () => {
        drawer.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const closeMenu = () => {
        drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Auto-close on menu link tap
    const links = drawer.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// --- MOBILE FILTERS ---
function initMobileFilters() {
    const sidebar = document.getElementById('shop-filter-sidebar');
    const overlay = document.getElementById('filter-overlay');

    if (!sidebar || !overlay) return;

    window.toggleMobileFilters = function() {
        const isOpen = !sidebar.classList.contains('-translate-x-full');
        if (isOpen) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        } else {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    };

    overlay.addEventListener('click', window.toggleMobileFilters);
}

// --- NEWSLETTER FORM ---
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const val = input ? input.value : '';
        if (val) {
            showToast('Subscribed', 'Your email address has been registered for upcoming collections.');
            form.reset();
        }
    });
}

// --- THEME TOGGLE ---
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeBtnMobile = document.getElementById('theme-toggle-btn-mobile');
    const sunIcon = document.getElementById('theme-sun-icon');
    const moonIcon = document.getElementById('theme-moon-icon');
    const dotMobile = document.getElementById('toggle-dot-mobile');

    if (!themeBtn) return;

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (sunIcon) sunIcon.classList.remove('hidden');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (themeBtnMobile) themeBtnMobile.classList.add('bg-brand-pink');
            if (dotMobile) dotMobile.classList.add('translate-x-6');
        } else {
            document.documentElement.classList.remove('dark');
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (themeBtnMobile) themeBtnMobile.classList.remove('bg-brand-pink');
            if (dotMobile) dotMobile.classList.remove('translate-x-6');
        }
        safeStorage.setItem('rogue_theme', theme);
    }

    function toggleTheme() {
        // Add temporary smooth transition class
        document.documentElement.classList.add('theme-transitioning');
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    }

    // Load initial theme
    const savedTheme = safeStorage.getItem('rogue_theme') || 'light';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', toggleTheme);
    if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);
}

// --- TOAST NOTIFICATIONS ---
function showToast(title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'w-80 bg-brand-card/95 backdrop-blur-md border border-brand-border text-brand-dark p-4 rounded-2xl shadow-xl flex gap-3 translate-y-10 opacity-0 transition-all duration-300';
    
    toast.innerHTML = `
        <div class="text-brand-pink bg-brand-pink/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <h6 class="font-syne text-xs font-bold uppercase tracking-wider">${title}</h6>
            <p class="text-[10px] text-gray-500 font-outfit mt-1 leading-relaxed">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- PRODUCT DETAIL POPUP ---
window.openProductDetail = function(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    modal.id = `product-modal-${prod.id}`;
    modal.innerHTML = `
        <div class="bg-brand-card rounded-custom-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-brand-border flex flex-col md:flex-row gap-6 animate-float" style="animation-duration: 8s;">
            <button onclick="document.getElementById('product-modal-${prod.id}').remove()" class="absolute top-4 right-4 w-8 h-8 rounded-full border border-brand-border text-gray-500 hover:text-brand-pink flex items-center justify-center hover:bg-brand-gray-bg transition-colors">
                ✕
            </button>
            <div class="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-brand-gray-bg">
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover">
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-between py-2">
                <div>
                    <span class="text-[10px] text-gray-400 font-outfit uppercase tracking-wider font-semibold">${prod.categoryLabel}</span>
                    <h3 class="font-syne text-xl font-bold text-brand-dark mt-1">${prod.name}</h3>
                    <div class="flex items-center gap-1.5 text-xs mt-1.5">
                        <span class="text-[#FF3B97] font-bold">★ ${prod.rating.toFixed(1)}</span>
                        <span class="text-gray-400">(${prod.reviews} reviews)</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 font-outfit leading-relaxed">${prod.description}</p>
                    
                    <div class="mt-4">
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-outfit">Select Size</span>
                        <div class="flex gap-2 mt-1.5" id="size-selector">
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-brand-dark bg-brand-dark text-brand-light text-xs font-bold font-outfit transition-colors cursor-pointer">M</button>
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-brand-border hover:border-brand-dark text-brand-dark text-xs font-bold font-outfit transition-colors cursor-pointer">L</button>
                            <button onclick="selectSize(this)" class="w-8 h-8 rounded-lg border border-brand-border hover:border-brand-dark text-brand-dark text-xs font-bold font-outfit transition-colors cursor-pointer">XL</button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-brand-border">
                    <div class="font-outfit text-lg font-bold text-brand-dark">LKR ${prod.price.toLocaleString()}</div>
                    <button onclick="addSelectedToCart('${prod.id}'); document.getElementById('product-modal-${prod.id}').remove();" class="flex-grow bg-brand-dark hover:bg-[#FF3B97] text-brand-light text-xs font-syne font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.bg-brand-card').addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', () => modal.remove());
};

window.selectSize = function(btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-brand-dark', 'text-brand-light', 'border-brand-dark');
        b.classList.add('border-brand-border');
    });
    btn.classList.remove('border-brand-border');
    btn.classList.add('bg-brand-dark', 'text-brand-light', 'border-brand-dark');
};

window.addSelectedToCart = function(prodId) {
    const selector = document.getElementById('size-selector');
    let size = 'L';
    if (selector) {
        const active = Array.from(selector.querySelectorAll('button')).find(b => b.classList.contains('bg-brand-dark'));
        if (active) size = active.textContent;
    }
    addToCart(prodId, size);
};

// Reusable Global Loader Functions
window.showLoader = function(customMessage) {
    const preloader = document.getElementById('site-preloader');
    const bar = document.getElementById('preloader-bar');
    const percentText = document.getElementById('preloader-percent');
    
    if (!preloader) return;
    
    // Reset state
    preloader.style.transition = 'none';
    preloader.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-full');
    preloader.style.display = 'flex';
    
    if (customMessage) {
        if (bar) {
            bar.style.width = '100%';
            bar.classList.add('animate-pulse');
        }
        if (percentText) {
            percentText.textContent = customMessage;
        }
    } else {
        if (bar) {
            bar.style.width = '0%';
            bar.classList.remove('animate-pulse');
        }
        if (percentText) {
            percentText.textContent = '00%';
        }
    }
};

window.hideLoader = function() {
    const preloader = document.getElementById('site-preloader');
    if (!preloader) return;
    
    preloader.style.transition = 'opacity 0.6s ease-in-out, transform 0.6s cubic-bezier(0.85, 0, 0.15, 1)';
    preloader.classList.add('opacity-0', 'pointer-events-none', '-translate-y-full');
    
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 600);
};

// Promo / Voucher Code System
let appliedPromo = null;
const PROMO_CODES = {
    'ROGUE10': 0.10, // 10% Off Coupon
    'ROGUE20': 0.20  // 20% Off Coupon
};

window.applyPromoCode = function() {
    const input = document.getElementById('promo-code-input');
    const msg = document.getElementById('promo-status-msg');
    if (!input || !msg) return;
    
    const code = input.value.trim().toUpperCase();
    
    if (code === '') {
        appliedPromo = null;
        msg.classList.add('hidden');
        renderCartItems();
        return;
    }
    
    if (PROMO_CODES.hasOwnProperty(code)) {
        appliedPromo = { code: code, rate: PROMO_CODES[code] };
        const pct = Math.round(PROMO_CODES[code] * 100);
        msg.textContent = `Promo code "${code}" applied (${pct}% off)!`;
        msg.className = 'text-[10px] text-emerald-500 font-outfit font-medium mt-1 block';
        msg.classList.remove('hidden');
        showToast('Promo Code Applied', `Discount code "${code}" successfully applied.`);
    } else {
        appliedPromo = null;
        msg.textContent = 'Invalid promo code. Please try again.';
        msg.className = 'text-[10px] text-red-500 font-outfit font-medium mt-1 block';
        msg.classList.remove('hidden');
    }
    renderCartItems();
};

// Checkout function - Send Order to WhatsApp
window.checkoutCart = function() {
    if (cart.length === 0) return;
    
    // Validate Delivery Details
    const nameInput = document.getElementById('checkout-name');
    const addrInput = document.getElementById('checkout-address');
    const phoneInput = document.getElementById('checkout-phone');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const address = addrInput ? addrInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    
    if (!name || !address) {
        showToast('Info Required', 'Please fill in your Name and Delivery Address to continue.');
        if (!name && nameInput) nameInput.focus();
        else if (addrInput) addrInput.focus();
        return;
    }
    
    // Save to localStorage for convenience next time
    safeStorage.setItem('rogue_checkout_name', name);
    safeStorage.setItem('rogue_checkout_address', address);
    safeStorage.setItem('rogue_checkout_phone', phone);
    
    // Show premium order processing loading screen
    window.showLoader("PROCESSING ORDER...");
    
    setTimeout(() => {
        // Compile order message
        let message = `*ROGUE WEAR - NEW ORDER* \u{1F4E6}\n`;
        message += `=========================\n\n`;
        
        message += `*DELIVERY DETAILS* \u{1F69A}\n`;
        message += `• *Name:* ${name}\n`;
        message += `• *Address:* ${address}\n`;
        if (phone) {
            message += `• *Phone:* ${phone}\n`;
        }
        message += `\n=========================\n\n`;
        
        let subtotal = 0;
        cart.forEach((item, index) => {
            const prod = PRODUCTS.find(p => p.id === item.id);
            if (prod) {
                const itemTotal = prod.price * item.quantity;
                subtotal += itemTotal;
                message += `${index + 1}. *${prod.name}*\n`;
                message += `   Size: ${item.size}\n`;
                message += `   Qty: ${item.quantity} x LKR ${prod.price.toLocaleString()}\n`;
                message += `   Subtotal: LKR ${itemTotal.toLocaleString()}\n\n`;
            }
        });
        
        // Calculate discount
        let discount = 0;
        if (appliedPromo && subtotal > 0) {
            discount = Math.round(subtotal * appliedPromo.rate);
        }
        
        const shipping = (subtotal - discount) > 15000 || subtotal === 0 ? 0 : 350;
        const total = subtotal - discount + shipping;
        
        message += `=========================\n`;
        message += `*Subtotal:* LKR ${subtotal.toLocaleString()}\n`;
        if (discount > 0) {
            message += `*Discount (${appliedPromo.code}):* -LKR ${discount.toLocaleString()}\n`;
        }
        message += `*Shipping:* LKR ${shipping.toLocaleString()}\n`;
        message += `*Total Amount:* LKR ${total.toLocaleString()}\n`;
        message += `=========================\n\n`;
        message += `Hi Rogue Wear, I would like to place this order. Please confirm delivery details and payment options!`;
        
        const encodedText = encodeURIComponent(message);
        const waUrl = `https://wa.me/94775756751?text=${encodedText}`;
        
        // Hide loader
        window.hideLoader();
        
        // Open WhatsApp in a new tab
        window.open(waUrl, '_blank');
        
        // Open Order Sent Confirmation Modal
        const confirmModal = document.getElementById('order-confirm-modal');
        const confirmCard = document.getElementById('order-confirm-card');
        if (confirmModal && confirmCard) {
            confirmModal.classList.remove('hidden');
            setTimeout(() => {
                confirmModal.classList.remove('opacity-0');
                confirmCard.classList.remove('scale-95');
            }, 10);
        }
    }, 1500);
};

window.confirmClearCart = function(shouldClear) {
    const confirmModal = document.getElementById('order-confirm-modal');
    const confirmCard = document.getElementById('order-confirm-card');
    
    if (confirmModal && confirmCard) {
        confirmModal.classList.add('opacity-0');
        confirmCard.classList.add('scale-95');
        setTimeout(() => {
            confirmModal.classList.add('hidden');
        }, 300);
    }
    
    if (shouldClear) {
        cart = [];
        appliedPromo = null; // Clear applied promo
        saveCart();
        updateCartCounter();
        if (typeof renderCartItems === 'function') renderCartItems();
        
        // Close cart drawer
        const closeCartBtn = document.getElementById('close-cart-btn');
        if (closeCartBtn) closeCartBtn.click();
        showToast('Cart Cleared', 'Your shopping cart has been cleared.');
    } else {
        showToast('Bag Preserved', 'Your shopping bag items were kept safe.');
    }
};



// Custom Streetwear Cursor Logic
function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });
    
    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        
        requestAnimationFrame(animateRing);
    }
    animateRing();
    
    const interactiveSelector = 'a, button, select, input, textarea, [role="button"], .cursor-pointer, .streetwear-card';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
            dot.classList.add('hovered');
            ring.classList.add('hovered');
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !relatedTarget.closest(interactiveSelector)) {
                dot.classList.remove('hovered');
                ring.classList.remove('hovered');
            }
        }
    });
}
