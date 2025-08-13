// State management
let shoppingBag = [];
let wishlist = [];
let currentView = 'grid';
let currentCategory = 'all';

// Sample products data
const products = [
    {id: 1, title: "Floral Summer Dress", description: "Light and breezy dress perfect for summer days", price: 89, originalPrice: 120, category: "dresses", rating: 4.5, reviews: 234, trending: true},
    {id: 2, title: "Silk Blouse", description: "Elegant silk blouse for professional occasions", price: 125, originalPrice: 160, category: "tops", rating: 4.8, reviews: 156, trending: false},
    {id: 3, title: "High-Waisted Jeans", description: "Classic denim with a modern fit", price: 78, originalPrice: 95, category: "bottoms", rating: 4.3, reviews: 342, trending: true},
    {id: 4, title: "Pearl Necklace", description: "Timeless pearl necklace for any occasion", price: 45, originalPrice: 65, category: "accessories", rating: 4.7, reviews: 89, trending: false},
    {id: 5, title: "Cashmere Sweater", description: "Luxurious cashmere sweater in soft colors", price: 199, originalPrice: 250, category: "tops", rating: 4.9, reviews: 67, trending: true},
    {id: 6, title: "Pleated Midi Skirt", description: "Versatile pleated skirt for day to night", price: 65, originalPrice: 85, category: "bottoms", rating: 4.4, reviews: 123, trending: false},
    {id: 7, title: "Statement Earrings", description: "Bold earrings to complete any outfit", price: 32, originalPrice: 45, category: "accessories", rating: 4.6, reviews: 198, trending: true},
    {id: 8, title: "Wrap Dress", description: "Flattering wrap dress in vibrant prints", price: 95, originalPrice: 120, category: "dresses", rating: 4.5, reviews: 276, trending: false}
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderProducts();
    renderTrending();
    updateCounters();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('href');
            scrollToSection(target);
            updateActiveNav(item);
            closeNavMenu();
        });
    });

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });

    // Sort
    document.getElementById('price-sort').addEventListener('change', (e) => {
        renderProducts(e.target.value);
    });

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            toggleView();
        });
    });

    // Modal controls
    setupModalControls();

    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);

    // Checkout
    document.getElementById('checkout').addEventListener('click', handleCheckout);

    // Toast close
    document.getElementById('toast-close').addEventListener('click', hideToast);
}

