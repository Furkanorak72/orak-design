'use server'

import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

export async function verifyStripeSessionAndDeductStock(sessionId: string) {
    if (!sessionId) return { success: false, error: "No session ID" };

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return { success: false, error: "Payment not completed" };
        }

        const supabase = await createClient();
        const metadata = session.metadata;

        if (!metadata?.cart_items) {
            console.error("STOK_HATA: Metadata içinde cart_items bulunamadı.");
            return { success: false, error: "Metadata missing" };
        }

        // 1. Resolve Order
        let orderId = metadata.orderId || null; // UUID is typically a string, do not parseInt
        let order = null;
        let isNewOrder = false;

        if (orderId) {
            const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
            order = data;
        }

        // 2. Fallback: Create Order if Missing
        if (!order) {
            console.log("Sipariş Veritabanında Yok - Oluşturuluyor...");
            const itemsParts = metadata.cart_items.split(',');
            const ids = itemsParts.map(p => parseInt(p.split(':')[0])).filter(n => !isNaN(n));

            // Fetch details for accurate record
            const { data: products } = await supabase.from('products').select('*').in('id', ids);

            const orderItems = itemsParts.map(p => {
                const [id, qty] = p.split(':');
                const pid = parseInt(id);
                const quantity = parseInt(qty);
                const prod = products?.find(x => x.id === pid);
                return {
                    id: pid,
                    name: prod?.name || 'Ürün',
                    price: prod?.price || 0,
                    quantity: quantity,
                    image: prod?.image_url || ''
                };
            });

            const totalAmount = orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const userId = metadata.userId || null;

            const { data: newOrder, error: dbError } = await supabase.from('orders').insert({
                user_id: userId === "" ? null : userId,
                items: orderItems,
                total_amount: totalAmount, // Primary field
                total_price: totalAmount,  // Legacy/Compatibility field
                status: 'Hazırlanıyor'
            }).select().single();

            if (dbError) {
                console.error("DB_ERROR: Sipariş yedek kaydı oluşturulamadı:", dbError.message);
                // We proceed to deduct stock anyway as requested
            } else {
                order = newOrder;
                isNewOrder = true;
                console.log("Sipariş başarıyla kaydedildi (ID):", order.id);
            }
        } else {
            // Check if already processed
            if (order.status === 'Hazırlanıyor' || order.status === 'Teslim Edildi' || order.status === 'Ödeme Alındı') {
                console.log(`STOK_SKIP: Sipariş ${order.id} zaten işlenmiş.`);
                return { success: true, message: "Already processed" };
            }
        }

        // 3. Deduct Stock
        const items = metadata.cart_items.split(',');
        const results = [];

        for (const itemStr of items) {
            const [id, qty] = itemStr.split(':');
            if (id && qty) {
                const quantity = parseInt(qty);
                const productId = parseInt(id);

                // RPC Call
                const { error } = await supabase.rpc('decrement_stock', {
                    product_id: productId,
                    quantity_to_decrement: quantity
                });

                if (error) {
                    console.error(`STOK_HATA: Ürün ID ${id} düşürülemedi:`, error.message);
                    results.push({ id, success: false, error: error.message });
                } else {
                    console.log(`STOK_BAŞARILI: Ürün ID ${id} stoğu -${quantity} düşürüldü.`);
                    results.push({ id, success: true });
                }
            }
        }

        // 4. Finalize Order Status
        if (order && !isNewOrder) {
            await supabase.from('orders').update({
                status: 'Hazırlanıyor',
                stripe_session_id: sessionId
            }).eq('id', order.id);
        }

        return { success: true, results };

    } catch (err: any) {
        console.error("STOK_HATA: Session verification failed:", err.message);
        return { success: false, error: err.message };
    }
}
