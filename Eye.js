
import * as THREE from './build/three.module.js';

const materialRed = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
const materialGreen = new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 1 } );
const materialPurple = new THREE.LineBasicMaterial( { color: 0x3A006F, linewidth: 1 } );
const materialBlue = new THREE.LineBasicMaterial( { color: 0x66B3FF, linewidth: 1 } );

export class Eye { 

    constructor(scene, currentScene, mouse, plane, json, currentMesh) {

        this.currentScene = currentScene;
        this.currentMesh = currentMesh;
        this.scene = scene;
        this.plane = plane;
        this.position = null;
        this.mouse = mouse;
        this.leftLine = [];
        this.rightLine = [];
        this.json = json;
        this.minX;
        this.minY;
        this.maxX;
        this.maxY;
        this.lengthX = 0;
        this.lengthY = 0;
    }

    setPosition(position) {

        this.position = position
        if (this.position == 'line1' || this.position == 'line3') {

            this.lineMaterialHorizontal = materialRed;
            this.lineMaterialVertical = materialBlue;

        } else if (this.position == 'line2' || this.position == 'line4') {

            this.lineMaterialHorizontal = materialGreen;
            this.lineMaterialVertical = materialPurple;
        }

    }

    getPosition() {

        return this.position;

    }

    checkLine(leftLine, position) {
        if (leftLine.length > 0) {

            for (let i = 0; i < leftLine.length; i++) {

                if (leftLine[i].name == position) {

                    this.scene[this.currentScene.index].remove( this.scene[this.currentScene.index].getObjectByName(position) );

                    leftLine = leftLine.filter(function(leftLine) {
                        return leftLine.name != position;
                    });

                }

            }

        }
        return leftLine;
    }

    findWidthHeight() {

        let tempLine = this.json.content[this.currentMesh.index];
        this.minY = tempLine.y1;
        this.minX = tempLine.x2;
        this.maxY = tempLine.y3;
        this.maxX = tempLine.x4;

        this.lengthX = this.maxX - this.minX;
        this.lengthY = this.maxY - this.minY;
        console.log('x y',this.minX, this.minY, this.maxX, this.maxY, this.lengthX, this.lengthY);
    }

    drawLine() {

        this.findWidthHeight();

        let horizontal = new Array(5);
        let vertical = new Array(9);
        let horizontalRight = new Array(5);
        let verticalRight = new Array(9);

        let xSpace = this.lengthX / 8;
        let ySpace = this.lengthY / 4;

        for (let i = 0; i < 5; i++) {
            horizontal[i] = [];
            horizontalRight[i] = [];
            horizontal[i].push( new THREE.Vector3( 0, this.minY + ySpace * i, 24 ) );
            horizontal[i].push( new THREE.Vector3( 2, this.minY + ySpace * i, 24 ) );
            horizontalRight[i].push( new THREE.Vector3( 0, this.minY + ySpace * i, 24 ) );
            horizontalRight[i].push( new THREE.Vector3( -2, this.minY + ySpace * i, 24 ) );
        }

        for (let i = 0; i < 9; i++) {
            vertical[i] = [];
            verticalRight[i] = [];
            vertical[i].push( new THREE.Vector3( this.minX + xSpace * i, 0, 24 ) );
            vertical[i].push( new THREE.Vector3( this.minX + xSpace * i, 10, 24 ) );
            verticalRight[i].push( new THREE.Vector3( -(this.minX + xSpace * i), 0, 24 ) );
            verticalRight[i].push( new THREE.Vector3( -(this.minX + xSpace * i), 10, 24 ) );
        }

        for (let i = 0; i < 5; i++) {
            let geometry = new THREE.BufferGeometry().setFromPoints( horizontal[i] );
            let geometry2 = new THREE.BufferGeometry().setFromPoints( horizontalRight[i] );
            let newLine = new THREE.Line( geometry, materialGreen);
            let newLine2 = new THREE.Line( geometry2, materialGreen);
            newLine.name = 'left horizontal';
            newLine2.name = 'right horizontal';

            this.leftLine.push(newLine);
            this.rightLine.push(newLine2);
        }

        for (let i = 0; i < 9; i++) {
            let geometry = new THREE.BufferGeometry().setFromPoints( vertical[i] );
            let geometry2 = new THREE.BufferGeometry().setFromPoints( verticalRight[i] );
            let newLine = new THREE.Line( geometry, materialRed);
            let newLine2 = new THREE.Line( geometry2, materialRed);
            newLine.name = 'left vertical';
            newLine2.name = 'right vertical';

            this.leftLine.push(newLine);
            this.rightLine.push(newLine2);

        }

    }

    copyLine() {

        for (let i = 0; i < this.rightLine.length; i++) {

            this.scene[Math.floor(this.currentScene.index / 2)].add(this.rightLine[i]);

        }

    }

    showLine(boolean) {

        if (boolean) {
            for (let i = 0; i < this.rightLine.length; i++) {
               
                this.scene[Math.floor(this.currentScene.index / 2)].add(this.rightLine[i]);
    
            }
        } else {
            for (let i = 0; i < this.leftLine.length; i++) {
    
                this.scene[Math.floor(this.currentScene.index / 2)].add(this.leftLine[i]);
    
            }
        }

    }

    changeEyeLine(boolean) {

        this.removeLine(!boolean);
        this.showLine(boolean);

    }

    removeLine(boolean) {

        if (boolean) {
            for (let i = 0; i < this.rightLine.length; i++) {
    
                this.scene[Math.floor(this.currentScene.index / 2)].remove( this.scene[Math.floor(this.currentScene.index / 2)].getObjectByName(this.rightLine[i].name) );
        
            }
        } else {
            for (let i = 0; i < this.leftLine.length; i++) {
    
                this.scene[Math.floor(this.currentScene.index / 2)].remove( this.scene[Math.floor(this.currentScene.index / 2)].getObjectByName(this.leftLine[i].name) );
        
            }
        }

    }

    removeLine() {

        for (let j = 0; j < this.scene.length; j++) {

            for (let i = 0; i < this.leftLine.length; i++) {
        
                this.scene[j].remove( this.scene[j].getObjectByName(this.leftLine[i].name) );
        
            }
        
            for (let i = 0; i < this.rightLine.length; i++) {
        
                this.scene[j].remove( this.scene[j].getObjectByName(this.rightLine[i].name) );
        
            }

        }

    }

    resetLine() {

        this.removeLine();

        this.leftLine = [];
        this.rightLine = [];
    }

    loadLine(callback) {

        var input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('accept', 'application/json')
        input.click();
        let scope = this;
        input.onchange = function(event) {
            var fileList = input.files;
            var fr=new FileReader();
            fr.onload=function(){
                var modelList = JSON.parse(fr.result);
                callback(modelList);
                
            }
            fr.readAsText(fileList[0]);
        }

    }

}