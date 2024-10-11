import {
    A2DMeshModelPRSA,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState,
    NodeTransform2D,
    V2, V3,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {SmokeParticleSystemModel} from "../FlameParticleSystem/SmokeParticleSystemModel";

@ASerializable("Player")
export class Player extends A2DMeshModelPRSA {
    static PlayerMaterial:AShaderMaterial|undefined=undefined;
    static PlayerTexture:ATexture;

    velocity:Vec2;
    speed:number=0.1;
    smokeParticleSystem!:SmokeParticleSystemModel;
    windDirection:number = 1;


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
        // let appState = GetAppState();
        // appState.setState("LabCatScale", 5+Math.sin(t));

        // Update the react component that displays this value
        // appState.updateComponents()

        // this.transform.scale = appState.getState("LabCatScale");
        this.transform.position = this.transform.position.plus(this.velocity);
        if (this.velocity.x == 0){
            this.smokeParticleSystem.setIsStill(true);
        }
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
        }
        let targetTransform = particleSystem.getWorldTransform();
        let playerTransform = this.getWorldTransform();
        let newTransform = playerTransform.getInverse().times(targetTransform);
        this.addChild(particleSystem);
        particleSystem.setTransform(newTransform);
    }

}