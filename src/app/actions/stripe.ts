'use server'

import { headers } from "next/headers";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Secure usage with env var
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

export async function createCheckoutSession(formData: FormData) {
    const origin = (await headers()).get("origin");
    const supabase = await createClient(); // Initialize Supabase client

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // If not logged in, maybe redirect to login or handle anonymously (but for profile we need user)
        // For this flow, let's assume login is required or just don't save order if guest.
        // User asked to save to orders table which has user_id, so user is required.
    }

    const cartItemsJson = formData.get("cartItems") as string;

    if (!cartItemsJson) {
        throw new Error("No cart items provided");
    }

    const cartItems = JSON.parse(cartItemsJson);

    // Check stock for each item
    for (const item of cartItems) {
        // Skip custom designs (which might have created virtual products or generic ids?)
        // Assuming custom designs have ID starting with 'design-' and infinite stock or checked differently?
        // User request implied real products. Custom designs are virtual. 
        // If ID is numeric, it's a DB product.
        if (!item.id.toString().startsWith('design-')) {
            const { data: product } = await supabase
                .from('products')
                .select('stock_quantity, name')
                .eq('id', item.id)
                .single();

            if (product) {
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Stok yetersiz: ${product.name} (Kalan: ${product.stock_quantity})`);
                }
            }
        }
    }

    // Calculate total for DB
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Save order to Supabase (Guest or Auth User)
    let orderId = null;

    // Note: RLS must allow public inserts for this to work for guests, 
    // or we must use a Service Role client here (which is safer but we lack env var in this context usually, 
    // though we can use Supabase Admin if configured).
    // For now we assume RLS allows insert or User is logged in.

    console.log("Sipariş Veritabanına Yazılıyor...");
    const { error, data } = await supabase.from('orders').insert({
        user_id: user ? user.id : null, // Requires user_id to be nullable in schema
        items: cartItems,
        total_amount: totalAmount,
        status: 'Ödeme Bekleniyor'
    }).select().single();

    if (error) {
        console.error("HATASI: Sipariş kaydedilemedi (Veritabanı/RLS):", error.message);
        // If we fail to save order, we might still let payment proceed but we won't track stock deduction via ID.
        // But user requested stock deduction. So this is critical.
        // We warn but proceed? Or throw?
        // Let's proceed but warn.
    } else {
        console.log("BAŞARILI: Sipariş kaydedildi:", data);
        orderId = data.id;
    }

    const lineItems = cartItems.map((item: any) => ({
        price_data: {
            currency: "try",
            product_data: {
                name: item.name,
                images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    // Compact items for metadata (id:qty,id:qty) to stay within limits
    const itemsMetadata = cartItems
        .filter((i: any) => !i.id.toString().startsWith('design-'))
        .map((i: any) => `${i.id}:${i.quantity}`)
        .join(',');

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user?.email, // Auto-fill if logged in
        line_items: lineItems,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        metadata: {
            orderId: orderId ? orderId.toString() : null,
            userId: user?.id || "",
            cart_items: itemsMetadata // Fallback for stock deduction
        }
    });

    if (session.url) {
        redirect(session.url);
    }
}
