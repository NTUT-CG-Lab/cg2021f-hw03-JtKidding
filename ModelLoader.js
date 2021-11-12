// import * as FS from src="https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.js"
import * as THREE from './build/three.module.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import { GUI } from './jsm/libs/dat.gui.module.js';
import { MMDLoader } from './jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './jsm/animation/MMDAnimationHelper.js';
import { Eye } from './Eye.js';

const modelFiles = ['models/mmd/kizunaai/kizunaai.pmx', 
                    'models/mmd/『天宮こころ(Kokoro Amamiya)』/『天宮こころ(Kokoro Amamiya)』.pmx', 
                    'models/mmd/るいのれ式物述有栖_配布用フォルダ/物述有栖.pmx'
];

const vpdFiles = [
    'models/mmd/vpds/01.vpd',
    'models/mmd/vpds/02.vpd',
    'models/mmd/vpds/03.vpd',
    'models/mmd/vpds/04.vpd',
    'models/mmd/vpds/05.vpd',
    'models/mmd/vpds/06.vpd',
    'models/mmd/vpds/07.vpd',
    'models/mmd/vpds/08.vpd',
    //'models/mmd/vpds/09.vpd',
    //'models/mmd/vpds/10.vpd',
    'models/mmd/vpds/11.vpd'
];

export class ModelLoader {

    constructor(scene, currentScene, mouse, plane, json) {

        this.helper = new MMDAnimationHelper();
		this.loader = new MMDLoader();
        this.vpds = [];

        this.mesh;
        this.meshes = [];
        this.scene = scene;
        this.currentScene = currentScene;
        this.currentMesh = {index:0};
        this.eye = new Eye(scene, currentScene, mouse, plane, json, this.currentMesh);
        this.vpdIndex = 0;
        this.model_data = [];
        this.isModelLoad = false;
        this.isMoveEye = false;
        this.clone = new Array(4);

    }

    isModelLoaded() {
        return this.isModelLoad;
    }

    changeMMDModel(index){

        this.clearClone();
        
        this.eye.resetLine();

        this.currentMesh.index += index;

        if (this.currentMesh.index == -1)
            this.currentMesh.index = this.meshes.length - 1;

        this.currentMesh.index %= this.meshes.length;
        this.mesh = this.meshes[this.currentMesh.index];

    }

