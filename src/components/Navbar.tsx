import Link from "next/link"
import { ShoppingCart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/auth/actions"
import CartDrawer from "@/components/CartDrawer"

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-widest font-serif text-black dark:text-white">
                        OrakShop
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden md:flex">
                        <Link href="/tasarla" className="font-medium">
                            Atölye
                        </Link>
                    </Button>
                    <CartDrawer />

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title={user.email} asChild>
                                <Link href="/profile">
                                    <User className="h-5 w-5" />
                                </Link>
                            </Button>
                            <form action={logout}>
                                <Button variant="ghost" size="icon" title="Çıkış Yap">
                                    <LogOut className="h-5 w-5 text-red-500" />
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Giriş</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register">Kayıt Ol</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
