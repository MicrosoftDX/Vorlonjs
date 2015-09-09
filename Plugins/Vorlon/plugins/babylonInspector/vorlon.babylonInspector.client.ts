module VORLON {
    declare var BABYLON;

    class DataGenerator {

        //ATTRIBUTES

        //CONSTRUCTOR
        /**
         * Constructor.
         * Does nothing.
         */
        constructor() {
        }

        //REQUESTS

        /**
         * Generate data about scenes
         * @returns {Array}
         * @private
         */
        public generateScenesData(scenes) {
            var data = [];

            scenes.forEach(scene => {
                var sceneData = {
                    activeCameraData: this._generateCameraData(scene.activeCamera),
                    meshesData: this._generateMeshesData(scene),
                    //texturesData: this._generateTexturesData(scene),
                    camerasData: this._generateCamerasData(scene),
                    lightsData : this._generateLightsData(scene)
                    //beforeRenderCallbacksData : scene._onBeforeRenderCallbacks.length > 0 ? this._generateBeforeRenderData(scene) : undefined,
                    //afterRenderCallbacksData : scene._onAfterRenderCallbacks.length > 0 ? this._generateAfterRenderData(scene) : undefined
                };
                data.push(sceneData);
            });

            return data;
        }

        //TOOLS

        /**
         * Converts a Color3 into a hex string
         * @param color
         */
        private _color3ToHex = function (color) {
            function componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }

            return "#" + componentToHex(color.r * 255) + componentToHex(color.g * 255) + componentToHex(color.b * 255);
        }

        /**
         * Round a number with afterComa numbers after the coma.
         * @param nbr
         * @param afterComa
         * @returns {number}
         * @private
         */
        private _roundNumber(nbr : number, afterComa : number) : number {
            var pow = Math.pow(10, afterComa);
            return Math.round(pow * nbr) / pow;
        }

        /**
         * Round each x, y and y components of a Vector3
         * @param vec
         * @param afterComa
         * @returns {any}
         * @private
         */
        private _roundVector3(vec, afterComa : number) {
            var result = new BABYLON.Vector3(this._roundNumber(vec.x, 2),
                this._roundNumber(vec.y, 2),
                this._roundNumber(vec.z, 2)
            )
            return result;
        }
        /**
         * Generate data object for a material object.
         * Result contains name, color, texture.
         * @param mat
         * @returns {{name: any, ambientColor: string, diffuseColor: string, emissiveColor: string, specularColor: string}}
         */
        private _generateMaterialData(mat) {
            var data;
            data = {
                name: mat.name,
                ambientColor: mat.ambientColor ? this._color3ToHex(mat.ambientColor) : undefined,
                diffuseColor: mat.diffuseColor ? this._color3ToHex(mat.diffuseColor) : undefined,
                emissiveColor: mat.emissiveColor ? this._color3ToHex(mat.emissiveColor) : undefined,
                specularColor: mat.specularColor ?  this._color3ToHex(mat.specularColor) : undefined,
                diffuseTexture : mat.diffuseTexture ? this._generateTextureData (mat.diffuseTexture) : undefined
            }
            return data;
        }

        /**
         * Generate data object for a multi-material object.
         * Result contains name, color, texture.
         * @param mat
         */
        private _generateMultiMaterialData(multimat) {
            var subMaterials = [];
            multimat.subMaterials.forEach(mat => {
                subMaterials.push(this._generateMaterialData(mat));
            });
            var data = {
                name : multimat.name,
                subMaterials : subMaterials
            };
            return data;
        }

        /**
         * Generate data about meshes
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateMeshesData(scene) {
            var data = [];
            scene.meshes.forEach(mesh => {
                data.push({
                    name: mesh.name,
                    isVisible : mesh.isVisible,
                    position: this._roundVector3(mesh.position, 2),
                    rotation: this._roundVector3(mesh.rotation, 2),
                    scaling: this._roundVector3(mesh.scaling, 2),
                    boundingBoxCenter : this._roundVector3(mesh.getBoundingInfo().boundingBox.center, 2),
                    material : mesh.material && !mesh.material.subMaterials ? this._generateMaterialData(mesh.material) : undefined,
                    multiMaterial : mesh.material && mesh.material.subMaterials ? this._generateMultiMaterialData(mesh.material) : undefined,
                    animations : this._generateAnimationData(mesh.animations)
                });
            });
            return data;
        }


        /**
         * Generate data object for a texture object.
         * Result contains name, url.
         * @param txtr
         * @returns {{name: any, url: any}}
         * @private
         */
        private _generateTextureData(txtr) {
            var data = {
                name: txtr.name,
                url: txtr.url
            };
            return data;
        }

        /**
         * Generate data about textures of one scene.
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateTexturesData(scene) {
            var data = [];
            scene.textures.forEach(txtr => {
                data.push(this._generateTextureData(txtr));
            });
            return data;
        }

        /**
         * Generate data about animations of an object
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateAnimationData(animations) {
            var data = [];
            animations.forEach(anim => {
                var keys = anim.getKeys();
                data.push({
                    name : anim.name,
                    targetProperty : anim.targetProperty,
                    framePerSecond : anim.framePerSecond,
                    stopped : anim._stopped,
                    beginFrame : keys[0].frame,
                    endFrame : keys[keys.length - 1].frame
                });
            });
            return data;
        }

        /**
         * Generate data for one camera.
         * @param cam
         * @returns {{name: any, type: (string|string|string), position: any, animations: Array, speed: (any|number), rotation: any, alpha: number, beta: number, radius: number}}
         * @private
         */
        private _generateCameraData(cam) {
            function getCameraType (cam) {
                if (cam instanceof BABYLON.FreeCamera) {
                    return "FreeCamera";
                } else if (cam instanceof BABYLON.ArcRotateCamera) {
                    return "ArcRotateCamera";
                } else {
                    return "Camera";
                }
            }

            var camType = getCameraType(cam);
            var camData = {
                name : cam.name,
                type : camType,
                mode : cam.mode == 0 ? 'perspective' : 'orthographic',
                layerMask : cam.layerMask.toString(2),
                position : this._roundVector3(cam.position,2),
                animations : this._generateAnimationData(cam.animations),
                speed :  camType == "FreeCamera" ? cam.speed : undefined,
                rotation :  camType == "FreeCamera" ? this._roundVector3(cam.rotation, 2) : undefined,
                alpha : camType == "ArcRotateCamera" ? this._roundNumber(cam.alpha, 2) : undefined,
                beta : camType == "ArcRotateCamera" ? this._roundNumber(cam.beta, 2) : undefined,
                radius : camType == "ArcRotateCamera" ? this._roundNumber(cam.radius, 2) : undefined
            }
            return camData;
        }

        /**
         * Generate data about cameras of one scene.
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateCamerasData(scene) {
            var data = [];
            scene.cameras.forEach(cam => {
                var camData = this._generateCameraData(cam);
                data.push(camData);
            });
            return data;
        }

        /**
         * Generate data about lights of one scene.
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateLightsData(scene) {

            function getLightType (light) {
                if (light instanceof BABYLON.PointLight) {
                    return "PointLight";
                } else if (light instanceof BABYLON.HemisphericLight) {
                    return "HemisphericLight";
                } else if (light instanceof BABYLON.SpotLight) {
                    return "SpotLight";
                } else if (light instanceof BABYLON.DirectionalLight) {
                    return "DirectionalLight";
                } else {
                    return "None";
                }
            }

            var data = [];
            scene.lights.forEach(light => {
                var lightType = getLightType(light);
                data.push({
                    name : light.name,
                    position : lightType != 'HemisphericLight' ? this._roundVector3(light.position, 2) : undefined,
                    diffuse : this._color3ToHex(light.diffuse),
                    specular : this._color3ToHex(light.specular),
                    intensity : light.intensity,
                    type : lightType,
                    direction : lightType == 'HemisphericLight' ? this._roundVector3(light.direction, 2) : undefined,
                    groundColor : lightType == 'HemisphericLight' ? this._color3ToHex(light.groundColor) : undefined,
                    isEnabled : light._isEnabled
                });
            });
            return data;
        }

        /**
         * Generate data about register before render functions of one scene.
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateBeforeRenderData(scene) {
            var data = [];
            scene._onBeforeRenderCallbacks.forEach(fct => {
                data.push({
                    body : fct.toString(2)
                });
            });
            return data;
        }

        /**
         * Generate data about register after render functions of one scene.
         * @param scene
         * @returns {Array}
         * @private
         */
        private _generateAfterRenderData(scene) {
            var data = [];
            scene._onAfterRenderCallbacks.forEach(fct => {
                data.push({
                    body : fct.toString(2)
                });
            });
            return data;
        }
    }

    /**
     * Class for queries sent by dashboard.
     * For each new query type, extend this class and
     * override findTarget() and execute() function.
     */
    class Query {

        client;
        target;
        targetName : string;
        sceneID : number;
        queryType :  QueryTypes;
        data;

        constructor(client, queryObject) {
            this.client = client;
            this.queryType = queryObject.queryType;
            this.data = queryObject.data;
            this.target = null;
            this.targetName = null;
            this.sceneID = this.data.sceneID;
        }

        /**
         * Execute the query (performs a specific action depending on the type
         * of query).
         */
        public execute() : void {

        }

        /**
         * Find the object target of the query thanks to its name (targetName)
         * and the id of the scene it belongs in (sceneID).
         */
        public findTarget() : void {

        }
    }

    /**
     * For spotting or unspotting mesh.
     * The target is the mesh in question.
     */
    class SpotMeshQuery extends Query {

        static spottedMeshes : Array <any> = [];
        static spottedMeshesMaterials : Array <any> = [];

        constructor(client, queryObject) {
            super(client, queryObject);
            this.targetName = this.data.meshName;
            this.findTarget();
        }

        public execute() : void {
            switch (this.queryType) {
                case QueryTypes.SPOT_MESH :
                    this._spotMesh(this.target);
                    break;
                case QueryTypes.UNSPOT_MESH :
                    this._unspotMesh(this.target);
                    break;
                default :
                    // not supposed to happen
                    break;
            }
        }

        public findTarget() : void {
            var scene = this.client.scenes[this.sceneID];
            this.target = scene.getMeshByName(this.targetName);
        }

        /**
         * Spot a mesh on the scene by (changing its material ? making it blink ? (that'd be nice))
         * @param meshName
         * @param sceneID
         * @private
         */
        private _spotMesh(mesh) {
            var index = SpotMeshQuery.spottedMeshes.indexOf(mesh);
            if (index >= 0) {
                return;
            }

            SpotMeshQuery.spottedMeshes.push(mesh);
            SpotMeshQuery.spottedMeshesMaterials.push(mesh.material);

            var spotMaterial = new BABYLON.StandardMaterial("spotMaterial", mesh._scene);
            spotMaterial.emissiveColor = new BABYLON.Color3(1,0,0);
            mesh.material = spotMaterial;
        }

        /**
         * Set initial material on mesh if it was spotted.
         * @param mesh
         * @private
         */
        private _unspotMesh(mesh) {
            var index = SpotMeshQuery.spottedMeshes.indexOf(mesh);
            if (index < 0) {
                return;
            }
            mesh.material = SpotMeshQuery.spottedMeshesMaterials[index];
            SpotMeshQuery.spottedMeshes.splice(index, 1);
            SpotMeshQuery.spottedMeshesMaterials.splice(index, 1);
        }

    }

    /**
     * Query to turn a light on or off.
     */
    class SwitchLightQuery extends Query {
        constructor(client, queryObject) {
            super(client, queryObject);
            this.targetName = queryObject.data.lightName;
            this.findTarget();
        }

        public execute() : void {
            switch (this.queryType) {
                case QueryTypes.TURN_OFF_LIGHT :
                    this._turnOffLight(this.target);
                    break;
                case QueryTypes.TURN_ON_LIGHT :
                    this._turnOnLight(this.target);
                    break;
                default :
                    // not supposed to happen
                    break;
            }
        }

        public findTarget() : void {
            var scene = this.client.scenes[this.sceneID];
            this.target = scene.getLightByName(this.targetName);
        }

        private _turnOnLight(light) {
            light._isEnabled = true;
        }

        private _turnOffLight(light) {

            light._isEnabled = false;

        }
    }

    /**
     * Query to hide or display a mesh.
     */
    class ToggleMeshVisibilityQuery extends Query {
        constructor(client, queryObject) {
            super(client, queryObject);
            this.targetName = queryObject.data.meshName;
            this.findTarget();
        }

        public execute() : void {
            switch (this.queryType) {
                case QueryTypes.HIDE_MESH :
                    this._hideMesh(this.target);
                    break;
                case QueryTypes.DISPLAY_MESH :
                    this._displayMesh(this.target);
                    break;
                default :
                    // not supposed to happen
                    break;
            }
        }

        public findTarget() : void {
            var scene = this.client.scenes[this.sceneID];
            this.target = scene.getMeshByName(this.targetName);
        }

        private _hideMesh(mesh) {
           mesh.isVisible = false;
        }

        private _displayMesh(mesh) {
            mesh.isVisible = true;
        }
    }

    /**
    * Query to display or hide axis of a mesh
    */
    class GizmoOnMeshQuery extends Query {
        gizmos : Array<any>;

        constructor(client, queryObject) {
            super(client, queryObject);
            this.targetName = queryObject.data.meshName;
            this.findTarget();
            this.gizmos = [];
        }

        public execute() : void {
            switch (this.queryType) {
                case QueryTypes.HIDE_MESH_GIZMO :
                    this._hideMeshGizmos();
                    break;
                case QueryTypes.DISPLAY_MESH_GIZMO :
                    this._displayMeshGizmos();
                    break;
                default :
                    // not supposed to happen
                    break;
            }
        }

        public findTarget() : void {
            var scene = this.client.scenes[this.sceneID];
            this.target = scene.getMeshByName(this.targetName);
        }

        /**
         * Build tubes that will be the mesh's axis.
         * If the mesh is named meshName, their names will be
         * "meshName_xAxis", "meshName_yAxis" and "meshName_zAxis"
         *
         * @private
         */
        private _buildGizmos() {
            var scene = this.client.scenes[this.sceneID];
            var directions = this.target.getBoundingInfo().boundingBox.directions;
            //Start tube at (0,0,0) because it will be automaticaly attached to the mesh when
            // we set tube's parent
            var center = new BABYLON.Vector3(0,0,0);
            var size = 2 * this.target.getBoundingInfo().boundingSphere.radius;

            var pathX = [center, center.add(directions[0].scaleInPlace(size))];
            this.gizmos[0] = BABYLON.Mesh.CreateTube(this.target.name + '_xAxis', pathX,
                    0.03, 10, null, scene);
            this.gizmos[0].material = new BABYLON.StandardMaterial(this.target.name + "_xAxisMat", scene);
            this.gizmos[0].material.emissiveColor = BABYLON.Color3.Red();

            var pathY = [center, center.add(directions[1].scaleInPlace(size))];
            this.gizmos[1] =  BABYLON.Mesh.CreateTube(this.target.name + '_yAxis', pathY,
                0.03, 10, null, scene);
            this.gizmos[1].material = new BABYLON.StandardMaterial(this.target.name + "_yAxisMat", scene);
            this.gizmos[1].material.emissiveColor = BABYLON.Color3.Blue();

            var pathZ = [center, center.add(directions[2].scaleInPlace(size))];
            this.gizmos[2] = BABYLON.Mesh.CreateTube(this.target.name + '_zAxis', pathZ,
                0.03, 10, null, scene);
            this.gizmos[2].material = new BABYLON.StandardMaterial(this.target.name + "_zAxisMat", scene);
            this.gizmos[2].material.emissiveColor = BABYLON.Color3.Green();

            this.gizmos.forEach(g => {
                g.parent = this.target;
            });

            // Exclude guizmos from lights so their color does not change
            scene.lights.forEach(l => {
                this.gizmos.forEach(g => {
                    l.excludedMeshes.push(g);
                });
            });

        }

        /**
         * Search the scene for meshes representing gizmos.
         * If found, return true, else return false.
         * @returns {boolean}
         * @private
         */
        private _gizmosAlreadyExist() : boolean {
            var scene = this.client.scenes[this.sceneID];
            var gizmoX = scene.getMeshByName(this.target.name + '_xAxis');
            return gizmoX == undefined ? false : true;
        }

        /**
         * Find mesh axes if they already exist
         * @private
         */
        private _findGizmos() {
            if (!this._gizmosAlreadyExist()) {
                return;
            }
            var scene = this.client.scenes[this.sceneID];
            this.gizmos[0] = scene.getMeshByName(this.target.name + '_xAxis');
            this.gizmos[1] = scene.getMeshByName(this.target.name + '_yAxis');
            this.gizmos[2] = scene.getMeshByName(this.target.name + '_zAxis');
        }

        /**
         * Hide mesh axes
         * @private
         */
        private _hideMeshGizmos() {
            if (!this._gizmosAlreadyExist()) {
                this._buildGizmos();
            } else {
                this._findGizmos();
            }
            this.gizmos.forEach(g => {
                g.isVisible = false;
            });
        }

        /**
         * Display mesh axes
         * @private
         */
        private _displayMeshGizmos() {
            if (!this._gizmosAlreadyExist()) {
                this._buildGizmos();
            } else {
                this._findGizmos();
            }
            this.gizmos.forEach(g => {
                g.isVisible = true;
            });
        }
    }

    ///**
    // * For queries about animation (start etc).
    // */
    //class AnimQuery extends Query {
    //
    //    private animTargetType : AnimTargetTypes;
    //    private animTargetName : string;
    //    private animTarget;
    //    private copyOfTargetAnimations : Array <any>;
    //    private currentFrame : number;
    //
    //    constructor(client, queryObject) {
    //        super(client, queryObject);
    //        this.targetName = this.data.animName;
    //        this.animTargetName = this.data.animTargetName;
    //        this.animTargetType = this.data.animTargetType;
    //        this.copyOfTargetAnimations = [];
    //        this.findTarget();
    //    }
    //
    //    public findTarget() : void {
    //        //might be unnecessary
    //        this._findAnimTarget();
    //        var animations = this.animTarget.animations;
    //        for(var i = 0; i < animations.length; ++i) {
    //            if (animations[i].name == this.targetName) {
    //                this.target = animations[i];
    //                break;
    //            }
    //        }
    //    }
    //
    //    public execute() : void {
    //        switch (this.queryType) {
    //            case QueryTypes.START_ANIM :
    //                this._startAnimation();
    //                break;
    //            case QueryTypes.PAUSE_ANIM :
    //                this._pauseAnimation();
    //                break;
    //            case QueryTypes.UNPAUSE_ANIM :
    //                this._unpauseAnimation();
    //                break;
    //            case QueryTypes.STOP_ANIM :
    //                this._stopAnimation();
    //                break;
    //            default :
    //                console.log("Default case");
    //                break;
    //        }
    //    }
    //
    //    private _startAnimation() {
    //        var keys = this.target.getKeys();
    //        this.client.scenes[this.sceneID].beginAnimation(this.animTarget,
    //            keys[0].frame,
    //            keys[keys.length - 1].frame,
    //            true);
    //    }
    //
    //    private _pauseAnimation() {
    //        this.currentFrame = this.target.currentFrame;
    //        this.client.scenes[this.sceneID].stopAnimation(this.animTarget);
    //    }
    //
    //    private _unpauseAnimation() {
    //        var keys = this.target.getKeys();
    //        this.client.scenes[this.sceneID].beginAnimation(this.animTarget,
    //            this.currentFrame,
    //            keys[keys.length - 1].frame,
    //            true);
    //    }
    //
    //    private _stopAnimation() {
    //        this.currentFrame = 0;
    //        this.client.scenes[this.sceneID].stopAnimation(this.animTarget);
    //    }
    //
    //    private _findAnimTarget() : void {
    //        switch(this.animTargetType) {
    //            case AnimTargetTypes.MESH:
    //                this.animTarget = this.client.scenes[this.sceneID].getMeshByName(this.animTargetName);
    //                break;
    //            default:
    //                break;
    //        }
    //        this.copyOfTargetAnimations = this.animTarget.animations.slice();
    //    }
    //}


    export class BabylonInspectorClient extends ClientPlugin {

        //ATTRIBUTES
        private id : string;
        private _dataGenerator : DataGenerator;

        engine;
        scenes;

        //CONSTRUCTOR
        /**
         * Consctructor
         */
        constructor() {
            super("babylonInspector"); // Name
            this._ready = true; // No need to wait
            this.id = "BABYLONINSPECTOR";
            this._dataGenerator = new DataGenerator();
        }

        /**
         * Return unique id for the plugin.
         * @returns {string}
         */
        public getID() : string {
            return this.id;
        }

        /**
        * Refresh client : sens BABYLON Engine again.
        * Override this method with cleanup work that needs to happen
        * as the user switches between clients on the dashboard.
        */
        public refresh(): void {
            this._sendScenesData();
        }

        /**
         * Start the clientside code : initilization etc
         */
        public startClientSide(): void {
            if(!BABYLON.Engine.isSupported()) {
                //error
            } else {
            }

            document.addEventListener("DOMContentLoaded", () => {
                this.engine = this._getBabylonEngine();
                if (this.engine) {
                    this.scenes = this.engine.scenes;
                    this.refresh();
                }
            });
        }

        /**
         * Handle messages received from the dashboard, on the client.
         * Then, send data back to dashboard.
         * Received objects must follow pattern :
         * {
         *  type : type of the query
         *  data : data of the query
         * }
         */
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            switch (receivedObject.queryType) {
                case QueryTypes.SPOT_MESH :
                case QueryTypes.UNSPOT_MESH :
                    new SpotMeshQuery(this, receivedObject).execute();
                    break;
                //case QueryTypes.START_ANIM :
                //case QueryTypes.PAUSE_ANIM :
                //case QueryTypes.UNPAUSE_ANIM :
                //case QueryTypes.STOP_ANIM :
                //    new AnimQuery(this, receivedObject).execute();
                //    break;
                case QueryTypes.TURN_OFF_LIGHT :
                case QueryTypes.TURN_ON_LIGHT :
                    new SwitchLightQuery(this, receivedObject).execute();
                    break;
                case QueryTypes.DISPLAY_MESH :
                case QueryTypes.HIDE_MESH :
                    new ToggleMeshVisibilityQuery(this, receivedObject).execute();
                    break;
                case QueryTypes.DISPLAY_MESH_GIZMO :
                case QueryTypes.HIDE_MESH_GIZMO :
                    new GizmoOnMeshQuery(this, receivedObject).execute();
                    break;
                default :
                    break;
            }
        }

        //TOOLS
        /**
         * Find and return a mesh by scene ID and mesh name.
         * @param meshName
         * @param sceneID
         * @returns {any}
         * @private
         */
        private _findMesh(meshName : string, sceneID : string) {
            var id : number = +sceneID;
            var scene = this.engine.scenes[id];
            var mesh = scene.getMeshByName(meshName);
            return mesh;
        }

        /**
         * Send all data about the scenes
         * @private
         */
        private _sendScenesData() {
            var scenesData = this._dataGenerator.generateScenesData(this.scenes);
            this.sendToDashboard({
                messageType : 'SCENES_DATA',
                data : scenesData,
                clientURL : window.location.href
            });
        }

        /**
         * Loop on all objects to fetch BABYLON Engine object.
         * @private
         */
        private _getBabylonEngine() {
            for (var member in window) {
                if (window[member] instanceof BABYLON.Engine) {
                    return window[member];
                }
            }
            return null;
        }
    }

    /**
     * Register the plugin with vorlon core
     */
    Core.RegisterClientPlugin(new BabylonInspectorClient());
}
