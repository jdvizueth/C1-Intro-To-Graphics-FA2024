import {App2DSceneController} from "../../anigraph/starter/App2D/App2DSceneController";
import {FleetFighterSceneModel} from "./FleetFighterSceneModel";
import {Polygon2DModel, Polygon2DView} from "../../anigraph/starter/nodes/polygon2D";
import {FireParticleSystemModel, ParticleSystemView} from "./nodes";
import {Player} from "./nodes/Player/Player";
import {Bullet} from "./nodes/Bullet/Bullet";
import {Asteroid} from "./nodes/Asteroid/Asteroid";
import {
    A2DMeshView,
    ADragInteraction, AGLContext,
    AInteractionEvent,
    AKeyboardInteraction,
    ANodeModel,
    ANodeView, AObject, ASVGView, AView, Mat3, NodeTransform2D, NodeTransform3D, V3, Vec2
} from "../../anigraph";
import {CustomSVGModel} from "./nodes/CustomSVGModel";
import {MyCustomModel, MyCustomView} from "../MainScene/nodes";
import {BackgroundParticleSystemModel} from "./nodes/BackgroundParticleSystem";
import {Meteoroid} from "./nodes/Meteoroid/Meteoroid";
import {SmokeParticleSystemModel} from "./nodes/FlameParticleSystem/SmokeParticleSystemModel";
import {TexturedPolygon2DView} from "../../anigraph/starter/nodes/textured";
import {BulletView} from "./nodes/Bullet/BulletView";
import {CollisionView} from "./nodes/CollisionView";
import {Collision} from "./nodes/Collision";
export class FleetFighterSceneController extends App2DSceneController{
    prevKeyW: boolean = false;
    prevKeyS: boolean = false;

    get model():FleetFighterSceneModel{
        return this._model as FleetFighterSceneModel;
    }


    async initScene() {
        super.initScene();

        // You can set the clear color for the rendering context
        // this.setClearColor(new Color(1.0,1.0, 1.0));
        // this.setClearColor(new Color(0.0,0.0, 0.0));

        // We can also set a background texture.
        // It is important to use "await" when loading a texture here if you plan to use it right away. This is because
        // loading happens asynchronously, so if you don't add "await" you may try to reference the texture before it
        // has finished loading, which is cause an error.
        await this.model.loadTexture(`./images/black.png`, "Space");// Load the texture with the scene model
        this.view.setBackgroundTexture(this.model.getTexture("Space"));// Set the texture as your background


    }

    /**
     * Specifies what view classes to use for different model class.
     */
    initModelViewSpecs() {
        this.addModelViewSpec(Polygon2DModel, Polygon2DView);
        this.addModelViewSpec(FireParticleSystemModel, ParticleSystemView);
        this.addModelViewSpec(SmokeParticleSystemModel, ParticleSystemView);
        this.addModelViewSpec(BackgroundParticleSystemModel, ParticleSystemView);
        this.addModelViewSpec(Player, A2DMeshView);
        this.addModelViewSpec(Meteoroid, A2DMeshView);
        this.addModelViewSpec(CustomSVGModel, ASVGView);
        this.addModelViewSpec(Bullet, TexturedPolygon2DView);
        this.addModelViewSpec(Asteroid, Polygon2DView);
        // this.addModelViewSpec(CollisionModel, CollisionView);
        this.addModelViewSpec(Collision, CollisionView)
    }

    /**
     * This will create any view specified by an addModelViewSpec call by default.
     * Only use this function if you want to do something custom / unusual that can't be contelled with a spec.
     * @param {ANodeModel} nodeModel
     * @returns {ANodeView}
     */
    createViewForNodeModel(nodeModel: ANodeModel): ANodeView {
        if(false){
            console.log("This is where you might do something very custom")
        }else{
            // The super function will just create a view based on what you specified in `initModelViewSpecs`
            return super.createViewForNodeModel(nodeModel);
        }

    }

