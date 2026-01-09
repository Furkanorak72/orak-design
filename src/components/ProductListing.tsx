'use client'

import { useState } from 'react'
import ProductCard from "@/components/ProductCard"
import { Button } from "@/components/ui/button"

export default function ProductListing({ products }: { products: any[] }) {
    const [filter, setFilter] = useState<'all' | 'T-Shirt' | 'Kazak'>('all')

    const filteredProducts = products.filter(product => {
        if (filter === 'all') return true
        // Case insensitive match or exact match depending on how data is saved
        return product.category?.toLowerCase() === filter.toLowerCase()
    })

    return (
        <div className="space-y-8">
            {/* Filter Tabs */}
            <div className="flex justify-center gap-4">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className="rounded-full px-6"
                >
                    Tümü
                </Button>
                <Button
                    variant={filter === 'T-Shirt' ? 'default' : 'outline'}
                    onClick={() => setFilter('T-Shirt')}
                    className="rounded-full px-6"
                >
                    T-Shirt
                </Button>
                <Button
                    variant={filter === 'Kazak' ? 'default' : 'outline'}
                    onClick={() => setFilter('Kazak')}
                    className="rounded-full px-6"
                >
                    Kazak
                </Button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 min-h-[400px]">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={{
                            id: product.id.toString(),
                            name: product.name,
                            price: product.price,
                            image: product.image_url,
                            category: product.category || 'Genel',
                            description: product.description || '',
                            stock_quantity: product.stock_quantity
                        }} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        <p>Bu kategoride ürün bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
