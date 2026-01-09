import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, User as UserIcon, Calendar, CreditCard } from "lucide-react";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Real Orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <UserIcon className="h-8 w-8" />
                Profilim
            </h1>

            <div className="grid gap-8 md:grid-cols-3">
                {/* User Info Sidebar */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kullanıcı Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                                <p className="text-sm">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Üyelik Tarihi</p>
                                <p className="text-sm">{new Date(user.created_at).toLocaleDateString("tr-TR")}</p>
                            </div>
                            <div className="pt-4">
                                <Badge variant="secondary" className="w-full justify-center">Standart Üye</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Section */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Önceki Siparişlerim
                            </CardTitle>
                            <CardDescription>
                                Geçmiş siparişleriniz ve durumları.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {(!orders || orders.length === 0) ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                        <p>Henüz bir siparişiniz bulunmuyor.</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 last:border-0 last:pb-0 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-gray-400">#{order.id.slice(0, 8)}</span>
                                                    <Badge className={
                                                        order.status === "Teslim Edildi" ? "bg-green-600 hover:bg-green-700" :
                                                            order.status === "Hazırlanıyor" ? "bg-orange-500 hover:bg-orange-600" :
                                                                order.status === "Ödeme Bekleniyor" ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-950" :
                                                                    "bg-blue-600 hover:bg-blue-700"
                                                    }>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {Array.isArray(order.items) ? order.items.map((i: any) => i.name).join(", ") : "Ürünler"}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(order.created_at).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="font-bold flex items-center gap-1 whitespace-nowrap">
                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                                {(order.total_amount || order.total_price || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
