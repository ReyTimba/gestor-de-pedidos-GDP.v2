import { prisma } from "../src/db/prisma";
import { TEMP_RESTAURANT_ID } from "../src/config/tempIds";

type SeedProduct = {
    name: string;
    quantity: number;
    unit: string;
};

type SeedSupplier = {
    name: string;
    phone?: string;
    products: SeedProduct[];
};

const suppliers: SeedSupplier[] = [
    {
        name: "SHYBARUM",
        phone: "658 76 48 23",
        products: [
            { name: "Sardina ahumada", quantity: 5, unit: "ud" },
            { name: "Anchoas", quantity: 7, unit: "ud" },
            { name: "Bacalao desmigado", quantity: 3, unit: "ud" },
            { name: "Salmon ahumado", quantity: 1, unit: "ud" },
            { name: "Redondo ternera", quantity: 4, unit: "ud" },
            { name: "Solomillo ternera", quantity: 2, unit: "ud" },
            { name: "Ribeye", quantity: 1, unit: "ud" },
            { name: "Entrana", quantity: 7, unit: "ud" },
            { name: "Tataki", quantity: 1, unit: "ud" },
            { name: "Costillas de ternera", quantity: 1, unit: "ud" },
            { name: "Solomillo lb. / pinchos", quantity: 16, unit: "ud" },
            { name: "Cecina", quantity: 1, unit: "ud" },
            { name: "Jamon de cebo campo", quantity: 1, unit: "ud" },
            { name: "Rabo de toro", quantity: 1, unit: "20 kg" },
            { name: "Presa iberica", quantity: 3, unit: "ud" },
            { name: "Nuggets", quantity: 1, unit: "12 kg" },
            { name: "Chuletas", quantity: 7, unit: "ud" },
            { name: "Bacalao", quantity: 4, unit: "ud" },
            { name: "Picada", quantity: 1, unit: "ud" },
            { name: "Alcachofas confitadas", quantity: 1, unit: "ud" },
            { name: "Conserva: mejillones", quantity: 1, unit: "ud" },
            { name: "Conserva: zamburinas", quantity: 1, unit: "ud" },
            { name: "Conserva: txipis", quantity: 1, unit: "ud" },
            { name: "Conserva: pate lechazo churro", quantity: 1, unit: "ud" },
            { name: "Conserva: pate avestruz", quantity: 1, unit: "ud" },
            { name: "Conserva: rilletes de pato", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "VERDURAS",
        products: [
            "Patata limpia",
            "Patata agria",
            "Patata baby",
            "Berenjenas",
            "Pimiento rojo",
            "Cebolla",
            "Cebolla morada",
            "Calabacin",
            "Boniato",
            "Apio",
            "Tomate temporada",
            "Tomate rama",
            "Limon",
            "Lima",
            "Judia verde",
            "Zanahoria",
            "Pimiento padron",
            "Mix lechuga menu",
            "Canonigos",
            "Espinacas baby",
            "Setas mix",
            "Puerro",
            "Brotes guisantes",
            "Brotes cilantro",
            "Ajo pelado",
            "Ajetes",
            "Rabanitos",
            "Perejil",
            "Cilantro",
            "Menta",
            "Romero",
            "Tomillo",
            "Fresa",
            "Naranja",
            "Pina",
            "Oregano fresco",
        ].map((name) => ({ name, quantity: 1, unit: "kg" })),
    },
    {
        name: "HUEVOS - Mercado Rojas Clemente",
        phone: "699 40 03 06",
        products: [
            { name: "Huevos", quantity: 3, unit: "cajas" },
            { name: "Clara pasteurizada", quantity: 2, unit: "ud" },
            { name: "Yema pasteurizada", quantity: 2, unit: "ud" },
        ],
    },
    {
        name: "ARTESPIGA",
        phone: "638 30 34 51",
        products: [{ name: "Pan torrija", quantity: 2, unit: "caja de 4 barras" }],
    },
    {
        name: "DECLINATURA",
        phone: "675 58 10 60",
        products: [
            { name: "Coca", quantity: 1, unit: "ud" },
            { name: "Torrezno", quantity: 1, unit: "4/caja" },
            { name: "Laminas de pan", quantity: 1, unit: "10/caja" },
        ],
    },
    {
        name: "DISVALSUR",
        phone: "647 50 75 23",
        products: [
            { name: "Azucar", quantity: 1, unit: "saco 25 kg" },
            { name: "Azucar moreno", quantity: 2, unit: "ud" },
            { name: "Sal fina", quantity: 8, unit: "ud" },
            { name: "Sal gruesa", quantity: 1, unit: "ud" },
            { name: "Sal escamas", quantity: 1, unit: "ud" },
            { name: "Mayonesa", quantity: 8, unit: "ud" },
            { name: "Garbanzos", quantity: 1, unit: "ud" },
            { name: "Atun", quantity: 7, unit: "ud" },
            { name: "Ventresca", quantity: 3, unit: "ud" },
            { name: "Alcaparras", quantity: 4, unit: "ud" },
            { name: "Miel", quantity: 1, unit: "ud" },
            { name: "Harina", quantity: 2, unit: "ud" },
            { name: "Curry verde", quantity: 1, unit: "ud" },
            { name: "Mostaza", quantity: 1, unit: "ud" },
            { name: "Mostaza antigua", quantity: 3, unit: "ud" },
            { name: "Ketchup", quantity: 4, unit: "ud" },
            { name: "Salsa Perrins", quantity: 1, unit: "ud" },
            { name: "Tabasco", quantity: 3, unit: "ud" },
            { name: "Aceite oliva", quantity: 2, unit: "5 L" },
            { name: "Aceite girasol", quantity: 3, unit: "ud" },
            { name: "Aceite freidora", quantity: 5, unit: "ud" },
            { name: "Vino blanco", quantity: 8, unit: "ud" },
            { name: "Vinagre", quantity: 8, unit: "ud" },
            { name: "Mantequilla", quantity: 3, unit: "ud" },
            { name: "Cobertura chocolate", quantity: 1, unit: "ud" },
            { name: "Nueces", quantity: 0.5, unit: "ud" },
            { name: "Gelatina", quantity: 7, unit: "ud" },
            { name: "Panko", quantity: 7, unit: "ud" },
            { name: "Harina garbanzos", quantity: 3, unit: "ud" },
            { name: "Tinta calamar", quantity: 2, unit: "ud" },
            { name: "Pepinillos", quantity: 1, unit: "ud" },
            { name: "Alcaparrones", quantity: 1, unit: "ud" },
            { name: "Papel film", quantity: 1, unit: "ud" },
            { name: "Papel aluminio", quantity: 0.5, unit: "ud" },
            { name: "Papel horno", quantity: 2, unit: "ud" },
            { name: "Cacao polvo", quantity: 0.5, unit: "ud" },
            { name: "Maizena", quantity: 0.5, unit: "ud" },
            { name: "Pimenton dulce", quantity: 1, unit: "ud" },
            { name: "Pimenton picante", quantity: 1, unit: "ud" },
            { name: "Curry", quantity: 1, unit: "ud" },
            { name: "Hierbas provenzales", quantity: 1, unit: "ud" },
            { name: "Laurel", quantity: 1, unit: "ud" },
            { name: "Pimienta negra", quantity: 1, unit: "ud" },
            { name: "Pimienta negra molida", quantity: 1, unit: "ud" },
            { name: "Azucar glass", quantity: 2, unit: "ud" },
            { name: "Canela rama", quantity: 1, unit: "ud" },
            { name: "Canela molida", quantity: 1, unit: "ud" },
            { name: "Sesamo", quantity: 1, unit: "ud" },
            { name: "Xantana", quantity: 1, unit: "ud" },
            { name: "Polvo remolacha", quantity: 1, unit: "ud" },
            { name: "Vino tinto", quantity: 10, unit: "ud" },
            { name: "Caldo pescado", quantity: 2, unit: "ud" },
            { name: "Lentejas", quantity: 1, unit: "ud" },
            { name: "Almendra", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "MAMMAFIORE",
        phone: "628 46 19 27",
        products: [
            { name: "Tomate grande", quantity: 5, unit: "ud" },
            { name: "Tomate pequeno", quantity: 6, unit: "ud" },
            { name: "Concentrado tomate", quantity: 6, unit: "ud" },
            { name: "Datterini", quantity: 10, unit: "ud" },
            { name: "Harina Caputo", quantity: 1, unit: "25 kg" },
            { name: "Nata", quantity: 12, unit: "ud" },
            { name: "Mascarpone", quantity: 6, unit: "ud" },
            { name: "Savoiardi", quantity: 6, unit: "ud" },
            { name: "Crema cannoli", quantity: 5, unit: "ud" },
            { name: "Cannoli", quantity: 15, unit: "ud" },
            { name: "Tomate seco", quantity: 1, unit: "ud" },
            { name: "Pasta tortellini", quantity: 1, unit: "ud" },
            { name: "Pasta ravioli", quantity: 1, unit: "ud" },
            { name: "Pasta orecchiette", quantity: 1, unit: "ud" },
            { name: "Pasta trofie", quantity: 1, unit: "ud" },
            { name: "Pasta rigatoni", quantity: 5, unit: "ud" },
            { name: "Pasta linguine", quantity: 5, unit: "ud" },
            { name: "Pasta penne", quantity: 5, unit: "ud" },
            { name: "Pasta spaghetti", quantity: 5, unit: "ud" },
            { name: "Porchetta", quantity: 1, unit: "ud" },
            { name: "Speck", quantity: 1, unit: "ud" },
            { name: "Bresaola", quantity: 1, unit: "ud" },
            { name: "Guanciale", quantity: 1, unit: "ud" },
            { name: "Mortadella", quantity: 1, unit: "ud" },
            { name: "Trufa", quantity: 1, unit: "ud" },
            { name: "Ricotta salata", quantity: 1, unit: "ud" },
            { name: "Pecorino", quantity: 1, unit: "ud" },
            { name: "Nutella", quantity: 1, unit: "ud" },
            { name: "Agua gas", quantity: 1, unit: "ud" },
            { name: "Limoncello", quantity: 1, unit: "ud" },
            { name: "Parmesano", quantity: 3, unit: "ud" },
            { name: "Pan carasau", quantity: 8, unit: "ud" },
            { name: "Tomino", quantity: 1, unit: "ud" },
            { name: "Burrata", quantity: 12, unit: "ud" },
            { name: "Granella pistacho", quantity: 1, unit: "ud" },
            { name: "Nebula", quantity: 1, unit: "ud" },
            { name: "Mozzarella cortada", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "HELADOS VALENTINO",
        phone: "656 70 48 30",
        products: [
            { name: "Leche merengada", quantity: 6, unit: "ud" },
            { name: "Cremino", quantity: 3, unit: "ud" },
            { name: "Palomita", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "TORMOL",
        products: [
            { name: "Pastillas horno verde", quantity: 1, unit: "ud" },
            { name: "Pastillas horno azul", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "GAS PROPANO",
        phone: "644 72 59 45",
        products: [{ name: "Bombonas", quantity: 1, unit: "ud" }],
    },
    {
        name: "CRISBERLIN",
        phone: "653 685 434",
        products: [
            { name: "Abrillantador maquina 10 L", quantity: 1, unit: "ud" },
            { name: "Lavavajillas maquina 10 L", quantity: 1, unit: "ud" },
            { name: "Lavavajillas manual", quantity: 6, unit: "5 L" },
            { name: "Desengrasante", quantity: 6, unit: "ud" },
            { name: "Desengrasante plancha", quantity: 4, unit: "ud" },
            { name: "Fregasuelo", quantity: 5, unit: "ud" },
            { name: "Acero inox", quantity: 6, unit: "ud" },
            { name: "Lejia", quantity: 4, unit: "ud" },
            { name: "Bolsa vacio 200 x 300", quantity: 4, unit: "ud" },
            { name: "Bolsa vacio 150 x 300", quantity: 6, unit: "ud" },
            { name: "Guantes S/M/L", quantity: 1, unit: "ud" },
            { name: "Estropajo", quantity: 1, unit: "ud" },
            { name: "Etiquetas", quantity: 2, unit: "ud" },
            { name: "Lumin pastilla", quantity: 5, unit: "ud" },
            { name: "Nanas paquete", quantity: 1, unit: "ud" },
            { name: "Abrillantador maquina 5 L", quantity: 3, unit: "ud" },
            { name: "Lavavajilla maquina 5 L", quantity: 3, unit: "ud" },
            { name: "Rollo papel cocina pequeno", quantity: 5, unit: "ud" },
            { name: "Escoba / mocho", quantity: 3, unit: "ud" },
            { name: "Toallitas aloe vera", quantity: 1, unit: "ud" },
            { name: "Bolsas basura", quantity: 30, unit: "ud" },
            { name: "Tupper tarta llevar", quantity: 2, unit: "750 g aprox." },
            { name: "Palitos pincho", quantity: 1, unit: "ud" },
            { name: "Bayetas multiusos", quantity: 5, unit: "ud" },
            { name: "Papel mano", quantity: 1, unit: "ud" },
            { name: "Papel higienico", quantity: 1, unit: "2 capas" },
            { name: "Sal descalcificador", quantity: 2, unit: "ud" },
            { name: "Servilletas kraft 40 x 40", quantity: 1, unit: "ud" },
            { name: "Servilletas kraft 20 x 20", quantity: 1, unit: "ud" },
            { name: "Carbon", quantity: 4, unit: "ud" },
            { name: "Carga sifon", quantity: 1, unit: "ud" },
            { name: "Servilletas negras", quantity: 1, unit: "ud" },
            { name: "Mangas pasteleras", quantity: 1, unit: "ud" },
            { name: "Pastillas limpia horno", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "QUESOS",
        phone: "627 41 86 27",
        products: [
            { name: "Queso vaca", quantity: 3, unit: "ud" },
            { name: "Queso oveja", quantity: 3, unit: "ud" },
            { name: "Queso cabra", quantity: 3, unit: "ud" },
        ],
    },
    {
        name: "LA MARRALE",
        phone: "609 64 89 39",
        products: [
            { name: "Aceitunas partidas", quantity: 1, unit: "ud" },
            { name: "Aceitunas sin hueso", quantity: 1, unit: "ud" },
            { name: "Papas fritas", quantity: 1, unit: "ud" },
            { name: "Mermelada", quantity: 1, unit: "ud" },
            { name: "Vinagre Jerez", quantity: 1, unit: "5 L" },
            { name: "Mojama", quantity: 0.5, unit: "ud" },
        ],
    },
    {
        name: "LA CHAINE",
        phone: "607 21 41 69",
        products: [
            { name: "Pure frambuesa", quantity: 1, unit: "ud" },
            { name: "Tahin", quantity: 1, unit: "ud" },
            { name: "Vainilla rama", quantity: 7, unit: "ud" },
            { name: "Papadoms", quantity: 6, unit: "ud" },
            { name: "Teryaki", quantity: 1, unit: "ud" },
            { name: "Soja", quantity: 1, unit: "ud" },
            { name: "Choco-peta", quantity: 1, unit: "ud" },
            { name: "Pasta ajo ceviche", quantity: 1, unit: "ud" },
            { name: "Ai picante / chiu chow", quantity: 1, unit: "ud" },
            { name: "Pasta brick", quantity: 1, unit: "ud" },
            { name: "Hoja lima", quantity: 1, unit: "ud" },
            { name: "Hoja platano", quantity: 0.5, unit: "ud" },
            { name: "Mayonesa japonesa", quantity: 1, unit: "ud" },
            { name: "Salsa oriental", quantity: 1, unit: "ud" },
            { name: "Maiz cancha", quantity: 2, unit: "ud" },
            { name: "Wasabi", quantity: 1, unit: "ud" },
            { name: "Pasta gochujang", quantity: 1, unit: "ud" },
            { name: "Aceite oriental", quantity: 1, unit: "ud" },
            { name: "Tomatillas / tomates", quantity: 1, unit: "ud" },
            { name: "Alga nori tostada", quantity: 1, unit: "ud" },
            { name: "Cola gambon", quantity: 1, unit: "ud" },
            { name: "Codium", quantity: 1, unit: "ud" },
            { name: "Polpo", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "JAPOFISH",
        products: [
            { name: "Calamar", quantity: 1, unit: "ud" },
            { name: "Sepia", quantity: 1, unit: "ud" },
            { name: "Tellinas", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "PESCADERIA - Mercado Rojas Clemente",
        phone: "657 85 35 76",
        products: [
            { name: "Corvina", quantity: 1, unit: "ud" },
            { name: "Salmon", quantity: 1, unit: "ud" },
            { name: "Boquerones", quantity: 1, unit: "ud" },
            { name: "Sepia mayo", quantity: 3, unit: "cajas" },
            { name: "Pescado menu", quantity: 1, unit: "ud" },
        ],
    },
    {
        name: "PANESCO",
        phone: "673 83 07 82",
        products: [{ name: "Pan mini burger", quantity: 1, unit: "ud" }],
    },
    {
        name: "CARNICERO",
        phone: "606 54 34 89",
        products: [
            { name: "Figatells pasta", quantity: 5, unit: "ud" },
            { name: "Hamburguesa", quantity: 5, unit: "ud" },
            { name: "Herrero", quantity: 1, unit: "ud" },
            { name: "Secreto menu", quantity: 1, unit: "ud" },
            { name: "Pollo menu", quantity: 1, unit: "ud" },
            { name: "Carrillera menu", quantity: 1, unit: "ud" },
            { name: "Sobrasadas", quantity: 4, unit: "ud" },
        ],
    },
];

async function clearDatabase() {
    await prisma.orderLine.deleteMany();
    await prisma.order.deleteMany();
    await prisma.requiredProduct.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();
}

async function seed() {
    await clearDatabase();

    const restaurant = await prisma.restaurant.create({
        data: {
            id: TEMP_RESTAURANT_ID,
            name: "Teca",
        },
    });

    const user = await prisma.user.create({
        data: {
            name: "Rey",
            restaurantId: restaurant.id,
        },
    });

    const order = await prisma.order.create({
        data: {
            restaurantId: restaurant.id,
            userId: user.id,
            orderStatus: "DRAFT",
        },
    });

    for (const supplierData of suppliers) {
        const supplier = await prisma.supplier.create({
            data: {
                name: supplierData.name,
                phone: supplierData.phone,
                restaurantId: restaurant.id,
            },
        });

        for (const productData of supplierData.products) {
            const requiredProduct = await prisma.requiredProduct.create({
                data: {
                    name: productData.name,
                    defaultQuantity: productData.quantity,
                    defaultUnit: productData.unit,
                    restaurantId: restaurant.id,
                    supplierId: supplier.id,
                },
            });

            await prisma.orderLine.create({
                data: {
                    nameSnapshot: requiredProduct.name,
                    quantityOrdered: productData.quantity,
                    unitSnapshot: productData.unit,
                    supplierSnapshot: supplier.name,
                    requiredProductId: requiredProduct.id,
                    orderId: order.id,
                },
            });
        }
    }
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
