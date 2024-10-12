import {
    A2DMeshModelPRSA,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState, Mat3,
    NodeTransform2D,
    V2, V3,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {Collision} from "../Collision";
import {SmokeParticleSystemModel} from "../FlameParticleSystem/SmokeParticleSystemModel";
import {FleetFighterSceneModel} from "../../FleetFighterSceneModel";

@ASerializable("Asteroid")
export class Asteroid extends A2DMeshModelPRSA {
    static asteroidMaterial:AShaderMaterial|undefined=undefined;
    static asteroidTexture:ATexture;

    velocity:Vec2 = V2(0,-1);
    speed:number=4;
    baseSpeed:number = 2;
    rotationSpeed = 0.1;

    collisionCircle: Collision | null = null;
    shouldDespawn: boolean = true;
    prevTime:number = 0;
    isChild:boolean = false;
    shotBack:boolean = false;

    hasUnclumped:boolean = false;


    constructor(verts?:VertexArray2D, transform?:NodeTransform2D, ...args:any[]) {
        if(Asteroid.asteroidMaterial === undefined){
            throw new Error("Use asteroid.CreateLabCatFloatingHead(...) instead of constructor")
        }
        super(verts, transform);
        this.velocity = V2();
    }

    static async PreloadAssets(){
        if(Asteroid.asteroidMaterial === undefined){
            Asteroid.asteroidTexture = await ATexture.LoadAsync("./images/SmMeteroid.png");
        }
    }


    /**
     * Here since all instances will use the same texture, we save it as a class attribute.
     * This function will be used instead of the constructor to create instances of this class.
     * @param transform
     * @param scale
     * @returns {Promise<asteroid>}
     * @constructor
     */
    static Create(transform?:NodeTransform2D, scale:number=1){
        transform = transform??NodeTransform2D.Identity();
        // this.PreloadAssets();
        if(!Asteroid.asteroidMaterial){
            Asteroid.asteroidMaterial= GetAppState().CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
            Asteroid.asteroidMaterial.setTexture("color", this.asteroidTexture);
        }
        let rval =  new Asteroid(
            VertexArray2D.SquareXYUV(),
            transform,
        );
        rval.setMaterial(Asteroid.asteroidMaterial);
        return rval;
    }


    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
        // let appState = GetAppState();
        // appState.setState("LabCatScale", 5+Math.sin(t));

        // Update the react component that displays this value
        // appState.updateComponents()

        // this.transform.scale = appState.getState("LabCatScale");
        // this.transform.position = this.transform.position.plus(this.velocity);
        let dt = t - this.prevTime;
        if (!this.shouldDespawn && !this.isChild){
            // Change rotation
            let currTransform = this.transform.getMatrix();
            let rotation = Mat3.Rotation((-10*(Math.PI/180))*this.rotationSpeed);
            let newTransform = currTransform.times(rotation);
            this.setTransformMat3(newTransform);
            // Change position
            let posX = this.transform.getPosition().x;
            let posY = this.transform.getPosition().y + (this.velocity.y*dt);
            let newPos = V3(posX, posY, 0);
            this.transform.setPosition(newPos);
        }
        this.prevTime = t;
    }

    gotHit(): void {
        console.log("GotHit");
    }

    shootBack(){
        if (!this.shotBack){
            this.velocity.y *= -1;
            this.shotBack = true;
        }
    }

    spawn(){
        this.shouldDespawn = false;
        let yPos = 11;
        let randomPosX = Math.random() * 18 - 9;
        this.transform.setPosition(V3(randomPosX, yPos, 0));
        // this.speed = (Math.random() + 3) + this.baseSpeed;
        this.velocity.y = -1 * (Math.random() + 3) + this.baseSpeed;
        this.hasUnclumped = false;
        this.shotBack = false;

    }

    checkDespawn() {
        if ((this.transform.getPosition().y <= -11 || this.transform.getPosition().y >= 14) && !this.isChild) {
            this.shouldDespawn = true;
        }
    }

    unClump(scene:FleetFighterSceneModel, transformMatrix?:Mat3){
        let parentToWorld: Mat3;
        if (transformMatrix) {
            // parentToWorld = this.transform.getMatrix().times(transformMatrix);
            parentToWorld = transformMatrix.times(this.transform.getMatrix());
        }
        else {
            parentToWorld = this.transform.getMatrix();
        }
        // this.reparent(scene);
        this.parent?.removeChild(this);
        scene.addChild(this);
        this.setTransformMat3(parentToWorld);

        this.isChild = false;
        this.hasUnclumped = true;
        for (let i = 0; i < this.children.length; i++){
            let child = this.children[i];
            if (child instanceof Asteroid){
                child.unClump(scene, parentToWorld);
            }

        }
    }
}
