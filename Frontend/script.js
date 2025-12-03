/* Boundless Moments - Shared JS */
(function() {
    // ✅ LIVE BACKEND CONNECTION
    const API_URL = "https://boundless-backend-cmli.onrender.com/api";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // ---------------------------
    // NEW: Mobile Hamburger Menu Logic
    // ---------------------------
    function initMobileMenu() {
        const hamburger = $('#hamburger');
        const navLinks = $('#nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                // Toggle the active class to slide menu in/out
                navLinks.classList.toggle('active');

                // Switch icon between bars and X
                const icon = hamburger.querySelector('i');
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        }
    }

    function setActiveNav() {
        const path = location.pathname.replace(/\\/g, '/');
        $$('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            const normalized = new URL(href, location.origin).pathname;
            if (path.endsWith(normalized) || (normalized.endsWith('/home/index.html') && (path.endsWith('/') || path.endsWith('/index.html')))) {
                a.classList.add('active');
            }
        });
    }

    function enableFadeIn() {
        $$('.fade-in').forEach((el, i) => {
            el.style.animationDelay = `${i * 60}ms`;
        });
    }

    async function loadPublicGallery() {
        const gallery = $('#gallery');
        if (!gallery) return; 
        gallery.innerHTML = "<p>Loading gallery...</p>"; 

        try {
            // ✅ Updated URL
            const res = await fetch(`${API_URL}/gallery`);
            if (!res.ok) throw new Error("Failed to load gallery");
            
            const images = await res.json();
            gallery.innerHTML = images.length ? 
                images.map(img => `
                    <div class="item" data-category="${img.category || 'general'}">
                        <img src="${img.image_url}" alt="${img.title || 'Gallery Image'}">
                    </div>
                `).join("") : 
                "<p>No images found in the gallery.</p>";
            
        } catch (err) {
            console.error(err);
            gallery.innerHTML = "<p>Error loading gallery. Please try again later.</p>";
        }
    }
    
    async function loadPublicTestimonials() {
        const container = $('.testimonials'); 
        if (!container) return; 

        try {
            // ✅ Updated URL
            const res = await fetch(`${API_URL}/testimonials`);
            if (!res.ok) throw new Error("Failed to load testimonials");
            
            const testimonials = await res.json();
            if (testimonials.length === 0) return; 

            const testimonialHtml = testimonials.map(t => {
                const ratingStars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
                const imgTag = t.client_image 
                    ? `<img src="${t.client_image}" alt="${t.client_name}">`
                    : '<div></div>'; 
                return `
                    <div class="card testimonial fade-in">
                        ${imgTag}
                        <div>
                            <h3>${t.client_name}</h3>
                            <div class="rating">${ratingStars}</div>
                            <p>“${t.testimonial_text}”</p>
                        </div>
                    </div>
                `;
            }).join("");

            container.insertAdjacentHTML('beforeend', testimonialHtml);

        } catch (err) {
            console.error(err);
            container.insertAdjacentHTML('beforeend', '<p>Could not load new testimonials.</p>');
        }
    }

    // ---------------------------
    // UPDATED FUNCTION TO LOAD DYNAMIC PRODUCTS
    // ---------------------------
    async function loadPublicShop() {
        const container = $('#shop'); // Find the shop grid
        if (!container) return; // Only run on shop page

        try {
            // ✅ Updated URL
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error("Failed to load products");

            const products = await res.json();
            if (products.length === 0) return; // No new products to add

            // Generate HTML for new products
            const productHtml = products.map(item => `
                <div class="card shop-item fade-in">
                    <img src="${item.image_url}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p class="muted">${item.description || item.category}</p>
                    <div class="flex" style="justify-content: space-between;">
                        <strong>$${item.price}</strong>
                        <button class="button brand add-to-cart" 
                            data-id="${item.id}" 
                            data-name="${item.name}" 
                            data-price="${item.price}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `).join("");

            // Append new products to the existing static ones
            container.insertAdjacentHTML('beforeend', productHtml);

        } catch (err) {
            console.error(err);
            container.insertAdjacentHTML('beforeend', '<p>Error loading new products.</p>');
        }
    }


    function initGalleryFilter() {
        const container = $('#gallery-filter');
        const gallery = $('#gallery');
        if (!container || !gallery) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            const filter = btn.dataset.filter;
            $$('#gallery-filter [data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            $$('#gallery .item').forEach(item => {
                const cat = item.dataset.category;
                item.classList.toggle('hidden', filter !== 'all' && cat !== filter);
            });
        });
    }

    function initForms() {
        $$('form[data-validate]')?.forEach(form => {
            form.addEventListener('submit', (e) => {
                let valid = true;
                $$('input[required], textarea[required], select[required]', form).forEach(field => {
                    const err = field.closest('label, .field')?.querySelector('.error');
                    if (err) err.textContent = '';
                    if (!field.value.trim()) {
                        valid = false;
                        if (err) err.textContent = 'This field is required.';
                    }
                    if (valid && field.type === 'email') {
                        const ok = /.+@.+\..+/.test(field.value);
                        if (!ok) {
                            valid = false;
                            if (err) err.textContent = 'Enter a valid email.';
                        }
                    }
                });
                if (!valid) e.preventDefault();
            });
        });
    }

    function initCalendar() {
        const cal = $('#calendar');
        if (!cal) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const first = new Date(year, month, 1);
        const startDay = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const bookedDates = (window.BOOKED_DATES || [5, 9, 14, 18, 23]);
        const header = cal.querySelector('.calendar-header');
        const grid = cal.querySelector('.grid');
        header.textContent = today.toLocaleString(undefined, {
            month: 'long',
            year: 'numeric'
        });

        for (let i = 0; i < startDay; i++) grid.appendChild(document.createElement('div'));

        for (let d = 1; d <= daysInMonth; d++) {
            const div = document.createElement('div');
            div.className = 'day';
            div.textContent = d;
            if (d === today.getDate()) div.classList.add('today');
            if (bookedDates.includes(d)) div.classList.add('booked');
            grid.appendChild(div);
        }
    }

    const CART_KEY = 'bm_cart_v1';

    function readCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch {
            return [];
        }
    }

    function writeCart(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        updateCartBadge();
    }

    function updateCartBadge() {
        const count = readCart().reduce((n, it) => n + (it.qty || 1), 0);
        $$('#cart-count').forEach(el => el.textContent = String(count));
    }

    // ---------------------------
    // UPDATED initShop FUNCTION
    // ---------------------------
    function initShop() {
        updateCartBadge(); // For the header
        
        const list = $('#cart-list');
        const totalEl = $('#cart-total');
        const checkout = $('#checkout');
        const shopContainer = $('#shop'); // The main grid

        // 1. Define renderCart in the main initShop scope
        function renderCart() {
            if (!list || !totalEl) return; 

            const cart = readCart();
            list.innerHTML = '';
            let total = 0;
            cart.forEach((it, idx) => {
                total += it.price * it.qty;
                const row = document.createElement('div');
                row.className = 'card flex';
                row.style.justifyContent = 'space-between';
                row.innerHTML = `<div><strong>${it.name}</strong><div class="muted">Qty: ${it.qty}</div></div><div>$${(it.price*it.qty).toFixed(2)} <button data-idx="${idx}" class="button ghost remove">Remove</button></div>`;
                list.appendChild(row);
            });
            totalEl.textContent = `$${total.toFixed(2)}`;
            updateCartBadge(); 
        }

        // 2. Add the "Add to Cart" listener using Event Delegation
        if (shopContainer) {
            shopContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-cart');
                if (!btn) return; 

                const item = {
                    id: btn.dataset.id, 
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price || '0'),
                    qty: 1
                };
                const cart = readCart();
                const existing = cart.find(c => c.id === item.id);
                if (existing) existing.qty += 1;
                else cart.push(item);
                
                writeCart(cart); 
                renderCart();  
            });
        }

        // 3. Add the "Remove from Cart" listener
        if (list && totalEl) {
            list.addEventListener('click', (e) => {
                const btn = e.target.closest('.remove');
                if (!btn) return;
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const cart = readCart();
                cart.splice(idx, 1);
                writeCart(cart); 
                renderCart(); 
            });

            // Initial render on page load
            renderCart();
        }

        // 4. Checkout logic
        if (checkout) {
            checkout.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                let ok = true;
                $$('input[required]', checkout).forEach(r => { if (!r.value.trim()) ok = false; });
                if (!ok) { alert('Please complete all required fields.'); return; }

                const cart = readCart();
                if (cart.length === 0) {
                    alert("Your cart is empty.");
                    return;
                }
                
                const formData = new FormData(checkout);
                const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

                try {
                    // ✅ Updated URL
                    const orderRes = await fetch(`${API_URL}/orders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customer_name: formData.get('customer_name'),
                            customer_email: formData.get('customer_email'),
                            customer_phone: formData.get('customer_phone'),
                            shipping_address: formData.get('shipping_address'),
                            total_amount: total.toFixed(2),
                            status: 'pending',
                            payment_status: 'paid' 
                        })
                    });

                    if (!orderRes.ok) throw new Error('Failed to create order');
                    
                    const newOrder = await orderRes.json();
                    const newOrderId = newOrder.id;

                    const itemPromises = cart.map(item => {
                        // Check if item.id is a real database ID (a number) or a static one (like "p1")
                        const isStaticItem = isNaN(parseInt(item.id));
                        
                        // ✅ Updated URL
                        return fetch(`${API_URL}/order-items`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: newOrderId,
                                product_id: isStaticItem ? 1 : parseInt(item.id), 
                                quantity: item.qty,
                                price: item.price
                            })
                        });
                    });

                    await Promise.all(itemPromises);

                    localStorage.removeItem(CART_KEY); 
                    updateCartBadge();
                    renderCart(); 
                    checkout.reset();
                    alert('Order placed successfully! Thank you.');

                } catch (err) {
                    console.error('Checkout error:', err);
                    alert('There was an error placing your order. Please try again.');
                }
            });
        }
    }

    function initAdmin() {
        const login = $('#admin-login');
        if (!login) return;

        if (sessionStorage.getItem('bm_admin') === '1') {
            window.location.href = 'admindashboard.html';
            return;
        }

        login.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = $('#admin-user').value.trim();
            const p = $('#admin-pass').value.trim();
            const err = $('#admin-error');
            err.textContent = '';

            try {
                // ✅ Updated URL
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: u,
                        password: p
                    })
                });

                if (response.ok) {
                    sessionStorage.setItem('bm_admin', '1');
                    window.location.href = 'admindashboard.html';
                } else {
                    err.textContent = 'Invalid credentials. Please try again.';
                }

            } catch (error) {
                console.error('Login fetch error:', error);
                err.textContent = 'Could not connect to the server.';
            }
        });
    }

    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const inquiryData = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                // ✅ Updated URL
                const response = await fetch(`${API_URL}/inquiries`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(inquiryData)
                });

                if (response.ok) {
                    alert('Message sent successfully! We\'ll get back to you soon.');
                    form.reset();
                } else {
                    alert('Error sending message. Please try again.');
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                alert('Could not connect to server. Please try again later.');
            }
        });
    }

    function initBookingForm() {
        const form = $('form[data-validate]');
        if (!form || !form.querySelector('input[type="date"]')) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const booking_time = '10:00:00'; 
            const booking = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                service_type: formData.get('service'),
                booking_date: formData.get('date'),
                booking_time,
                location: formData.get('location') || null,
                notes: formData.get('notes'),
                status: 'pending'
            };

            try {
                // ✅ Updated URL
                const res = await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(booking)
                });
                if (!res.ok) throw new Error('Failed to create booking');
                alert('Booking request submitted successfully! We\'ll confirm your appointment soon.');
                form.reset();
            } catch (err) {
                console.error(err);
                alert('Error submitting booking. Please try again.');
            }
        });
    }

    // ---------------------------
    // UPDATED DOMContentLoaded
    // ---------------------------
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize Mobile Menu
        initMobileMenu();

        setActiveNav();
        
        // Load dynamic content
        await loadPublicGallery(); 
        await loadPublicTestimonials(); 
        await loadPublicShop(); 
        
        // Init filters AFTER content is loaded
        initGalleryFilter(); 

        // Run animations AFTER dynamic content is added
        enableFadeIn(); 

        // Init forms and other interactive elements
        initForms();
        initCalendar();
        initShop();
        initAdmin();
        initContactForm();
        initBookingForm();
    });
})();