    initInteractions() {
        super.initInteractions();
        const self = this;

        /**
         * Here we will create an interaction mode, which defines one set of controls
         * At any point, there is an active interaction mode.
         */
        this.createNewInteractionMode(
            "Main",
            {
                onKeyDown: (event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    console.log(event.key)
                    /**
                     * Respond to key down events
                     */

                    /**
                     * This is how you handle arrow keys
                     */

                    let keysDownState = self.getKeysDownState();
                    if (keysDownState['d']) {
                        this.model.player.onMoveRight();
                    }
                    if (keysDownState['a']) {
                        this.model.player.onMoveLeft();
                    }
                    if (keysDownState['w']) {
                        this.model.player.onMoveUp();
                        this.model.fireParticleSystem.growFlame();
                        if (!this.prevKeyW){
                            this.model.starParticleSystem.increaseSpeed();
                            this.model.star2ParticleSystem.increaseSpeed();
                            this.model.star3ParticleSystem.increaseSpeed();
                        }
                        if (!this.prevKeyW){
                            this.prevKeyW = true;
                        }
                    }
                    if (keysDownState['s']) {
                        this.model.player.onMoveDown();
                        this.model.fireParticleSystem.shrinkFlame();
                        if (!this.prevKeyS){
                            this.model.starParticleSystem.decreaseSpeed();
                            this.model.star2ParticleSystem.decreaseSpeed();
                            this.model.star3ParticleSystem.decreaseSpeed();
                        }
                        if (!this.prevKeyS){
                            this.prevKeyS = true;
                        }
                    }
                    if (keysDownState[' ']) {
                        console.log("clicked spacebar");
                        event.preventDefault();
                        let currBullet = this.model.bullets.pop();
                        if (currBullet) {
                                this.model.addChild(currBullet);
                                // currBullet.setPosition(this.model.player.transform.position);
                                currBullet.transform.setPosition(this.model.player.transform.getPosition());
                                currBullet.onMoveUp();
                                this.model.bulletsUsed.push(currBullet);
                        }
                    }
                    if(event.key == "C"){
                    }
                },

                onKeyUp:(event:AInteractionEvent, interaction:AKeyboardInteraction)=>{
                    /**
                     * Respond to key up events
                     */
                    let keysDownState = self.getKeysDownState();
                    if (!keysDownState['d'] && !keysDownState['a']) {
                        this.model.player.onHaltHorizontal();
                    }
                    if (!keysDownState['w']){
                        if (this.prevKeyW){
                            this.model.starParticleSystem.revertSpeed();
                            this.model.star2ParticleSystem.revertSpeed();
                            this.model.star3ParticleSystem.revertSpeed();
                        }
                        this.prevKeyW = false;
                    }
                    if (!keysDownState['s']){
                        if (this.prevKeyS){
                            this.model.starParticleSystem.revertSpeed();
                            this.model.star2ParticleSystem.revertSpeed();
                            this.model.star3ParticleSystem.revertSpeed();
                        }
                        this.prevKeyS = false;
                    }
                    if (!keysDownState['w'] && !keysDownState['s']) {
                        this.model.player.onHaltVertical();
                        this.model.fireParticleSystem.stillFlame();
                    }
                },
                onDragStart:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    interaction.cursorStartPosition = this.getWorldCoordinatesOfCursorEvent(event);
                },
                onDragMove:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                    let cursorPosition = this.getWorldCoordinatesOfCursorEvent(event) as Vec2;
                    let cursorStartPosition = interaction.cursorStartPosition;
                    let cursorVector = cursorPosition.minus(cursorStartPosition);
                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if(event.shiftKey){
                        }
                        if (keysDownState['x']) {
                        } else if (keysDownState['y']) {
                        } else {
                        }
                    }
                },
                onDragEnd:(event:AInteractionEvent, interaction:ADragInteraction)=>{
                },
                onClick:(event:AInteractionEvent)=>{
                    this.eventTarget.focus();
                    let cursorPosition = this.getWorldCoordinatesOfCursorEvent(event) as Vec2;
                    // this.model.labCatVectorHead.setTransform(Mat3.Translation2D(cursorPosition));

                    let keysDownState = self.getKeysDownState();
                    if(cursorPosition) {
                        if (keysDownState['x']) {
                            console.log(`Click with "x" key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        } else {
                            console.log(`Click at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                        if(event.shiftKey){
                            console.log(`Click with shift key at ${cursorPosition.elements[0], cursorPosition.elements[1]}`)
                        }
                    }
                    this.model.signalComponentUpdate();
                },
            }
        )
        this.setCurrentInteractionMode("Main");
    }

    onAnimationFrameCallback(context:AGLContext) {
        // call the model's time update function
        this.model.timeUpdate(this.model.clock.time)

        // render the scene view
        super.onAnimationFrameCallback(context);
    }



}