function scrollToSection(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

function updateActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function closeNavMenu() {
    document.getElementById('nav').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');
}

function renderProducts(sortBy = '') {
    let filteredProducts = currentCategory === 'all' 
        ? [...products] 
        : products.filter(p => p.category === currentCategory);

    // Sort products
    if (sortBy === 'low-high') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    const container = document.getElementById('products-container');
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card ${currentView === 'list' ? 'list-view' : ''}">
            <div class="product-image">
                ${product.title}
                <div class="product-actions">
                    <button class="action-icon" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
                        ${isInWishlist(product.id) ? '❤️' : '🤍'}
                    </button>
                    <button class="action-icon" onclick="quickView(${product.id})" title="Quick View">👁️</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}☆</span>
                    <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">
                        $${product.price}
                        ${product.originalPrice ? `<span class="price-original">$${product.originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-bag" onclick="addToBag(${product.id})">Add to Bag</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTrending() {
    const trendingProducts = products.filter(p => p.trending);
    const container = document.getElementById('trending-grid');
    
    container.innerHTML = trendingProducts.map(product => `
        <div class="trending-item" onclick="scrollToSection('#collection')">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <small>${product.category}</small>
        </div>
    `).join('');
}

function toggleView() {
    const container = document.getElementById('products-container');
    container.classList.toggle('list-view', currentView === 'list');
    renderProducts();
}

function addToBag(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = shoppingBag.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingBag.push({...product, quantity: 1});
    }

    updateCounters();
    showToast(`${product.title} added to bag!`);
}

function toggleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    const index = wishlist.findIndex(item => item.id === productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`${product.title} removed from wishlist`);
    } else {
        wishlist.push(product);
        showToast(`${product.title} added to wishlist!`);
    }

    updateCounters();
    renderProducts();
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    const content = document.getElementById('quickview-content');
    
    content.innerHTML = `
        <div style="display: flex; gap: 2rem; align-items: center;">
            <div style="flex: 1;">
                <div style="height: 300px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                    ${product.title}
                </div>
            </div>
            <div style="flex: 1;">
                <div style="color: #e74c3c; font-size: 0.9rem; font-weight: 500; text-transform: uppercase; margin-bottom: 0.5rem;">
                    ${product.category}
                </div>
                <h2 style="color: #2c3e50; margin-bottom: 1rem;">${product.title}</h2>
                <p style="color: #7f8c8d; margin-bottom: 1rem;">${product.description}</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="color: #f39c12;">${'★'.repeat(Math.floor(product.rating))}☆</span>
                    <span style="color: #7f8c8d; font-size: 0.9rem;">${product.rating} (${product.reviews} reviews)</span>
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #e74c3c; margin-bottom: 2rem;">
                    $${product.price}
                    ${product.originalPrice ? `<span style="text-decoration: line-through; color: #bdc3c7; margin-left: 0.5rem; font-size: 1.2rem;">$${product.originalPrice}</span>` : ''}
                </div>
                <button onclick="addToBag(${product.id}); closeModal('quickview-modal')" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    Add to Bag
                </button>
            </div>
        </div>
    `;
    
    showModal('quickview-modal');
}

function updateCounters() {
    const bagCount = shoppingBag.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlist.length;

    const bagCountEl = document.querySelector('.bag-count');
    const wishlistCountEl = document.querySelector('.wishlist-count');

    bagCountEl.textContent = bagCount;
    bagCountEl.style.display = bagCount > 0 ? 'flex' : 'none';

    wishlistCountEl.textContent = wishlistCount;
    wishlistCountEl.style.display = wishlistCount > 0 ? 'flex' : 'none';
}

function setupModalControls() {
    // Bag modal
    document.getElementById('bag-btn').addEventListener('click', () => {
        renderBag();
        showModal('bag-modal');
    });

    // Wishlist modal
    document.getElementById('wishlist-btn').addEventListener('click', () => {
        renderWishlist();
        showModal('wishlist-modal');
    });

    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeModal(modalId) {
    hideModal(modalId);
}

function renderBag() {
    const container = document.getElementById('bag-items');
    const subtotal = document.getElementById('bag-subtotal');
    const total = document.getElementById('bag-total');

    if (shoppingBag.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #7f8c8d;">Your bag is empty</div>';
        subtotal.textContent = '$0.00';
        total.textContent = '$0.00';
        return;
    }

    const subtotalAmount = shoppingBag.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    container.innerHTML = shoppingBag.map(item => `
        <div class="bag-item">
            <div class="bag-item-image">${item.title}</div>
            <div class="bag-item-details">
                <div class="bag-item-title">${item.title}</div>
                <div class="bag-item-price">$${item.price}</div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span style="padding: 0 1rem; font-weight: 500;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="qty-btn" onclick="removeFromBag(${item.id})" style="margin-left: 1rem; color: #e74c3c;">×</button>
                </div>
            </div>
        </div>
    `).join('');

    subtotal.textContent = `$${subtotalAmount.toFixed(2)}`;
    total.textContent = `$${subtotalAmount.toFixed(2)}`;
}

function renderWishlist() {
    const container = document.getElementById('wishlist-items');

    if (wishlist.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #7f8c8d;">Your wishlist is empty</div>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="bag-item">
            <div class="bag-item-image">${item.title}</div>
            <div class="bag-item-details">
                <div class="bag-item-title">${item.title}</div>
                <div class="bag-item-price">$${item.price}</div>
                <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                    <button onclick="addToBag(${item.id})" style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Add to Bag</button>
                    <button onclick="toggleWishlist(${item.id}); renderWishlist();" style="padding: 0.5rem 1rem; background: #ecf0f1; color: #7f8c8d; border: none; border-radius: 5px; cursor: pointer;">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateQuantity(productId, change) {
    const item = shoppingBag.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromBag(productId);
        } else {
            updateCounters();
            renderBag();
        }
    }
}

function removeFromBag(productId) {
    const index = shoppingBag.findIndex(item => item.id === productId);
    if (index > -1) {
        const product = shoppingBag[index];
        shoppingBag.splice(index, 1);
        updateCounters();
        renderBag();
        showToast(`${product.title} removed from bag`);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    showToast('Message sent successfully!');
    e.target.reset();
}

function handleCheckout() {
    if (shoppingBag.length === 0) {
        showToast('Your bag is empty!', 'error');
        return;
    }

    showToast('Order placed successfully!');
    shoppingBag = [];
    updateCounters();
    hideModal('bag-modal');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');

    messageEl.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('show');
}

// Scroll effects
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 25px rgba(0,0,0,0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    }
});