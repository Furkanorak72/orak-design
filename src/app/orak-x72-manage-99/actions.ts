'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addProduct(formData: FormData) {
    const supabase = await createClient()

    // Basic validation/auth check could go here
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const price = parseFloat(formData.get("price") as string)
    const stock_quantity = parseInt(formData.get("stock") as string)
    const category = formData.get("category") as string || "Genel"
    const image_url = formData.get("image_url") as string || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80" // Placeholder if empty
    const description = formData.get("description") as string

    const { error } = await supabase.from("products").insert({
        name,
        price,
        stock_quantity,
        category,
        image_url,
        description
    })

    if (error) {
        console.error("Error adding product:", error)
        // In a real app, return error to display on form
        return
    }

    revalidatePath("/orak-x72-manage-99")
    revalidatePath("/") // Update homepage too
}
