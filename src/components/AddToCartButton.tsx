'use client'

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
    product: {
        id: string
        name: string
        price: number
        image: string
        quantity: number
        stock_quantity?: number
    }
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
}

export default function AddToCartButton({ product, className, size = "default" }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a Link (though Card has Link, Footer might propagate)
        e.stopPropagation() // Stop event bubbling
        console.log("AddToCartButton: Clicked for product", product.name)
        addItem(product)
    }

    return (
        <Button size={size} className={cn("w-full transition-all active:scale-95", className)} onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Sepete Ekle
        </Button>
    )
}
