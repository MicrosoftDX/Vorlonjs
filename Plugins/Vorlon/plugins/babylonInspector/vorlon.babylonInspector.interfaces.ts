module VORLON {
    export enum QueryTypes {SPOT_MESH, UNSPOT_MESH, START_ANIM, PAUSE_ANIM, UNPAUSE_ANIM, STOP_ANIM,
            TURN_ON_LIGHT, TURN_OFF_LIGHT, HIDE_MESH, DISPLAY_MESH, DISPLAY_MESH_GIZMO, HIDE_MESH_GIZMO};
    export enum AnimTargetTypes {MESH, MATERIAL, CAMERA, LIGHT, SKELETTON};
    export interface Message {
        type: string;
        data: any;
    }
}