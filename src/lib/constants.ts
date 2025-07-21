// src/lib/constants.ts
import type { Action, BodyPart } from "./types";

export const defaultBodyParts: BodyPart[] = [
    { id: 'bp_head', name: 'bodyParts.head', icon: 'User', category: 'Head', equippedItem: null },
    { id: 'bp_torso', name: 'bodyParts.torso', icon: 'Shirt', category: 'Torso', equippedItem: null },
    { id: 'bp_overtop', name: 'bodyParts.overtop', icon: 'Wind', category: 'Overtop', equippedItem: null },
    { id: 'bp_legs', name: 'bodyParts.legs', icon: 'PersonStanding', category: 'Legs', equippedItem: null },
    { id: 'bp_underwear', name: 'bodyParts.underwear', icon: 'Heart', category: 'Underwear', equippedItem: null },
    { id: 'bp_left_foot', name: 'bodyParts.leftFoot', icon: 'Footprints', category: 'Feet', equippedItem: null },
    { id: 'bp_right_foot', name: 'bodyParts.rightFoot', icon: 'Footprints', category: 'Feet', equippedItem: null },
    { id: 'bp_left_hand', name: 'bodyParts.leftHand', icon: 'Hand', category: 'Hand', equippedItem: null },
    { id: 'bp_right_hand', name: 'bodyParts.rightHand', icon: 'Hand', category: 'Hand', equippedItem: null },
];

export const gameActions: Action[] = [
    { id: 'act1', name: 'action.use', icon: 'MousePointer', requiresBodyPart: true, requiresTarget: true },
    { id: 'act2', name: 'action.take', icon: 'Grab', requiresBodyPart: true, requiresTarget: true },
    { id: 'act3', name: 'action.look', icon: 'Eye', requiresBodyPart: false, requiresTarget: true },
    { id: 'act4', name: 'action.go', icon: 'PersonStanding', requiresBodyPart: false, requiresTarget: true },
    { id: 'act5', name: 'action.talk', icon: 'MessageCircle', requiresBodyPart: false, requiresTarget: true },
    { id: 'act6', name: 'action.attack', icon: 'Swords', requiresBodyPart: true, requiresTarget: true },
];
