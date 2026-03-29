// Datos por defecto (Seed Data) v3
const defaultProducts = [
    {
        id: "prod_1",
        nombre: "Budín de Limón Keto",
        categoria: "Budines",
        descripcion: "Exquisito budín cítrico, suave y esponjoso. Ideal para acompañar tus mates.",
        ingredientes: "Harina de almendras, huevos, stevia, jugo de limón, polvo de hornear.",
        imagen: "./assets/budin.png"
    },
    {
        id: "prod_2",
        nombre: "Galletitas y Barras",
        categoria: "Galletas",
        descripcion: "Galletas crocantes y barras llenas de energía con chips de chocolate amargo.",
        ingredientes: "Avena arrollada, harina integral, chips 70% cacao, pasta de maní.",
        imagen: "./assets/galletas.png"
    },
    {
        id: "prod_3",
        nombre: "Barra Energética",
        categoria: "Barras proteicas",
        descripcion: "El snack perfecto para antes o después de entrenar.",
        ingredientes: "Pasta de maní, avena, chips de chocolate, miel pura.",
        imagen: "./assets/barra.png"
    },
    {
        id: "prod_4",
        nombre: "Mix Frutos Secos Premium",
        categoria: "Frutos secos",
        descripcion: "Selección de las mejores nueces, almendras y castañas para tu día.",
        ingredientes: "Nueces, Almendras, Castañas de Cajú, Pasas Rubias.",
        imagen: "./assets/mix.png"
    },
    {
        id: "prod_5",
        nombre: "Alfajores de Almendra Keto",
        categoria: "Alfajores",
        descripcion: "Rellenos de abundante dulce de leche sin azúcar y masa de almendras.",
        ingredientes: "Harina de almendra, dulce de leche keto.",
        imagen: "./assets/alfajor.png"
    },
    {
        id: "prod_6",
        nombre: "Chocotorta sin Azúcar",
        categoria: "Alfajores", 
        descripcion: "Postre clásico en versión saludable, sin azúcar agregada.",
        ingredientes: "Galletas integrales, queso crema, dulce de leche sin azúcar.",
        imagen: "./assets/dona.png"
    }
];

// Gestión de Datos
class DataManager {
    static init() {
        // Usamos una nueva clave (v3) para asegurar que tome los nuevos datos e ignore los viejos
        if (!localStorage.getItem('vitaleze_productos_v3')) {
            localStorage.setItem('vitaleze_productos_v3', JSON.stringify(defaultProducts));
        }
    }

    // --- PRODUCTOS ---
    static getProducts() {
        return JSON.parse(localStorage.getItem('vitaleze_productos_v3')) || [];
    }

    static saveProduct(product) {
        const products = this.getProducts();
        if (product.id) {
            // Update
            const index = products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                products[index] = product;
            } else {
                products.push(product); // fallback
            }
        } else {
            // Create
            product.id = 'prod_' + Date.now();
            products.push(product);
        }
        localStorage.setItem('vitaleze_productos_v3', JSON.stringify(products));
        return product;
    }

    static deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('vitaleze_productos_v3', JSON.stringify(products));
    }

    static getCategories() {
        const products = this.getProducts();
        const categories = new Set(products.map(p => p.categoria));
        return Array.from(categories);
    }
}

// Inicializar al cargar el script
DataManager.init();
