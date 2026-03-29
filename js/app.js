document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM Principales
    const productGrid = document.getElementById('product-grid');
    const productFilters = document.getElementById('product-filters');
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    // Inicializar UI
    initFilters();
    renderProducts('all');

    // 1. Navegación y Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.add('scrolled'); 
        }
    });
    
    // Fuerza fondo blanco por defecto para mejor lectura de logo
    navbar.classList.add('scrolled');

    // Menú móvil
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Cerrar menú móvil al hacer click en link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.add('fa-bars');
            mobileToggle.querySelector('i').classList.remove('fa-times');
        });
    });

    // 2. Renderizado de Productos y Filtros
    function initFilters() {
        // Limpiamos siempre primero
        productFilters.innerHTML = '<button class="filter-btn active" data-filter="all">Todos</button>';
        
        const categories = DataManager.getCategories();
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            productFilters.appendChild(btn);
        });

        // Eventos de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts(e.target.dataset.filter);
            });
        });
    }

    function renderProducts(filter) {
        productGrid.innerHTML = '';
        const allProducts = DataManager.getProducts();
        const filtered = filter === 'all' ? allProducts : allProducts.filter(p => p.categoria === filter);

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p class="text-muted text-center w-100" style="grid-column: 1/-1;">No hay productos en esta categoría.</p>';
            return;
        }

        filtered.forEach(p => {
            const el = document.createElement('div');
            el.className = 'product-card';
            
            // Format WhatsApp Message
            const waText = encodeURIComponent(`Hola Vitaleze, quiero encargar: ${p.nombre} 🌾`);
            const waLink = `https://wa.me/5493512755594?text=${waText}`;

            el.innerHTML = `
                <div class="product-img-wrapper">
                    <span class="product-category-tag">${p.categoria}</span>
                    <img src="${p.imagen}" alt="${p.nombre}" class="product-img" loading="lazy">
                </div>
                <div class="product-content">
                    <h3 class="product-title">${p.nombre}</h3>
                    <p class="product-desc">${p.descripcion}</p>
                    ${p.ingredientes ? `<div class="product-ingredients"><strong>Ingredientes:</strong> ${p.ingredientes}</div>` : ''}
                    <a href="${waLink}" target="_blank" class="btn btn-primary w-100 mt-2">
                        <i class="fa-brands fa-whatsapp"></i> Pedir
                    </a>
                </div>
            `;
            productGrid.appendChild(el);
        });
    }

    // =========================================
    // LÓGICA DEL PANEL DE ADMINISTRACIÓN
    // =========================================
    const btnOpenAdmin = document.getElementById('btn-open-admin');
    const adminModal = document.getElementById('admin-modal');
    const btnCloseAdmin = document.getElementById('btn-close-admin');

    if(btnOpenAdmin) {
        btnOpenAdmin.addEventListener('click', () => {
            adminModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // stop scroll
            refreshAdminLists();
        });
    }

    if(btnCloseAdmin) {
        btnCloseAdmin.addEventListener('click', () => {
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
            // Refrescar UI pública
            initFilters();
            renderProducts('all');
        });
    }

    // Pestañas del Admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.target).classList.add('active');
        });
    });

    // --- FORMULARIO PRODUCTOS ---
    const formProducto = document.getElementById('form-producto');
    if(formProducto) {
        formProducto.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let imageUrl = document.getElementById('prod-img-url').value;
            const fileInput = document.getElementById('prod-img-file');
            
            // Si hay archivo, convertir a Base64
            if (fileInput.files && fileInput.files[0]) {
                try {
                    imageUrl = await fileToBase64(fileInput.files[0]);
                } catch (err) {
                    alert('La imagen es demasiado grande. Intenta subir una URL o una imagen de menor resolución.');
                    return;
                }
            }

            if (!imageUrl) {
                imageUrl = './assets/default.jpg'; // Default placeholder si no hay imagen
            }

            const product = {
                id: document.getElementById('prod-id').value || null,
                nombre: document.getElementById('prod-nombre').value,
                categoria: document.getElementById('prod-categoria').value,
                descripcion: document.getElementById('prod-descripcion').value,
                ingredientes: document.getElementById('prod-ingredientes').value,
                imagen: imageUrl
            };

            try {
                DataManager.saveProduct(product);
                formProducto.reset();
                document.getElementById('prod-id').value = '';
                refreshAdminLists();
                alert('Producto guardado correctamente.');
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    alert('El espacio de almacenamiento local está lleno. Elimina imágenes pesadas o usa URLs de imágenes.');
                }
            }
        });
    }

    // --- REFRESCO DE LISTAS ADMINISTRATIVAS ---
    function refreshAdminLists() {
        const prodList = document.getElementById('admin-lista-productos');
        if(!prodList) return;
        
        prodList.innerHTML = '';
        DataManager.getProducts().forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${p.nombre}</strong> (${p.categoria})</span>
                <div class="actions">
                    <button class="btn-edit" data-id="${p.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete" data-id="${p.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            prodList.appendChild(li);
        });

        attachAdminDeleteEvents();
        attachAdminEditEvents();
    }

    function attachAdminDeleteEvents() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if(confirm('¿Seguro que deseas eliminar este producto?')) {
                    DataManager.deleteProduct(id);
                    refreshAdminLists();
                }
            });
        });
    }

    function attachAdminEditEvents() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const p = DataManager.getProducts().find(x => x.id === id);
                if (p) {
                    document.getElementById('prod-id').value = p.id;
                    document.getElementById('prod-nombre').value = p.nombre;
                    document.getElementById('prod-categoria').value = p.categoria;
                    document.getElementById('prod-descripcion').value = p.descripcion;
                    document.getElementById('prod-ingredientes').value = p.ingredientes;
                    document.getElementById('prod-img-url').value = p.imagen;
                    
                    document.querySelectorAll('.tab-btn')[0].click(); // Ir a la tab de producto
                }
            });
        });
    }

    // --- UTILIDAD BASE64 ---
    // Convierte un archivo de imagen en un data string (base64) redimensionando si es posible
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Calidad 80%
                };
                img.onerror = reject;
            };
            reader.onerror = error => reject(error);
        });
    }

    // Efecto sutil en hover
    const heroBg = document.querySelector('.hero-bg-shapes');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        if(heroBg) {
            heroBg.style.transform = `translate(-${x * 30}px, -${y * 30}px)`;
        }
    });

});
