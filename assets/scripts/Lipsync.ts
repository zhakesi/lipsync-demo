
import { _decorator, Component, systemEvent, SystemEvent, CCFloat } from 'cc';
import { MeshRenderer, AudioSource, AudioPlayer} from 'cc';
const { ccclass, property } = _decorator;

var SAMPLE_RATE = 48000;
var FRAME_RATE = 30;

@ccclass('Lipsync')
export class Lipsync extends Component {
    declare private _morph: import("cc").__private.cocos_3d_assets_morph_Morph;
    
    @property({type: MeshRenderer})
    public mMouthRender: MeshRenderer = null!;

    @property({type: AudioSource})
    mAudio:AudioSource = null!;

    private mPlayer: AudioPlayer | null = null;
    private mWeightOpen : number = 0;
    private mWeightPress : number = 0;
    private mWeightKiss : number = 0;

    @property({type:CCFloat, range:[0, 1, 0.1], slide: true})
    set weightOpen (val: number) {
        this.mWeightOpen = val;
        this.updateMorphWeights();
    }

    get weightOpen () {
        return this.mWeightOpen;
    }

    @property({type:CCFloat, range:[0, 1, 0.1], slide: true})
    set weightPress (val: number) {
        this.mWeightPress = val;
        this.updateMorphWeights();
    }

    get weightPress () {
        return this.mWeightPress;
    }

    @property({type:CCFloat, range:[0, 1, 0.1], slide: true})
    set weightKiss (val: number) {
        this.mWeightKiss = val;
        this.updateMorphWeights();
    }

    get weightKiss () {
        return this.mWeightKiss;
    }

    start () {
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.InitAudioBuffer, this);
        //systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.InitAudioBuffer, this);
        if (!this.mAudio) {
            return;
        }
        this.mAudio.pause();
    }

    update (deltaTime: number) {
        if (!this.mPlayer) {
            return;
        }
        if (this.mPlayer.state == 1) {
            var weights = this.mPlayer.getLipData();
            this.mWeightKiss = weights[0];
            this.mWeightPress =  weights[1];
            this.mWeightOpen = weights[2];
        } else {
            this.mWeightKiss = 0;
            this.mWeightPress =  0;
            this.mWeightOpen = 0;
        }
        this.updateMorphWeights();
    }

    updateMorphWeights() {
        if (!this.mMouthRender) {
            return;
        }
        const mesh = this.mMouthRender.mesh;
        if (!mesh) {
            return;
        }

        this._morph = mesh.struct.morph!;
        if (!this._morph) {
            console.warn('the mesh not have any morph data');
            return;
        }

        if (this._morph.subMeshMorphs.length === 0) {
            console.warn('submesh count is 0');
            return;
        }
        let weights = [this.mWeightKiss, this.mWeightPress,  this.weightOpen];

        for (let iSubMeshMorph = 0; iSubMeshMorph < this._morph.subMeshMorphs.length; ++iSubMeshMorph) {
            if (this._morph.subMeshMorphs[iSubMeshMorph]) {
                this.mMouthRender!.setWeights(weights, iSubMeshMorph);
            }
        }
        //console.info("weights:%.2f, %.2f, %.2f", _open, _press, _kiss);
    }

    private InitAudioBuffer() {
        this.mPlayer = this.mAudio.getPlayer ();
        if (this.mPlayer.state == 1) {
            return;
        }
        if (this.mPlayer) {
            console.info("get player");
        } else {
            console.info("player is null!!!");
        }

        this.mAudio.play();
    }
}
