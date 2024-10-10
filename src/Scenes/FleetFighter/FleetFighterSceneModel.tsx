import {App2DSceneModel} from "anigraph/starter/App2D/App2DSceneModel";
import {FireParticleSystemModel} from "./nodes";
import {Player} from "./nodes/Player/Player";
import {Meteoroid} from "./nodes/Meteoroid/Meteoroid";
import {
    AMaterial,
    AMaterialManager,
    ANodeModel,
    AppState,
    ATexture,
    Color,
    DefaultMaterials,
    GetAppState,
    Mat3,
    Mat4,
    Polygon2D,
    SVGAsset,
    V2,
    V3
} from "../../anigraph";
import React from "react";
import {CustomSVGModel} from "./nodes/CustomSVGModel";
import {BackgroundParticleSystemModel} from "./nodes/BackgroundParticleSystem";
import {SmokeParticleSystemModel} from "./nodes/FlameParticleSystem/SmokeParticleSystemModel";

import {Bullet} from "./nodes/Bullet/Bullet";
import {GameConfigs} from "./FleetFighterGameConfigs";
import {Asteroid} from "./nodes/Asteroid/Asteroids";
import {Collision, collisionType} from "./nodes/Collision";
// import {collisionType} from "./nodes/CollisionModel";

let nErrors = 0;
export class FleetFighterSceneModel extends App2DSceneModel{

    /**
     * Our example particle system model. Note that if we are declaring some class instance attribute that may not be
     * initialized in the constructor, we need to put the "!" after its name to indicate that we intend to initialize it
     * elsewhere. In this case, we will initialize `particleSystem` in the `initScene()` function.
     * @type {FireParticleSystemModel}
     */
    fireParticleSystem!:FireParticleSystemModel;
    smokeParticleSystem!:SmokeParticleSystemModel;
    starParticleSystem!:BackgroundParticleSystemModel;
    star2ParticleSystem!:BackgroundParticleSystemModel;
    star3ParticleSystem!:BackgroundParticleSystemModel;


    player!:Player;
    meteoroids:Meteoroid[] = [];


    /**
     * The bullets used to hit spaceships and such, for now Lab Cat will be the bullet but we can change that later
     * @type {Bullet[]}
     */
        // bullet!:Bullet;
    bullets: Bullet[] = [];

    bulletsUsed: Bullet[] = [];

    bulletTexture!:ATexture;

    /**
     * Lab Cat vector asset. Also a floating head.
     * @type {SVGAsset}
     */
    labCatSVG!:SVGAsset;
    labCatVectorHead!:CustomSVGModel;


    /**
     * Asteroid stuff
     * @type {Polygon2DModel[]}
     */
    asteroids: Asteroid[] = [];

    /**
     * Material for asteroids
     * @type {AMaterial}
     */
    asteroidMaterial!:AMaterial;


    /**
     * This will add variables to the control pannel
     * @param appState
     */
    initAppState(appState:AppState){
        appState.addSliderIfMissing(FireParticleSystemModel.ParticleOrbitKey, 7, 0, 10, 0.001);
        appState.addColorControl(FireParticleSystemModel.ParticleColorKey, Color.FromString("#00abe0"));
    }

    /**
     * This function is a good place to preload files that the scene uses; things like textures and shaders.
     * In the final project, we will use a similar function to load 3D meshes.
     * @returns {Promise<void>}
     * @constructor
     */
    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();
        let appState = GetAppState();

