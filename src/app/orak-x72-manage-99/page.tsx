import { createClient } from "@/utils/supabase/server"
import AdminPanel from "@/components/AdminPanel"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()

    // Fetch all products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

    return (
        <AdminPanel initialProducts={products || []} />
    )
}
