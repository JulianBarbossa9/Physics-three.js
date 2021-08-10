import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
//Importar libreria para fisicas
import CANNON from 'cannon'

// console.log(CANNON);

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Panel de Control 
 */
// Para crear el panel de control es necesario que sea un OBJETO en el cado de la creación de esferas es una función hay que convertirlo
const convertObject = {};
convertObject.createSphere = () => {
    // Aca le doy diferentes posiciónes y diferente radio a las esferas que estoy creando 
    createSphere(
        Math.random() * 0.5, //Radio
        {
            x:(Math.random() -0.5) * 3, 
            y:3, 
            z:(Math.random() -0.5) * 3
        }
    );
}

convertObject.createBox= () => {
    // Aca le doy diferentes posiciónes y diferente radio a las esferas que estoy creando 
    createBox(
        Math.random() * 0.5, // Width
        Math.random() * 0.5, // Height
        Math.random() * 0.5, // Depth
        {
            x:(Math.random() -0.5) * 3, 
            y:3, 
            z:(Math.random() -0.5) * 3
        }
    );
}
gui.add(convertObject, 'createSphere'); // Tiene que ser si o si como se llama la función
gui.add(convertObject, 'createBox');
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Fisicas del mundo
*/
// Mundo
const world = new CANNON.World();

// Agregar gravedad negativo en y para que caiga
world.gravity.set(0,-9.82,0); 

// Materials ----> podemos cambiar la fricción o el rebote dependiendo del material
// Se uso defatulMaterial == defaultMaterial para simplificar todo 
const defaultMaterial = new CANNON.Material('default');
// const plasticMaterial = new CANNON.Material('plastic');

// Combinación de los 2 materiales previamente creado
const defaultContacMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.9//Rebote 
    }
)
world.addContactMaterial(defaultContacMaterial);
world.defaultContactMaterial = defaultContacMaterial; 


// Crear Esfera body == mesh pero es body porque es en CANNON
// const sphereShape = new CANNON.Sphere(0.5); 

// // Creo el cuerpo===Body con masa y posicion
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position:new CANNON.Vec3(0,3,0),
//     shape: sphereShape,
    // material: defatulMaterial // se actualiza el material para que rebote (plastico)
// }); 

/**
 * Fuerzas 
 */
// Empuja la esfera en la dirección x 
// sphereBody.applyLocalForce(new CANNON.Vec3(150,0,0), new CANNON.Vec3(0,0,0)); 
// world.addBody(sphereBody) // Aca agrego la esfera al mundo para que caiga 

// Floor fisica 
const floorShape = new CANNON.Plane();

const floorBody = new CANNON.Body();//Es un plano infinito
floorBody.mass = 0; //Hago el objeto estatico para que no se mueva
// floorBody.material = defatulMaterial;// se actualiza el material (concreto)
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
     Math.PI * 0.5);//Corregir las posicion del plano para que la pelota/espera caiga
world.addBody(floorBody);



//
//
/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Creacion de esferas con función
 */

// Creo un array que actualiza los objetos creados Mesh y Body 
const objectsToUpdate = [];
//Optimizar
const sphereGeometry = new THREE.SphereBufferGeometry(1,20,20); 
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness:0.3,
    roughness:0.4,
    envMap: environmentMapTexture
})



const createSphere = (radius, position) => {
    // Three.js mesh creación de la maya que creamos comunmente 
    const mesh = new THREE.Mesh(sphereGeometry,sphereMaterial); 
    mesh.scale.set(radius, radius, radius); 
    mesh.castShadow = true;
    mesh.position.copy(position); // mesh es un objeto donde accedemos a la propiedad position y le le decimos que copie en esa propiedad la nueva position dada por la función 
    scene.add(mesh); 

    // Cannon.js body creación de las fisicas 
    const shape = new CANNON.Sphere(radius);

    const body = new CANNON.Body({
        mass:1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    // console.log(body)
    world.addBody(body);

    // Guardo los objetos para actualizarlos, si llamo 2 veces a createSphere tengo 2 objetos y llamo 3 veces a createSphere tengo 3 objetos y asi...
    objectsToUpdate.push({
        mesh:mesh,
        body:body
    })
}

const boxGeometry = new THREE.BoxBufferGeometry(1 ,1 ,1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.5,
    roughness: 0.5,
    envMap: environmentMapTexture
})


const createBox = (width, height, depth, position) =>{
    // Three.js creacion del mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon.js
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth /2));
    const body = new CANNON.Body({
        mass:1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    // console.log(body)
    world.addBody(body);

    objectsToUpdate.push({
        mesh:mesh,
        body:body
    })

}

// Llamamos la función de crear las esferas "createSphere"
createSphere(0.5,{x:0 , y:3, z:0});
//createBox(0.5,{x:0 , y:3, z:0}); 
// createSphere(0.5,{x:2 , y:3, z:2});
// createSphere(0.5,{x:1 , y:1, z:4});
// console.log(objectsToUpdate);



/**
 * Animate
 */
const clock = new THREE.Clock()

// Tiempo transcurrido previamente 
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Necesitamos extraer del tiempo transcurrido (elapsedTime) del frame previo 
    const deltaTime = elapsedTime - oldElapsedTime; 

    oldElapsedTime = elapsedTime;
    // sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0), sphereBody.position); 

    // // Simular la fuerza del viento 
    // sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0), sphereBody.position);

    // Actualizar las fisicas del mundo
    world.step(1 / 60,deltaTime ,3);

    // Actualizo la posicion de las esferas 
    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position); 
    }

    // Actualizar cada posicion de la esfera (las esfera cae)
    // sphere.position.copy(sphereBody.position) // Esto resume las lineas de abajo 
    // sphere.position.x = sphereBody.position.x;
    // sphere.position.y = sphereBody.position.y;
    // sphere.position.z = sphereBody.position.z;

   

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()