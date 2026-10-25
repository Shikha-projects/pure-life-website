// Global State Management
let purchaseType = 'sub'; // 'sub' ($37.99) or 'once' ($44.99)
let flavorQuantities = {
    vanilla: 0,
    cacao: 0,
    berries: 0
};
let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 2. Dark / Light Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                themeToggleBtn.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggleBtn.textContent = '☀️';
            }
        });
    }

    // 3. Drawer Cart Triggers
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', openCart);
    }

    // 4. FAQ Accordion Handler
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });
});

// Custom Box Builder Logic
function setPurchaseType(type) {
    purchaseType = type;
    
    document.getElementById('btn-subscribe').classList.toggle('active', type === 'sub');
    document.getElementById('btn-onetime').classList.toggle('active', type === 'once');

    const unitPriceText = type === 'sub' ? '$3.16 / bar' : '$3.74 / bar';
    document.querySelectorAll('.unit-price-display').forEach(el => el.textContent = unitPriceText);

    updateBuilderState();
}

function updateFlavorQty(flavor, delta) {
    const currentTotal = Object.values(flavorQuantities).reduce((a, b) => a + b, 0);
    
    if (delta > 0 && currentTotal >= 12) {
        return; // Box is full at 12 bars
    }
    
    if (flavorQuantities[flavor] + delta >= 0) {
        flavorQuantities[flavor] += delta;
        document.getElementById(`qty-${flavor}`).textContent = flavorQuantities[flavor];
        updateBuilderState();
    }
}

function updateBuilderState() {
    const totalBars = Object.values(flavorQuantities).reduce((a, b) => a + b, 0);
    const progressFill = document.getElementById('box-progress-fill');
    const countText = document.getElementById('box-count-text');
    const statusTag = document.getElementById('box-status-tag');
    const addBtn = document.getElementById('add-box-btn');
    const totalPriceSpan = document.getElementById('builder-total-price');

    const progressPercentage = (totalBars / 12) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    countText.textContent = `${totalBars} / 12 Bars`;

    const boxPrice = purchaseType === 'sub' ? 37.99 : 44.99;
    totalPriceSpan.textContent = `$${boxPrice.toFixed(2)}`;

    if (totalBars === 12) {
        statusTag.textContent = 'Box Complete!';
        statusTag.style.backgroundColor = 'var(--olive-primary)';
        statusTag.style.color = '#FFFFFF';
        addBtn.disabled = false;
    } else {
        statusTag.textContent = `Add ${12 - totalBars} more bar(s)`;
        statusTag.style.backgroundColor = 'var(--border-color)';
        statusTag.style.color = 'var(--text-primary)';
        addBtn.disabled = true;
    }
}

function addBoxToCart() {
    const totalBars = Object.values(flavorQuantities).reduce((a, b) => a + b, 0);
    if (totalBars !== 12) return;

    const price = purchaseType === 'sub' ? 37.99 : 44.99;
    const title = purchaseType === 'sub' ? '12-Pack Subscription Box' : '12-Pack One-Time Box';

    cartItems.push({
        id: Date.now(),
        title: title,
        subtitle: `Vanilla: ${flavorQuantities.vanilla}, Cacao: ${flavorQuantities.cacao}, Berries: ${flavorQuantities.berries}`,
        price: price
    });

    // Reset Builder
    flavorQuantities = { vanilla: 0, cacao: 0, berries: 0 };
    document.getElementById('qty-vanilla').textContent = '0';
    document.getElementById('qty-cacao').textContent = '0';
    document.getElementById('qty-berries').textContent = '0';
    updateBuilderState();

    renderCart();
    openCart();
}

function addSinglePackToCart() {
    cartItems.push({
        id: Date.now(),
        title: 'Nutrio Single Pack',
        subtitle: 'Retail Sample Unit',
        price: 3.99
    });

    renderCart();
    openCart();
}

// Drawer Cart Operations
function openCart() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
}

function renderCart() {
    const listContainer = document.getElementById('cart-items-list');
    const countSpan = document.getElementById('cart-count');
    const subtotalSpan = document.getElementById('cart-subtotal');
    const shippingMsg = document.getElementById('cart-shipping-msg');
    const shippingFill = document.getElementById('cart-shipping-fill');

    countSpan.textContent = cartItems.length;

    if (cartItems.length === 0) {
        listContainer.innerHTML = '<p class="empty-cart-text">Your cart is currently empty.</p>';
        subtotalSpan.textContent = '$0.00';
        shippingMsg.textContent = 'Add items to unlock Free Shipping!';
        shippingFill.style.width = '0%';
        return;
    }

    let subtotal = 0;
    listContainer.innerHTML = cartItems.map(item => {
        subtotal += item.price;
        return `
            <div class="cart-item">
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-sub">${item.subtitle}</div>
                    <strong>$${item.price.toFixed(2)}</strong>
                </div>
                <button onclick="removeCartItem(${item.id})" style="background:none; border:none; color:var(--terracotta-accent); cursor:pointer;">Remove</button>
            </div>
        `;
    }).join('');

    subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;

    // Update Shipping Goal Progress ($35 Threshold)
    const goal = 35.00;
    if (subtotal >= goal) {
        shippingMsg.textContent = '🎉 You unlocked FREE Shipping & Free Eco-Shaker!';
        shippingFill.style.width = '100%';
    } else {
        const remaining = goal - subtotal;
        shippingMsg.textContent = `Add $${remaining.toFixed(2)} more for Free Shipping & Gift!`;
        shippingFill.style.width = `${(subtotal / goal) * 100}%`;
    }
}

function removeCartItem(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    renderCart();
}

function checkout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    openModal('Checkout Triggered', 'Thank you for your order! In a live environment, you would now be redirected to the secure Pure Life Inc. DTC payment gateway.');
}

// Global Modal Utilities
function openModal(title, text) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').textContent = text;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('info-modal').style.display = 'none';
}