import { login } from '../auth/actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const error = searchParams.error as string
    const message = searchParams.message as string

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-black">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
                    <CardDescription>
                        E-posta ve şifrenizle hesabınıza erişin
                    </CardDescription>
                </CardHeader>
                <form action={login}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm font-medium">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-blue-100 border border-blue-200 text-blue-600 rounded-md text-sm font-medium">
                                {message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                E-posta
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ornek@email.com"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Şifre
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit">Giriş Yap</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Hesabınız yok mu?{" "}
                            <a href="/register" className="text-blue-600 hover:underline">
                                Kayıt Ol
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