    onProgress(xhr) {

        if (xhr.lengthComputable) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');

        }

    }

    loadModel(windowResize) {
        for ( let i = 0; i < modelFiles.length; i++ ) {

            this.model_data.push({'model_name':modelFiles[i]});
            let model = modelFiles[i];
            // console.log(model);
            var scope = this;
            this.loader.load(model, function (object) {
                let temp;
                temp = object;
                temp.position.y = -10;
                temp.name = 'mmdModel';
                scope.meshes.push(temp);
                // console.log('model', scope.mesh);
                // console.log('SkeletonUtils', scope.mesh.SkeletonUtils());
                
                // scope.scene.add(scope.mesh);
                if (i == 0) {
                    scope.mesh = object;
                    // scope.scene.add(scope.mesh);
                }
                scope.isModelLoad = true;
                windowResize();
            }, this.onProgress, null);

        }

    }

    loadVpd() {
        
        const vpdFile = vpdFiles[this.vpdIndex];

        var scope = this;
        this.loader.loadVPD(vpdFile, false, function (vpd) {

            scope.vpds.push(vpd);
            console.log(vpd);
            scope.vpdIndex++;

            if (scope.vpdIndex < vpdFiles.length) {

                scope.loadVpd();

            } else {

                scope.initGui();

            }

        }, this.onProgress, null);

    }
    clearClone() {

        this.scene[0].remove( this.scene[0].getObjectByName('clone1') );
        this.scene[1].remove( this.scene[1].getObjectByName('clone2') );
        this.scene[2].remove( this.scene[2].getObjectByName('clone3') );
        this.scene[3].remove( this.scene[3].getObjectByName('clone4') );
        // this.clone = new Array(4);
        this.clone[0] = null;
        this.clone[1] = null;
        this.clone[2] = null;
        this.clone[3] = null;
    }

    addClone() {

        if (this.isModelLoad) {

            for (let i = 0; i < 4; i++) {
                if (this.clone[i] == null) {
                    
                    this.clone[i] = SkeletonUtils.clone( this.mesh );
                    this.clone[i].name = 'clone' + (i+1);
                    this.scene[i].add(this.clone[i]);
                    console.log('clonnnnnnnnne', this.clone[i].name);
                }
            }

        } 

    }

    findBone(obj, name) {

        
        let child = [];

        if ('name' in obj && obj.name == name) {

            return obj;

        } else {
            
            if ('children' in obj) {
                
                for (let i = 0; i < obj.children.length; i++) {
                    
                    child.push(this.findBone(obj.children[i], name));

                }
            } else {

                return null;
                
            }
            
            for (let j = 0; j < child.length; j++) {

                if (child[j] != null) {
                    if (child[j].name == name) {
                        
                        return child[j];

                    }
                }
            }

        }

        return null;

    }

    delete3DOBJ(obj){
			
        let selectedObject = this.scene[Math.floor(this.currentScene.index / 2)].getObjectByName(obj);
        console.log(selectedObject);
        this.scene[Math.floor(this.currentScene.index / 2)].remove( selectedObject );

    }

    getOtherRotation(otherScene) {
        let location = ["RXNA", "LXNA", "RXPA", "LXPA", "RYNA", "LYNA", "RYPA", "LYPA"];
        
        return this.model_data[this.currentMesh.index][location[otherScene]];
    }

    setOtherRotation(rotation) {

        switch(this.currentScene.index) {
            case 0:
                this.model_data[this.currentMesh.index]['RXNA'] = THREE.MathUtils.radToDeg(rotation.x);
                this.model_data[this.currentMesh.index]['LXNA'] = THREE.MathUtils.radToDeg(rotation.x);
                break;
            case 2:
                this.model_data[this.currentMesh.index]['RXPA'] = THREE.MathUtils.radToDeg(rotation.x);
                this.model_data[this.currentMesh.index]['LXPA'] = THREE.MathUtils.radToDeg(rotation.x);
                break;
            case 4:
                this.model_data[this.currentMesh.index]['RYNA'] = THREE.MathUtils.radToDeg(rotation.y);
                this.model_data[this.currentMesh.index]['LYPA'] = -THREE.MathUtils.radToDeg(rotation.y);
                break;
            case 6:
                this.model_data[this.currentMesh.index]['RYPA'] = THREE.MathUtils.radToDeg(rotation.y);
                this.model_data[this.currentMesh.index]['LYNA'] = -THREE.MathUtils.radToDeg(rotation.y);
                break;
            default:
                break;
        }

    }

    getCurrentMesh() {
        return this.currentMesh.index;
    }

    getCurrentOffset() {

        switch(this.currentMesh.index) {
            case 0:
                return new THREE.Vector3(0.5, 8.2, 0);
            case 1:
                return new THREE.Vector3(0.6, 5.5, 0);
            case 2:
                return new THREE.Vector3(0.6, 4.5, 0);
        }

    }

    getEye() {
        console.log('model currentScene:', this.currentScene.index);
        return this.eye;

    }

    getClone() {
        return this.clone;
    }

    saveJson() {
                
        var content = JSON.stringify(this.model_data, null, 4);
        var blob = new Blob([content], {type: "text/plain"});
        var filename = 'model_data.json'; 
        var a = document.createElement('a'); 
        var url = URL.createObjectURL(blob); 
        a.href = url; 
        a.download = filename; 
        a.click(); 

    }

    initGui() {

        const gui = new GUI();

        const dictionary = this.mesh.morphTargetDictionary;

        const controls = {};
        const keys = [];

        const poses = gui.addFolder('Poses');
        const morphs = gui.addFolder('Morphs');

        function getBaseName(s) {

            return s.slice(s.lastIndexOf('/') + 1);

        }

        function initControls(scope) {

            for (const key in dictionary) {

                controls[key] = 0.0;

            }

            controls.pose = - 1;

            for (let i = 0; i < vpdFiles.length; i++) {

                controls[getBaseName(vpdFiles[i])] = false;

            }

        }

        function initKeys() {

            for (const key in dictionary) {

                keys.push(key);

            }

        }

        function initPoses(scope) {

            const files = { default: - 1 };

            for (let i = 0; i < vpdFiles.length; i++) {
                console.log(vpdFiles[i]);
                files[getBaseName(vpdFiles[i])] = i;

            }
            
            poses.add(controls, 'pose', files).onChange(() => onChangePose(scope));
            console.log(poses);
        }

        function initMorphs(scope) {

            for (const key in dictionary) {
                
                morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(() => onChangeMorph(scope));

            }

        }

        function onChangeMorph(scope) {
            
            for (let i = 0; i < keys.length; i++) {

                const key = keys[i];
                const value = controls[key];
                scope.mesh.morphTargetInfluences[i] = value;

            }

        }

        function onChangePose(scope) {
            console.log(scope);
            const index = parseInt(controls.pose);

            if (index === - 1) {

                scope.mesh.pose();
                
            } else {

                scope.helper.pose(scope.mesh, scope.vpds[index]);
                console.log(scope.mesh);
            }

        }

        initControls(this);
        initKeys();
        initPoses(this);
        initMorphs(this);

        onChangeMorph(this);
        onChangePose(this);

        poses.open();
        morphs.open();

    }
}