-- Insert sample products for KurşunDesign
-- First, clear existing products (Optional but good practice if we want clean state, but DELETE usually requires CASCADE or just manual deletion. For now, we will just INSERT new ones. User might want to truncate manually).

insert into products (name, description, price, image_url, category, stock_quantity) values
('Basic Beyaz T-Shirt', 'Minimalist ve rahat kesim, %100 pamuklu kumaş.', 499.90, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', 'T-Shirt', 100),
('Siyah Oversize T-Shirt', 'Sokak stiline uygun geniş kesim siyah t-shirt.', 549.90, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80', 'T-Shirt', 80),
('Gri Kapüşonlu Sweatshirt', 'Soğuk günler için içi polarlı, sıcak tutan tasarım.', 899.90, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80', 'Kazak', 50),
('Bej Örgü Kazak', 'Kış aylarının vazgeçilmezi şık ve modern örgü kazak.', 1199.00, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80', 'Kazak', 40),
('V Yaka Basic T-Shirt', 'Klasik kesim, her tarza uygun v yaka tasarım.', 459.90, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80', 'T-Shirt', 90),
('Lacivert Polar Sweatshirt', 'Rahatlık ve şıklığı bir arada sunan polar model.', 950.00, 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=500&q=80', 'Kazak', 60),
('Çizgili Triko Kazak', 'Zamansız çizgili desen, yumuşak doku.', 1050.00, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80', 'Kazak', 35),
('Baskılı Grafik T-Shirt', 'Özel tasarım baskılı, dikkat çekici t-shirt.', 599.90, 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&q=80', 'T-Shirt', 70);
