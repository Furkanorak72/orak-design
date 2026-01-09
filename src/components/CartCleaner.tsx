'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { processSuccessfulOrder } from '@/app/actions/orders'

export default function CartCleaner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const clearCart = useCartStore((state) => state.clearCart)
    const processedRef = useRef(false)

    useEffect(() => {
        if (processedRef.current) return

        const success = searchParams.get('success')
        const orderId = searchParams.get('orderId')

        if (success === 'true') {
            // Mark as processed to verify strict mode double invocation
            processedRef.current = true

            // 1. Clear Cart
            clearCart()

            // 2. Process Order (Deduct Stock)
            if (orderId) {
                const oid = parseInt(orderId)
                if (!isNaN(oid)) {
                    processSuccessfulOrder(oid)
                        .then((res) => {
                            if (res.success) {
                                console.log("Order processed and stock deducted.")
                            } else {
                                console.error("Order processing failed:", res.error)
                            }
                        })
                        .catch(err => console.error("Error calling processSuccessfulOrder:", err))
                }
            }

            // Optional: Remove query params after processing to clean URL
            // router.replace('/', { scroll: false })
        }
    }, [searchParams, clearCart])

    return null
}
