import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/data"
import AddToCartButton from "./AddToCartButton"

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const isOutOfStock = product.stock_quantity === 0
    return (
        <Card className={`group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale-[0.5]' : ''}`}>
            <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="backdrop-blur-md bg-white/80 dark:bg-black/60">
                            {product.category}
                        </Badge>
                    </div>
                </div>
            </Link>
            <CardContent className="p-4">
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                </p>
                {product.stock_quantity !== undefined && product.stock_quantity > 0 && (
                    <div className="mt-2 flex justify-end">
                        {product.stock_quantity <= 5 ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                                Sadece {product.stock_quantity} adet kaldı!
                            </span>
                        ) : (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Stokta Son {product.stock_quantity} Adet
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between gap-4">
                <span className="text-xl font-bold text-blue-600">
                    {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <div className="w-1/2">
                    {product.stock_quantity === 0 ? (
                        <Button disabled className="w-full bg-gray-400">Tükendi</Button>
                    ) : (
                        <AddToCartButton product={{ ...product, quantity: 1 }} />
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
