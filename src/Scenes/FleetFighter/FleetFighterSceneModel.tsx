import { App2DSceneModel } from "anigraph/starter/App2D/App2DSceneModel";
import {FireParticleSystemModel} from "./nodes";
import {Player} from "./nodes/Player/Player";
import {
    AMaterialManager,
    ANodeModel,
    AppState,
    Color,
    DefaultMaterials,
    GetAppState,
    SVGAsset,
    V2, V3
} from "../../anigraph";
import React from "react";
import {CustomSVGModel} from "./nodes/CustomSVGModel";
import {BackgroundParticleSystemModel} from "./nodes/BackgroundParticleSystem";


let nErrors = 0;
export class FleetFighterSceneModel extends App2DSceneModel{

    /**
     * Our example particle system model. Note that if we are declaring some class instance attribute that may not be
     * initialized in the constructor, we need to put the "!" after its name to indicate that we intend to initialize it
     * elsewhere. In this case, we will initialize `particleSystem` in the `initScene()` function.
     * @type {FireParticleSystemModel}
     */
    fireParticleSystem!:FireParticleSystemModel;
    starParticleSystem!:BackgroundParticleSystemModel;

    /**
     * Lab Cat's floating head. Lab Cat wants to show you how to create a simple quad textured with a cool texture.
     * In this case, a texture of Lab Cat's floating head... What could be cooler than that?
     * @type {Player}
     */
    player!:Player;

    /**
     * Lab Cat vector asset. Also a floating head.
     * @type {SVGAsset}
     */
    labCatSVG!:SVGAsset;
    labCatVectorHead!:CustomSVGModel;


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
        this.labCatSVG = await SVGAsset.Load("./images/svg/LabCatVectorHead.svg");
        await Player.PreloadAssets();
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

        // Create an instance of Lab Cat's floating head. Not as cool as the real Lab Cat, but still pretty cool.
        this.player = Player.Create();
        // The geometry itself is a unit square that ranges from -0.5 to 0.5 in x and y. Let's scale it up x3.
        this.player.transform.scale = 2.5;

        // Lab Cat on the scene. Or in the scene, I guess... Either way, this will cause the controller to make a view.
        this.addChild(this.player);


        // Lab Cat on the scene... again!
        this.labCatVectorHead = new CustomSVGModel(this.labCatSVG);
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
        let particleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        particleMaterial.setUniform("opacityInMatrix", true);
        particleMaterial.setTexture("color", this.getTexture("GaussianSplat"))
        this.fireParticleSystem.setMaterial(particleMaterial)

        // Let's add the particle system, which will cause the scene controller to create a particle system view and add
        // it to our scene graph. Pretty sweet.
        // this.addChild(this.particleSystem);

        // Bind the particle system to the ship
        let targetTransform = this.fireParticleSystem.getWorldTransform();
        let playerTransform = this.player.getWorldTransform();
        let newTransform = playerTransform.getInverse().times(targetTransform);
        this.player.addChild(this.fireParticleSystem);
        this.fireParticleSystem.setTransform(newTransform);
        this.fireParticleSystem.transform.setPosition(V3(0,-.2,0));
        // Here we will change the zValue of our particles so that they render behind Lab Cat...
        this.fireParticleSystem.zValue = -0.01;

        /** By default, objects are placed at a depth of 0. If you don't change this, then child objects will render on top of parents, and objects added to the scene later will be rendered on top of objects you added earlier. If you want to change this behavior, you can set the zValue of an object. The depth of an object will be the sum of zValues along the path that leads from its scene graph node to world space. Objects with higher depth values will be rendered on top of objects with lower depth values. Note that any depth value outside the scene's depth range will not be rendered. The depth range is [this.cameraModel.camera.zNear, this.cameraModel.camera.zFar] (defaults to [-5,5] at time of writing in 2024...)
         */

        // Initialize star particle system
        this.starParticleSystem = new BackgroundParticleSystemModel();
        maxNumParticles = 25;
        this.starParticleSystem.initParticles(maxNumParticles)

        particleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        particleMaterial.setUniform("opacityInMatrix", true);
        particleMaterial.setTexture("color", this.getTexture("SmallStar"));
        this.starParticleSystem.setMaterial(particleMaterial)
        this.starParticleSystem.zValue = -0.01;
        this.addChild(this.starParticleSystem);


        // Alternatively, we could have made the particles a child of Lab Cat, which would cause them to move with Lab Cat.
        // this.labCatFloatingHead.addChild(this.particleSystem);
        // this.labCatVectorHead.addChild(this.particleSystem);

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


    /**
     * Our time update function.
     * @param t
     */
    timeUpdate(t: number) {
        try {
            // This is a good strategy in general. It iterates over all of the models in the scene and calls the
            // individual `timeUpdate` functions for each model. If you don't have many interactions between models you
            // can usually implement most of your scene logic this way
            this.mapOverDescendants((d)=>{
                (d as ANodeModel).timeUpdate(t);
            })
        }catch(e) {
            if(nErrors<1){
                console.error(e);
                nErrors+=1;
            }
        }
    }
}
