import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerificationSuccess() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-black">
            <Card className="w-full max-w-sm shadow-lg text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">E-posta Doğrulandı!</CardTitle>
                    <CardDescription>
                        Hesabınız başarıyla doğrulandı.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                        Artık hesabınıza güvenle giriş yapabilirsiniz.
                    </p>
                </CardContent>
                <CardFooter>
                    <Link href="/login" className="w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700">Giriş Yap</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
