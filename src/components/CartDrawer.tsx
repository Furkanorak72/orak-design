'use client'

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import Image from "next/image"
import { createCheckoutSession } from "@/app/actions/stripe"
import { validateStock } from "@/app/actions/cart"
import { useEffect, useState } from "react"

export default function CartDrawer() {
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const items = useCartStore(state => state.items)
    const removeItem = useCartStore(state => state.removeItem)
    const updateQuantity = useCartStore(state => state.updateQuantity)
    const totalPrice = useCartStore(state => state.totalPrice())

    // Hydrate store manually or just wait for mount
    useEffect(() => {
        useCartStore.persist.rehydrate()
        setMounted(true)
    }, [])

    // Validate stock ONLY when drawer opens
    useEffect(() => {
        if (isOpen && items.length > 0) {
            const checkStock = async () => {
                const result = await validateStock(items.map(i => ({ id: i.id, quantity: i.quantity })))
                if (!result.valid) {
                    result.invalidIds.forEach(id => removeItem(id))
                    alert(result.messages.join("\n"))
                }
            }
            checkStock()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    if (!mounted) {
        // Render a placeholder or nothing during SSR to prevent mismatch
        return (
            <Button variant="ghost" size="icon" className="relative group">
                <ShoppingCart className="h-5 w-5 text-gray-500" />
                <span className="sr-only">Sepet</span>
            </Button>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <ShoppingCart className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                    <span className="sr-only">Sepet</span>
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-medium text-white flex items-center justify-center">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Sepetim ({items.length} Ürün)</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShoppingCart className="h-16 w-16 text-gray-300" />
                            <p className="text-muted-foreground">Sepetiniz boş.</p>
                            <SheetTrigger asChild>
                                <Button variant="link">Alışverişe Başla</Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-2 bg-muted/20 rounded-lg">
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-background">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex justify-between gap-2">
                                            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                                            <p className="font-bold text-sm">
                                                {(item.price * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 border rounded-md">
                                                <button
                                                    className="p-1 hover:bg-muted"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    className="p-1 hover:bg-muted"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="border-t pt-4 sm:flex-col sm:space-x-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Toplam</span>
                            <span className="text-xl font-bold">
                                <span className="text-xl font-bold">
                                    {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </span>
                            </span>
                        </div>
                        <form action={createCheckoutSession}>
                            <input type="hidden" name="cartItems" value={JSON.stringify(items)} />
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg shadow-blue-200 dark:shadow-none" type="submit">
                                Ödemeye Geç
                            </Button>
                        </form>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
