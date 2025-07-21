// src/lib/constants.ts
import type { Action, BodyPart } from "./types";

export const defaultBodyParts: BodyPart[] = [
    { id: 'bp1', name: 'bodyParts.rightHand', icon: 'Hand' },
    { id: 'bp2', name: 'bodyParts.leftHand', icon: 'Hand' },
    { id: 'bp3', name: 'bodyParts.rightFoot', icon: 'Footprints' },
    { id: 'bp4', name: 'bodyParts.leftFoot', icon: 'Footprints' },
    { id: 'bp5', name: 'bodyParts.mouth', icon: 'Smile' },
    { id: 'bp6', name: 'bodyParts.chest', icon: 'Heart' },
    { id: 'bp7', name: 'bodyParts.buttocks', icon: 'Circle' },
];

export const gameActions: Action[] = [
    { id: 'act1', name: 'action.use', icon: 'MousePointer', requiresBodyPart: true, requiresTarget: true },
    { id: 'act2', name: 'action.take', icon: 'Grab', requiresBodyPart: true, requiresTarget: true },
    { id: 'act3', name: 'action.look', icon: 'Eye', requiresBodyPart: false, requiresTarget: true },
    { id: 'act4', name: 'action.go', icon: 'PersonStanding', requiresBodyPart: false, requiresTarget: true },
    { id: 'act5', name: 'action.talk', icon: 'MessageCircle', requiresBodyPart: false, requiresTarget: true },
    { id: 'act6', name: 'action.attack', icon: 'Swords', requiresBodyPart: true, requiresTarget: true },
];
