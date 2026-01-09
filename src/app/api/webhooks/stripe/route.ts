import { headers } from "next/headers";
import Stripe from "stripe";
import { processSuccessfulOrder } from "@/app/actions/orders";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

// Provides robustness against client-side failures
export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;
    // Ideally this secret comes from env var STRIPE_WEBHOOK_SECRET
    // For this dev environment, user might need to obtain it via `stripe listen`.
    // We will assume it's in env or user provides it. 
    // If not present, we can't verify signature locally without the CLI output secret.
    // I'll leave a placeholder or try to read it.
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
        } else {
            // In dev without secret, assume user set it or throw.
            // For strict correctness, we throw if missing.
            // But if user is testing locally without setting env, this blocks.
            // I'll assume standard setup.
            if (!signature) throw new Error("No signature");
            // If we can't verify, we can't proceed safely. But for "smart checkout" fix, we assume it's set up.
            throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        }
    } catch (err: any) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId; // We passed this in actions/stripe.ts

        if (orderId) {
            console.log(`Webhook: Processing Order ID ${orderId}`);
            const oid = parseInt(orderId);
            if (!isNaN(oid)) {
                await processSuccessfulOrder(oid);
            }
        } else if (session.metadata?.cart_items) {
            console.log("Webhook: Fallback - Processing Stock from Metadata");
            // Fallback: If order wasn't saved, deduct based on metadata
            const supabase = await createClient();
            const items = session.metadata.cart_items.split(',');

            for (const itemStr of items) {
                const [id, qty] = itemStr.split(':');
                if (id && qty) {
                    const { error } = await supabase.rpc('decrement_stock', {
                        product_id: parseInt(id),
                        quantity_to_decrement: parseInt(qty)
                    });

                    if (error) {
                        console.error(`Stok Düşme Hatası (Metadata) ID ${id}:`, error.message);
                    } else {
                        console.log(`Ürün ID: ${id} için stok ${qty} adet düşürüldü (Metadata)`);
                    }
                }
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
