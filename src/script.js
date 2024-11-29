import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Texture Loader
const textureLoader = new THREE.TextureLoader

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */


const axesHelper = new THREE.AxesHelper(2)



//realistic ground
const ground = textureLoader.load('/grass.jpg')
const normalground = textureLoader.load('/normalGrass.jpg')
const groundAO = textureLoader.load('/grassAmbientOcclusion.jpg')
normalground.wrapS = normalground.wrapT = THREE.RepeatWrapping
groundAO.wrapS = groundAO.wrapT = THREE.RepeatWrapping

//realistic Statue
const statuebase = textureLoader.load('/Beige_Icon_Concrete_fvrsfuwku_4k_Albedo.jpg')
const statueAO = textureLoader.load('/statueAO.jpg')
statueAO.wrapS = statueAO.wrapT = THREE.RepeatWrapping

//realistic pathway
const pathwayMap = textureLoader.load('pathway.jpg')
pathwayMap.wrapS = pathwayMap.wrapT = THREE.RepeatWrapping
const pathwayNorm = textureLoader.load('pathwayNormal.jpg')
pathwayNorm.wrapS = pathwayNorm.wrapT = THREE.RepeatWrapping
const pathwayAO = textureLoader.load('pathwayAO.jpg')
pathwayAO.wrapS = pathwayAO.wrapT = THREE.RepeatWrapping


const geometry = new THREE.TorusKnotGeometry( 2, 0.3, 26, 20, 9, 6 ); 
const material1 = new THREE.MeshStandardMaterial( { 
    color: '#D4AF37',
    roughness: 0.5,
    metalness: 0.5
    }); 
const topStatue= new THREE.Mesh( geometry, material1 ); 
topStatue.position.y = 9.5
scene.add( topStatue );

const material = new THREE.MeshStandardMaterial({
    map: statuebase, // Base texture
    aoMap: statueAO,
    roughness: 0.5,  // Adds surface roughness
    metalness: 0.5   // Simulates slight metallic appearance

});
const base = new THREE.BoxGeometry(12,0.5,12)
const statueBase = new THREE.Mesh(base , material)
statueBase.position.y = 0.3
statueBase.position.x = 0
scene.add(statueBase)

const statuemid = new THREE.CylinderGeometry( 1.5, 5, 5, 64, 64); 
const statueMid = new THREE.Mesh( statuemid, material ); 
statueMid.position.y = 3
scene.add( statueMid );


// Pathway material (to look like stone or concrete)
const pathwayMaterial = new THREE.MeshStandardMaterial({
    map: pathwayMap, 
    aoMap: pathwayAO,
    normalMap: pathwayNorm,
    roughness: 0.9,   // High roughness for a non-reflective look
    metalness: 0.1    // Minimal metallic appearance
});

// Pathway geometry (rectangular, longer to reach grass edge)
const pathwayLength = 35; // Half of the grass size (70 / 2)
const pathwayGeometry = new THREE.BoxGeometry(5, 0.1, pathwayLength); // Adjust length
pathwayMap.repeat.set(1, pathwayLength / 2); 
pathwayAO.repeat.set(1, pathwayLength / 2); 
pathwayNorm.repeat.set(1, pathwayLength / 2);
// North pathway
const northPathway = new THREE.Mesh(pathwayGeometry, pathwayMaterial);
northPathway.position.set(0, 0.05, -pathwayLength / 2); // Move north (-z)
northPathway.receiveShadow = true;

// East pathway
const eastPathway = new THREE.Mesh(pathwayGeometry, pathwayMaterial);
eastPathway.rotation.y = Math.PI * 0.5; // Rotate for east-west direction
eastPathway.position.set(pathwayLength / 2, 0.05, 0); // Move east (+x)
eastPathway.receiveShadow = true;

// West pathway
const westPathway = new THREE.Mesh(pathwayGeometry, pathwayMaterial);
westPathway.rotation.y = Math.PI * 0.5; // Rotate for east-west direction
westPathway.position.set(-pathwayLength / 2, 0.05, 0); // Move west (-x)
westPathway.receiveShadow = true;

// South pathway
const southPathway = new THREE.Mesh(pathwayGeometry, pathwayMaterial);
southPathway.position.set(0, 0.05, pathwayLength / 2); // Move south (+z)
southPathway.receiveShadow = true;

// Add pathways to the scene
scene.add(northPathway, eastPathway, westPathway, southPathway);

const grass = new THREE.Mesh(
    new THREE.BoxGeometry(70, 70, 0.05),
    new THREE.MeshStandardMaterial({ 
        map: ground,
        normalMap: normalground,
        aoMap: groundAO,
        roughness: 1
    })
)
grass.rotation.x = - Math.PI * 0.5
grass.position.z = 0
grass.receiveShadow = true; 
scene.add(grass, axesHelper)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 0.5)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

//spotlight
const spotlight = new THREE.SpotLight(0xffffff, 0.9, 100, Math.PI / 6, 0.1, 1);
spotlight.position.set(0, 10, 0); // Position above the statue
spotlight.target = topStatue; // Point the spotlight at the statue

//spotlight properties
spotlight.castShadow = true; // Enable shadow casting
spotlight.angle = Math.PI / 4; // Spotlight cone angle
spotlight.penumbra = 0.3; // Soft edge for the spotlight
spotlight.decay = 2; // Light decay over distance

// Add the spotlight to the scene
scene.add(spotlight);



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 5
camera.position.z = 20
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    topStatue.rotation.y += 0.02; // Adjust speed by changing 0.01
    //topStatue.rotation.x += 0.005; // Optional, for multi-axis spin
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()