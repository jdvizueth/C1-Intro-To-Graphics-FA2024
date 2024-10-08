import {
    A2DMeshModelPRSA,
    ASerializable,
    AShaderMaterial, ATexture, DefaultMaterials, GetAppState, Mat3,
    NodeTransform2D,
    V2,
    Vec2,
    VertexArray2D
} from "../../../../anigraph";
import {GameConfigs} from "../../FleetFighterGameConfigs";

@ASerializable("Meteoroid")
export class Meteoroid extends A2DMeshModelPRSA {
    static meteoroidMaterial:AShaderMaterial|undefined=undefined;
    static meteoroidTexture:ATexture;

    velocity:Vec2;
    speed:number=0.1;
    rotationSpeed = 0.1;


    constructor(verts?:VertexArray2D, transform?:NodeTransform2D, ...args:any[]) {
        if(Meteoroid.meteoroidMaterial === undefined){
            throw new Error("Use Meteoroid.CreateLabCatFloatingHead(...) instead of constructor")
        }
        super(verts, transform);
        this.velocity = V2();
    }

    static async PreloadAssets(){
        if(Meteoroid.meteoroidMaterial === undefined){
            Meteoroid.meteoroidTexture = await ATexture.LoadAsync("./images/SmMeteroid.png");
        }
    }


    /**
     * Here since all instances will use the same texture, we save it as a class attribute.
     * This function will be used instead of the constructor to create instances of this class.
     * @param transform
     * @param scale
     * @returns {Promise<Meteoroid>}
     * @constructor
     */
    static Create(transform?:NodeTransform2D, scale:number=1){
        transform = transform??NodeTransform2D.Identity();
        // this.PreloadAssets();
        if(!Meteoroid.meteoroidMaterial){
            Meteoroid.meteoroidMaterial= GetAppState().CreateShaderMaterial(DefaultMaterials.TEXTURED2D_SHADER);
            Meteoroid.meteoroidMaterial.setTexture("color", this.meteoroidTexture);
        }
        let rval =  new Meteoroid(
            VertexArray2D.SquareXYUV(),
            transform,
        );
        rval.setMaterial(Meteoroid.meteoroidMaterial);
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

        let currTransform = this.transform.getMatrix();
        let rotation = Mat3.Rotation((-10*(Math.PI/180))*this.rotationSpeed);
        let newTransform = currTransform.times(rotation);
        this.setTransformMat3(newTransform);
    }

}
