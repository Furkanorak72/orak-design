import React, { useRef, useMemo, useEffect } from 'react'
import { useGLTF, Decal, useTexture, TransformControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { easing } from 'maath'

export type DecalType = {
    id: string
    textureUrl: string
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
}

interface TShirtProps {
    color: string
    decals?: DecalType[]
    selectedDecalId?: string | null
    onDecalSelect?: (id: string | null) => void
    onDecalChange?: (id: string, newProps: Partial<DecalType>) => void
    controlMode?: 'translate' | 'rotate' | 'scale'
}

export function TShirt({
    color,
    decals,
    selectedDecalId,
    onDecalSelect,
    onDecalChange,
    controlMode = 'translate'
}: TShirtProps) {
    // Use the local model
    const { nodes } = useGLTF('/models/oversized_t-shirt.glb') as any

    // 1. Analyze Geometry: Find Meshes, Scale, and Main Body
    const { meshes, mainMeshId, scale, offset, center } = useMemo(() => {
        const meshList = Object.values(nodes).filter((n: any) => n.isMesh) as THREE.Mesh[]

        // Calculate Bounding Box
        const box = new THREE.Box3()
        meshList.forEach(m => {
            if (m.geometry) {
                m.geometry.computeBoundingBox()
                if (m.geometry.boundingBox) box.union(m.geometry.boundingBox)
            }
        })

        // Auto-Center Calculation
        const center = new THREE.Vector3()
        box.getCenter(center)

        // Auto-Scale Calculation
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetScale = 2.5 / (maxDim || 1) // Normalize to ~2.5 units

        // Find "Main" mesh (likely the body) for Decal placement
        let maxRadius = 0
        let bestId = null
        meshList.forEach(m => {
            if (m.geometry) {
                m.geometry.computeBoundingSphere()
                const r = m.geometry.boundingSphere?.radius || 0
                if (r > maxRadius) {
                    maxRadius = r
                    bestId = m.uuid
                }
            }
        })

        return {
            meshes: meshList,
            mainMeshId: bestId || (meshList[0]?.uuid),
            scale: [targetScale, targetScale, targetScale] as [number, number, number],
            offset: [-center.x, -center.y, -center.z] as [number, number, number],
            center: center // Return center for relative positioning
        }
    }, [nodes])

    // Error Handling
    if (!meshes || meshes.length === 0) return null

    return (
        <group dispose={null}>
            {/* 1. Global Scale */}
            <group scale={scale}>
                {/* 2. Orientation Correction: Stand Upright (Rotate X -90deg) */}
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    {/* 3. Centering: Move geometric center to origin */}
                    <group position={offset}>
                        {meshes.map((mesh) => (
                            <mesh
                                key={mesh.uuid}
                                castShadow
                                receiveShadow
                                geometry={mesh.geometry}
                                onClick={(e) => {
                                    // Deselect if clicking on empty shirt area
                                    e.stopPropagation()
                                    onDecalSelect?.(null)
                                }}
                            >
                                <AnimatedMaterial color={color} />

                                {mesh.uuid === mainMeshId && decals?.map((decal) => (
                                    <DecalItem
                                        key={decal.id}
                                        decal={decal}
                                        isSelected={decal.id === selectedDecalId}
                                        onSelect={() => onDecalSelect?.(decal.id)}
                                        onChange={(p: any) => onDecalChange?.(decal.id, p)}
                                        mode={controlMode}
                                        modelCenter={center}
                                    />
                                ))}
                            </mesh>
                        ))}
                    </group>
                </group>
            </group>
        </group>
    )
}

function AnimatedMaterial({ color }: { color: string }) {
    const ref = useRef<THREE.MeshStandardMaterial>(null)
    useFrame((state, delta) => {
        if (ref.current) easing.dampC(ref.current.color, color, 0.25, delta)
    })
    return <meshStandardMaterial ref={ref} roughness={0.8} />
}

function DecalItem({ decal, isSelected, onSelect, onChange, mode, modelCenter }: any) {
    const texture = useTexture(decal.textureUrl)
    const ref = useRef<any>(null)

    // Disable camera controls when TransformControls is active
    const { camera, gl } = useThree()
    const controlsRef = useRef<any>(null)

    useEffect(() => {
        const controls = controlsRef.current
        if (controls) {
            const callback = (event: { mode: string }) => {
                // Only disable orbit controls if the TransformControls is actively being used
                // and not just changing mode
                if (event.mode) {
                    (camera as any).controls.enabled = !controls.dragging
                }
            }
            controls.addEventListener('dragging-changed', callback)
            return () => controls.removeEventListener('dragging-changed', callback)
        }
    }, [camera, gl, isSelected]) // Re-run effect if selection changes

    // Calculate absolute position (Model Space) from relative position (Visual Space)
    const displayPosition = useMemo(() => {
        if (!modelCenter) return decal.position
        return [
            decal.position[0] + modelCenter.x,
            decal.position[1] + modelCenter.y,
            decal.position[2] + modelCenter.z
        ] as [number, number, number]
    }, [decal.position, modelCenter])

    return (
        <>
            <Decal
                ref={ref}
                debug
                position={displayPosition}
                rotation={decal.rotation}
                scale={decal.scale}
                map={texture as any}
                // Fix Z-fighting / Visibility

                // Interaction
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect()
                }}
            />
            {isSelected && (
                <TransformControls
                    ref={controlsRef} // Attach ref to TransformControls
                    object={ref}
                    mode={mode}
                    // Limit translation to X/Y (surface)
                    showZ={mode !== 'rotate'}
                    size={0.5}
                    onMouseUp={() => {
                        if (ref.current && modelCenter) {
                            // Convert back to Relative Position
                            onChange({
                                position: [
                                    ref.current.position.x - modelCenter.x,
                                    ref.current.position.y - modelCenter.y,
                                    ref.current.position.z - modelCenter.z
                                ],
                                rotation: ref.current.rotation.toArray(),
                                scale: ref.current.scale.toArray()
                            })
                        }
                    }}
                />
            )}
        </>
    )
}

useGLTF.preload('/models/oversized_t-shirt.glb')
