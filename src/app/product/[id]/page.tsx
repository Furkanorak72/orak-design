import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AddToCartButton from "@/components/AddToCartButton" // We'll create this client component

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Breadcrumb could go here */}

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Image Section */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 border">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <Badge variant="secondary" className="mb-2 text-sm">{product.category || 'Genel'}</Badge>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-blue-600">
                                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                            {product.stock_quantity > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Stokta Var</Badge>
                            ) : (
                                <Badge variant="destructive">Tükendi</Badge>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                            {product.description}
                        </p>

                        <div className="pt-6 border-t mt-auto">
                            {product.stock_quantity > 0 ? (
                                <AddToCartButton product={{
                                    id: product.id.toString(),
                                    name: product.name,
                                    price: product.price,
                                    image: product.image_url,
                                    quantity: 1,
                                    stock_quantity: product.stock_quantity
                                }} />
                            ) : (
                                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                                    Tükendi
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Güvenli Ödeme • Aynı Gün Kargo • İade Garantisi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
