import {
    A2DMeshModelPRSA, AMaterialManager,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState,
    NodeTransform2D,
    V2, V3,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {SmokeParticleSystemModel} from "../FlameParticleSystem/SmokeParticleSystemModel";
import {Collision, collisionType} from "../Collision";

@ASerializable("Player")
export class Player extends A2DMeshModelPRSA {
    static PlayerMaterial:AShaderMaterial|undefined=undefined;
    static PlayerTexture:ATexture;
    static PlayerTexture2:ATexture;

    velocity:Vec2;
    speed:number=0.1;
    smokeParticleSystem!:SmokeParticleSystemModel;
    windDirection:number = 1;
    collisionCircle: Collision | null = null;

    health:number = 2;
    iFrameMax:number = 1;
    iFrameTimer:number = 0;
    incrementIFrame = false;
    prevTime:number = 0;
    onHurtTexture = false;

    constructor(verts?:VertexArray2D, transform?:NodeTransform2D, ...args:any[]) {
        if(Player.PlayerMaterial === undefined){
            throw new Error("Use Player.CreateLabCatFloatingHead(...) instead of constructor")
        }
        super(verts, transform);
        this.velocity = V2();
    }

    static async PreloadAssets(){
        if(Player.PlayerMaterial === undefined){
            Player.PlayerTexture = await ATexture.LoadAsync("./images/Ship1.png");
            Player.PlayerTexture2 = await ATexture.LoadAsync("./images/Ship1Red.png");
        }
    }


    /**
     * Here since all instances will use the same texture, we save it as a class attribute.
     * This function will be used instead of the constructor to create instances of this class.
     * @param transform
     * @param scale
     * @returns {Promise<Player>}
     * @constructor
     */
    static Create(transform?:NodeTransform2D, scale:number=1){
        transform = transform??NodeTransform2D.Identity();
        if(!Player.PlayerMaterial){
            Player.PlayerMaterial= GetAppState().CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
            Player.PlayerMaterial.setTexture("color", this.PlayerTexture);
        }
        let rval =  new Player(
            VertexArray2D.SquareXYUV(),
            transform,
        );
        rval.setMaterial(Player.PlayerMaterial);

        return rval;
    }


    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
        let dt = t - this.prevTime;
        // Increment the IFrames if necessary
        if (this.incrementIFrame){
            this.iFrameTimer += dt;
            if (this.iFrameTimer >= this.iFrameMax){
                this.incrementIFrame = false;
                this.iFrameTimer = 0;
                if(Player.PlayerMaterial) {
                    Player.PlayerMaterial.setTexture("color", Player.PlayerTexture);
                }
            }
        }
        // this.transform.scale = appState.getState("LabCatScale");
        this.transform.position = this.transform.position.plus(this.velocity);
        if (this.velocity.x == 0){
            this.smokeParticleSystem.setIsStill(true);
        }
        this.prevTime = t;
    }

    onMoveRight(){
        this.velocity.x = GameConfigs.PLAYER_MOVESPEED;
        this.smokeParticleSystem.setSwayRight(false);
    }
    onMoveLeft(){
        this.velocity.x = -GameConfigs.PLAYER_MOVESPEED
        this.smokeParticleSystem.setSwayRight(true);
    }
    onMoveUp(){
        this.velocity.y = GameConfigs.PLAYER_MOVESPEED;
    }
    onMoveDown(){
        this.velocity.y = -GameConfigs.PLAYER_MOVESPEED;
    }
    onHaltHorizontal(){
        this.velocity.x = 0;
    }
    onHaltVertical(){
        this.velocity.y = 0;
    }

    makeParticleSystemChild(particleSystem:any){
        if (particleSystem instanceof SmokeParticleSystemModel){
            this.smokeParticleSystem = particleSystem;
            this.smokeParticleSystem.setVisible = false;
        }
        let targetTransform = particleSystem.getWorldTransform();
        let playerTransform = this.getWorldTransform();
        let newTransform = playerTransform.getInverse().times(targetTransform);
        this.addChild(particleSystem);
        particleSystem.setTransform(newTransform);
    }

    gotHit(): void {
        if (!this.incrementIFrame){
            if(Player.PlayerMaterial) {
                Player.PlayerMaterial.setTexture("color", Player.PlayerTexture2);
            }
            this.health -= 1;
            this.incrementIFrame = true;
            console.log(this.health);
            if (this.health <= 1){
                this.smokeParticleSystem.setVisible = true;
            }
        }

    }

}
