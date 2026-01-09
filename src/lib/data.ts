export interface Product {
    id: string
    name: string
    price: number
    image: string
    category: string
    description: string
    stock_quantity?: number
}

export const products: Product[] = [
    {
        id: "1",
        name: "Modern Kablosuz Kulaklık",
        price: 1299.90,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        category: "Elektronik",
        description: "Yüksek ses kalitesi ve uzun pil ömrü ile mükemmel bir deneyim."
    },
    {
        id: "2",
        name: "Akıllı Saat Series 5",
        price: 2499.00,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        category: "Elektronik",
        description: "Sağlık takibi ve bildirimler bileğinizde."
    },
    {
        id: "3",
        name: "Ergonomik Ofis Koltuğu",
        price: 3450.00,
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
        category: "Mobilya",
        description: "Uzun çalışma saatleri için maksimum konfor."
    },
    {
        id: "4",
        name: "Deri Sırt Çantası",
        price: 899.90,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
        category: "Moda",
        description: "Şık tasarım ve geniş iç hacim."
    },
    {
        id: "5",
        name: "Mekanik Klavye",
        price: 1100.00,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b91a05c?w=500&q=80",
        category: "Elektronik",
        description: "Hızlı tepkime süresi ve RGB aydınlatma."
    },
    {
        id: "6",
        name: "Spor Ayakkabı",
        price: 1500.00,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        category: "Spor",
        description: "Hafif ve rahat yapısıyla koşu için ideal."
    },
    {
        id: "7",
        name: "Termos Kupa",
        price: 350.00,
        image: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=500&q=80",
        category: "Mutfak",
        description: "İçeceklerinizi 12 saat sıcak veya soğuk tutar."
    },
    {
        id: "8",
        name: "Minimalist Masa Lambası",
        price: 450.50,
        image: "https://images.unsplash.com/photo-1507473888900-52e1ad1d1535?w=500&q=80",
        category: "Aydınlatma",
        description: "Çalışma masanız için modern bir dokunuş."
    }
]
