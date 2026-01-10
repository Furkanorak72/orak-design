import ProductListing from "@/components/ProductListing";
import CartCleaner from "@/components/CartCleaner";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order('id', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black">
      <CartCleaner />
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-48 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="container px-4 md:px-6 relative z-10 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-light tracking-widest sm:text-5xl md:text-6xl text-white font-serif">
                Orak<span className="font-bold">Shop</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl font-light tracking-wide mt-4">
                Sadelik ve şıklığın kusursuz uyumu. Yeni sezon T-shirt ve Kazak koleksiyonunu keşfedin.
              </p>
            </div>
            <div className="space-x-4 pt-6">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-8 py-6 text-lg tracking-widest uppercase transition-all" asChild>
                <a href="#koleksiyon">Koleksiyonu İncele</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="koleksiyon" className="container px-4 py-16 md:py-24 mx-auto">
        <div className="flex flex-col items-center justify-center mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-light tracking-widest text-gray-900 dark:text-gray-100 font-serif uppercase">Koleksiyon</h2>
          <div className="w-24 h-1 bg-black dark:bg-white"></div>
          <p className="text-muted-foreground max-w-[600px]">
            Farklı tarzlar, özgün tasarımlar. Size en uygun parçayı seçin.
          </p>
        </div>

        <ProductListing products={products || []} />
      </section>
    </div>
  );
}
