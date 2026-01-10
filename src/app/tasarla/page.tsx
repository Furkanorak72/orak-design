'use client'

import { useState, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    Decal,
    useTexture,
    OrbitControls,
    Center,
    Environment,
    RoundedBox,
    ContactShadows,
    Html
} from '@react-three/drei'
import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/store/useCartStore'
import { Shirt, Type, Image as ImageIcon, ShoppingBag, RotateCcw, ZoomIn, ZoomOut, ArrowLeftRight, Palette, Move, RotateCw, Maximize, Bold } from 'lucide-react'
import { TShirt, DecalType as BaseDecalType } from '@/components/canvas/TShirt'

// --- Types ---
export type DecalType = BaseDecalType & {
    face: 'front' | 'back'
}

type ProductType = 'tshirt' | 'hoodie'

// --- Helper: Text to Image ---
// --- Helper: Text to Image ---
const createTextTexture = (text: string, color: string, fontSize: number = 64, font: string = 'Inter', isBold: boolean = false) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 1024
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = color
        ctx.font = `${isBold ? 'bold ' : ''}${fontSize * 4}px ${font}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    }
    return canvas.toDataURL('image/png')
}

// --- Procedural Apparel Model ---
// --- Procedural Apparel Model ---
function ApparelModel({
    product,
    decals,
    currentFace,
    color,
    selectedDecalId,
    onDecalSelect,
    onDecalChange,
    controlMode
}: {
    product: ProductType,
    decals: DecalType[],
    currentFace: 'front' | 'back',
    color: string,
    selectedDecalId?: string | null,
    onDecalSelect?: (id: string | null) => void,
    onDecalChange?: (id: string, p: any) => void,
    controlMode?: 'translate' | 'rotate' | 'scale'
}) {
    const groupRef = useRef<THREE.Group>(null)

    // Smooth Rotation
    useFrame((state, delta) => {
        if (groupRef.current) {
            const targetRotation = currentFace === 'front' ? 0 : Math.PI
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, delta * 3)
        }
    })

    // -- T-SHIRT (High Quality GLTF) --
    if (product === 'tshirt') {
        const tshirtDecals = decals.map(d => ({
            ...d,
            // Pass through
        }))
        return (
            <group ref={groupRef} dispose={null}>
                <TShirt
                    color={color}
                    decals={tshirtDecals}
                    selectedDecalId={selectedDecalId}
                    onDecalSelect={onDecalSelect}
                    onDecalChange={onDecalChange}
                    controlMode={controlMode}
                />
            </group>
        )
    }

    // -- HOODIE (Procedural Fallback for now) --
    // Filter decals for Torso
    const RenderDecals = () => decals.map((decal) => (
        <DecalWrapper key={decal.id} decal={decal} />
    ))

    // Geometry Dimensions
    const torsoWidth = 1.0
    const torsoHeight = 1.4
    const torsoDepth = 0.35

    const armJsx = (side: 'left' | 'right') => {
        const isLongSleeve = product === 'hoodie'
        const armLen = isLongSleeve ? 1.2 : 0.5
        const armWidth = 0.35
        const angle = side === 'left' ? -Math.PI / 6 : Math.PI / 6
        const posX = side === 'left' ? -0.65 : 0.65
        const posY = 0.5

        return (
            <mesh position={[posX, posY, 0]} rotation={[0, 0, angle]} castShadow>
                <capsuleGeometry args={[0.16, armLen, 4, 8]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
        )
    }

    return (
        <group ref={groupRef} dispose={null}>
            {/* Main Torso */}
            <RoundedBox
                args={[torsoWidth, torsoHeight, torsoDepth]}
                radius={0.05}
                smoothness={4}
                castShadow
                receiveShadow
                position={[0, 0, 0]}
            >
                <meshStandardMaterial color={color} roughness={0.9} />
                <RenderDecals />
            </RoundedBox>

            {/* Neck / Collar */}
            <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.1, 32]} />
                <meshStandardMaterial color="#ddd" roughness={0.9} />
            </mesh>

            {/* Arms */}
            {armJsx('left')}
            {armJsx('right')}

            {/* Hoodie Special: Hood on Back */}
            {product === 'hoodie' && (
                <mesh position={[0, 0.5, -0.25]} rotation={[0.5, 0, 0]}>
                    <sphereGeometry args={[0.3, 32, 16]} />
                    <meshStandardMaterial color={color} roughness={0.9} />
                </mesh>
            )}
        </group>
    )
}

function DecalWrapper({ decal }: { decal: DecalType }) {
    const texture = useTexture(decal.textureUrl)
    return (
        <Decal
            position={new THREE.Vector3(...decal.position)}
            rotation={new THREE.Euler(...decal.rotation)}
            scale={new THREE.Vector3(...decal.scale)}
            map={texture}
        />
    )
}

// --- Main Page ---
// --- Main Page ---
export default function DesignPage() {
    const [product, setProduct] = useState<ProductType>('tshirt')
    const [currentFace, setCurrentFace] = useState<'front' | 'back'>('front')
    const [decals, setDecals] = useState<DecalType[]>([])
    const [activeTab, setActiveTab] = useState('color')
    const [isSaving, setIsSaving] = useState(false)

    // Interactive State
    const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null)
    const [controlMode, setControlMode] = useState<'translate' | 'rotate' | 'scale'>('translate')

    // Configuration State
    const [shirtColor, setShirtColor] = useState('#ffffff')

    // Inputs
    const [textSize, setTextSize] = useState(50)
    const [textColor, setTextColor] = useState('#000000')
    const [inputText, setInputText] = useState('')
    const [textFont, setTextFont] = useState('Inter')
    const [isBold, setIsBold] = useState(false)

    const addToCart = useCartStore(state => state.addItem)

    const handleDecalChange = (id: string, newProps: Partial<DecalType>) => {
        setDecals(prev => prev.map(d => d.id === id ? { ...d, ...newProps } : d))
    }

    const addDecal = (url: string, isText = false) => {
        // Position Logic:
        // T-Shirt Model (scaled 2x): Chest is approx Z=0.15 (local) -> World Z?
        // Decal is child of Mesh (TShirt).
        // Since TShirt component wraps Mesh, and Decal is inside, we use Local coordinates of the mesh.
        // For standard T-Shirt model: +Z is front.

        // Position Logic:
        // User calibrated values: Chest High (Relative to Center)
        const zPos = currentFace === 'front' ? 0.18 : -0.18
        const yPos = 0.4
        const rotY = currentFace === 'front' ? 0 : Math.PI

        const newDecal: DecalType = {
            id: uuidv4(),
            textureUrl: url,
            position: [0, yPos, zPos],
            rotation: [0, rotY, 0],
            scale: isText ? [0.25, 0.06, 1] : [0.15, 0.15, 1], // Smaller scale for T-Shirt model
            face: currentFace
        }
        setDecals([...decals, newDecal])
        setSelectedDecalId(newDecal.id) // Select newly added decal
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => addDecal(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleTextAdd = () => {
        if (!inputText) return
        const textureData = createTextTexture(inputText, textColor, textSize, textFont, isBold)
        addDecal(textureData, true)
        setInputText('')
    }

    const handleAddToCart = () => {
        setIsSaving(true)
        const thumb = product === 'tshirt'
            ? "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80"
            : "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80"

        setTimeout(() => {
            addToCart({
                id: `design-${uuidv4()}`,
                name: `Özel Tasarım ${product === 'tshirt' ? 'T-Shirt' : 'Kazak'} (${shirtColor})`,
                price: product === 'tshirt' ? 599.90 : 999.90,
                image: thumb
            })
            setIsSaving(false)
            alert("Tasarım sepete eklendi!")
        }, 800)
    }

    const colors = [
        '#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#64748b'
    ]

    return (
        <div className="h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row bg-gray-50">
            {/* 3D Viewport */}
            <div className="flex-1 relative bg-gradient-to-b from-gray-100 to-gray-300 overflow-hidden">
                {/* Logo Overlay */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none opacity-80">
                    <h3 className="text-xl font-serif font-bold tracking-widest text-black/40 uppercase">Orak<span className="font-extrabold text-black/60">Shop</span></h3>
                </div>

                {/* Face Controls */}
                <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <Button
                        size="sm"
                        variant={currentFace === 'front' ? 'default' : 'secondary'}
                        onClick={() => setCurrentFace('front')}
                    >
                        Ön Yüz
                    </Button>
                    <Button
                        size="sm"
                        variant={currentFace === 'back' ? 'default' : 'secondary'}
                        onClick={() => setCurrentFace('back')}
                    >
                        Arka Yüz
                    </Button>
                </div>

                {/* Interaction Mode Toolbar */}
                {selectedDecalId && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 p-2 rounded-full shadow-lg backdrop-blur text-xs font-medium">
                        <span className="px-2 text-gray-500">Düzenle:</span>
                        <div className="flex bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setControlMode('translate')}
                                className={`p-2 rounded-full transition-colors ${controlMode === 'translate' ? 'bg-white shadow text-black' : 'text-black/40 hover:text-black'}`}
                                title="Taşı"
                            >
                                <Move className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setControlMode('rotate')}
                                className={`p-2 rounded-full transition-colors ${controlMode === 'rotate' ? 'bg-white shadow text-black' : 'text-black/40 hover:text-black'}`}
                                title="Döndür"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setControlMode('scale')}
                                className={`p-2 rounded-full transition-colors ${controlMode === 'scale' ? 'bg-white shadow text-black' : 'text-black/40 hover:text-black'}`}
                                title="Büyüt/Küçült"
                            >
                                <Maximize className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 40 }} className="w-full h-full">
                    <ambientLight intensity={0.6} />
                    <spotLight position={[5, 10, 7]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
                    <spotLight position={[-5, 5, 5]} intensity={0.5} />
                    <spotLight position={[-5, 5, 5]} intensity={0.5} />
                    <Environment preset="studio" />

                    <Suspense fallback={<Html center><div className="bg-white/80 px-4 py-2 rounded-full shadow-lg font-bold text-sm backdrop-blur-sm animate-pulse">Atölye Hazırlanıyor...</div></Html>}>
                        <ApparelModel
                            product={product}
                            decals={decals}
                            currentFace={currentFace}
                            color={shirtColor}
                            selectedDecalId={selectedDecalId}
                            onDecalSelect={setSelectedDecalId}
                            onDecalChange={handleDecalChange}
                            controlMode={controlMode}
                        />
                    </Suspense>

                    <ContactShadows
                        position={[0, -0.8, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={1.5}
                        far={0.8}
                    />

                    <OrbitControls
                        target={[0, 0, 0]}
                        enablePan={false}
                        enableZoom={true}
                        // Lock vertical angle to horizon (90 degrees) to prevent bad angles
                        minPolarAngle={Math.PI / 2}
                        maxPolarAngle={Math.PI / 2}
                        // Limit zoom to prevent clipping or getting too far
                        minDistance={2.5}
                        maxDistance={6}
                    />
                </Canvas>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full lg:w-[380px] bg-white border-l p-6 shadow-2xl z-20 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-bold tracking-widest">ATÖLYE</h2>
                    <p className="text-sm text-gray-500 mt-1">Hayalindeki ürünü tasarla.</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={product === 'tshirt' ? 'default' : 'outline'}
                            onClick={() => setProduct('tshirt')}
                            className="h-16"
                        >
                            <Shirt className="mr-2 h-5 w-5" /> T-Shirt
                        </Button>
                        <Button
                            variant={product === 'hoodie' ? 'default' : 'outline'}
                            onClick={() => setProduct('hoodie')}
                            className="h-16"
                        >
                            <div className="mr-2 font-bold">H</div> Kazak
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="color"><Palette className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="upload"><ImageIcon className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="text"><Type className="w-4 h-4" /></TabsTrigger>
                        </TabsList>

                        <TabsContent value="color" className="pt-4">
                            <Label className="block mb-3 font-medium">Kumaş Rengi</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${shirtColor === c ? 'border-black scale-110' : 'border-gray-200'}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setShirtColor(c)}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="pt-4">
                            <Label className="block mb-2 text-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-black transition-colors">
                                <span className="block mb-1 font-medium">Görsel Seç</span>
                                <span className="text-xs text-gray-400">JPG, PNG</span>
                                <Input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </Label>
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4 pt-4">
                            <Input
                                placeholder="Yazınızı girin..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />

                            <div className="flex gap-2">
                                <select
                                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={textFont}
                                    onChange={(e) => setTextFont(e.target.value)}
                                >
                                    <option value="Inter">Modern (Inter)</option>
                                    <option value="Arial">Basit (Arial)</option>
                                    <option value="Times New Roman">Klasik (Serif)</option>
                                    <option value="Courier New">Daktilo (Mono)</option>
                                    <option value="Brush Script MT">El Yazısı</option>
                                </select>
                                <button
                                    className={`h-10 w-10 border rounded flex items-center justify-center transition-colors ${isBold ? 'bg-black text-white border-black' : 'bg-white text-black hover:bg-gray-100'}`}
                                    onClick={() => setIsBold(!isBold)}
                                    title="Kalın"
                                >
                                    <Bold className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    className="w-12 p-1 h-10"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                />
                                <div className="flex-1 flex items-center border rounded px-2">
                                    <span className="text-xs mr-2 text-gray-400">Boyut</span>
                                    <Slider
                                        value={[textSize]}
                                        min={20} max={150} step={5}
                                        onValueChange={(val) => setTextSize(val[0])}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleTextAdd} disabled={!inputText}>
                                Ekle
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {/* Simple Layer List */}
                    {decals.length > 0 && (
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Katmanlar</span>
                                <button className="text-xs text-red-500 underline" onClick={() => setDecals([])}>Temizle</button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-auto">
                                {decals.map((d, i) => (
                                    <div
                                        key={d.id}
                                        className={`text-xs p-2 rounded flex justify-between items-center cursor-pointer border transition-all ${selectedDecalId === d.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                                        onClick={() => setSelectedDecalId(d.id)}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="font-bold text-gray-400">#{i + 1}</span>
                                            <span className="font-medium">{d.face === 'front' ? 'Ön' : 'Arka'} - {d.id.slice(0, 4)}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDecals(decals.filter(x => x.id !== d.id))
                                                if (selectedDecalId === d.id) setSelectedDecalId(null)
                                            }}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1"
                                            title="Sil"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 text-center space-y-2">
                        <p className="text-xs text-gray-500 font-medium">Kendi tasarımını oluşturma özelliği yakında hizmetinizde!</p>
                        <Button className="w-full h-12 text-lg bg-gray-200 text-gray-400 hover:bg-gray-200" disabled>
                            Atölye Çok Yakında
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
