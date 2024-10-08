import { App2DSceneModel } from "anigraph/starter/App2D/App2DSceneModel";
import {FireParticleSystemModel} from "./nodes";
import {Player} from "./nodes/Player/Player";
import {Meteoroid} from "./nodes/Meteoroid/Meteoroid";
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
import {SmokeParticleSystemModel} from "./nodes/FlameParticleSystem/SmokeParticleSystemModel";


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
        this.player = Player.Create();
        // The geometry itself is a unit square that ranges from -0.5 to 0.5 in x and y. Let's scale it up x2.5.
        this.player.transform.scale = 2.5;
        this.addChild(this.player);

        // Create meteoroids

        this.meteoroids.push(Meteoroid.Create());
        // this.addChild(this.meteoroids[0]);
        this.meteoroids[0].transform.scale = 3.5;


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


        /** By default, objects are placed at a depth of 0. If you don't change this, then child objects will render on top of parents, and objects added to the scene later will be rendered on top of objects you added earlier. If you want to change this behavior, you can set the zValue of an object. The depth of an object will be the sum of zValues along the path that leads from its scene graph node to world space. Objects with higher depth values will be rendered on top of objects with lower depth values. Note that any depth value outside the scene's depth range will not be rendered. The depth range is [this.cameraModel.camera.zNear, this.cameraModel.camera.zFar] (defaults to [-5,5] at time of writing in 2024...)
         */

        // Initialize star particle systems

        // Medium-sized stars
        let colorM = Color.Red().GetSpun(Math.PI);
        this.starParticleSystem = new BackgroundParticleSystemModel(colorM, 4, 1.5, 0.1, 0.4, 0.25);
        maxNumParticles = 25;
        this.starParticleSystem.initParticles(maxNumParticles)

        let smallStarParticleMaterial = appState.CreateShaderMaterial(DefaultMaterials.PARTICLE_TEXTURE_2D_SHADER);
        smallStarParticleMaterial.setUniform("opacityInMatrix", true);
        smallStarParticleMaterial.setTexture("color", this.getTexture("SmallStar"));
        this.starParticleSystem.setMaterial(smallStarParticleMaterial)
        this.starParticleSystem.zValue = -0.01;
        this.addChild(this.starParticleSystem);

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
