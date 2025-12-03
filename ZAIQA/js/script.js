/**
 * Zaiqa Restaurant - Main JavaScript
 * Handles mobile navigation, scroll animations, and Shopping Cart.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen Logic
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 500); // Small delay for smooth transition
        }
    });

    // Mobile Navigation Logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        // Accessibility: Set initial state
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-controls', 'main-nav');
        navLinks.id = 'main-nav';

        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            toggleMenu(!isExpanded);
        });

        // Close menu when clicking a link
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu(false);
                hamburger.focus(); // Return focus to button
            }
        });
    }

    function toggleMenu(show) {
        if (!navLinks || !hamburger) return;

        if (show) {
            navLinks.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Animate hamburger to X
            const bars = document.querySelectorAll('.bar');
            if (bars.length === 3) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            }
        } else {
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scrolling

            // Restore hamburger
            const bars = document.querySelectorAll('.bar');
            if (bars.length === 3) {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        }
    }

    // Scroll Animations (IntersectionObserver)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('show');
            el.style.transition = 'none';
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }


    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Product Detail Modal Logic
    const productModal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const closeModal = document.querySelector('.close-modal');

    if (productModal) {
        // Open Modal when clicking on a menu item
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Prevent modal opening if "Add to Cart" button was clicked
                if (e.target.closest('.add-to-cart-btn')) return;

                const img = item.querySelector('.menu-img img').src;
                const title = item.querySelector('h3').innerText;
                const priceText = item.querySelector('.price').innerText;
                const desc = item.querySelector('.menu-desc').innerText;
                const price = priceText.replace(/[^0-9]/g, ''); // Extract number

                // Populate Modal
                modalImg.src = img;
                modalTitle.innerText = title;
                modalPrice.innerText = priceText;
                modalDesc.innerText = desc;

                // Configure Add to Cart button in modal
                modalAddToCartBtn.setAttribute('data-name', title);
                modalAddToCartBtn.setAttribute('data-price', price);

                // Configure WhatsApp Button
                const message = `Hi, I am interested in ordering *${title}* (${priceText}).`;
                const phoneNumber = "923272591778";
                whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                // Show Modal
                productModal.classList.add('show');
                productModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close Modal Logic
        const closeProductModal = () => {
            productModal.classList.remove('show');
            productModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (closeModal) {
            closeModal.addEventListener('click', closeProductModal);
        }

        window.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeProductModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && productModal.classList.contains('show')) {
                closeProductModal();
            }
        });
    }

    // =========================================
    // SHOPPING CART LOGIC
    // =========================================

    class Cart {
        constructor() {
            this.items = JSON.parse(localStorage.getItem('zaiqa_cart')) || [];
            this.total = 0;
            this.init();
        }

        init() {
            this.injectCartModal();
            this.updateTotal();
            this.bindEvents();
        }

        injectCartModal() {
            if (!document.getElementById('cart-modal')) {
                const modalHTML = `
                <div id="cart-modal" class="modal" aria-hidden="true">
                    <div class="modal-content cart-modal-content">
                        <span class="close-modal" id="close-cart-modal">&times;</span>
                        <div class="modal-info" style="width: 100%; padding: 2rem;">
                            <h2 style="text-align: center; margin-bottom: 2rem; color: white;">Your Cart 🛒</h2>
                            <div class="cart-items">
                                <!-- Cart Items will be injected here -->
                            </div>
                            <div class="cart-total">
                                <span>Total:</span>
                                <span class="cart-total-price">Rs. 0</span>
                            </div>
                            <button class="checkout-btn" id="checkout-btn">
                                Checkout on WhatsApp 📱
                            </button>
                        </div>
                    </div>
                </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }
        }

        bindEvents() {
            // Add to Cart Buttons
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                    const btn = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                    const name = btn.getAttribute('data-name');
                    const price = parseInt(btn.getAttribute('data-price'));

                    if (name && price) {
                        this.addItem(name, price);
                        this.showNotification(`Added ${name} to cart!`);

                        // Animation effect
                        btn.textContent = "Added! ✓";
                        setTimeout(() => {
                            btn.textContent = "Add to Cart 🛒";
                        }, 2000);
                    }
                }
            });

            // Cart Icon Click
            const cartIcon = document.querySelector('.cart-icon-container');
            if (cartIcon) {
                cartIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openCart();
                });
            }

            // Close Cart Modal
            const closeBtn = document.getElementById('close-cart-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeCart());
            }

            // Close on Outside Click
            const cartModal = document.getElementById('cart-modal');
            if (cartModal) {
                window.addEventListener('click', (e) => {
                    if (e.target === cartModal) {
                        this.closeCart();
                    }
                });
            }

            // Checkout Button
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => this.checkout());
            }
        }

        addItem(name, price) {
            const existing = this.items.find(i => i.name === name);
            if (existing) {
                existing.qty++;
            } else {
                this.items.push({ name, price, qty: 1 });
            }
            this.save();
            this.updateUI(); // Update UI if modal is open
        }

        removeItem(name) {
            this.items = this.items.filter(i => i.name !== name);
            this.save();
            this.updateUI();
        }

        updateQty(name, change) {
            const item = this.items.find(i => i.name === name);
            if (item) {
                item.qty += change;
                if (item.qty <= 0) this.removeItem(name);
                else {
                    this.save();
                    this.updateUI();
                }
            }
        }

        save() {
            localStorage.setItem('zaiqa_cart', JSON.stringify(this.items));
            this.updateTotal();
        }

        updateTotal() {
            this.total = this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

            // Update cart count badge
            const badges = document.querySelectorAll('.cart-count');
            badges.forEach(badge => {
                const count = this.items.reduce((sum, item) => sum + item.qty, 0);
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            });
        }

        openCart() {
            const modal = document.getElementById('cart-modal');
            if (modal) {
                this.updateUI();
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        }

        closeCart() {
            const modal = document.getElementById('cart-modal');
            if (modal) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        }

        updateUI() {
            const container = document.querySelector('.cart-items');
            const totalEl = document.querySelector('.cart-total-price');
            if (!container) return;

            if (this.items.length === 0) {
                container.innerHTML = '<p class="empty-cart-msg">Your cart is empty. Add some delicious food!</p>';
            } else {
                container.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <span class="cart-item-price">Rs. ${item.price * item.qty}</span>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-action="decrease" data-name="${item.name}">-</button>
                            <span class="cart-item-qty">${item.qty}</span>
                            <button class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
                            <button class="remove-item-btn" data-action="remove" data-name="${item.name}">🗑️</button>
                        </div>
                    </div>
                `).join('');

                // Re-attach event listeners for dynamic elements
                container.querySelectorAll('.qty-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const name = e.target.getAttribute('data-name');
                        const action = e.target.getAttribute('data-action');
                        if (action === 'increase') this.updateQty(name, 1);
                        else if (action === 'decrease') this.updateQty(name, -1);
                    });
                });

                container.querySelectorAll('.remove-item-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const name = e.target.getAttribute('data-name');
                        this.removeItem(name);
                    });
                });
            }

            if (totalEl) totalEl.textContent = `Rs. ${this.total}`;
        }

        checkout() {
            if (this.items.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            let message = "Hi, I would like to place an order:\n\n";
            this.items.forEach(item => {
                message += `- ${item.name} x${item.qty} (Rs. ${item.price * item.qty})\n`;
            });
            message += `\n*Total: Rs. ${this.total}*`;
            message += `\n\nPlease confirm my order.`;

            const phoneNumber = "923272591778";
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        }

        showNotification(msg) {
            // Simple notification logic
            const notif = document.createElement('div');
            notif.textContent = msg;
            notif.style.position = 'fixed';
            notif.style.bottom = '20px';
            notif.style.right = '20px';
            notif.style.backgroundColor = 'var(--primary)';
            notif.style.color = 'white';
            notif.style.padding = '1rem 2rem';
            notif.style.borderRadius = '50px';
            notif.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            notif.style.zIndex = '3000';
            notif.style.animation = 'fadeUp 0.3s ease forwards';

            document.body.appendChild(notif);

            setTimeout(() => {
                notif.style.opacity = '0';
                setTimeout(() => notif.remove(), 300);
            }, 2000);
        }
    }

    // Initialize Cart
    const cart = new Cart();

    // Menu Filter Logic (Existing - kept for compatibility)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');
    const searchInput = document.getElementById('menu-search');

    if (filterBtns.length > 0) {
        const showItem = (item) => {
            item.classList.remove('hidden');
            item.classList.add('fade-in');
            void item.offsetWidth;
            item.classList.add('show');
            item.addEventListener('transitionend', () => {
                item.classList.remove('fade-in');
            }, { once: true });
        };

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');

                menuCategories.forEach(category => {
                    if (filterValue === 'all') {
                        category.classList.remove('hidden');
                        const items = category.querySelectorAll('.menu-item');
                        items.forEach(item => showItem(item));
                    } else {
                        const categoryTitle = category.querySelector('.category-title').innerText.toLowerCase();
                        if (categoryTitle.includes(filterValue)) {
                            category.classList.remove('hidden');
                            const items = category.querySelectorAll('.menu-item');
                            items.forEach(item => showItem(item));
                        } else {
                            category.classList.add('hidden');
                        }
                    }
                });
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchValue = e.target.value.toLowerCase().trim();
                menuCategories.forEach(category => {
                    const items = category.querySelectorAll('.menu-item');
                    let hasVisibleItems = false;
                    items.forEach(item => {
                        const title = item.querySelector('h3').innerText.toLowerCase();
                        if (title.includes(searchValue)) {
                            showItem(item);
                            hasVisibleItems = true;
                        } else {
                            item.classList.add('hidden');
                        }
                    });
                    if (hasVisibleItems) category.classList.remove('hidden');
                    else category.classList.add('hidden');
                });
            });
        }
    }

    // =========================================
    // RESERVATION FORM LOGIC
    // =========================================
    const reservationForm = document.querySelector('.reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('res-name').value;
            const phone = document.getElementById('res-phone').value;
            const date = document.getElementById('res-date').value;
            const time = document.getElementById('res-time').value;
            const type = document.getElementById('res-type').value;
            const guests = document.getElementById('res-guests').value;

            const message = `*New Reservation Request*\n\nName: ${name}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nType: ${type}\nGuests: ${guests}\n\nPlease confirm availability.`;

            const phoneNumber = "923272591778";
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }

    // =========================================
    // THEME TOGGLE LOGIC
    // =========================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check saved preference
    const savedTheme = localStorage.getItem('zaiqa_theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeToggle) themeToggle.textContent = '🌙';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            themeToggle.textContent = isLight ? '🌙' : '☀️';
            localStorage.setItem('zaiqa_theme', isLight ? 'light' : 'dark');
        });
    }

    // =========================================
    // GALLERY LIGHTBOX LOGIC
    // =========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        lightboxClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
