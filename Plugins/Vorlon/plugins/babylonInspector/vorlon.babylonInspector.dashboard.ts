module VORLON {

    declare var BABYLON;

    /**
     * Represents a node in a tree.
     * Composed of a div wrapper that can have classes :
     *   tree-node : always, represents the type TreeNodeHTMLElement
     *   tree-node-with-children : if element has children
     *   tree-node-folded : if the node is folded, ie its children are hidden
     *   tree-node-hidden : if the node is hidden, ie its parent is folded
     * In the wrapper div, we have :
     *   dropDownButton : if the node has children, allows to fold and unfold children
     *      when user clicks on it
     *   content : the content to be displayed
     *   features : optionnal features
     */
    class TreeNodeHTMLElement {
        //ATTRIBUTES

        dashboard : BabylonInspectorDashboard;

        wrapper : HTMLElement;

        dropDownButton : HTMLElement;
        icon : HTMLElement;
        content : HTMLElement;
        features : HTMLElement;

        parent : TreeNodeHTMLElement;
        children : Array<TreeNodeHTMLElement>;
        hasChildren : boolean;
        isFolded : boolean;
        isHidden : boolean;

        //CONSTRUCTOR
        constructor(dashboard : BabylonInspectorDashboard, contentValue : any) {
            this.dashboard = dashboard;

            this.children = [];

            this.wrapper = document.createElement('div');
            this.wrapper.className = 'tree-node tree-node-hidden tree-node-folded';

            this.content = document.createElement('div');
            this.content.className = 'tree-node-content';
            this.content.innerHTML = contentValue;
            this.wrapper.appendChild(this.content);

            this.features = document.createElement('div');
            this.features.className = 'tree-node-features';
            this.wrapper.appendChild(this.features);

            this.hasChildren = false;
            this.isFolded = true;
            this.isHidden = true;
        }

        //REQUESTS
        /**
         * Add a child to the node.
         * @param child
         */
        public addChild(child : TreeNodeHTMLElement) {
            if (!this.hasChildren) {
                this.hasChildren = true;
                this.createDropdownIcon();
                this._prepend(this.wrapper, this.dropDownButton);
                this.wrapper.className += ' tree-node-with-children';
            }
            this.wrapper.appendChild(child.wrapper);
            this.children.push(child);
            child.parent = this;
        }

        /**
         * Add a feature (a button, image or whatever)
         * @param feature
         */
        public addFeature(feature : HTMLElement) {
            this.features.appendChild(feature);
        }

        /**
         * Create a dropdown icon with event listener on click.
         * @returns {any}
         * @private
         */
        createDropdownIcon () {
            var dropDown = document.createElement('div');
            dropDown.innerHTML = '+';
            dropDown.className = 'tree-node-button folded-button';
            dropDown.addEventListener('click', () => {
                if (this.isFolded) {
                    dropDown.innerHTML = '-';
                    this.unfold();
                } else {
                    dropDown.innerHTML = '+';
                    this.fold();
                }
            });
            this.dropDownButton = dropDown;
        }

        /**
         * Fold node
         */
        public fold () {
            if (this.isFolded) {
                return;
            }

            this.wrapper.className += " tree-node-folded";
            this.isFolded = true;

            for (var i = 0; i < this.children.length; ++i) {
                var child : TreeNodeHTMLElement = this.children[i];
                child.hide();
            }
        }

        /**
         * Hide node
         */
        public hide () {
            if (this.isHidden) {
                return;
            }
            this.isHidden = true;
            this.wrapper.className += ' tree-node-hidden';
        }

        /**
         * Unhide node
         */
        public unhide() {
            if (!this.isHidden) {
                return;
            }
            this.isHidden = false;
            this.wrapper.classList.remove('tree-node-hidden');
        }

        /**
         * Unfold node
         */
        public unfold () {
            if (!this.isFolded) {
                return;
            }

            this.wrapper.classList.remove('tree-node-folded');
            this.isFolded = false;

            for (var i = 0; i < this.children.length; ++i) {
                var child : TreeNodeHTMLElement = this.children[i];
                child.unhide();
            }
        }

        //TOOLS
       _prepend = (parent : HTMLElement, child : HTMLElement) => {
            parent.insertBefore(child, parent.firstChild);
        }
    }

    /**
     * Tree node elements with a type represented by an small icon
     */
    class TypeTreeNodeHTMLElement extends TreeNodeHTMLElement {
        icon : HTMLElement;
        type : string;
        constructor(dashboard, content, type) {
            super(dashboard, content);
            this.type = type;
            this.createAndAddTypeIcon(this.type);
        }

        /**
         * Create a type icon, its background is the image found at
         * imgURL.
         */
        createAndAddTypeIcon(iconType) {
            var typeIcon = document.createElement('div');
            typeIcon.className = 'tree-node-type-icon tree-node-type-icon-' + iconType;
            this.icon = typeIcon;
            this._prepend(this.wrapper, this.icon);
        }
    }

    /**
     * Node to display a property.
     * Constructor must be provided with property name and value.
     * Node content will be <span> property name : </span> property value
     */
    class PropertyTreeNodeHTMLElement extends TreeNodeHTMLElement {

        constructor(dashboard : BabylonInspectorDashboard, propertyName : string, propertyValue : string) {
            super(dashboard, "<span>" + propertyName + " : " + "</span>" + propertyValue);
        }
    }

    /**
     * Node to display a color property. Property with color sample added
     * in features.
     */
    class ColorPropertyTreeNodeHTMLElement extends PropertyTreeNodeHTMLElement {

        constructor(dashboard : BabylonInspectorDashboard, propertyName : string, propertyValue : string) {
            super(dashboard, propertyName, propertyValue);
            var colorSample = this._createColorSample(propertyValue);
            this.addFeature(colorSample);
        }

        /**
         * Create a color sample which background colored in colorHex.
         * @param colorHex
         * @returns {any}
         * @private
         */
        private _createColorSample(colorHex) {
            var colorSample = document.createElement('div');
            colorSample.className = "tree-node-color-sample";
            colorSample.style.backgroundColor = colorHex;
            colorSample.style.borderColor = this._isClearColor(colorHex) ? '#000000' : '#ffffff';
            return colorSample;
        }

        /**
         * True if colorHex is a clear color
         * @param colorHex
         * @returns {boolean}
         * @private
         */
        private _isClearColor(colorHex) : boolean {
            return (colorHex.charAt(1) == 'f' || colorHex.charAt(1) == 'F')
            && (colorHex.charAt(3) == 'f' || colorHex.charAt(3) == 'F')
            && (colorHex.charAt(5) == 'f' || colorHex.charAt(5) == 'F');

        }
    }

    /**
     * Node to display a texture.
     * Texture thumbnail which displays texture on click added to features.
     */
    class TextureUrlPropertyTreeNodeHTMLElement extends PropertyTreeNodeHTMLElement {

        completeURL : string;
        imageDisplayed : boolean;

        constructor(dashboard : BabylonInspectorDashboard, textureURL, completeURL) {
            super(dashboard, 'url', textureURL);
            this.completeURL = completeURL;
            this.imageDisplayed = false;
            var imageViewer = this._createImageViewer();
            this.addFeature(imageViewer);
        }

        /**
         * Create texture thumbnail that allows to view texture on click.
         * @returns {any}
         * @private
         */
        private _createImageViewer() : HTMLElement {
            var viewerThumbnail = document.createElement('div');
            viewerThumbnail.className = 'tree-node-texture-thumbnail';
            viewerThumbnail.style.backgroundImage = ('url(' + this.completeURL + ')');

            var imageView = document.createElement('div');
            imageView.className = 'tree-node-texture-view';
            imageView.style.backgroundImage = ('url(' + this.completeURL + ')');

            viewerThumbnail.addEventListener('mouseover', () => {
                //if image was displayed, hide it
                if (this.imageDisplayed) {
                    return;
                }
                //else, display it
                this.imageDisplayed = true;
                this.dashboard.displayer.innerHTML = "";
                this.dashboard.displayer.style.display = 'block';
                this.dashboard.displayer.appendChild(imageView);
            });

            viewerThumbnail.addEventListener('mouseout', () => {
                //if image was displayed, hide it
                if (!this.imageDisplayed) {
                    return;
                }
                this.imageDisplayed = false;
                this.dashboard.displayer.style.display = 'none';
                this.dashboard.displayer.innerHTML = "";
            });

            //imageView.addEventListener('click', () => {
            //    this.imageDisplayed = false;
            //    this.dashboard.displayer.innerHTML = "";
            //});
            return viewerThumbnail;
        }
    }

    class LightTreeNodeHTMLElement extends TreeNodeHTMLElement {
        lightName : string;
        lightIsOn : boolean;

        constructor(dashboard, lightName, isEnabled) {
            super(dashboard, lightName);
            this.lightName = lightName;
            this.lightIsOn = isEnabled;
            var switchBtn = this._createSwitch();
            this.addFeature(switchBtn);
        }

        /**
         * Create the on/off switch
         * @returns {any}
         * @private
         */
        private _createSwitch() : HTMLElement {
            var switchBtn = document.createElement('div');
            switchBtn.className = 'tree-node-light-switch clickable';
            if (this.lightIsOn) {
                switchBtn.innerHTML = 'ON';
                switchBtn.className += ' tree-node-light-switch-on';
            } else {
                switchBtn.innerHTML = 'OFF';
                switchBtn.className += ' tree-node-light-switch-off';
            }

            switchBtn.addEventListener('click', () => {
                var data =  {
                    lightName : this.lightName,
                    sceneID : (<SceneTreeNodeHTMLElement>(this.parent.parent)).sceneID
                }
                if (this.lightIsOn) {
                    this.lightIsOn = false;
                    switchBtn.innerHTML = 'OFF';
                    switchBtn.classList.remove('tree-node-light-switch-on');
                    switchBtn.className += ' tree-node-light-switch-off';
                    this.dashboard.queryToClient(QueryTypes.TURN_OFF_LIGHT, data);
                } else {
                    this.lightIsOn = true;
                    switchBtn.innerHTML = 'ON';
                    switchBtn.classList.remove('tree-node-light-switch-off');
                    switchBtn.className += ' tree-node-light-switch-on';
                    this.dashboard.queryToClient(QueryTypes.TURN_ON_LIGHT, data);
                }
            });

            return switchBtn;
        }
    }

    /**
     * Node to display a scene.
     * Contains the scene ID as an attribute
     */
    class SceneTreeNodeHTMLElement extends TreeNodeHTMLElement {
        //ATTRIBUTES
        sceneID : number;
        //CONSTRUCTOR
        constructor(dashboard : BabylonInspectorDashboard, sceneID : number) {
            super(dashboard, 'Scene n° ' + sceneID);
            this.sceneID = sceneID;
        }
    }

    /**
     * Node to display a mesh.
     */
    class MeshTreeNodeHTMLElement extends TreeNodeHTMLElement {
        //ATTRIBUTES
        meshName : string;
        meshIsSpotted : boolean;
        meshIsVisible : boolean;
        gizmosVisible : boolean;

        //CONSTRUCTOR
        constructor(dashboard : BabylonInspectorDashboard, meshName : string, visible : boolean) {
            super(dashboard, meshName);
            this.meshName = meshName;
            this.meshIsSpotted = false;
            this.meshIsVisible = visible;
            this.gizmosVisible = false;
            var spotMeshButton = this._createSpotMeshButton();
            this.addFeature(spotMeshButton);
            var displaySwitch = this._createSwitch();
            this.addFeature(displaySwitch);
            var gizmosSwitch = this._createGizmoSwitch();
            this.addFeature(gizmosSwitch);
        }
        //REQUESTS
        //TOOLS
        /**
         * Create a switch to spot the mesh in the scene
         * @returns {any}
         * @private
         */
        private _createSpotMeshButton() : HTMLElement {
            var spotMeshCheckbox = document.createElement('div');
            spotMeshCheckbox.innerHTML = 'Spot mesh';
            var cb = document.createElement('div');
            cb.className = "tree-node-features-element tree-node-spot-mesh-button tree-node-spot-mesh-button-off clickable"
            cb.addEventListener('click', () => {
                var data = {
                    meshName: this.meshName,
                    sceneID: (<SceneTreeNodeHTMLElement>(this.parent.parent)).sceneID
                }
                if (this.meshIsSpotted) {
                    this.meshIsSpotted = false;
                    cb.classList.remove('tree-node-spot-mesh-button-on');
                    cb.className += ' tree-node-spot-mesh-button-off';
                    this.dashboard.queryToClient(QueryTypes.UNSPOT_MESH, data);
                } else {
                    this.meshIsSpotted = true;
                    cb.classList.remove('tree-node-spot-mesh-button-off');
                    cb.className += ' tree-node-spot-mesh-button-on';
                    this.dashboard.queryToClient(QueryTypes.SPOT_MESH, data);
                }
            });
            spotMeshCheckbox.appendChild(cb);
            return spotMeshCheckbox;
        }

        /**
         * Create a switch to hide/display the mesh
         * @returns {any}
         * @private
         */
        private _createSwitch() : HTMLElement {
            var switchBtn = document.createElement('div');
            switchBtn.className = 'tree-node-mesh-switch';
            if (this.meshIsVisible) {
                switchBtn.innerHTML = 'ON';
                switchBtn.className += 'tree-node-features-element tree-node-mesh-switch-on clickable';
            } else {
                switchBtn.innerHTML = 'OFF';
                switchBtn.className += ' tree-node-mesh-switch-off';
            }

            switchBtn.addEventListener('click', () => {
                var data =  {
                    meshName : this.meshName,
                    sceneID : (<SceneTreeNodeHTMLElement>(this.parent.parent)).sceneID
                };
                if (this.meshIsVisible) {
                    this.meshIsVisible = false;
                    switchBtn.innerHTML = 'OFF';
                    switchBtn.classList.remove('tree-node-mesh-switch-on');
                    switchBtn.className += ' tree-node-mesh-switch-off';
                    this.dashboard.queryToClient(QueryTypes.HIDE_MESH, data);
                } else {
                    this.meshIsVisible = true;
                    switchBtn.innerHTML = 'ON';
                    switchBtn.classList.remove('tree-node-mesh-switch-off');
                    switchBtn.className += ' tree-node-mesh-switch-on';
                    this.dashboard.queryToClient(QueryTypes.DISPLAY_MESH, data);
                }
            });


            return switchBtn;
        }

        /**
         * Create a switch than displays or hide the axes (gizmos) of the mesh..
         * @returns {any}
         * @private
         */
        private _createGizmoSwitch() : HTMLElement {
            var gizmosBtn = document.createElement('div');
            gizmosBtn.className = 'tree-node-features-element tree-node-mesh-gizmo clickable';
            gizmosBtn.innerHTML = 'gizmo off';
            gizmosBtn.className += ' tree-node-mesh-gizmo-off';

            gizmosBtn.addEventListener('click', () => {
                var data =  {
                    meshName : this.meshName,
                    sceneID : (<SceneTreeNodeHTMLElement>(this.parent.parent)).sceneID
                };
                if (this.gizmosVisible) {
                    this.gizmosVisible = false;
                    gizmosBtn.innerHTML = 'gizmo off';
                    gizmosBtn.classList.remove('tree-node-mesh-gizmo-on');
                    gizmosBtn.className += ' tree-node-mesh-gizmo-off';
                    this.dashboard.queryToClient(QueryTypes.HIDE_MESH_GIZMO, data);
                } else {
                    this.gizmosVisible = true;
                    gizmosBtn.innerHTML = 'gizmo on';
                    gizmosBtn.classList.remove('tree-node-mesh-gizmo-off');
                    gizmosBtn.className += ' tree-node-mesh-gizmo-on';
                    this.dashboard.queryToClient(QueryTypes.DISPLAY_MESH_GIZMO, data);
                }
            });
            return gizmosBtn;
        }
    }

    /**
     * Node to display an animation.
     * Features : play/pause and stop buttons (disabled).
     */
    class AnimationTreeNodeHTMLElement extends TreeNodeHTMLElement {
        animationIsStarted : boolean;
        animationIsStopped : boolean;
        animationIsPaused : boolean;

        playBtn : HTMLElement;
        stopBtn : HTMLElement;

        animName : string;
        targetType : AnimTargetTypes;

        constructor(dashboard : BabylonInspectorDashboard, animName : string, targetType : AnimTargetTypes, stopped : boolean) {
            super(dashboard, animName);
            this.animName = animName;
            this.targetType = targetType;
            this.animationIsStopped = stopped;
            this.animationIsPaused = false;
            this.animationIsStarted = !stopped;
            //this._createPlayStopIcons();
        }

        private _createPlayStopIcons() {

            //Create buttons and set appropriate class names
            this.playBtn = document.createElement('button');
            this.stopBtn = document.createElement('button');

            if (this.animationIsStarted) {
                this.playBtn.className = 'tree-node-features-element tree-node-animation-button tree-node-animation-button-pause';
                this.stopBtn.className = 'tree-node-features-element tree-node-animation-button tree-node-animation-button-stop';
            } else {
                this.playBtn.className = 'tree-node-features-element tree-node-animation-button tree-node-animation-button-play';
                this.stopBtn.className = 'tree-node-features-element tree-node-animation-button tree-node-animation-button-stop-pressed';
            }

            // Event listeners
            this.playBtn.addEventListener('click', () => {

                if (!this.animationIsStarted) {
                    this._startAnimation();
                } else if (this.animationIsPaused) {
                    this.unpauseAnimation();
                } else {
                    this._pauseAnimation();
                }
            });

            this.stopBtn.addEventListener('click', () => {
                if (!this.animationIsStarted) {
                    return;
                }
                this._stopAnimation();
            });

            // Add to features list
            this.addFeature(this.playBtn);
            this.addFeature(this.stopBtn);
        }

        private _startAnimation() {
            if (!this.animationIsStopped) {
                return;
            }
            this.animationIsStarted = true;
            this.animationIsStopped = false;

            //play-pause button  has icon pause
            this.playBtn.classList.remove('tree-node-animation-button-play');
            this.playBtn.className += ' tree-node-animation-button-pause';

            // stop button has icon unpressed
            this.stopBtn.classList.remove('tree-node-animation-button-stop-pressed');
            this.stopBtn.className += ' tree-node-animation-button-stop';

            this.dashboard.queryToClient(QueryTypes.START_ANIM, {
                animName : this.animName,
                animTargetType : this.targetType,
                animTargetName : this._getTargetName(),
                sceneID : this._getSceneID()
            });
        }

        private _pauseAnimation() {
            if (this.animationIsPaused || this.animationIsStopped) {
                return;
            }

            this.animationIsPaused = true;

            //play-pause button  has icon play
            this.playBtn.classList.remove('tree-node-animation-button-pause');
            this.playBtn.className += ' tree-node-animation-button-play';

            this.dashboard.queryToClient(QueryTypes.PAUSE_ANIM, {
                animName : this.animName,
                animTargetType : this.targetType,
                animTargetName : this._getTargetName(),
                sceneID : this._getSceneID()
            });
        }

        private unpauseAnimation() {
            if (!this.animationIsPaused) {
                return;
            }

            this.animationIsPaused = false;

            //play-pause button  has icon pause
            this.playBtn.classList.remove('tree-node-animation-button-play');
            this.playBtn.className += ' tree-node-animation-button-pause';

            this.dashboard.queryToClient(QueryTypes.UNPAUSE_ANIM, {
                animName : this.animName,
                animTargetType : this.targetType,
                animTargetName : this._getTargetName(),
                sceneID : this._getSceneID()
            });
        }

        private _stopAnimation() {
            if (!this.animationIsStarted) {
                return;
            }

            this.animationIsStarted = false;
            this.animationIsStopped = true;
            this.animationIsPaused = false;

            //play-pause button has icon play
            this.playBtn.classList.remove('tree-node-animation-button-pause');
            this.playBtn.className += ' tree-node-animation-button-play';
            //stop button has icon stop pressed
            this.stopBtn.classList.remove('tree-node-animation-button-stop');
            this.stopBtn.className += ' tree-node-animation-button-stop-pressed';

            this.dashboard.queryToClient(QueryTypes.STOP_ANIM, {
                animName : this.animName,
                animTargetType : this.targetType,
                animTargetName : this._getTargetName(),
                sceneID : this._getSceneID()
            });
        }

        /**
         * Find the name of the object targeted by the animation.
         * @returns {string}
         * @private
         */
        private _getTargetName() : string {
            var targetName : string;
            switch (this.targetType) {
                case AnimTargetTypes.MESH :
                    targetName = (<MeshTreeNodeHTMLElement>(this.parent.parent)).meshName;
                    break;
                default :
                    break;
            }
            return targetName;
        }

        private _getSceneID() : number {
            var sceneID : number;
            switch (this.targetType) {
                case AnimTargetTypes.MESH :
                    sceneID = (<SceneTreeNodeHTMLElement>(this.parent.parent.parent.parent)).sceneID;
                    break;
                default :
                    break;
            }
            return sceneID;
        }
    }


    /**
     * Class that generates the tree of data.
     */
    class DataTreeGenerator {

        //ATTRIBUTES
        dashboard : BabylonInspectorDashboard;

        //CONSTRCUTOR
        constructor(dashboard) {
            this.dashboard = dashboard;
        }

        /**
         * Generate a material node.
         * @param materialData
         * @param clientURL
         * @returns {VORLON.PropertyTreeNodeHTMLElement}
         * @private
         */
        private _generateMaterialNode(materialData, clientURL) : TreeNodeHTMLElement {
            var materialNode = new PropertyTreeNodeHTMLElement(this.dashboard, "material", ""); {
                var materialPropertyNode:PropertyTreeNodeHTMLElement;

                materialPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "diffuseColor", materialData.diffuseColor);
                materialNode.addChild(materialPropertyNode);

                materialPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "ambientColor", materialData.ambientColor);
                materialNode.addChild(materialPropertyNode);

                materialPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "emissiveColor", materialData.emissiveColor);
                materialNode.addChild(materialPropertyNode);

                materialPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "specularColor", materialData.specularColor);
                materialNode.addChild(materialPropertyNode);

                if (materialData.diffuseTexture) {
                    materialPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "diffuseTexture", materialData.diffuseTexture.name);
                    {
                        var texturePropertyNode:TreeNodeHTMLElement;

                        texturePropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", materialData.diffuseTexture.name);
                        materialPropertyNode.addChild(texturePropertyNode);

                        texturePropertyNode = new TextureUrlPropertyTreeNodeHTMLElement(this.dashboard,
                            materialData.diffuseTexture.url,
                            clientURL + materialData.diffuseTexture.url);
                        materialPropertyNode.addChild(texturePropertyNode);
                    }
                    materialNode.addChild(materialPropertyNode);
                }

            }
            return materialNode;
        }

        /**
         * Generate an animation node
         * @param animations
         * @returns {VORLON.PropertyTreeNodeHTMLElement}
         * @private
         */
        private _generateAnimationsNode(animations) : TreeNodeHTMLElement {
            var allAnimationsNode = new PropertyTreeNodeHTMLElement(this.dashboard, "animations", "");
            animations.forEach(anim => {
                var animNode = new AnimationTreeNodeHTMLElement(this.dashboard, anim.name, AnimTargetTypes.MESH, anim.stopped);
                {
                    var animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", anim.name);
                    animNode.addChild(animPropertyNode);

                    animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "target property", anim.targetProperty);
                    animNode.addChild(animPropertyNode);

                    animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "frame per second", anim.framePerSecond);
                    animNode.addChild(animPropertyNode);

                    animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "running", anim.stopped);
                    animNode.addChild(animPropertyNode);

                    animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "begin frame", anim.beginFrame);
                    animNode.addChild(animPropertyNode);

                    animPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "end frame", anim.endFrame);
                    animNode.addChild(animPropertyNode);
                }
                allAnimationsNode.addChild(animNode);
            });
            return allAnimationsNode;
        }

        /**
         * Generate the tree of meshes
         * @param meshesData
         * @param clientURL
         * @returns {VORLON.TypeTreeNodeHTMLElement}
         */
        generateMeshesTree(meshesData, clientURL) : TreeNodeHTMLElement {
            //Generate node containing all meshes
            var allMeshesNode = new TypeTreeNodeHTMLElement(this.dashboard, "Meshes", "mesh");

            // Generate one node for each mesh
            meshesData.forEach(meshData => {
                var meshNode = new MeshTreeNodeHTMLElement(this.dashboard, meshData.name, meshData.isVisible); {
                    // Generate one node for each property
                    var propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", meshData.name);
                    meshNode.addChild(propertyNode);

                    propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "position",
                        "(" + meshData.position.x + ", " + meshData.position.y + ", " + meshData.position.z + ")");
                    meshNode.addChild(propertyNode);

                    propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "rotation",
                        "(" + meshData.rotation.x + ", " + meshData.rotation.y + ", " + meshData.rotation.z + ")");
                    meshNode.addChild(propertyNode);

                    propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "scaling",
                        "(" + meshData.scaling.x + ", " + meshData.scaling.y + ", " + meshData.scaling.z + ")");
                    meshNode.addChild(propertyNode);

                    propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "bounding box center",
                        "(" + meshData.boundingBoxCenter.x + ", " + meshData.boundingBoxCenter.y + ", " + meshData.boundingBoxCenter.z + ")");
                    meshNode.addChild(propertyNode);

                    if(meshData.animations) {
                        propertyNode = this._generateAnimationsNode(meshData.animations);
                        meshNode.addChild(propertyNode);
                    }

                    if (meshData.material) {
                        propertyNode = this._generateMaterialNode(meshData.material, clientURL);
                        meshNode.addChild(propertyNode);
                    }

                    //TODO factorise avec plus haut
                    if (meshData.multiMaterial) {
                        propertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "multi material", "");
                        var subMaterialNode;
                        meshData.multiMaterial.subMaterials.forEach((subMaterialData, index) => {
                            subMaterialNode = this._generateMaterialNode(subMaterialData, clientURL);
                            propertyNode.addChild(subMaterialNode);
                        });
                        meshNode.addChild(propertyNode);
                    }

                }
                allMeshesNode.addChild(meshNode);
            });
            return allMeshesNode;
        }

        /**
         * Generate the tree of textures
         * @param texturesData
         * @param clientURL
         * @returns {VORLON.TreeNodeHTMLElement}
         */
        generateTexturesTree(texturesData, clientURL) : TreeNodeHTMLElement {
            var allTexturesNode = new TreeNodeHTMLElement(this.dashboard, "Textures");

            texturesData.forEach(txtrData => {
                var txtrNode = new TreeNodeHTMLElement(this.dashboard, txtrData.name);
                {
                    var texturePropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", txtrData.name);
                    txtrNode.addChild(texturePropertyNode);

                    texturePropertyNode = new TextureUrlPropertyTreeNodeHTMLElement(this.dashboard,
                        txtrData.url,
                        clientURL + txtrData.url);
                    txtrNode.addChild(texturePropertyNode);
                }

                allTexturesNode.addChild(txtrNode);
            });
            return allTexturesNode;
        }

        /**
         * Generate the tree of the active camera.
         * @param camData
         * @returns {VORLON.TypeTreeNodeHTMLElement}
         */
        generateActiveCameraNode(camData) : TreeNodeHTMLElement {
            var camNode = new TypeTreeNodeHTMLElement(this.dashboard, "Active camera", "camera");
            var camPropertyNode;

            camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", camData.name);
            camNode.addChild(camPropertyNode);

            camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "type", camData.type);
            camNode.addChild(camPropertyNode);

            camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "mode", camData.mode);
            camNode.addChild(camPropertyNode);

            camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "layer mask", camData.layerMask);
            camNode.addChild(camPropertyNode);

            camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "position",
                "(" + camData.position.x + ", " + camData.position.y + ", " + camData.position.z + ")");
            camNode.addChild(camPropertyNode);

            if (camData.type == 'FreeCamera') {
                camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "speed", camData.speed);
                camNode.addChild(camPropertyNode);

                camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "rotation",
                    "(" + camData.rotation.x + ", " + camData.rotation.y + ", " + camData.rotation.z + ")");
                camNode.addChild(camPropertyNode);
            }

            if (camData.type == 'ArcRotateCamera') {
                camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "alpha", camData.alpha);
                camNode.addChild(camPropertyNode);

                camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "beta", camData.beta);
                camNode.addChild(camPropertyNode);

                camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "radius", camData.radius);
                camNode.addChild(camPropertyNode);
            }

            if (camData.animations) {
                camPropertyNode = this._generateAnimationsNode(camData.animations);
                camNode.addChild(camPropertyNode);
            }

            return camNode;

        }

        /**
         * Generate the tree of cameras.
         * @param camerasData
         * @returns {VORLON.TypeTreeNodeHTMLElement}
         */
        generateCamerasTree(camerasData) : TreeNodeHTMLElement {
            var allCamerasNode = new TypeTreeNodeHTMLElement(this.dashboard, "Cameras", "camera");
            camerasData.forEach(camData => {
                var camNode = new TreeNodeHTMLElement(this.dashboard, camData.name); {
                    var camPropertyNode;

                    camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", camData.name);
                    camNode.addChild(camPropertyNode);

                    camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "type", camData.type);
                    camNode.addChild(camPropertyNode);

                    camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "mode", camData.mode);
                    camNode.addChild(camPropertyNode);

                    camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "layer mask", camData.layerMask);
                    camNode.addChild(camPropertyNode);

                    camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "position",
                        "(" + camData.position.x + ", " + camData.position.y + ", " + camData.position.z + ")");
                    camNode.addChild(camPropertyNode);

                    if (camData.type == 'FreeCamera') {
                        camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "speed", camData.speed);
                        camNode.addChild(camPropertyNode);

                        camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "rotation",
                            "(" + camData.rotation.x + ", " + camData.rotation.y + ", " + camData.rotation.z + ")");
                        camNode.addChild(camPropertyNode);
                    }

                    if (camData.type == 'ArcRotateCamera') {
                        camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "alpha", camData.alpha);
                        camNode.addChild(camPropertyNode);

                        camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "beta", camData.beta);
                        camNode.addChild(camPropertyNode);

                        camPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "radius", camData.radius);
                        camNode.addChild(camPropertyNode);
                    }

                    if (camData.animations) {
                        camPropertyNode = this._generateAnimationsNode(camData.animations);
                        camNode.addChild(camPropertyNode);
                    }
                }
                allCamerasNode.addChild(camNode);
            });
            return allCamerasNode;
        }

        /**
         * Generate the tree of lights.
         * @param lightsData
         * @returns {VORLON.TypeTreeNodeHTMLElement}
         */
        generateLightsTree(lightsData) : TreeNodeHTMLElement {
            var allLightsNode = new TypeTreeNodeHTMLElement(this.dashboard, "Lights", "light");
            lightsData.forEach(lightData => {
                var lightNode = new LightTreeNodeHTMLElement(this.dashboard, lightData.name, lightData.isEnabled); {
                    var lightPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "name", lightData.name);
                    lightNode.addChild(lightPropertyNode);

                    lightPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "type", lightData.type);
                    lightNode.addChild(lightPropertyNode);

                    if (lightData.type != "HemisphericLight") {
                        lightPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "position",
                            "(" + lightData.position.x + ", " + lightData.position.y + ", " + lightData.position.z + ")");
                        lightNode.addChild(lightPropertyNode);
                    }

                    lightPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "diffuse", lightData.diffuse);
                    lightNode.addChild(lightPropertyNode);

                    lightPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "specular", lightData.specular);
                    lightNode.addChild(lightPropertyNode);

                    lightPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "intensity", lightData.intensity);
                    lightNode.addChild(lightPropertyNode);

                    if (lightData.type == "HemisphericLight") {
                        lightPropertyNode = new PropertyTreeNodeHTMLElement(this.dashboard, "direction",
                            "(" + lightData.direction.x + ", " + lightData.direction.y + ", " + lightData.direction.z + ")");
                        lightNode.addChild(lightPropertyNode);

                        lightPropertyNode = new ColorPropertyTreeNodeHTMLElement(this.dashboard, "groundColor", lightData.groundColor);
                        lightNode.addChild(lightPropertyNode);
                    }
                }
                allLightsNode.addChild(lightNode);

            });
            return allLightsNode;
        }

        /**
         * Generate the tree of functions before render.
         * @param beforeRenderCallbacksData
         * @returns {VORLON.TreeNodeHTMLElement}
         */
        generateBeforeRenderCallbacksTree(beforeRenderCallbacksData) : TreeNodeHTMLElement {
            var allBeforeRenderCallBacksNode = new TreeNodeHTMLElement(this.dashboard, 'functions registered before render');
            beforeRenderCallbacksData.forEach((fct, index) => {
                var functionNode = new TreeNodeHTMLElement(this.dashboard, index); {
                    var propertyFunctionNode = new PropertyTreeNodeHTMLElement(this.dashboard, "body", fct.body);
                    functionNode.addChild(propertyFunctionNode);
                }
                allBeforeRenderCallBacksNode.addChild(functionNode);
            });
            return allBeforeRenderCallBacksNode;
        }

        /**
         * Generate the tree of functions after render.
         * @param afterRenderCallbacksData
         * @returns {VORLON.TreeNodeHTMLElement}
         */
        generateAfterRenderCallbacksTree(afterRenderCallbacksData) : TreeNodeHTMLElement {
            var allAfterRenderCallBacksNode = new TreeNodeHTMLElement(this.dashboard, 'functions registered after render');
            afterRenderCallbacksData.forEach((fct, index) => {
                var functionNode = new TreeNodeHTMLElement(this.dashboard, index); {
                    var propertyFunctionNode = new PropertyTreeNodeHTMLElement(this.dashboard, "body", fct.body);
                    functionNode.addChild(propertyFunctionNode);
                }
                allAfterRenderCallBacksNode.addChild(functionNode);
            });
            return allAfterRenderCallBacksNode;
        }

        /**
         * Generate tree containging all data.
         * Extra curly brackets {} are added in order to render tree view in code.
         * @param scenesData
         * @returns {VORLON.TreeNodeHTMLElement}
         */
        public generateScenesTree(scenesData, clientURL) : TreeNodeHTMLElement {
            //Tree root
            var treeRoot = new TreeNodeHTMLElement(this.dashboard, "Scenes explorer");
            //Generate scene nodes
            scenesData.forEach((scene, index) => {

                var sceneNode = new SceneTreeNodeHTMLElement(this.dashboard, index);{

                    if(scene.activeCameraData) {
                        var activeCameraNode = this.generateActiveCameraNode(scene.activeCameraData);
                        sceneNode.addChild(activeCameraNode);
                    }

                    if(scene.meshesData) {
                        var allMeshesNode = this.generateMeshesTree(scene.meshesData, clientURL);
                        sceneNode.addChild(allMeshesNode);
                    }

                    if(scene.texturesData) {
                        var allTexturesNode = this.generateTexturesTree(scene.texturesData, clientURL);
                        sceneNode.addChild(allTexturesNode);
                    }

                    if(scene.camerasData) {
                        var allCamerasNode = this.generateCamerasTree(scene.camerasData);
                        sceneNode.addChild(allCamerasNode);
                    }

                   if (scene.lightsData) {
                       var allLightsNode = this.generateLightsTree(scene.lightsData);
                       sceneNode.addChild(allLightsNode);
                   }

                   if (scene.beforeRenderCallbacksData) {
                       var allBeforeRenderCallbacksNode = this.generateBeforeRenderCallbacksTree(scene.beforeRenderCallbacksData);
                       sceneNode.addChild(allBeforeRenderCallbacksNode);
                   }

                    if (scene.afterRenderCallbacksData) {
                        var allAfterRenderCallbacksNode = this.generateAfterRenderCallbacksTree(scene.afterRenderCallbacksData);
                        sceneNode.addChild(allAfterRenderCallbacksNode);
                    }

                }
                treeRoot.addChild(sceneNode)
            });
            return treeRoot;
        }
    }

    export class BabylonInspectorDashboard extends DashboardPlugin {

        private id : string;
        private _dataTreeGenerator : DataTreeGenerator;
        private treeRoot : TreeNodeHTMLElement;
        private _containerDiv : HTMLElement;
        displayer : HTMLElement


        /**
         * Do any setup you need, call super to configure
         * the plugin with html and css for the dashboarde
         */
        constructor() {
            //     name   ,  html for dash   css for dash
            super("babylonInspector", "control.html", "control.css");
            this._ready = false;
            this.id = 'BABYLONINSPECTOR';
            this._dataTreeGenerator = new DataTreeGenerator(this);
            this.treeRoot = null;
        }

        /**
         * Return unique id for your plugin
         */
        public getID():string {
            return this.id;
        }

        /**
         * When we get a message from the client, handle it
         */
        public onRealtimeMessageReceivedFromClientSide(receivedObject:any):void {
            switch (receivedObject.messageType) {
                case 'SCENES_DATA' :
                    var scenesData = receivedObject.data;
                    this._refreshTree(scenesData, receivedObject.clientURL);
                    break;
                default :
                    break;
            }
        }

        /**
         * Send a query to client of type queryType containing some data.
         * @param queryType
         * @param data
         */
        public queryToClient(queryType : QueryTypes, data : any) {
            var message = {
                queryType: queryType,
                data: data
            };
            this.sendToClient(message);
        }


        /**
         * This code will run on the dashboard
         * Start dashboard code
         * uses _insertHtmlContentAsync to insert the control.html content
         * into the dashboard
         * @param div
         */
        public startDashboardSide(div:HTMLDivElement = null):void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = filledDiv;
                this.displayer = <HTMLElement> this._containerDiv.querySelector("#babylonInspector-displayer");
                this._ready = true;
            });

        }

        //TOOLS

        /**
         * Refresh tree.
         * @param scenesData
         * @private
         */
        private _refreshTree(scenesData, clientURL) {
            this.treeRoot = this._dataTreeGenerator.generateScenesTree(scenesData, clientURL);
            this.treeRoot.unhide();
            this.treeRoot.unfold();
            this._containerDiv.appendChild(this.treeRoot.wrapper);
        }

    }

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new BabylonInspectorDashboard());
}
