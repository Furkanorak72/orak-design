'use server'

import { createClient } from "@/utils/supabase/server"

export async function processSuccessfulOrder(orderId: number) {
    const supabase = await createClient()

    // 1. Fetch Order
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (error || !order) {
        console.error("Order not found or error:", error?.message)
        return { success: false, error: "Order not found" }
    }

    // 2. Idempotency Check: prevent double deduction
    if (order.status === 'Ödeme Alındı' || order.status === 'Teslim Edildi') {
        return { success: true, message: "Already processed" }
    }

    // 3. Deduct Stock for each item
    const items = order.items as any[]

    for (const item of items) {
        // Only deduct for real products (numeric IDs)
        if (!item.id.toString().startsWith('design-')) {
            // secure RPC call
            const { error: rpcError } = await supabase.rpc('decrement_stock', {
                product_id: parseInt(item.id),
                quantity_to_decrement: item.quantity
            })

            if (rpcError) {
                console.error(`Stok düşme hatası (ID: ${item.id}):`, rpcError.message)
            } else {
                console.log(`Ürün ID: ${item.id} için stok ${item.quantity} adet düşürüldü`)
            }
        }
    }

    // 4. Update Order Status
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'Ödeme Alındı' })
        .eq('id', orderId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    return { success: true }
}
