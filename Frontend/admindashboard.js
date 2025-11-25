document.addEventListener("DOMContentLoaded", () => {
    // ✅ LIVE BACKEND CONNECTION
    const API_URL = "https://boundless-backend-cmli.onrender.com/api";

    const navItems = document.querySelectorAll(".admin-nav-item");
    const sections = document.querySelectorAll(".admin-section");

    // -------------------------------
    // Sidebar navigation
    // -------------------------------
    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const sectionId = item.dataset.section;

            if (sectionId === "logout") {
                sessionStorage.removeItem("bm_admin");
                window.location.href = "index.html"; // Updated to index.html
                return;
            }

            navItems.forEach(i => i.classList.remove("active"));
            sections.forEach(sec => sec.classList.remove("active"));

            item.classList.add("active");
            document.getElementById(`${sectionId}-section`).classList.add("active");

            // Clear badge when section opened
            const badge = item.querySelector(".badge");
            if (badge) badge.style.display = "none";
        });
    });

    // -------------------------------
    // Utility: Update sidebar badge
    // -------------------------------
    function updateBadge(id, count) {
        const item = document.querySelector(`.admin-nav-item[data-section="${id}"]`);
        if (!item) return;
        let badge = item.querySelector(".badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "badge";
            item.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
    }

    // -------------------------------
    // Dashboard counters
    // -------------------------------
    function updateDashboard(inquiriesCount, bookingsCount, usersCount) {
        const inqEl = document.getElementById("total-inquiries");
        const bookEl = document.getElementById("total-bookings");
        const userEl = document.getElementById("total-users");

        if (inqEl) inqEl.textContent = inquiriesCount;
        if (bookEl) bookEl.textContent = bookingsCount;
        if (userEl) userEl.textContent = usersCount;
    }

    // -------------------------------
    // Load Inquiries
    // -------------------------------
    async function loadInquiries() {
        const tbody = document.getElementById("inquiries-list");
        if (!tbody) return;
        tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
        try {
            const res = await fetch(`${API_URL}/inquiries`);
            if (!res.ok) throw new Error("Failed to fetch inquiries");
            const inquiries = await res.json();
            tbody.innerHTML = inquiries.length ?
                inquiries.map(i => `<tr>
                    <td>${i.id}</td>
                    <td>${i.name}</td>
                    <td>${i.email}</td>
                    <td>${i.subject}</td>
                    <td>${new Date(i.created_at).toLocaleDateString()}</td>
                    <td>${i.status || "New"}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="button small success view" data-id="${i.id}">View</button>
                            <button class="button small danger delete" data-id="${i.id}">Delete</button>
                        </div>
                    </td>
                </tr>`).join("") :
                "<tr><td colspan='7'>No inquiries found</td></tr>";

            const newCount = inquiries.filter(i => i.status === "new").length;
            updateBadge("inquiries", newCount);
            
            // Update dashboard counters safely
            const bookingsEl = document.getElementById("total-bookings");
            const usersEl = document.getElementById("total-users");
            if(bookingsEl && usersEl) {
                 updateDashboard(newCount, bookingsEl.textContent, usersEl.textContent);
            }

            tbody.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this inquiry?")) return;
                    const delRes = await fetch(`${API_URL}/inquiries/${id}`, { method: "DELETE" });
                    if (!delRes.ok) alert("Failed to delete inquiry");
                    loadInquiries();
                });
            });

            tbody.querySelectorAll(".view").forEach(btn => {
                btn.addEventListener("click", () => {
                    const inquiry = inquiries.find(i => i.id == btn.dataset.id);
                    if (inquiry) alert(`Name: ${inquiry.name}\nEmail: ${inquiry.email}\nSubject: ${inquiry.subject}\nMessage: ${inquiry.message || "N/A"}\nDate: ${new Date(inquiry.created_at).toLocaleString()}`);
                });
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='7'>Error loading inquiries</td></tr>";
            console.error(err);
        }
    }

    // -------------------------------
    // Load Bookings
    // -------------------------------
    async function loadBookings() {
        const tbody = document.getElementById("bookings-list");
        if (!tbody) return;
        tbody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";
        try {
            const res = await fetch(`${API_URL}/bookings`);
            if (!res.ok) throw new Error("Failed to fetch bookings");
            const bookings = await res.json();
            tbody.innerHTML = bookings.length ?
                bookings.map(b => `<tr>
                    <td>${b.id}</td>
                    <td>${b.name}</td>
                    <td>${b.email}</td>
                    <td>${b.service_type}</td>
                    <td>${new Date(b.booking_date).toLocaleDateString()}</td>
                    <td>${b.booking_time}</td>
                    <td>${b.status || "Pending"}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="button small success approve" data-id="${b.id}">Approve</button>
                            <button class="button small danger delete" data-id="${b.id}">Delete</button>
                        </div>
                    </td>
                </tr>`).join("") :
                "<tr><td colspan='8'>No bookings found</td></tr>";

            const pendingCount = bookings.filter(b => b.status === "pending").length;
            updateBadge("bookings", pendingCount);
            
            const inquiriesEl = document.getElementById("total-inquiries");
            const usersEl = document.getElementById("total-users");
            if(inquiriesEl && usersEl) {
                updateDashboard(inquiriesEl.textContent, pendingCount, usersEl.textContent);
            }

            tbody.querySelectorAll(".approve").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Approve this booking?")) return;
                    
                    const booking = bookings.find(b => b.id == id);
                    const body = { ...booking, status: "confirmed" };
                    delete body.id;
                    delete body.created_at;
                    delete body.updated_at;

                    const res = await fetch(`${API_URL}/bookings/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body) 
                    });
                    if (!res.ok) alert("Failed to approve booking.");
                    loadBookings();
                });
            });

            tbody.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this booking?")) return;
                    const res = await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete booking");
                    loadBookings();
                });
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='8'>Error loading bookings</td></tr>";
            console.error(err);
        }
    }

    // -------------------------------
    // Load Orders
    // -------------------------------
    async function loadOrders() {
        const tbody = document.getElementById("orders-list");
        if (!tbody) return; 
        tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";
        try {
            const res = await fetch(`${API_URL}/orders`);
            if (!res.ok) throw new Error("Failed to fetch orders");
            const orders = await res.json();
            tbody.innerHTML = orders.length ?
                orders.map(o => `<tr>
                    <td>${o.id}</td>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td>${o.customer_name}</td>
                    <td>${o.customer_email}</td>
                    <td>$${o.total_amount}</td>
                    <td>${o.status || "Pending"}</td>
                    <td>
                        <div class="action-buttons">
                            ${o.status === 'pending' ? `<button class="button small info approve-order" data-id="${o.id}">Mark Shipped</button>` : ''}
                            <button class="button small danger delete-order" data-id="${o.id}">Delete</button>
                        </div>
                    </td>
                </tr>`).join("") :
                "<tr><td colspan='7'>No orders found</td></tr>";

            tbody.querySelectorAll(".approve-order").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Mark this order as shipped?")) return;
                    
                    const order = orders.find(o => o.id == id);
                    const orderData = {
                        customer_name: order.customer_name,
                        customer_email: order.customer_email,
                        customer_phone: order.customer_phone,
                        shipping_address: order.shipping_address,
                        total_amount: order.total_amount,
                        payment_status: "paid", 
                        status: "shipped"
                    };

                    const res = await fetch(`${API_URL}/orders/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData)
                    });
                    
                    if (!res.ok) {
                        alert("Failed to update order status");
                    }
                    loadOrders();
                });
            });

            tbody.querySelectorAll(".delete-order").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this order permanently?")) return;
                    const res = await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete order");
                    loadOrders();
                });
            });

        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='7'>Error loading orders</td></tr>";
            console.error(err);
        }
    }

    // -------------------------------
    // Load Users
    // -------------------------------
    async function loadUsers() {
        const tbody = document.getElementById("users-list");
        if (!tbody) return;
        tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";
        try {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) throw new Error("Failed to fetch users");
            const users = await res.json();
            tbody.innerHTML = users.length ?
                users.map(u => `<tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="button small danger delete" data-id="${u.id}">Delete</button>
                        </div>
                    </td>
                </tr>`).join("") :
                "<tr><td colspan='5'>No users found</td></tr>";

            const usersCount = users.length;
            const inquiriesEl = document.getElementById("total-inquiries");
            const bookingsEl = document.getElementById("total-bookings");
            if(inquiriesEl && bookingsEl) {
                updateDashboard(inquiriesEl.textContent, bookingsEl.textContent, usersCount);
            }

            tbody.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this user?")) return;
                    const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete user");
                    loadUsers();
                });
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='5'>Error loading users</td></tr>";
            console.error(err);
        }
    }

    // -------------------------------
    // Handle Add New User Form
    // -------------------------------
    function initAddUserForm() {
        const form = document.getElementById("add-user-form");
        if (!form) return; 

        form.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            const username = document.getElementById("add-user-username").value;
            const email = document.getElementById("add-user-email").value;
            const password = document.getElementById("add-user-password").value;
            const role = document.getElementById("add-user-role").value;

            try {
                const res = await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password_hash: password, 
                        role: role
                    })
                });
                if (!res.ok) throw new Error("Failed to create user");
                
                alert("User created successfully!");
                form.reset(); 
                loadUsers(); 
            } catch (err) {
                console.error(err);
                alert("Error creating user. Check the console.");
            }
        });
    }

    // -------------------------------
    // Load Gallery
    // -------------------------------
    async function loadGallery() {
        const container = document.getElementById("gallery-manager-grid");
        if (!container) return;
        container.innerHTML = "Loading...";
        try {
            const res = await fetch(`${API_URL}/gallery`);
            if (!res.ok) throw new Error("Failed to fetch gallery");
            const items = await res.json();
            
            container.innerHTML = items.length ?
                items.map(img => `<div class="gallery-item">
                    <img src="${img.image_url}" alt="${img.title || 'Gallery Image'}">
                    <button class="button small danger delete" data-id="${img.id}">Delete</button>
                </div>`).join("") :
                "No images found";

            container.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this image?")) return;
                    const res = await fetch(`${API_URL}/gallery/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete image");
                    loadGallery();
                });
            });
        } catch (err) {
            container.innerHTML = "Error loading gallery";
            console.error(err);
        }
    }
    
    // -------------------------------
    // Handle Add New Gallery Image Form
    // -------------------------------
    function initAddGalleryForm() {
        const form = document.getElementById("add-gallery-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newImage = {
                image_url: document.getElementById("add-gallery-url").value,
                thumbnail_url: document.getElementById("add-gallery-thumb").value || null,
                title: document.getElementById("add-gallery-title").value || null,
                category: document.getElementById("add-gallery-category").value,
                description: document.getElementById("add-gallery-desc").value || null
            };
            try {
                const res = await fetch(`${API_URL}/gallery`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newImage)
                });
                if (!res.ok) throw new Error("Failed to add image");
                
                alert("Image added successfully!");
                form.reset();
                loadGallery(); 
            } catch (err) {
                console.error(err);
                alert("Error adding image. Check the console.");
            }
        });
    }

    // -------------------------------
    // Load Testimonials
    // -------------------------------
    async function loadTestimonials() {
        const container = document.getElementById("testimonials-list");
        if (!container) return;
        container.innerHTML = "Loading...";
        try {
            const res = await fetch(`${API_URL}/testimonials`);
            if (!res.ok) throw new Error("Failed to fetch testimonials");
            const items = await res.json();
            container.innerHTML = items.length ?
                items.map(t => `<div class="testimonial-item">
                    <p>"${t.testimonial_text}"</p> 
                    <strong>- ${t.client_name} (${t.service_type})</strong>
                    <button class="button small danger delete" data-id="${t.id}">Delete</button>
                </div>`).join("") :
                "No testimonials found";

            container.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this testimonial?")) return;
                    const res = await fetch(`${API_URL}/testimonials/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete testimonial");
                    loadTestimonials();
                });
            });
        } catch (err) {
            container.innerHTML = "Error loading testimonials";
            console.error(err);
        }
    }

    // -------------------------------
    // Handle Add New Testimonial Form
    // -------------------------------
    function initAddTestimonialForm() {
        const form = document.getElementById("add-testimonial-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const testimonialData = {
                client_name: document.getElementById("add-testimonial-name").value,
                client_image: document.getElementById("add-testimonial-image").value || null,
                service_type: document.getElementById("add-testimonial-service").value,
                rating: parseInt(document.getElementById("add-testimonial-rating").value),
                testimonial_text: document.getElementById("add-testimonial-text").value
            };
            try {
                const res = await fetch(`${API_URL}/testimonials`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(testimonialData)
                });
                if (!res.ok) throw new Error("Failed to add testimonial");
                alert("Testimonial added successfully!");
                form.reset();
                loadTestimonials(); 
            } catch (err) {
                console.error(err);
                alert("Error adding testimonial. Check the console.");
            }
        });
    }

    // -------------------------------
    // Load Shop Items (Products)
    // -------------------------------
    async function loadShop() {
        const container = document.getElementById("shop-items-list");
        if (!container) return;
        container.innerHTML = "Loading...";
        try {
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error("Failed to fetch shop items");
            const items = await res.json();
            container.innerHTML = items.length ?
                items.map(item => `<div class="shop-item-admin">
                    <img src="${item.image_url || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    <div class="shop-item-content">
                        <h4>${item.name}</h4>
                        <p class="price">$${item.price}</p>
                    </div>
                    <div class="shop-item-actions">
                        <button class="button small danger delete" data-id="${item.id}">Delete</button>
                    </div>
                </div>`).join("") :
                "No shop items found";

            container.querySelectorAll(".delete").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    if (!confirm("Delete this item?")) return;
                    const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
                    if (!res.ok) alert("Failed to delete item");
                    loadShop();
                });
            });
        } catch (err) {
            container.innerHTML = "Error loading shop items";
            console.error(err);
        }
    }
    
    // -------------------------------
    // Handle Add New Product Form
    // -------------------------------
    function initAddProductForm() {
        const form = document.getElementById("add-product-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productData = {
                name: document.getElementById("add-product-name").value,
                price: parseFloat(document.getElementById("add-product-price").value),
                image_url: document.getElementById("add-product-image").value,
                category: document.getElementById("add-product-category").value,
                description: document.getElementById("add-product-desc").value || null,
                stock_quantity: 100 // Default stock
            };
            
            try {
                const res = await fetch(`${API_URL}/products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                });
                if (!res.ok) throw new Error("Failed to add product");

                alert("Product added successfully!");
                form.reset();
                loadShop(); // Refresh the product list

            } catch(err) {
                console.error(err);
                alert("Error adding product. Check the console.");
            }
        });
    }

    // -------------------------------
    // Initial Load
    // -------------------------------
    loadInquiries();
    loadBookings();
    loadOrders(); 
    loadUsers();
    loadGallery();
    loadTestimonials();
    loadShop();
    initAddUserForm();
    initAddGalleryForm();
    initAddTestimonialForm(); 
    initAddProductForm();
    
    // -------------------------------
    // Refresh buttons
    // -------------------------------
    document.getElementById("refresh-inquiries")?.addEventListener("click", loadInquiries);
    document.getElementById("refresh-bookings")?.addEventListener("click", loadBookings);
    document.getElementById("refresh-users")?.addEventListener("click", loadUsers);
    document.getElementById("refresh-orders")?.addEventListener("click", loadOrders);
    
    // -------------------------------
    // Auto refresh every 30 seconds
    // -------------------------------
    setInterval(() => {
        // Only refresh if the main dashboard is active, to save resources
        if (document.getElementById('dashboard-section').classList.contains('active')) {
            loadInquiries();
            loadBookings();
            loadOrders();
            loadUsers();
        }
    }, 30000);
});