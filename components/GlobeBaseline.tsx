"use client"

import { useRef, useEffect } from "react"

// Set Cesium base URL for assets (wird im Browser gesetzt)
if (typeof window !== "undefined") {
  ;(window as any).CESIUM_BASE_URL = "/cesium"
}

export function GlobeBaseline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null) // Cesium.Viewer

  useEffect(() => {
    // Guard: Nur client-side
    if (typeof window === "undefined") return

    // Guard: Container muss existieren
    if (!containerRef.current) {
      console.warn("⚠️ Container nicht verfügbar")
      return
    }

    // Guard: Verhindere doppelte Init (StrictMode-safe)
    if (viewerRef.current) {
      console.warn("⚠️ Viewer bereits initialisiert, überspringe Init")
      return
    }

    const container = containerRef.current
    let isMounted = true

    // Async Init-Funktion
    const initCesium = async () => {
      try {
        // Import Cesium CSS
        await import("cesium/Build/Cesium/Widgets/widgets.css")

        // Import Cesium
        const Cesium = await import("cesium")

        // Guard: Prüfe nochmal ob Component noch gemountet ist
        if (!isMounted || !containerRef.current) {
          console.warn("⚠️ Component unmounted während Cesium Import")
          return
        }

        // WICHTIG: Setze Base URL für Cesium Assets
        // Dies muss VOR new Cesium.Viewer() gesetzt werden
        console.log("🔍 Setze Cesium Base URL...")
        
        // Methode 1: buildModuleUrl.setBaseUrl (empfohlen)
        if (typeof (Cesium as any).buildModuleUrl !== "undefined" && (Cesium as any).buildModuleUrl.setBaseUrl) {
          ;(Cesium as any).buildModuleUrl.setBaseUrl("/cesium/")
          console.log("✅ Cesium Base URL gesetzt via buildModuleUrl.setBaseUrl: /cesium/")
          
          // Test: Prüfe ob Base URL korrekt gesetzt wurde
          try {
            const testUrl = (Cesium as any).buildModuleUrl("Assets/Textures/NaturalEarthII/tilemapresource.xml")
            console.log("🔍 Test URL für NaturalEarthII:", testUrl)
            console.log("🔍 Erwartete URL: /cesium/Assets/Textures/NaturalEarthII/tilemapresource.xml")
          } catch (error) {
            console.warn("⚠️ Fehler beim Testen der Base URL:", error)
          }
        } else {
          console.warn("⚠️ buildModuleUrl.setBaseUrl nicht verfügbar")
        }
        
        // Methode 2: window.CESIUM_BASE_URL (Fallback)
        ;(window as any).CESIUM_BASE_URL = "/cesium"
        console.log("✅ window.CESIUM_BASE_URL gesetzt: /cesium")

        // Set Cesium Ion Access Token (optional)
        const cesiumIonToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
        if (cesiumIonToken && cesiumIonToken.trim() !== "") {
          Cesium.Ion.defaultAccessToken = cesiumIonToken.trim()
          console.log("✅ Cesium Ion Token gesetzt")
        }

        // Initialize terrain provider (minimal: Ellipsoid)
        const terrainProvider = new Cesium.EllipsoidTerrainProvider()

        // Warte, bis Container vollständig gerendert ist
        await new Promise((resolve) => requestAnimationFrame(resolve))
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Guard: Prüfe nochmal ob Component noch gemountet ist
        if (!isMounted || !containerRef.current) {
          console.warn("⚠️ Component unmounted vor Viewer-Erstellung")
          return
        }

        // Prüfe Container-Größe
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        if (containerWidth === 0 || containerHeight === 0) {
          console.error("❌ Container hat keine Größe:", containerWidth, "x", containerHeight)
          return
        }

        console.log("📐 Container-Größe:", containerWidth, "x", containerHeight)

        // Erstelle Viewer mit minimalen Optionen
        // WICHTIG: baseLayer: false verhindert, dass Cesium einen Standard-Layer lädt
        const viewer = new Cesium.Viewer(container, {
          terrainProvider: terrainProvider,
          baseLayer: false, // EXPLIZIT false, um Standard-Layer zu verhindern
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          timeline: false,
          animation: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
          shouldAnimate: true,
          requestRenderMode: false,
          maximumRenderTimeChange: Infinity,
        })

        console.log("✅ Viewer erstellt")
        
        // WICHTIG: Entferne ALLE Imagery-Layers sofort nach Viewer-Erstellung
        // Dies verhindert, dass Cesium versucht, NaturalEarthII oder andere Standard-Layer zu laden
        console.log("🧹 Entferne alle Standard-Imagery-Layers...")
        viewer.imageryLayers.removeAll()
        console.log("✅ Alle Imagery-Layers entfernt, neue length:", viewer.imageryLayers.length)

        // Warte, bis cesiumWidget und canvas verfügbar sind
        let retries = 0
        const maxRetries = 50
        while (retries < maxRetries) {
          if (viewer.cesiumWidget && viewer.cesiumWidget.canvas && viewer.canvas) {
            if (viewer.cesiumWidget.canvas instanceof HTMLCanvasElement) {
              console.log("✅ cesiumWidget und canvas verfügbar nach", retries, "Versuchen")
              break
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 100))
          retries++
        }

        if (!viewer.cesiumWidget || !viewer.cesiumWidget.canvas) {
          console.error("❌ cesiumWidget oder canvas nicht verfügbar")
          viewer.destroy()
          return
        }

        // Warte zusätzlich, damit Cesium alle internen Referenzen setzen kann
        await new Promise((resolve) => requestAnimationFrame(resolve))
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Guard: Prüfe nochmal ob Component noch gemountet ist
        if (!isMounted) {
          console.warn("⚠️ Component unmounted, zerstöre Viewer")
          viewer.destroy()
          return
        }

        // Debug: Canvas-Größe loggen
        const canvas = viewer.canvas || viewer.cesiumWidget?.canvas
        if (canvas) {
          console.log("📐 Canvas size:", canvas.clientWidth, "x", canvas.clientHeight)
        } else {
          console.warn("⚠️ Canvas nicht verfügbar für Size-Check")
        }

        // Debug: Render Error Listener
        viewer.scene.renderError.addEventListener((error: any) => {
          console.error("❌ Cesium Render Error:", error)
        })

        // Debug: Tile Load Progress
        viewer.scene.globe.tileLoadProgressEvent.addEventListener((n: number) => {
          if (n > 0) {
            console.log("📦 Tiles loading:", n)
          }
        })

        // Configure scene (minimal)
        viewer.scene.globe.enableLighting = true
        viewer.scene.globe.showWaterEffect = true
        viewer.scene.globe.showGroundAtmosphere = true
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a1628")
        viewer.scene.requestRenderMode = false
        viewer.scene.maximumRenderTimeChange = Infinity
        
        // Setze Ozean-Farbe explizit für schöne blaue Ozeane
        try {
          viewer.scene.globe.oceanNormalMapUrl = Cesium.buildModuleUrl("Assets/Textures/waterNormalsSmall.jpg")
          console.log("✅ Ozean-Normal-Map gesetzt")
        } catch (error) {
          console.warn("⚠️ Fehler beim Setzen der Ozean-Normal-Map:", error)
        }

        // ===== IMAGERY DEBUG & SAFE TEST =====
        console.log("🔍 === IMAGERY DEBUG START ===")
        
        // 1) Logge Imagery-Layers nach Viewer-Init
        console.log("📊 viewer.imageryLayers.length (nach Viewer-Init):", viewer.imageryLayers.length)
        for (let i = 0; i < viewer.imageryLayers.length; i++) {
          const layer = viewer.imageryLayers.get(i)
          console.log(`  Layer ${i}:`, {
            show: layer.show,
            alpha: layer.alpha,
            provider: layer.imageryProvider?.constructor?.name || "unknown"
          })
        }

        // 2) Wenn keine Imagery-Layers vorhanden sind, füge einen hinzu
        if (viewer.imageryLayers.length === 0) {
          console.warn("⚠️ KEINE Imagery-Layers vorhanden! Versuche World Imagery hinzuzufügen...")
          try {
            const worldImagery = await Cesium.createWorldImageryAsync({
              style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
            })
            const layer = viewer.imageryLayers.addImageryProvider(worldImagery)
            layer.show = true
            layer.alpha = 1.0
            console.log("✅ World Imagery hinzugefügt, neue length:", viewer.imageryLayers.length)
          } catch (error) {
            console.error("❌ World Imagery fehlgeschlagen:", error)
          }
        }

        // 3) Safe-Test: Entferne alle Layers und füge World Imagery hinzu
        console.log("🧪 === SAFE TEST: Entferne alle Layers und füge World Imagery hinzu ===")
        viewer.imageryLayers.removeAll()
        console.log("📊 Nach removeAll(), length:", viewer.imageryLayers.length)

        try {
          console.log("🔄 Füge Cesium World Imagery hinzu...")
          const worldImagery = await Cesium.createWorldImageryAsync({
            style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
          })
          const layer = viewer.imageryLayers.addImageryProvider(worldImagery)
          layer.show = true
          layer.alpha = 1.0
          console.log("✅ World Imagery hinzugefügt, neue length:", viewer.imageryLayers.length)
          console.log("✅ Layer.show:", layer.show, "Layer.alpha:", layer.alpha)
          
          // Force render
          viewer.scene.requestRender()
          console.log("✅ requestRender() aufgerufen")
        } catch (error) {
          console.error("❌ World Imagery fehlgeschlagen:", error)
          // Fallback: OpenStreetMap
          try {
            console.log("🔄 Fallback: Versuche OpenStreetMap...")
            const osmProvider = new Cesium.OpenStreetMapImageryProvider({
              url: "https://a.tile.openstreetmap.org/",
            })
            const layer = viewer.imageryLayers.addImageryProvider(osmProvider)
            layer.show = true
            layer.alpha = 1.0
            console.log("✅ OpenStreetMap hinzugefügt (Fallback)")
          } catch (osmError) {
            console.error("❌ OpenStreetMap fehlgeschlagen:", osmError)
          }
        }

        // 4) Finale Prüfung
        console.log("📊 Finale Imagery-Layers nach Safe-Test:", viewer.imageryLayers.length)
        for (let i = 0; i < viewer.imageryLayers.length; i++) {
          const layer = viewer.imageryLayers.get(i)
          console.log(`  Final Layer ${i}:`, {
            show: layer.show,
            alpha: layer.alpha,
            provider: layer.imageryProvider?.constructor?.name || "unknown"
          })
        }
        
        // 5) Prüfe baseLayer-Option
        console.log("🔍 Viewer baseLayer-Option:", (viewer as any).baseLayer)
        console.log("🔍 === IMAGERY DEBUG END ===")

        // World Terrain (Höhen, Berge, Täler)
        try {
          const worldTerrain = await Cesium.createWorldTerrainAsync()
          viewer.terrainProvider = worldTerrain
          viewer.scene.requestRender()
          console.log("✅ Cesium World Terrain geladen")
        } catch (terrainError) {
          console.warn("⚠️ World Terrain nicht geladen (Ion Token?):", terrainError)
        }

        // 3D-Gebäude (Cesium OSM Buildings)
        try {
          const osmBuildings = await Cesium.Cesium3DTileset.fromIonAssetId(96188)
          viewer.scene.primitives.add(osmBuildings)
          viewer.scene.requestRender()
          console.log("✅ 3D-Gebäude (OSM Buildings) geladen")
        } catch (buildingsError) {
          console.warn("⚠️ 3D-Gebäude nicht geladen (Ion Token?):", buildingsError)
        }

        // Kamera erst nach kurzer Verzögerung setzen (vermeidet Höhe 0)
        await new Promise((r) => requestAnimationFrame(r))
        await new Promise((r) => setTimeout(r, 50))
        const initialHeightMeters = 15_000_000
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 0, initialHeightMeters),
          orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0,
          },
        })
        viewer.scene.requestRender()

        // Store viewer reference
        viewerRef.current = viewer

        // Force initial render
        viewer.scene.requestRender()
        console.log("✅ Cesium Viewer vollständig initialisiert")
      } catch (error) {
        console.error("❌ Error initializing Cesium:", error)
      }
    }

    initCesium()

    // Cleanup: destroy viewer und setze viewerRef.current = null
    return () => {
      isMounted = false

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try {
          viewerRef.current.destroy()
          console.log("✅ Viewer destroyed")
        } catch (error) {
          console.warn("⚠️ Fehler beim Destroy des Viewers:", error)
        }
      }

      viewerRef.current = null
    }
  }, []) // Leeres Dependency Array: nur einmal beim Mount

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "500px",
        background: "#111",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}
