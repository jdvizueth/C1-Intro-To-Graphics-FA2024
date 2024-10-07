import {ASerializable, Color, Mat3, V2} from "../../../../anigraph";
import {
    Instanced2DParticleSystemModel
} from "../../../../anigraph/starter/nodes/instancedParticlesSystem/Instanced2DParticleSystemModel";
import {Background2DParticle} from "./Background2DParticle";
import {AParticleEnums} from "../../../../anigraph/physics/particles/AParticleEnums";
import {Vector3} from "three";
import {GameConfigs} from "../../FleetFighterGameConfigs";

@ASerializable("BackgroundParticleSystemModel")
export class BackgroundParticleSystemModel extends Instanced2DParticleSystemModel<Background2DParticle>{
    hiddenParticles: Background2DParticle[] = [];
    activeParticles: Background2DParticle[] = [];
    spawnTimerLength: number = .05;
    spawnTimerProgress: number = 0;
    yDespawn:number = -11;
    ySpawn:number = 11;
    maxAlpha:number;
    minAlpha:number;
    alphaRate:number;
    starColor:Color;
    starSpeed:number;
    currSpeed:number;
    starRadius:number;

    constructor(color?: Color, speed?: number, radius?:number, minAlpha?:number, maxAlpha?:number, alphaRate?:number) {
        super();
        this.starColor = color??Color.White();
        this.starSpeed = speed??1;
        this.starRadius = radius??1;
        this.minAlpha = minAlpha??0.1;
        this.maxAlpha = maxAlpha??0.5;
        this.alphaRate = alphaRate??0.25;
        this.currSpeed = speed??1;
    }


    /**
     * Particle system model for using instanced particles
     * "Instanced" graphics are ones where the same geometry is rendered many times, possibly with minor variations (e.g., in position and color). Each render of the object is an "instance". This is handled as a special case so that the program can share common data across the different instances, which helps scale up to a larger number of instances more efficiently. This makes it great for something like a particle system, where you have many copies of the same geometry.
     * Note that with instanced graphics, you need to specify the number of instances you plan to use up front so that we can allocate resources on the GPU to store whatever attributes vary between instances. This means that instead of creating new particles and destroying old ones as the application progresses, you will create a fixed budget of particles up front and simply hide any particles you aren't using. Then, when you want to "create" a new particle, you take one of the hidden particles, set its attributed, and un-hide it.
     */


    // These are just keys for some simple app state properties we will control via sliders in this demo.
    static ParticleOrbitKey = "ParticleOrbit"
    static ParticleColorKey = "ParticleColor"

    /**
     * If you plan to simulate things with time steps, you are going to want to keep track of the last clock time when you updated so you can calculate how much time has passed between `timeUpdate(t)` calls
     * @type {number}
     */
    lastUpdateTime:number=0;


    /**
     * timeUpdate
     * This will update the particle system at time t. You may consider splitting this into an `updateParticles` function that iterates through all the particles and updates them individually, and an `emit` function that resets a given particle when some condition is met.
     * We often want to know the current time when a particle is emitted. You may also consider writing a third function called something like `launchParticle` that finds a particle to recycle and explicitly sets a condition that will lead to it being emitted the next time `timeUpdate` is called. This will let you trigger the emission of a particle from a controller interaction (e.g., keyboard or mouse event), which runs asynchronously with your model.
     * @param t
     * @param args
     */
    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args); // Be a good citizen and call the parent function in case something important happens there...

        let time = t - this.lastUpdateTime;

        // let currTransform = this.transform.getMatrix();
        // let rotation = Mat3.Rotation(0.8);
        // this.setTransformMat3(currTransform.times(rotation));

        // iterate through the visible particles and update properties of each one
        for(let p=0;p<this.nParticles;p++){
            if (this.particles[p].visible){
                let particle = this.particles[p];

                particle.position.y -= time*(particle.speed+this.currSpeed);
                // particle.color.a += .1

                // particle.color.a = 0.5;
                this.handleBrightness(particle, time);

                // Update radius to get smaller with age
                // particle.radius = particle.iRadius * (1-lifePercentage);

                // Respawn particle once reached end of y border
                if (particle.position.y <= this.yDespawn){
                    this.spawnParticle(particle);
                }
            }
        }

        // Let's signal that our particle data has changed, which will trigger the view to refresh.
        this.signalParticlesUpdated();

        // Remember to update `this.lastUpdateTime` so that it will be accurate the next time you call this function!
        this.spawnTimerProgress += time;
        this.lastUpdateTime = t;
    }

    /**
     * Initialize the particles
     * If you want to add and remove particles on the fly, you should still initialize nParticles to the maximum you plan to use at any one point. Then you should create and add that many in initParticles, and set the `visible` parameter of any you aren't using right away to false. Then, later, when you want to turn a particle on, you can set `particle.visible=true` and assign its other attributes accordingly.
     * @param nParticles the maximum number of particles you might want to use
     */
    initParticles(nParticles?:number){
        if(nParticles === undefined){nParticles = AParticleEnums.DEFAULT_MAX_N_PARTICLES;}
        for(let i=0;i<nParticles;i++){
            // create one particle
            let spawn = V2(Math.random() * 18 - 9, Math.random() * 20 - 10);
            // Get span of colors
            let color = this.starColor.clone();
            color.a = Math.random() * 0.5;
            let angle = Math.random() * 30;
            let spinAngle = (angle*(Math.PI/180));
            color = color.GetSpun(spinAngle);
            // Randomize speed slightly
            let random = Math.random() * 0.4 - 0.2;
            let speed = random;
            let newp = new Background2DParticle(spawn, this.starRadius, color, speed);

            // set it to be visible
            newp.visible=true;

            // add it to the particle system
            this.addParticle(newp);
        }
        this.signalParticlesUpdated();
    }

    spawnParticle(p:Background2DParticle | undefined){
        if (p !== undefined){
            // Reset position
            let randomPosX = Math.random() * 18 - 9;
            p.position = V2(randomPosX, 11);
        }

    }
    handleBrightness(p:Background2DParticle | undefined, dt:number){
        if (p !== undefined){
            // Update alpha value
            // p.color.a += .1;
            if (p.isBrightening){
                p.color.a += this.alphaRate*dt;
            }
            else{
                p.color.a -= this.alphaRate*dt;
            }
            // Check if passed max or min alpha
            if (p.color.a >= this.maxAlpha){
                p.isBrightening = false;
            }
            if (p.color.a <= this.minAlpha){
                p.isBrightening = true;
            }
        }
    }

    increaseSpeed(){
        // this.starSpeed += GameConfigs.PLAYER_MOVESPEED;
        this.currSpeed = this.currSpeed*1.8;
    }
    revertSpeed(){
        // this.starSpeed -= GameConfigs.PLAYER_MOVESPEED;
        this.currSpeed = this.starSpeed;
    }
    decreaseSpeed(){
        // this.starSpeed -= GameConfigs.PLAYER_MOVESPEED;
        this.currSpeed = this.currSpeed*0.9;
    }

}



