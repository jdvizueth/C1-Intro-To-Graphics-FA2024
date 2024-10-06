import {
    A2DMeshModelPRSA,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState,
    NodeTransform2D,
    V2,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";

@ASerializable("Player")
export class Player extends A2DMeshModelPRSA {
    static LabCatFloatingHeadMaterial:AShaderMaterial|undefined=undefined;
    static LabCatFloatingHeadTexture:ATexture;

    velocity:Vec2;
    speed:number=0.1;


    constructor(verts?:VertexArray2D, transform?:NodeTransform2D, ...args:any[]) {
        if(Player.LabCatFloatingHeadMaterial === undefined){
            throw new Error("Use Player.CreateLabCatFloatingHead(...) instead of constructor")
        }
        super(verts, transform);
        this.velocity = V2();
    }

    static async PreloadAssets(){
        if(Player.LabCatFloatingHeadMaterial === undefined){
            Player.LabCatFloatingHeadTexture = await ATexture.LoadAsync("./images/Ship1.png");
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
        if(!Player.LabCatFloatingHeadMaterial){
            Player.LabCatFloatingHeadMaterial= GetAppState().CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
            Player.LabCatFloatingHeadMaterial.setTexture("color", this.LabCatFloatingHeadTexture);
        }
        let rval =  new Player(
            VertexArray2D.SquareXYUV(),
            transform,
        );
        rval.setMaterial(Player.LabCatFloatingHeadMaterial);
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
    }

    onMoveRight(){
        this.velocity.x = GameConfigs.PLAYER_MOVESPEED;
    }
    onMoveLeft(){
        this.velocity.x = -GameConfigs.PLAYER_MOVESPEED
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

}