        /**
         * We will talk about shaders later in the semester. For now, just know that each one of these is something like
         * a material used for rendering objects.
          */
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.INSTANCED_TEXTURE2D_SHADER);
        await appState.loadShaderMaterialModel(AMaterialManager.DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        await appState.loadShaderMaterialModel(DefaultMaterials.TEXTURED2D_SHADER);
        await this.loadTexture( "./images/fireParticle2.png", "GaussianSplat")
        await this.loadTexture( "./images/SmallStar.png", "SmallStar")
        await this.loadTexture( "./images/MedStar.png", "MedStar")
        // await this.loadTexture( "./images/SmMeteroid.png", "Meteroid")
        // this.labCatSVG = await SVGAsset.Load("./images/svg/LabCatVectorHead.svg");
        await Player.PreloadAssets();
        await Meteoroid.PreloadAssets();
        this.bulletTexture = await ATexture.LoadAsync("./images/LabCatFloatingHeadSmall.png")
    }

    /**
     * Use this function to initialize the content of the scene.
     * Generally, this will involve creating instances of ANodeModel subclasses and adding them as children of the scene:
     * ```
     * let myNewModel = new MyModelClass(...);
     * this.addChild(myNewModel);
     * ```
     *
     * You may also want to add tags to your models, which provide an additional way to control how they are rendered
     * by the scene controller. See example code below.
     */
    async initScene(){
        let appState = GetAppState();

        // Create an instance of the player
        //More asteroid stuff
        this.asteroidMaterial = appState.CreateMaterial(DefaultMaterials.RGBA_SHADER);


        // Create an instance of Lab Cat's floating head. Not as cool as the real Lab Cat, but still pretty cool.
        this.player = Player.Create();
        // The geometry itself is a unit square that ranges from -0.5 to 0.5 in x and y. Let's scale it up x2.5.
        this.player.transform.scale = 2.5;

        // this.bullet = Bullet.Create();
        // this.bullet.transform.scale = 1;
        this.bullets = [];
        for (let i = 0; i < GameConfigs.nBULLET; i++) {
            let newBullet = new Bullet(Polygon2D.Square(), Mat3.Translation2D([0,0]),
                Mat4.From2DMat3(
                    Mat3.Translation2D(V2(0.5,0.5)).times(
                        Mat3.Scale2D(0.5)
                    )
                ));
            newBullet.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
            newBullet.setTexture(this.bulletTexture);
            let currCircle = new Collision(1, collisionType.bullet);
            currCircle.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
            newBullet.collisionCircle = currCircle;
            newBullet.addChild(currCircle);
            // newBullet.transform.scale = 1;
            this.bullets.push(newBullet);
        }

        // Lab Cat on the scene. Or in the scene, I guess... Either way, this will cause the controller to make a view.
        this.addChild(this.player);

        // Create meteoroids

        this.meteoroids.push(Meteoroid.Create());
        // this.addChild(this.meteoroids[0]);
        this.meteoroids[0].transform.scale = 3.5;

        // this.addChild(this.bullet);

        // Lab Cat on the scene... again!
        // this.labCatVectorHead = new CustomSVGModel(this.labCatSVG);
        // this.addChild(this.labCatVectorHead);


        // Now let's create some particles...
        // Here we initialize our particle system. We will initialize to a relatively small number of particles here to
        // be safe, but you can probably increase this on most modern machines. I can run thousands on my machine just fine.
        this.fireParticleSystem = new FireParticleSystemModel();
        let maxNumParticles = 100;
        this.fireParticleSystem.initParticles(maxNumParticles) // the number you pass here will be the maximum number of particles you can have at once for this particle system

        // For now, use this material that I've created for you. It will render each particle as the
        // pixel-wise product of a particle texture and an instance color. The texture I've used here is a simple blurry
        // dot. Can't go wrong with a blurry dot...
        // You can use a different texture if you want by putting it in the /public/images/ directory, loading it in
        // PreloadAssets() with its own name and assigning it here using that name instead of "GaussianSplat"
        let fireParticleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        fireParticleMaterial.setUniform("opacityInMatrix", true);
        fireParticleMaterial.setTexture("color", this.getTexture("GaussianSplat"))
        this.fireParticleSystem.setMaterial(fireParticleMaterial)

        // Smoke Particle System
        this.smokeParticleSystem = new SmokeParticleSystemModel();
        maxNumParticles = 100;
        this.smokeParticleSystem.initParticles(maxNumParticles)
        let smokeParticleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        smokeParticleMaterial.setUniform("opacityInMatrix", true);
        smokeParticleMaterial.setTexture("color", this.getTexture("GaussianSplat"))
        this.smokeParticleSystem.setMaterial(fireParticleMaterial)
        // this.addChild(this.smokeParticleSystem);

        // Bind the particle system to the ship
        this.player.makeParticleSystemChild(this.fireParticleSystem);
        this.fireParticleSystem.transform.setPosition(V3(0,-.2,0));
        this.player.makeParticleSystemChild(this.smokeParticleSystem);
        this.smokeParticleSystem.transform.setPosition(V3(0,0.1,0));

        // Here we will change the zValue of our particles so that they render behind the player...
        this.fireParticleSystem.zValue = -0.01;


        // let targetTransform = this.particleSystem.getWorldTransform();
        // let playerTransform = this.player.getWorldTransform();
        // let newTransform = playerTransform.getInverse().times(targetTransform);
        // this.player.addChild(this.particleSystem);
        // this.particleSystem.setTransform(newTransform);
        // this.particleSystem.transform.setPosition(V3(0,-.2,0));
        /** By default, objects are placed at a depth of 0. If you don't change this, then child objects will render on top of parents, and objects added to the scene later will be rendered on top of objects you added earlier. If you want to change this behavior, you can set the zValue of an object. The depth of an object will be the sum of zValues along the path that leads from its scene graph node to world space. Objects with higher depth values will be rendered on top of objects with lower depth values. Note that any depth value outside the scene's depth range will not be rendered. The depth range is [this.cameraModel.camera.zNear, this.cameraModel.camera.zFar] (defaults to [-5,5] at time of writing in 2024...)
         */

        // Initialize star particle systems

        // Medium-sized stars
        let colorM = Color.Red().GetSpun(Math.PI);
        this.starParticleSystem = new BackgroundParticleSystemModel(colorM, 4, 1.5, 0.1, 0.4, 0.25);
        maxNumParticles = 25;
        this.starParticleSystem.initParticles(maxNumParticles)
        // More Asteroid Stuff
        function createSpikyGeometry(k:number, spikiness:number=0, color:Color){
            let polygon = Polygon2D.CreateForRendering() // default is hasColors=true, hasTextureCoords=false
            // color = color??appState.getState("ColorValue1");
            let spikeScale = 1-spikiness;
            for(let v=0;v<k;v++){
                let theta_step = -2*Math.PI/k; // The sign matters here!
                let theta = v*theta_step;
                let thetab = (v+0.5)*theta_step;
                polygon.addVertex(V2(Math.cos(theta), Math.sin(theta)), color);
                polygon.addVertex(V2(Math.cos(thetab), Math.sin(thetab)).times(spikeScale), color);
            }
            return polygon;
        }
        let newAsteroid = new Asteroid(createSpikyGeometry(4, 0, new Color(0,150,150,1)));
        newAsteroid.setMaterial(this.asteroidMaterial);
        // newAsteroid.transform.setPosition(this.player.transform.getPosition());
        newAsteroid.transform.setPosition(V3(-11,5,0));

        let smallStarParticleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        smallStarParticleMaterial.setUniform("opacityInMatrix", true);
        smallStarParticleMaterial.setTexture("color", this.getTexture("SmallStar"));
        this.starParticleSystem.setMaterial(smallStarParticleMaterial)
        this.starParticleSystem.zValue = -0.01;
        this.addChild(this.starParticleSystem);
        for (let i=0;i<6; i++) {
            let asteroidCopy = new Asteroid(createSpikyGeometry(4, 0, new Color(0,150,150,1)));
            asteroidCopy.setMaterial(this.asteroidMaterial);
            asteroidCopy.transform.setPosition(newAsteroid.transform.getPosition().plus(V3(3,0,0)));
            // asteroidCopy.addChild(new Collision(3, collisionType.asteroid));
            let currCircle = new Collision(1, collisionType.bullet);
            currCircle.setMaterial(GetAppState().CreateMaterial(AMaterialManager.DefaultMaterials.TEXTURED2D_SHADER));
            asteroidCopy.collisionCircle = currCircle;
            asteroidCopy.addChild(currCircle);
            this.addChild(asteroidCopy);
            this.asteroids.push(asteroidCopy);
            newAsteroid = asteroidCopy;
        }

        // Small stars
        this.star2ParticleSystem = new BackgroundParticleSystemModel(Color.White(), 1.5, 0.5, 0.1, 0.5);
        maxNumParticles = 250;
        this.star2ParticleSystem.initParticles(maxNumParticles)

        this.star2ParticleSystem.setMaterial(smallStarParticleMaterial)
        this.star2ParticleSystem.zValue = -0.01;
        this.addChild(this.star2ParticleSystem);

        // Larger stars
        let largeStarParticleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        let colorL = new Color(255,255,0,1);
        // colorL = colorL.GetSpun(4);
        this.star3ParticleSystem = new BackgroundParticleSystemModel(colorL, 6, 2.5, 0.1, 0.3, 0.1);
        maxNumParticles = 3;
        this.star3ParticleSystem.initParticles(maxNumParticles)
        largeStarParticleMaterial.setTexture("color", this.getTexture("MedStar"));
        this.star3ParticleSystem.setMaterial(largeStarParticleMaterial)
        this.star3ParticleSystem.zValue = -0.01;
        this.addChild(this.star3ParticleSystem);


        appState.setState("LabCatScale", 1.0);
        appState.setReactGUIContentFunction(
            (props:{appState:AppState})=>{
                return (
                    <React.Fragment>
                    {`Lab Cat head scale is ${props.appState.getState("LabCatScale")}`}
                    </React.Fragment>
                );
            }
        );

    }

    // Helper Functions ----------------------------------------------------
    // checkAsteroidCollision(){
    //     for (let i = 0; i < this.bulletsUsed.length; i++) {
    //         let b = this.bulletsUsed[i];
    //         for (let a of this.asteroids) {
    //             let intersection = b.getIntersectionsWith(a);
    //             if (intersection.length > 0){
    //                 a.gotHit();
    //                 b.hasCollided = true;
    //
    //                 b.parent?.removeChild(b);
    //                 this.bullets.push(b);
    //                 this.bulletsUsed.splice(i, 1);
    //                 i--;
    //                 b.speed = 0;
    //                 break;
    //             }
    //         }
    //     }
    // }
    checkAsteroidCollision(){
        for (let i=0;i<this.bulletsUsed.length;i++){
            let b = this.bulletsUsed[i];
            for (let a of this.asteroids) {
                // console.log('at least it goes through the loop');
                if (b.collisionCircle && a.collisionCircle && b.collisionCircle.isCollidingWith(b.transform.getPosition(), a.transform.getPosition(), a.collisionCircle)) {
                    console.log('it actually works!')
                    a.gotHit();
                    b.hasCollided = true;

                    b.parent?.removeChild(b);
                    this.bullets.push(b);
                    this.bulletsUsed.splice(i, 1);
                    i--;
                    b.speed = 0;
                    break;
                }
            }
        }
    }



    /**
     * Our time update function.
     * @param t
     */
    timeUpdate(t: number) {
        try {
            // This is a good strategy in general. It iterates over all of the models in the scene and calls the
            // individual `timeUpdate` functions for each model. If you don't have many interactions between models you
            // can usually implement most of your scene logic this way
            // for (let i = 0; i < this.meteoroids.length; i++){
            //     this.meteoroids[i].timeUpdate(t);
            // }
            // console.log(this.bulletsUsed)
            this.mapOverDescendants((d)=>{
                (d as ANodeModel).timeUpdate(t);
                this.checkAsteroidCollision();
            })
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }
    }
}
