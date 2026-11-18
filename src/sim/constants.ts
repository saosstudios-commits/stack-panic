export const WORLD_WIDTH = 32;
export const WORLD_HEIGHT = 18;
export const FIXED_DT = 1 / 60;

// Camera framing (Level Devil side-view with slight 3D diorama tilt)
export const CAMERA_PITCH_DEG = 7.5;
export const CAMERA_YAW_DEG = 4.0;
export const CAMERA_DISTANCE = 36;

// Worker collider & movement feel
export const PLAYER_W = 0.72;
export const PLAYER_H = 1.15;
export const MAX_SPEED = 7.8;
export const GROUND_ACCEL = 58.0;
export const GROUND_DECEL = 68.0;
export const AIR_ACCEL = 38.0;
export const AIR_DECEL = 18.0;

export const JUMP_VEL = 13.4;
export const GRAVITY = 34.0;
export const APEX_GRAVITY_MULT = 0.65;
export const APEX_VY_THRESHOLD = 2.0;
export const JUMP_CUT_MULT = 0.48;
export const MAX_FALL_SPEED = 20.0;
export const COYOTE_TIME = 0.10;
export const JUMP_BUFFER = 0.09;

// Carried stack physics (spring-damped chain)
export const STACK_ANCHOR_X = 0.50;
export const STACK_ANCHOR_Y = 0.62;
export const CONTAINER_W = 0.56;
export const CONTAINER_H = 0.34;
export const STACK_STIFFNESS = 230.0;
export const STACK_DAMPING = 17.5;
export const STACK_INERTIA = 0.28;
export const STACK_FLIP_WHIP = 1.45;
export const TIP_BASE = 1.05;
export const TIP_PER_BOX = 0.16;
export const DANGER_RATIO = 0.64;

// Failure & respawn (< 600ms)
export const SLOW_MO_DURATION = 0.18;
export const SLOW_MO_SCALE = 0.28;
export const RESPAWN_DELAY = 0.52;
