'use client'

import { useState } from 'react'
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, Save, Plus, Lock, Upload } from 'lucide-react'
import { addProduct, deleteProduct, updateProductPrice } from '@/app/actions/admin'
import Image from 'next/image'

// This component handles the UI and client-side logic
export default function AdminPanel({ initialProducts }: { initialProducts: any[] }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [products, setProducts] = useState(initialProducts)

    // Image Upload State
    const [imageUrl, setImageUrl] = useState('')
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file)

            if (uploadError) {
                // If bucket doesn't exist, try creating or warn
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName)

            setImageUrl(publicUrl)
        } catch (error: any) {
            console.error(error)
            alert('Yükleme başarısız! Lütfen "products" adında bir Storage Bucket oluşturduğunuzdan emin olun. Hata: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    // Auth Check
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === 'admin123') {
            setIsAuthenticated(true)
        } else {
            alert("Hatalı şifre!")
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" /> Admin Girişi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Şifre</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Şifreyi giriniz..."
                                />
                            </div>
                            <Button type="submit" className="w-full">Giriş Yap</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
                <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Çıkış</Button>
            </div>

            {/* Add Product Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Yeni Ürün Ekle</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        await addProduct(formData)
                        alert("Ürün eklendi!")
                        // Ideally strictly refresh router here
                        window.location.reload()
                    }} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Ürün Adı</Label>
                            <Input name="name" required placeholder="Örn: Desenli Kazak" />
                        </div>
                        <div className="space-y-2">
                            <Label>Fiyat (TL)</Label>
                            <Input name="price" type="number" step="0.01" required placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stok Adedi</Label>
                            <Input name="stock_quantity" type="number" defaultValue="100" required placeholder="100" />
                        </div>
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Input name="category" required placeholder="T-Shirt veya Kazak" />
                        </div>

                        {/* Enhanced Image URL Input */}
                        <div className="space-y-2">
                            <Label>Görsel URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="image_url"
                                    required
                                    placeholder="https://..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="flex-1"
                                />
                                <Label htmlFor="image-upload" className={`flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors h-10 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploading ? '...' : 'Seç'}
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                </Label>
                            </div>
                            {imageUrl && (
                                <div className="mt-2 relative w-20 h-20 border rounded overflow-hidden">
                                    <Image src={imageUrl} alt="Önizleme" fill className="object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Açıklama</Label>
                            <Input name="description" placeholder="Kısa açıklama..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Stripe Price ID (Opsiyonel)</Label>
                            <Input name="stripe_price_id" placeholder="price_..." />
                        </div>
                        <Button type="submit" className="md:col-span-2"><Plus className="mr-2 h-4 w-4" /> Ürünü Ekle</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Product List */}
            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Görsel</th>
                                    <th className="px-6 py-3">Ad</th>
                                    <th className="px-6 py-3">Fiyat</th>
                                    <th className="px-6 py-3">Stok</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialProducts.map((product) => (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="relative w-12 h-12">
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4">{product.price} TL</td>
                                        <td className="px-6 py-4">{product.stock_quantity ?? 0}</td>
                                        <td className="px-6 py-4">{product.category}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <form action={async (formData) => {
                                                const newPrice = prompt("Yeni fiyatı girin:", product.price)
                                                if (newPrice) {
                                                    formData.set('price', newPrice)
                                                    formData.set('id', product.id)
                                                    await updateProductPrice(formData)
                                                }
                                            }}>
                                                <Button size="icon" variant="ghost" type="submit" title="Fiyatı Düzenle">
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            </form>

                                            <form action={async () => {
                                                if (confirm("Silmek istediğinize emin misiniz?")) {
                                                    await deleteProduct(product.id)
                                                }
                                            }}>
                                                <Button size="icon" variant="ghost" type="submit" title="Sil">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
