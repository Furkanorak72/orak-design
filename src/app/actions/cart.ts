'use server'

import { createClient } from "@/utils/supabase/server"

export async function validateStock(items: { id: string, quantity: number }[]) {
    const supabase = await createClient()
    const invalidItems: string[] = [] // IDs of items to remove
    const messages: string[] = []

    for (const item of items) {
        if (!item.id.toString().startsWith('design-')) {
            const { data: product } = await supabase
                .from('products')
                .select('stock_quantity, name')
                .eq('id', item.id)
                .single()

            if (product) {
                if (product.stock_quantity < item.quantity) {
                    invalidItems.push(item.id)
                    messages.push(`"${product.name}" stokta kalmadığı için sepetten çıkarıldı.`)
                }
            } else {
                // Product might be deleted
                invalidItems.push(item.id)
                messages.push("Bazı ürünler satıştan kaldırıldığı için sepetten çıkarıldı.")
            }
        }
    }

    return {
        valid: invalidItems.length === 0,
        invalidIds: invalidItems,
        messages
    }
}
