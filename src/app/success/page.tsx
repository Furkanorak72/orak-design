import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyStripeSessionAndDeductStock } from "@/app/actions/verify-session"
import ClearCart from "@/components/ClearCart"

export default async function SuccessPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const sessionId = searchParams.session_id as string

    // Trigger verification and stock deduction
    // We ignore the result for the UI unless it's a critical error we want to show?
    // User said: "Hata Denetimi: ... terminale logla ama kullanıcının teşekkür sayfasını görmesini engelleme."
    // So we run it, log it (in action), and show success.

    if (sessionId) {
        await verifyStripeSessionAndDeductStock(sessionId);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-black">
            <ClearCart />
            <Card className="w-full max-w-sm shadow-lg text-center animate-in fade-in zoom-in duration-500">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">Ödeme Başarılı!</CardTitle>
                    <CardDescription>
                        Siparişiniz alındı ve hazırlanıyor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                        Teşekkür ederiz. Sipariş bilgileri e-posta adresinize gönderildi.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Link href="/" className="w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700">Alışverişe Devam Et</Button>
                    </Link>
                    <Link href="/profile" className="w-full">
                        <Button variant="outline" className="w-full">Siparişlerim</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
