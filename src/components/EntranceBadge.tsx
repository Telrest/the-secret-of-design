import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/** 独立的小场景：有真实厚度、倒角、金属边圈和校徽贴图的纪念章。 */
export default function EntranceBadge() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch { return } // 不支持 WebGL 时仍有下层的校徽和立体边框。
    let disposed = false

    let texture: THREE.Texture | null = null
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30)
    camera.position.set(0, 0, 5.8)
    camera.lookAt(0, 0, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(360, 360, false)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    host.append(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xecf8ff, 0x14233d, 3))
    const key = new THREE.DirectionalLight(0xffffff, 5)
    key.position.set(-3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x80cfff, 4)
    rim.position.set(4, -1, 2)
    scene.add(rim)
    const back = new THREE.DirectionalLight(0xffdb9c, 3)
    back.position.set(-2, -2, -4)
    scene.add(back)

    const badge = new THREE.Group()
    scene.add(badge)
    const metal = new THREE.MeshStandardMaterial({ color: 0xa6bfd0, metalness: 0.85, roughness: 0.26 })
    const edge = new THREE.MeshStandardMaterial({ color: 0xd5e7ef, metalness: 0.75, roughness: 0.2 })
    const blue = new THREE.MeshStandardMaterial({ color: 0x123b60, metalness: 0.6, roughness: 0.28 })
    materials.push(metal, edge, blue)
    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, z = 0) => {
      geometries.push(geometry)
      const item = new THREE.Mesh(geometry, material)
      item.position.z = z
      badge.add(item)
      return item
    }
    const body = new THREE.CylinderGeometry(1, 1, 0.19, 96)
    body.rotateX(Math.PI / 2)
    mesh(body, metal)
    mesh(new THREE.TorusGeometry(0.984, 0.047, 12, 96), edge, 0.095)
    mesh(new THREE.TorusGeometry(0.984, 0.035, 12, 96), edge, -0.095)
    mesh(new THREE.CircleGeometry(0.96, 96), blue, -0.099).rotation.y = Math.PI
    mesh(new THREE.TorusGeometry(0.87, 0.012, 8, 96), metal, -0.105)
    // 侧面保留三圈细槽和真实厚度，正面由倒角边圈呈现金属质感。
    for (let index = 0; index < 3; index++) {
      mesh(new THREE.TorusGeometry(1.001, 0.006, 6, 96), blue, -0.045 + index * 0.045)
    }

    const face = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.05, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.25,
    })
    materials.push(face)
    mesh(new THREE.CircleGeometry(0.94, 96), face, 0.107)
    const image = new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}mowan/beihang-logo.jpg`,
      (loaded) => {
        if (disposed) { loaded.dispose(); return }
        loaded.colorSpace = THREE.SRGBColorSpace
        face.map = loaded
        face.needsUpdate = true
        renderer.render(scene, camera)
        setVisible(true)
      }, undefined, () => {},
    )
    texture = image

    // 始终正面朝向镜头，位移与迎面放大交给外层动画。
    renderer.render(scene, camera)
    return () => {
      disposed = true
      texture?.dispose()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])
  return <div ref={hostRef} className={`game-entrance__model${visible ? ' is-ready' : ''}`} />
}
