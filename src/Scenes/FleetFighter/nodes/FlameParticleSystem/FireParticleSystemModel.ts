import {ASerializable, Color, GetAppState, V2, V3, Vec3} from "../../../../anigraph";
import {
    Instanced2DParticleSystemModel
} from "../../../../anigraph/starter/nodes/instancedParticlesSystem/Instanced2DParticleSystemModel";
import {Flame2DParticle} from "./Flame2DParticle";
import {AParticleEnums} from "../../../../anigraph/physics/particles/AParticleEnums";
import {GameConfigs} from "../../FleetFighterGameConfigs";
import {CustomSVGModel} from "../CustomSVGModel";

@ASerializable("FireParticleSystemModel")
export class FireParticleSystemModel extends Instanced2DParticleSystemModel<Flame2DParticle>{
    hiddenParticles: Flame2DParticle[] = [];
    activeParticles: Flame2DParticle[] = [];
    spawnTimerLength: number = .05;
    spawnTimerProgress: number = 0;
    flameGrowth: number = 1;

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

        // Go through hidden list to see what to spawn
        if (this.spawnTimerProgress >= this.spawnTimerLength){
            for (let i=0; i<10; i++){
                if (this.hiddenParticles.length > 0){
                    let particle: Flame2DParticle | undefined = this.hiddenParticles.pop(); // This flame particle const should never be called
                    this.spawnParticle(particle);
                }
            }
            this.spawnTimerProgress = 0;
        }

        // iterate through the visible particles and update properties of each one
        for(let p=0;p<this.nParticles;p++){
            if (this.particles[p].visible){
                let particle = this.particles[p];

                let amplitude = 0.2;
                let frequency = 2;

                particle.position.y -= .004*particle.speed*this.flameGrowth;
                particle.position.x = particle.startPos.x + (amplitude * (Math.sin(frequency * time)));

                let lifePercentage = particle.age / particle.lifeSpan;

                // Update radius to get smaller with age
                particle.radius = particle.iRadius * (1-lifePercentage);

                // Update the color to shift to red with age
                let spinAngle = (-60*(Math.PI/180)) * lifePercentage;
                particle.color = particle.iColor.GetSpun(spinAngle);

                // Kill particle once reached end of lifespan
                if (particle.age >= particle.lifeSpan){
                    this.killParticle(particle);
                }

                // Age the particle
                particle.age += time;
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
            let newp = new Flame2DParticle();

            // set it to be not visible
            newp.visible=false;

            // Add to hidden queue to be spawned later
            this.hiddenParticles.push(newp);

            // add it to the particle system
            this.addParticle(newp);
        }
        this.signalParticlesUpdated();
    }

    spawnParticle(p:Flame2DParticle | undefined){
        if (p !== undefined){
            // Reset position
            p.position = p.startPos;
            let randomPosX = (Math.random()-0.5) * 0.6;
            let startPosition = V2(randomPosX, 0);
            p.startPos = startPosition;

            // Reset radius
            p.radius = p.iRadius;
            p.iRadius = .4;

            // Reset color
            p.color = p.iColor;
            p.iColor = Color.FromRGBuintAfloat(255, 255, 0, .8);

            p.age = 0;
            p.radius = .5;
            this.activeParticles.push(p);
            p.visible = true;
            // this.particles[p].color = Color.Random();
        }

    }

    killParticle(p:Flame2DParticle){
        p.visible = false;
        this.activeParticles.pop();
        this.hiddenParticles.push(p);
    }

    growFlame(){
        this.flameGrowth = GameConfigs.FLAME_GROWTH;
    }

    shrinkFlame(){
        this.flameGrowth = GameConfigs.FLAME_SHRINK;
    }

    stillFlame(){
        this.flameGrowth = GameConfigs.FLAME_NORMAL;
    }

}



