import {live} from "../live/live";
import Env = live.Env;
import {message} from "../message/messenger";
import Messenger = message.Messenger;

declare let autowatch: any;
declare function post(message?: any): void;
declare let Global: any;

let env: Env = Env.MAX;

if (env === Env.MAX) {
    post('recompile successful');
    autowatch = 1;
}

let messenger = new Messenger(Env.MAX, 0);

let scaleTypeCurrent, indexScaleCurrent, indexPitchCurrent;

let seconds = [
    [43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77],
    [43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76],
    [43, 45, 47, 49, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73, 74, 76],
    [44, 45, 47, 49, 50, 52, 54, 56, 57, 59, 61, 62, 64, 66, 68, 69, 71, 73, 74, 76],
    [44, 45, 47, 49, 51, 52, 54, 56, 57, 59, 61, 63, 64, 66, 68, 69, 71, 73, 75, 76],
    [44, 46, 47, 49, 51, 52, 54, 56, 58, 59, 61, 63, 64, 66, 68, 70, 71, 73, 75, 76],
    [44, 46, 47, 49, 51, 53, 54, 56, 58, 59, 61, 63, 65, 66, 68, 70, 71, 73, 75, 77],
    [44, 46, 48, 49, 51, 53, 54, 56, 58, 60, 61, 63, 65, 66, 68, 70, 72, 73, 75, 77],
    [43, 44, 46, 48, 49, 51, 53, 55, 56, 58, 60, 61, 63, 65, 67, 68, 70, 72, 73, 75, 77],
    [43, 44, 46, 48, 50, 51, 53, 55, 56, 58, 60, 62, 63, 65, 67, 68, 70, 72, 74, 75, 77],
    [43, 45, 46, 48, 50, 51, 53, 55, 57, 58, 60, 62, 63, 65, 67, 69, 70, 72, 74, 75, 77],
    [43, 45, 46, 48, 50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77],
];

let thirds_rise = [
    [43, 47, 45, 48, 47, 50, 48, 52, 50, 53, 52, 55, 53, 57, 55, 59, 57, 60, 59, 62, 60, 64, 62, 65, 64, 67, 65, 69, 67, 71, 69, 72, 71, 74, 72, 76, 74, 77],
    [43, 47, 45, 48, 47, 50, 48, 52, 50, 54, 52, 55, 54, 57, 55, 59, 57, 60, 59, 62, 60, 64, 62, 66, 64, 67, 66, 69, 67, 71, 69, 72, 71, 74, 72, 76],
    [43, 47, 45, 49, 47, 50, 49, 52, 50, 54, 52, 55, 54, 57, 55, 59, 57, 61, 59, 62, 61, 64, 62, 66, 64, 67, 66, 69, 67, 71, 69, 73, 71, 74, 73, 76],
    [44, 47, 45, 49, 47, 50, 49, 52, 50, 54, 52, 56, 54, 57, 56, 59, 57, 61, 59, 62, 61, 64, 62, 66, 64, 68, 66, 69, 68, 71, 69, 73, 71, 74, 73, 76],
    [44, 47, 45, 49, 47, 51, 49, 52, 51, 54, 52, 56, 54, 57, 56, 59, 57, 61, 59, 63, 61, 64, 63, 66, 64, 68, 66, 69, 68, 71, 69, 73, 71, 75, 73, 76],
    [44, 47, 46, 49, 47, 51, 49, 52, 51, 54, 52, 56, 54, 58, 56, 59, 58, 61, 59, 63, 61, 64, 63, 66, 64, 68, 66, 70, 68, 71, 70, 73, 71, 75, 73, 76],
    [44, 47, 46, 49, 47, 51, 49, 53, 51, 54, 53, 56, 54, 58, 56, 59, 58, 61, 59, 63, 61, 65, 63, 66, 65, 68, 66, 70, 68, 71, 70, 73, 71, 75, 73, 77],
    [44, 48, 46, 49, 48, 51, 49, 53, 51, 54, 53, 56, 54, 58, 56, 60, 58, 61, 60, 63, 61, 65, 63, 66, 65, 68, 66, 70, 68, 72, 70, 73, 72, 75, 73, 77],
    [43, 46, 44, 48, 46, 49, 48, 51, 49, 53, 51, 55, 53, 56, 55, 58, 56, 60, 58, 61, 60, 63, 61, 65, 63, 67, 65, 68, 67, 70, 68, 72, 70, 73, 72, 75, 73, 77],
    [43, 46, 44, 48, 46, 50, 48, 51, 50, 53, 51, 55, 53, 56, 55, 58, 56, 60, 58, 62, 60, 63, 62, 65, 63, 67, 65, 68, 67, 70, 68, 72, 70, 74, 72, 75, 74, 77],
    [43, 46, 45, 48, 46, 50, 48, 51, 50, 53, 51, 55, 53, 57, 55, 58, 57, 60, 58, 62, 60, 63, 62, 65, 63, 67, 65, 69, 67, 70, 69, 72, 70, 74, 72, 75, 74, 77],
    [43, 46, 45, 48, 46, 50, 48, 52, 50, 53, 52, 55, 53, 57, 55, 58, 57, 60, 58, 62, 60, 64, 62, 65, 64, 67, 65, 69, 67, 70, 69, 72, 70, 74, 72, 76, 74, 77],
];

let thirds_fall = [
    [47, 43, 48, 45, 50, 47, 52, 48, 53, 50, 55, 52, 57, 53, 59, 55, 60, 57, 62, 59, 64, 60, 65, 62, 67, 64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77, 74],
    [47, 43, 48, 45, 50, 47, 52, 48, 54, 50, 55, 52, 57, 54, 59, 55, 60, 57, 62, 59, 64, 60, 66, 62, 67, 64, 69, 66, 71, 67, 72, 69, 74, 71, 76, 72],
    [47, 43, 49, 45, 50, 47, 52, 49, 54, 50, 55, 52, 57, 54, 59, 55, 61, 57, 62, 59, 64, 61, 66, 62, 67, 64, 69, 66, 71, 67, 73, 69, 74, 71, 76, 73],
    [47, 44, 49, 45, 50, 47, 52, 49, 54, 50, 56, 52, 57, 54, 59, 56, 61, 57, 62, 59, 64, 61, 66, 62, 68, 64, 69, 66, 71, 68, 73, 69, 74, 71, 76, 73],
    [47, 44, 49, 45, 51, 47, 52, 49, 54, 51, 56, 52, 57, 54, 59, 56, 61, 57, 63, 59, 64, 61, 66, 63, 68, 64, 69, 66, 71, 68, 73, 69, 75, 71, 76, 73],
    [47, 44, 49, 46, 51, 47, 52, 49, 54, 51, 56, 52, 58, 54, 59, 56, 61, 58, 63, 59, 64, 61, 66, 63, 68, 64, 70, 66, 71, 68, 73, 70, 75, 71, 76, 73],
    [47, 44, 49, 46, 51, 47, 53, 49, 54, 51, 56, 53, 58, 54, 59, 56, 61, 58, 63, 59, 65, 61, 66, 63, 68, 65, 70, 66, 71, 68, 73, 70, 75, 71, 77, 73],
    [48, 44, 49, 46, 51, 48, 53, 49, 54, 51, 56, 53, 58, 54, 60, 56, 61, 58, 63, 60, 65, 61, 66, 63, 68, 65, 70, 66, 72, 68, 73, 70, 75, 72, 77, 73],
    [46, 43, 48, 44, 49, 46, 51, 48, 53, 49, 55, 51, 56, 53, 58, 55, 60, 56, 61, 58, 63, 60, 65, 61, 67, 63, 68, 65, 70, 67, 72, 68, 73, 70, 75, 72, 77, 73],
    [46, 43, 48, 44, 50, 46, 51, 48, 53, 50, 55, 51, 56, 53, 58, 55, 60, 56, 62, 58, 63, 60, 65, 62, 67, 63, 68, 65, 70, 67, 72, 68, 74, 70, 75, 72, 77, 74],
    [46, 43, 48, 45, 50, 46, 51, 48, 53, 50, 55, 51, 57, 53, 58, 55, 60, 57, 62, 58, 63, 60, 65, 62, 67, 63, 69, 65, 70, 67, 72, 69, 74, 70, 75, 72, 77, 74],
    [46, 43, 48, 45, 50, 46, 52, 48, 53, 50, 55, 52, 57, 53, 58, 55, 60, 57, 62, 58, 64, 60, 65, 62, 67, 64, 69, 65, 70, 67, 72, 69, 74, 70, 76, 72, 77, 74],
    [47, 43, 48, 45, 50, 47, 52, 48, 53, 50, 55, 52, 57, 53, 59, 55, 60, 57, 62, 59, 64, 60, 65, 62, 67, 64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77, 74],
];

let fourths_rise = [
    [43, 48, 45, 50, 47, 52, 48, 53, 50, 55, 52, 57, 53, 59, 55, 60, 57, 62, 59, 64, 60, 65, 62, 67, 64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77],
    [43, 48, 45, 50, 47, 52, 48, 54, 50, 55, 52, 57, 54, 59, 55, 60, 57, 62, 59, 64, 60, 66, 62, 67, 64, 69, 66, 71, 67, 72, 69, 74, 71, 76],
    [43, 49, 45, 50, 47, 52, 49, 54, 50, 55, 52, 57, 54, 59, 55, 61, 57, 62, 59, 64, 61, 66, 62, 67, 64, 69, 66, 71, 67, 73, 69, 74, 71, 76],
    [44, 49, 45, 50, 47, 52, 49, 54, 50, 56, 52, 57, 54, 59, 56, 61, 57, 62, 59, 64, 61, 66, 62, 68, 64, 69, 66, 71, 68, 73, 69, 74, 71, 76],
    [44, 49, 45, 51, 47, 52, 49, 54, 51, 56, 52, 57, 54, 59, 56, 61, 57, 63, 59, 64, 61, 66, 63, 68, 64, 69, 66, 71, 68, 73, 69, 75, 71, 76],
    [44, 49, 46, 51, 47, 52, 49, 54, 51, 56, 52, 58, 54, 59, 56, 61, 58, 63, 59, 64, 61, 66, 63, 68, 64, 70, 66, 71, 68, 73, 70, 75, 71, 76],
    [44, 49, 46, 51, 47, 53, 49, 54, 51, 56, 53, 58, 54, 59, 56, 61, 58, 63, 59, 65, 61, 66, 63, 68, 65, 70, 66, 71, 68, 73, 70, 75, 71, 77],
    [44, 49, 46, 51, 48, 53, 49, 54, 51, 56, 53, 58, 54, 60, 56, 61, 58, 63, 60, 65, 61, 66, 63, 68, 65, 70, 66, 72, 68, 73, 70, 75, 72, 77],
    [43, 48, 44, 49, 46, 51, 48, 53, 49, 55, 51, 56, 53, 58, 55, 60, 56, 61, 58, 63, 60, 65, 61, 67, 63, 68, 65, 70, 67, 72, 68, 73, 70, 75, 72, 77],
    [43, 48, 44, 50, 46, 51, 48, 53, 50, 55, 51, 56, 53, 58, 55, 60, 56, 62, 58, 63, 60, 65, 62, 67, 63, 68, 65, 70, 67, 72, 68, 74, 70, 75, 72, 77],
    [43, 48, 45, 50, 46, 51, 48, 53, 50, 55, 51, 57, 53, 58, 55, 60, 57, 62, 58, 63, 60, 65, 62, 67, 63, 69, 65, 70, 67, 72, 69, 74, 70, 75, 72, 77],
    [43, 48, 45, 50, 46, 52, 48, 53, 50, 55, 52, 57, 53, 58, 55, 60, 57, 62, 58, 64, 60, 65, 62, 67, 64, 69, 65, 70, 67, 72, 69, 74, 70, 76, 72, 77],
];

let fourths_fall = [
    [48, 43, 50, 45, 52, 47, 53, 48, 55, 50, 57, 52, 59, 53, 60, 55, 62, 57, 64, 59, 65, 60, 67, 62, 69, 64, 71, 65, 72, 67, 74, 69, 76, 71, 77, 72],
    [48, 43, 50, 45, 52, 47, 54, 48, 55, 50, 57, 52, 59, 54, 60, 55, 62, 57, 64, 59, 66, 60, 67, 62, 69, 64, 71, 66, 72, 67, 74, 69, 76, 71],
    [49, 43, 50, 45, 52, 47, 54, 49, 55, 50, 57, 52, 59, 54, 61, 55, 62, 57, 64, 59, 66, 61, 67, 62, 69, 64, 71, 66, 73, 67, 74, 69, 76, 71],
    [49, 44, 50, 45, 52, 47, 54, 49, 56, 50, 57, 52, 59, 54, 61, 56, 62, 57, 64, 59, 66, 61, 68, 62, 69, 64, 71, 66, 73, 68, 74, 69, 76, 71],
    [49, 44, 51, 45, 52, 47, 54, 49, 56, 51, 57, 52, 59, 54, 61, 56, 63, 57, 64, 59, 66, 61, 68, 63, 69, 64, 71, 66, 73, 68, 75, 69, 76, 71],
    [49, 44, 51, 46, 52, 47, 54, 49, 56, 51, 58, 52, 59, 54, 61, 56, 63, 58, 64, 59, 66, 61, 68, 63, 70, 64, 71, 66, 73, 68, 75, 70, 76, 71],
    [49, 44, 51, 46, 53, 47, 54, 49, 56, 51, 58, 53, 59, 54, 61, 56, 63, 58, 65, 59, 66, 61, 68, 63, 70, 65, 71, 66, 73, 68, 75, 70, 77, 71],
    [49, 44, 51, 46, 53, 48, 54, 49, 56, 51, 58, 53, 60, 54, 61, 56, 63, 58, 65, 60, 66, 61, 68, 63, 70, 65, 72, 66, 73, 68, 75, 70, 77, 72],
    [48, 43, 49, 44, 51, 46, 53, 48, 55, 49, 56, 51, 58, 53, 60, 55, 61, 56, 63, 58, 65, 60, 67, 61, 68, 63, 70, 65, 72, 67, 73, 68, 75, 70, 77, 72],
    [48, 43, 50, 44, 51, 46, 53, 48, 55, 50, 56, 51, 58, 53, 60, 55, 62, 56, 63, 58, 65, 60, 67, 62, 68, 63, 70, 65, 72, 67, 74, 68, 75, 70, 77, 72],
    [48, 43, 50, 45, 51, 46, 53, 48, 55, 50, 57, 51, 58, 53, 60, 55, 62, 57, 63, 58, 65, 60, 67, 62, 69, 63, 70, 65, 72, 67, 74, 69, 75, 70, 77, 72],
    [48, 43, 50, 45, 52, 46, 53, 48, 55, 50, 57, 52, 58, 53, 60, 55, 62, 57, 64, 58, 65, 60, 67, 62, 69, 64, 70, 65, 72, 67, 74, 69, 76, 70, 77, 72],
    [48, 43, 50, 45, 52, 47, 53, 48, 55, 50, 57, 52, 59, 53, 60, 55, 62, 57, 64, 59, 65, 60, 67, 62, 69, 64, 71, 65, 72, 67, 74, 69, 76, 71, 77, 72],
];

let fifths_rise = [
    [43, 50, 45, 52, 47, 53, 48, 55, 50, 57, 52, 59, 53, 60, 55, 62, 57, 64, 59, 65, 60, 67, 62, 69, 64, 71, 65, 72, 67, 74, 69, 76, 71, 77],
    [43, 50, 45, 52, 47, 54, 48, 55, 50, 57, 52, 59, 54, 60, 55, 62, 57, 64, 59, 66, 60, 67, 62, 69, 64, 71, 66, 72, 67, 74, 69, 76],
    [43, 50, 45, 52, 47, 54, 49, 55, 50, 57, 52, 59, 54, 61, 55, 62, 57, 64, 59, 66, 61, 67, 62, 69, 64, 71, 66, 73, 67, 74, 69, 76],
    [44, 50, 45, 52, 47, 54, 49, 56, 50, 57, 52, 59, 54, 61, 56, 62, 57, 64, 59, 66, 61, 68, 62, 69, 64, 71, 66, 73, 68, 74, 69, 76],
    [44, 51, 45, 52, 47, 54, 49, 56, 51, 57, 52, 59, 54, 61, 56, 63, 57, 64, 59, 66, 61, 68, 63, 69, 64, 71, 66, 73, 68, 75, 69, 76],
    [44, 51, 46, 52, 47, 54, 49, 56, 51, 58, 52, 59, 54, 61, 56, 63, 58, 64, 59, 66, 61, 68, 63, 70, 64, 71, 66, 73, 68, 75, 70, 76],
    [44, 51, 46, 53, 47, 54, 49, 56, 51, 58, 53, 59, 54, 61, 56, 63, 58, 65, 59, 66, 61, 68, 63, 70, 65, 71, 66, 73, 68, 75, 70, 77],
    [44, 51, 46, 53, 48, 54, 49, 56, 51, 58, 53, 60, 54, 61, 56, 63, 58, 65, 60, 66, 61, 68, 63, 70, 65, 72, 66, 73, 68, 75, 70, 77],
    [43, 49, 44, 51, 46, 53, 48, 55, 49, 56, 51, 58, 53, 60, 55, 61, 56, 63, 58, 65, 60, 67, 61, 68, 63, 70, 65, 72, 67, 73, 68, 75, 70, 77],
    [43, 50, 44, 51, 46, 53, 48, 55, 50, 56, 51, 58, 53, 60, 55, 62, 56, 63, 58, 65, 60, 67, 62, 68, 63, 70, 65, 72, 67, 74, 68, 75, 70, 77],
    [43, 50, 45, 51, 46, 53, 48, 55, 50, 57, 51, 58, 53, 60, 55, 62, 57, 63, 58, 65, 60, 67, 62, 69, 63, 70, 65, 72, 67, 74, 69, 75, 70, 77],
    [43, 50, 45, 52, 46, 53, 48, 55, 50, 57, 52, 58, 53, 60, 55, 62, 57, 64, 58, 65, 60, 67, 62, 69, 64, 70, 65, 72, 67, 74, 69, 76, 70, 77],
    [43, 50, 45, 52, 47, 53, 48, 55, 50, 57, 52, 59, 53, 60, 55, 62, 57, 64, 59, 65, 60, 67, 62, 69, 64, 71, 65, 72, 67, 74, 69, 76, 71, 77],
];

let fifths_fall = [
    [50, 43, 52, 45, 53, 47, 55, 48, 57, 50, 59, 52, 60, 53, 62, 55, 64, 57, 65, 59, 67, 60, 69, 62, 71, 64, 72, 65, 74, 67, 76, 69, 77, 71],
    [50, 43, 52, 45, 54, 47, 55, 48, 57, 50, 59, 52, 60, 54, 62, 55, 64, 57, 66, 59, 67, 60, 69, 62, 71, 64, 72, 66, 74, 67, 76, 69],
    [50, 43, 52, 45, 54, 47, 55, 49, 57, 50, 59, 52, 61, 54, 62, 55, 64, 57, 66, 59, 67, 61, 69, 62, 71, 64, 73, 66, 74, 67, 76, 69],
    [50, 44, 52, 45, 54, 47, 56, 49, 57, 50, 59, 52, 61, 54, 62, 56, 64, 57, 66, 59, 68, 61, 69, 62, 71, 64, 73, 66, 74, 68, 76, 69],
    [51, 44, 52, 45, 54, 47, 56, 49, 57, 51, 59, 52, 61, 54, 63, 56, 64, 57, 66, 59, 68, 61, 69, 63, 71, 64, 73, 66, 75, 68, 76, 69],
    [51, 44, 52, 46, 54, 47, 56, 49, 58, 51, 59, 52, 61, 54, 63, 56, 64, 58, 66, 59, 68, 61, 70, 63, 71, 64, 73, 66, 75, 68, 76, 70],
    [51, 44, 53, 46, 54, 47, 56, 49, 58, 51, 59, 53, 61, 54, 63, 56, 65, 58, 66, 59, 68, 61, 70, 63, 71, 65, 73, 66, 75, 68, 77, 70],
    [51, 44, 53, 46, 54, 48, 56, 49, 58, 51, 60, 53, 61, 54, 63, 56, 65, 58, 66, 60, 68, 61, 70, 63, 72, 65, 73, 66, 75, 68, 77, 70],
    [49, 43, 51, 44, 53, 46, 55, 48, 56, 49, 58, 51, 60, 53, 61, 55, 63, 56, 65, 58, 67, 60, 68, 61, 70, 63, 72, 65, 73, 67, 75, 68, 77, 70],
    [50, 43, 51, 44, 53, 46, 55, 48, 56, 50, 58, 51, 60, 53, 62, 55, 63, 56, 65, 58, 67, 60, 68, 62, 70, 63, 72, 65, 74, 67, 75, 68, 77, 70],
    [50, 43, 51, 45, 53, 46, 55, 48, 57, 50, 58, 51, 60, 53, 62, 55, 63, 57, 65, 58, 67, 60, 69, 62, 70, 63, 72, 65, 74, 67, 75, 69, 77, 70],
    [50, 43, 52, 45, 53, 46, 55, 48, 57, 50, 58, 52, 60, 53, 62, 55, 64, 57, 65, 58, 67, 60, 69, 62, 70, 64, 72, 65, 74, 67, 76, 69, 77, 70],
    [50, 43, 52, 45, 53, 47, 55, 48, 57, 50, 59, 52, 60, 53, 62, 55, 64, 57, 65, 59, 67, 60, 69, 62, 71, 64, 72, 65, 74, 67, 76, 69, 77, 71],
];

let triads_rise_and_fall = [
    [47, 50, 43, 48, 52, 45, 50, 53, 47, 52, 55, 48, 53, 57, 50, 55, 59, 52, 57, 60, 53, 59, 62, 55, 60, 64, 57, 62, 65, 59, 64, 67, 60, 65, 69, 62, 67, 71, 64, 69, 72, 65, 71, 74, 67, 72, 76, 69, 74, 77, 71],
    [47, 50, 43, 48, 52, 45, 50, 54, 47, 52, 55, 48, 54, 57, 50, 55, 59, 52, 57, 60, 54, 59, 62, 55, 60, 64, 57, 62, 66, 59, 64, 67, 60, 66, 69, 62, 67, 71, 64, 69, 72, 66, 71, 74, 67, 72, 76, 69],
    [47, 50, 43, 49, 52, 45, 50, 54, 47, 52, 55, 49, 54, 57, 50, 55, 59, 52, 57, 61, 54, 59, 62, 55, 61, 64, 57, 62, 66, 59, 64, 67, 61, 66, 69, 62, 67, 71, 64, 69, 73, 66, 71, 74, 67, 73, 76, 69],
    [47, 50, 44, 49, 52, 45, 50, 54, 47, 52, 56, 49, 54, 57, 50, 56, 59, 52, 57, 61, 54, 59, 62, 56, 61, 64, 57, 62, 66, 59, 64, 68, 61, 66, 69, 62, 68, 71, 64, 69, 73, 66, 71, 74, 68, 73, 76, 69],
    [47, 51, 44, 49, 52, 45, 51, 54, 47, 52, 56, 49, 54, 57, 51, 56, 59, 52, 57, 61, 54, 59, 63, 56, 61, 64, 57, 63, 66, 59, 64, 68, 61, 66, 69, 63, 68, 71, 64, 69, 73, 66, 71, 75, 68, 73, 76, 69],
    [47, 51, 44, 49, 52, 46, 51, 54, 47, 52, 56, 49, 54, 58, 51, 56, 59, 52, 58, 61, 54, 59, 63, 56, 61, 64, 58, 63, 66, 59, 64, 68, 61, 66, 70, 63, 68, 71, 64, 70, 73, 66, 71, 75, 68, 73, 76, 70],
    [47, 51, 44, 49, 53, 46, 51, 54, 47, 53, 56, 49, 54, 58, 51, 56, 59, 53, 58, 61, 54, 59, 63, 56, 61, 65, 58, 63, 66, 59, 65, 68, 61, 66, 70, 63, 68, 71, 65, 70, 73, 66, 71, 75, 68, 73, 77, 70],
    [48, 51, 44, 49, 53, 46, 51, 54, 48, 53, 56, 49, 54, 58, 51, 56, 60, 53, 58, 61, 54, 60, 63, 56, 61, 65, 58, 63, 66, 60, 65, 68, 61, 66, 70, 63, 68, 72, 65, 70, 73, 66, 72, 75, 68, 73, 77, 70],
    [46, 49, 43, 48, 51, 44, 49, 53, 46, 51, 55, 48, 53, 56, 49, 55, 58, 51, 56, 60, 53, 58, 61, 55, 60, 63, 56, 61, 65, 58, 63, 67, 60, 65, 68, 61, 67, 70, 63, 68, 72, 65, 70, 73, 67, 72, 75, 68, 73, 77, 70],
    [46, 50, 43, 48, 51, 44, 50, 53, 46, 51, 55, 48, 53, 56, 50, 55, 58, 51, 56, 60, 53, 58, 62, 55, 60, 63, 56, 62, 65, 58, 63, 67, 60, 65, 68, 62, 67, 70, 63, 68, 72, 65, 70, 74, 67, 72, 75, 68, 74, 77, 70],
    [46, 50, 43, 48, 51, 45, 50, 53, 46, 51, 55, 48, 53, 57, 50, 55, 58, 51, 57, 60, 53, 58, 62, 55, 60, 63, 57, 62, 65, 58, 63, 67, 60, 65, 69, 62, 67, 70, 63, 69, 72, 65, 70, 74, 67, 72, 75, 69, 74, 77, 70],
    [46, 50, 43, 48, 52, 45, 50, 53, 46, 52, 55, 48, 53, 57, 50, 55, 58, 52, 57, 60, 53, 58, 62, 55, 60, 64, 57, 62, 65, 58, 64, 67, 60, 65, 69, 62, 67, 70, 64, 69, 72, 65, 70, 74, 67, 72, 76, 69, 74, 77, 70],
    [47, 50, 43, 48, 52, 45, 50, 53, 47, 52, 55, 48, 53, 57, 50, 55, 59, 52, 57, 60, 53, 59, 62, 55, 60, 64, 57, 62, 65, 59, 64, 67, 60, 65, 69, 62, 67, 71, 64, 69, 72, 65, 71, 74, 67, 72, 76, 69, 74, 77, 71],
];

let triads_fall = [
    [50, 47, 43, 52, 48, 45, 53, 50, 47, 55, 52, 48, 57, 53, 50, 59, 55, 52, 60, 57, 53, 62, 59, 55, 64, 60, 57, 65, 62, 59, 67, 64, 60, 69, 65, 62, 71, 67, 64, 72, 69, 65, 74, 71, 67, 76, 72, 69, 77, 74, 71],
    [50, 47, 43, 52, 48, 45, 54, 50, 47, 55, 52, 48, 57, 54, 50, 59, 55, 52, 60, 57, 54, 62, 59, 55, 64, 60, 57, 66, 62, 59, 67, 64, 60, 69, 66, 62, 71, 67, 64, 72, 69, 66, 74, 71, 67, 76, 72, 69],
    [50, 47, 43, 52, 49, 45, 54, 50, 47, 55, 52, 49, 57, 54, 50, 59, 55, 52, 61, 57, 54, 62, 59, 55, 64, 61, 57, 66, 62, 59, 67, 64, 61, 69, 66, 62, 71, 67, 64, 73, 69, 66, 74, 71, 67, 76, 73, 69],
    [50, 47, 44, 52, 49, 45, 54, 50, 47, 56, 52, 49, 57, 54, 50, 59, 56, 52, 61, 57, 54, 62, 59, 56, 64, 61, 57, 66, 62, 59, 68, 64, 61, 69, 66, 62, 71, 68, 64, 73, 69, 66, 74, 71, 68, 76, 73, 69],
    [51, 47, 44, 52, 49, 45, 54, 51, 47, 56, 52, 49, 57, 54, 51, 59, 56, 52, 61, 57, 54, 63, 59, 56, 64, 61, 57, 66, 63, 59, 68, 64, 61, 69, 66, 63, 71, 68, 64, 73, 69, 66, 75, 71, 68, 76, 73, 69],
    [51, 47, 44, 52, 49, 46, 54, 51, 47, 56, 52, 49, 58, 54, 51, 59, 56, 52, 61, 58, 54, 63, 59, 56, 64, 61, 58, 66, 63, 59, 68, 64, 61, 70, 66, 63, 71, 68, 64, 73, 70, 66, 75, 71, 68, 76, 73, 70],
    [51, 47, 44, 53, 49, 46, 54, 51, 47, 56, 53, 49, 58, 54, 51, 59, 56, 53, 61, 58, 54, 63, 59, 56, 65, 61, 58, 66, 63, 59, 68, 65, 61, 70, 66, 63, 71, 68, 65, 73, 70, 66, 75, 71, 68, 77, 73, 70],
    [51, 48, 44, 53, 49, 46, 54, 51, 48, 56, 53, 49, 58, 54, 51, 60, 56, 53, 61, 58, 54, 63, 60, 56, 65, 61, 58, 66, 63, 60, 68, 65, 61, 70, 66, 63, 72, 68, 65, 73, 70, 66, 75, 72, 68, 77, 73, 70],
    [49, 46, 43, 51, 48, 44, 53, 49, 46, 55, 51, 48, 56, 53, 49, 58, 55, 51, 60, 56, 53, 61, 58, 55, 63, 60, 56, 65, 61, 58, 67, 63, 60, 68, 65, 61, 70, 67, 63, 72, 68, 65, 73, 70, 67, 75, 72, 68, 77, 73, 70],
    [50, 46, 43, 51, 48, 44, 53, 50, 46, 55, 51, 48, 56, 53, 50, 58, 55, 51, 60, 56, 53, 62, 58, 55, 63, 60, 56, 65, 62, 58, 67, 63, 60, 68, 65, 62, 70, 67, 63, 72, 68, 65, 74, 70, 67, 75, 72, 68, 77, 74, 70],
    [50, 46, 43, 51, 48, 45, 53, 50, 46, 55, 51, 48, 57, 53, 50, 58, 55, 51, 60, 57, 53, 62, 58, 55, 63, 60, 57, 65, 62, 58, 67, 63, 60, 69, 65, 62, 70, 67, 63, 72, 69, 65, 74, 70, 67, 75, 72, 69, 77, 74, 70],
    [50, 46, 43, 52, 48, 45, 53, 50, 46, 55, 52, 48, 57, 53, 50, 58, 55, 52, 60, 57, 53, 62, 58, 55, 64, 60, 57, 65, 62, 58, 67, 64, 60, 69, 65, 62, 70, 67, 64, 72, 69, 65, 74, 70, 67, 76, 72, 69, 77, 74, 70],
    [50, 47, 43, 52, 48, 45, 53, 50, 47, 55, 52, 48, 57, 53, 50, 59, 55, 52, 60, 57, 53, 62, 59, 55, 64, 60, 57, 65, 62, 59, 67, 64, 60, 69, 65, 62, 71, 67, 64, 72, 69, 65, 74, 71, 67, 76, 72, 69, 77, 74, 71],
];

let triads_rise = [
    [43, 47, 50, 45, 48, 52, 47, 50, 53, 48, 52, 55, 50, 53, 57, 52, 55, 59, 53, 57, 60, 55, 59, 62, 57, 60, 64, 59, 62, 65, 60, 64, 67, 62, 65, 69, 64, 67, 71, 65, 69, 72, 67, 71, 74, 69, 72, 76, 71, 74, 77],
    [43, 47, 50, 45, 48, 52, 47, 50, 54, 48, 52, 55, 50, 54, 57, 52, 55, 59, 54, 57, 60, 55, 59, 62, 57, 60, 64, 59, 62, 66, 60, 64, 67, 62, 66, 69, 64, 67, 71, 66, 69, 72, 67, 71, 74, 69, 72, 76],
    [43, 47, 50, 45, 49, 52, 47, 50, 54, 49, 52, 55, 50, 54, 57, 52, 55, 59, 54, 57, 61, 55, 59, 62, 57, 61, 64, 59, 62, 66, 61, 64, 67, 62, 66, 69, 64, 67, 71, 66, 69, 73, 67, 71, 74, 69, 73, 76],
    [44, 47, 50, 45, 49, 52, 47, 50, 54, 49, 52, 56, 50, 54, 57, 52, 56, 59, 54, 57, 61, 56, 59, 62, 57, 61, 64, 59, 62, 66, 61, 64, 68, 62, 66, 69, 64, 68, 71, 66, 69, 73, 68, 71, 74, 69, 73, 76],
    [44, 47, 51, 45, 49, 52, 47, 51, 54, 49, 52, 56, 51, 54, 57, 52, 56, 59, 54, 57, 61, 56, 59, 63, 57, 61, 64, 59, 63, 66, 61, 64, 68, 63, 66, 69, 64, 68, 71, 66, 69, 73, 68, 71, 75, 69, 73, 76],
    [44, 47, 51, 46, 49, 52, 47, 51, 54, 49, 52, 56, 51, 54, 58, 52, 56, 59, 54, 58, 61, 56, 59, 63, 58, 61, 64, 59, 63, 66, 61, 64, 68, 63, 66, 70, 64, 68, 71, 66, 70, 73, 68, 71, 75, 70, 73, 76],
    [44, 47, 51, 46, 49, 53, 47, 51, 54, 49, 53, 56, 51, 54, 58, 53, 56, 59, 54, 58, 61, 56, 59, 63, 58, 61, 65, 59, 63, 66, 61, 65, 68, 63, 66, 70, 65, 68, 71, 66, 70, 73, 68, 71, 75, 70, 73, 77],
    [44, 48, 51, 46, 49, 53, 48, 51, 54, 49, 53, 56, 51, 54, 58, 53, 56, 60, 54, 58, 61, 56, 60, 63, 58, 61, 65, 60, 63, 66, 61, 65, 68, 63, 66, 70, 65, 68, 72, 66, 70, 73, 68, 72, 75, 70, 73, 77],
    [43, 46, 49, 44, 48, 51, 46, 49, 53, 48, 51, 55, 49, 53, 56, 51, 55, 58, 53, 56, 60, 55, 58, 61, 56, 60, 63, 58, 61, 65, 60, 63, 67, 61, 65, 68, 63, 67, 70, 65, 68, 72, 67, 70, 73, 68, 72, 75, 70, 73, 77],
    [43, 46, 50, 44, 48, 51, 46, 50, 53, 48, 51, 55, 50, 53, 56, 51, 55, 58, 53, 56, 60, 55, 58, 62, 56, 60, 63, 58, 62, 65, 60, 63, 67, 62, 65, 68, 63, 67, 70, 65, 68, 72, 67, 70, 74, 68, 72, 75, 70, 74, 77],
    [43, 46, 50, 45, 48, 51, 46, 50, 53, 48, 51, 55, 50, 53, 57, 51, 55, 58, 53, 57, 60, 55, 58, 62, 57, 60, 63, 58, 62, 65, 60, 63, 67, 62, 65, 69, 63, 67, 70, 65, 69, 72, 67, 70, 74, 69, 72, 75, 70, 74, 77],
    [43, 46, 50, 45, 48, 52, 46, 50, 53, 48, 52, 55, 50, 53, 57, 52, 55, 58, 53, 57, 60, 55, 58, 62, 57, 60, 64, 58, 62, 65, 60, 64, 67, 62, 65, 69, 64, 67, 70, 65, 69, 72, 67, 70, 74, 69, 72, 76, 70, 74, 77],
    [43, 47, 50, 45, 48, 52, 47, 50, 53, 48, 52, 55, 50, 53, 57, 52, 55, 59, 53, 57, 60, 55, 59, 62, 57, 60, 64, 59, 62, 65, 60, 64, 67, 62, 65, 69, 64, 67, 71, 65, 69, 72, 67, 71, 74, 69, 72, 76, 71, 74, 77],
];

let triads_rise_first_inv = [
    [43, 48, 52, 45, 50, 53, 47, 52, 55, 48, 53, 57, 50, 55, 59, 52, 57, 60, 53, 59, 62, 55, 60, 64, 57, 62, 65, 59, 64, 67, 60, 65, 69, 62, 67, 71, 64, 69, 72, 65, 71, 74, 67, 72, 76, 69, 74, 77],
    [43, 48, 52, 45, 50, 54, 47, 52, 55, 48, 54, 57, 50, 55, 59, 52, 57, 60, 54, 59, 62, 55, 60, 64, 57, 62, 66, 59, 64, 67, 60, 66, 69, 62, 67, 71, 64, 69, 72, 66, 71, 74, 67, 72, 76],
    [43, 49, 52, 45, 50, 54, 47, 52, 55, 49, 54, 57, 50, 55, 59, 52, 57, 61, 54, 59, 62, 55, 61, 64, 57, 62, 66, 59, 64, 67, 61, 66, 69, 62, 67, 71, 64, 69, 73, 66, 71, 74, 67, 73, 76],
    [44, 49, 52, 45, 50, 54, 47, 52, 56, 49, 54, 57, 50, 56, 59, 52, 57, 61, 54, 59, 62, 56, 61, 64, 57, 62, 66, 59, 64, 68, 61, 66, 69, 62, 68, 71, 64, 69, 73, 66, 71, 74, 68, 73, 76],
    [44, 49, 52, 45, 51, 54, 47, 52, 56, 49, 54, 57, 51, 56, 59, 52, 57, 61, 54, 59, 63, 56, 61, 64, 57, 63, 66, 59, 64, 68, 61, 66, 69, 63, 68, 71, 64, 69, 73, 66, 71, 75, 68, 73, 76],
    [44, 49, 52, 46, 51, 54, 47, 52, 56, 49, 54, 58, 51, 56, 59, 52, 58, 61, 54, 59, 63, 56, 61, 64, 58, 63, 66, 59, 64, 68, 61, 66, 70, 63, 68, 71, 64, 70, 73, 66, 71, 75, 68, 73, 76],
    [44, 49, 53, 46, 51, 54, 47, 53, 56, 49, 54, 58, 51, 56, 59, 53, 58, 61, 54, 59, 63, 56, 61, 65, 58, 63, 66, 59, 65, 68, 61, 66, 70, 63, 68, 71, 65, 70, 73, 66, 71, 75, 68, 73, 77],
    [44, 49, 53, 46, 51, 54, 48, 53, 56, 49, 54, 58, 51, 56, 60, 53, 58, 61, 54, 60, 63, 56, 61, 65, 58, 63, 66, 60, 65, 68, 61, 66, 70, 63, 68, 72, 65, 70, 73, 66, 72, 75, 68, 73, 77],
    [43, 48, 51, 44, 49, 53, 46, 51, 55, 48, 53, 56, 49, 55, 58, 51, 56, 60, 53, 58, 61, 55, 60, 63, 56, 61, 65, 58, 63, 67, 60, 65, 68, 61, 67, 70, 63, 68, 72, 65, 70, 73, 67, 72, 75, 68, 73, 77],
    [43, 48, 51, 44, 50, 53, 46, 51, 55, 48, 53, 56, 50, 55, 58, 51, 56, 60, 53, 58, 62, 55, 60, 63, 56, 62, 65, 58, 63, 67, 60, 65, 68, 62, 67, 70, 63, 68, 72, 65, 70, 74, 67, 72, 75, 68, 74, 77],
    [43, 48, 51, 45, 50, 53, 46, 51, 55, 48, 53, 57, 50, 55, 58, 51, 57, 60, 53, 58, 62, 55, 60, 63, 57, 62, 65, 58, 63, 67, 60, 65, 69, 62, 67, 70, 63, 69, 72, 65, 70, 74, 67, 72, 75, 69, 74, 77],
    [43, 48, 52, 45, 50, 53, 46, 52, 55, 48, 53, 57, 50, 55, 58, 52, 57, 60, 53, 58, 62, 55, 60, 64, 57, 62, 65, 58, 64, 67, 60, 65, 69, 62, 67, 70, 64, 69, 72, 65, 70, 74, 67, 72, 76, 69, 74, 77],
    [43, 48, 52, 45, 50, 53, 47, 52, 55, 48, 53, 57, 50, 55, 59, 52, 57, 60, 53, 59, 62, 55, 60, 64, 57, 62, 65, 59, 64, 67, 60, 65, 69, 62, 67, 71, 64, 69, 72, 65, 71, 74, 67, 72, 76, 69, 74, 77],
];

let triads_fall_first_inv = [
    [52, 48, 43, 53, 50, 45, 55, 52, 47, 57, 53, 48, 59, 55, 50, 60, 57, 52, 62, 59, 53, 64, 60, 55, 65, 62, 57, 67, 64, 59, 69, 65, 60, 71, 67, 62, 72, 69, 64, 74, 71, 65, 76, 72, 67, 77, 74, 69],
    [52, 48, 43, 54, 50, 45, 55, 52, 47, 57, 54, 48, 59, 55, 50, 60, 57, 52, 62, 59, 54, 64, 60, 55, 66, 62, 57, 67, 64, 59, 69, 66, 60, 71, 67, 62, 72, 69, 64, 74, 71, 66, 76, 72, 67],
    [52, 49, 43, 54, 50, 45, 55, 52, 47, 57, 54, 49, 59, 55, 50, 61, 57, 52, 62, 59, 54, 64, 61, 55, 66, 62, 57, 67, 64, 59, 69, 66, 61, 71, 67, 62, 73, 69, 64, 74, 71, 66, 76, 73, 67],
    [52, 49, 44, 54, 50, 45, 56, 52, 47, 57, 54, 49, 59, 56, 50, 61, 57, 52, 62, 59, 54, 64, 61, 56, 66, 62, 57, 68, 64, 59, 69, 66, 61, 71, 68, 62, 73, 69, 64, 74, 71, 66, 76, 73, 68],
    [52, 49, 44, 54, 51, 45, 56, 52, 47, 57, 54, 49, 59, 56, 51, 61, 57, 52, 63, 59, 54, 64, 61, 56, 66, 63, 57, 68, 64, 59, 69, 66, 61, 71, 68, 63, 73, 69, 64, 75, 71, 66, 76, 73, 68],
    [52, 49, 44, 54, 51, 46, 56, 52, 47, 58, 54, 49, 59, 56, 51, 61, 58, 52, 63, 59, 54, 64, 61, 56, 66, 63, 58, 68, 64, 59, 70, 66, 61, 71, 68, 63, 73, 70, 64, 75, 71, 66, 76, 73, 68],
    [53, 49, 44, 54, 51, 46, 56, 53, 47, 58, 54, 49, 59, 56, 51, 61, 58, 53, 63, 59, 54, 65, 61, 56, 66, 63, 58, 68, 65, 59, 70, 66, 61, 71, 68, 63, 73, 70, 65, 75, 71, 66, 77, 73, 68],
    [53, 49, 44, 54, 51, 46, 56, 53, 48, 58, 54, 49, 60, 56, 51, 61, 58, 53, 63, 60, 54, 65, 61, 56, 66, 63, 58, 68, 65, 60, 70, 66, 61, 72, 68, 63, 73, 70, 65, 75, 72, 66, 77, 73, 68],
    [51, 48, 43, 53, 49, 44, 55, 51, 46, 56, 53, 48, 58, 55, 49, 60, 56, 51, 61, 58, 53, 63, 60, 55, 65, 61, 56, 67, 63, 58, 68, 65, 60, 70, 67, 61, 72, 68, 63, 73, 70, 65, 75, 72, 67, 77, 73, 68],
    [51, 48, 43, 53, 50, 44, 55, 51, 46, 56, 53, 48, 58, 55, 50, 60, 56, 51, 62, 58, 53, 63, 60, 55, 65, 62, 56, 67, 63, 58, 68, 65, 60, 70, 67, 62, 72, 68, 63, 74, 70, 65, 75, 72, 67, 77, 74, 68],
    [51, 48, 43, 53, 50, 45, 55, 51, 46, 57, 53, 48, 58, 55, 50, 60, 57, 51, 62, 58, 53, 63, 60, 55, 65, 62, 57, 67, 63, 58, 69, 65, 60, 70, 67, 62, 72, 69, 63, 74, 70, 65, 75, 72, 67, 77, 74, 69],
    [52, 48, 43, 53, 50, 45, 55, 52, 46, 57, 53, 48, 58, 55, 50, 60, 57, 52, 62, 58, 53, 64, 60, 55, 65, 62, 57, 67, 64, 58, 69, 65, 60, 70, 67, 62, 72, 69, 64, 74, 70, 65, 76, 72, 67, 77, 74, 69],
    [52, 48, 43, 53, 50, 45, 55, 52, 47, 57, 53, 48, 59, 55, 50, 60, 57, 52, 62, 59, 53, 64, 60, 55, 65, 62, 57, 67, 64, 59, 69, 65, 60, 71, 67, 62, 72, 69, 64, 74, 71, 65, 76, 72, 67, 77, 74, 69],
];

let triads_rise_second_inv = [
    [43, 47, 53, 45, 48, 55, 47, 50, 57, 48, 52, 59, 50, 53, 60, 52, 55, 62, 53, 57, 64, 55, 59, 65, 57, 60, 67, 59, 62, 69, 60, 64, 71, 62, 65, 72, 64, 67, 74, 65, 69, 76, 67, 71, 77],
    [43, 47, 54, 45, 48, 55, 47, 50, 57, 48, 52, 59, 50, 54, 60, 52, 55, 62, 54, 57, 64, 55, 59, 66, 57, 60, 67, 59, 62, 69, 60, 64, 71, 62, 66, 72, 64, 67, 74, 66, 69, 76],
    [43, 47, 54, 45, 49, 55, 47, 50, 57, 49, 52, 59, 50, 54, 61, 52, 55, 62, 54, 57, 64, 55, 59, 66, 57, 61, 67, 59, 62, 69, 61, 64, 71, 62, 66, 73, 64, 67, 74, 66, 69, 76],
    [44, 47, 54, 45, 49, 56, 47, 50, 57, 49, 52, 59, 50, 54, 61, 52, 56, 62, 54, 57, 64, 56, 59, 66, 57, 61, 68, 59, 62, 69, 61, 64, 71, 62, 66, 73, 64, 68, 74, 66, 69, 76],
    [44, 47, 54, 45, 49, 56, 47, 51, 57, 49, 52, 59, 51, 54, 61, 52, 56, 63, 54, 57, 64, 56, 59, 66, 57, 61, 68, 59, 63, 69, 61, 64, 71, 63, 66, 73, 64, 68, 75, 66, 69, 76],
    [44, 47, 54, 46, 49, 56, 47, 51, 58, 49, 52, 59, 51, 54, 61, 52, 56, 63, 54, 58, 64, 56, 59, 66, 58, 61, 68, 59, 63, 70, 61, 64, 71, 63, 66, 73, 64, 68, 75, 66, 70, 76],
    [44, 47, 54, 46, 49, 56, 47, 51, 58, 49, 53, 59, 51, 54, 61, 53, 56, 63, 54, 58, 65, 56, 59, 66, 58, 61, 68, 59, 63, 70, 61, 65, 71, 63, 66, 73, 65, 68, 75, 66, 70, 77],
    [44, 48, 54, 46, 49, 56, 48, 51, 58, 49, 53, 60, 51, 54, 61, 53, 56, 63, 54, 58, 65, 56, 60, 66, 58, 61, 68, 60, 63, 70, 61, 65, 72, 63, 66, 73, 65, 68, 75, 66, 70, 77],
    [43, 46, 53, 44, 48, 55, 46, 49, 56, 48, 51, 58, 49, 53, 60, 51, 55, 61, 53, 56, 63, 55, 58, 65, 56, 60, 67, 58, 61, 68, 60, 63, 70, 61, 65, 72, 63, 67, 73, 65, 68, 75, 67, 70, 77],
    [43, 46, 53, 44, 48, 55, 46, 50, 56, 48, 51, 58, 50, 53, 60, 51, 55, 62, 53, 56, 63, 55, 58, 65, 56, 60, 67, 58, 62, 68, 60, 63, 70, 62, 65, 72, 63, 67, 74, 65, 68, 75, 67, 70, 77],
    [43, 46, 53, 45, 48, 55, 46, 50, 57, 48, 51, 58, 50, 53, 60, 51, 55, 62, 53, 57, 63, 55, 58, 65, 57, 60, 67, 58, 62, 69, 60, 63, 70, 62, 65, 72, 63, 67, 74, 65, 69, 75, 67, 70, 77],
    [43, 46, 53, 45, 48, 55, 46, 50, 57, 48, 52, 58, 50, 53, 60, 52, 55, 62, 53, 57, 64, 55, 58, 65, 57, 60, 67, 58, 62, 69, 60, 64, 70, 62, 65, 72, 64, 67, 74, 65, 69, 76, 67, 70, 77],
    [43, 47, 53, 45, 48, 55, 47, 50, 57, 48, 52, 59, 50, 53, 60, 52, 55, 62, 53, 57, 64, 55, 59, 65, 57, 60, 67, 59, 62, 69, 60, 64, 71, 62, 65, 72, 64, 67, 74, 65, 69, 76, 67, 71, 77],
];

let triads_fall_second_inv = [
    [53, 47, 43, 55, 48, 45, 57, 50, 47, 59, 52, 48, 60, 53, 50, 62, 55, 52, 64, 57, 53, 65, 59, 55, 67, 60, 57, 69, 62, 59, 71, 64, 60, 72, 65, 62, 74, 67, 64, 76, 69, 65, 77, 71, 67],
    [54, 47, 43, 55, 48, 45, 57, 50, 47, 59, 52, 48, 60, 54, 50, 62, 55, 52, 64, 57, 54, 66, 59, 55, 67, 60, 57, 69, 62, 59, 71, 64, 60, 72, 66, 62, 74, 67, 64, 76, 69, 66],
    [54, 47, 43, 55, 49, 45, 57, 50, 47, 59, 52, 49, 61, 54, 50, 62, 55, 52, 64, 57, 54, 66, 59, 55, 67, 61, 57, 69, 62, 59, 71, 64, 61, 73, 66, 62, 74, 67, 64, 76, 69, 66],
    [54, 47, 44, 56, 49, 45, 57, 50, 47, 59, 52, 49, 61, 54, 50, 62, 56, 52, 64, 57, 54, 66, 59, 56, 68, 61, 57, 69, 62, 59, 71, 64, 61, 73, 66, 62, 74, 68, 64, 76, 69, 66],
    [54, 47, 44, 56, 49, 45, 57, 51, 47, 59, 52, 49, 61, 54, 51, 63, 56, 52, 64, 57, 54, 66, 59, 56, 68, 61, 57, 69, 63, 59, 71, 64, 61, 73, 66, 63, 75, 68, 64, 76, 69, 66],
    [54, 47, 44, 56, 49, 46, 58, 51, 47, 59, 52, 49, 61, 54, 51, 63, 56, 52, 64, 58, 54, 66, 59, 56, 68, 61, 58, 70, 63, 59, 71, 64, 61, 73, 66, 63, 75, 68, 64, 76, 70, 66],
    [54, 47, 44, 56, 49, 46, 58, 51, 47, 59, 53, 49, 61, 54, 51, 63, 56, 53, 65, 58, 54, 66, 59, 56, 68, 61, 58, 70, 63, 59, 71, 65, 61, 73, 66, 63, 75, 68, 65, 77, 70, 66],
    [54, 48, 44, 56, 49, 46, 58, 51, 48, 60, 53, 49, 61, 54, 51, 63, 56, 53, 65, 58, 54, 66, 60, 56, 68, 61, 58, 70, 63, 60, 72, 65, 61, 73, 66, 63, 75, 68, 65, 77, 70, 66],
    [53, 46, 43, 55, 48, 44, 56, 49, 46, 58, 51, 48, 60, 53, 49, 61, 55, 51, 63, 56, 53, 65, 58, 55, 67, 60, 56, 68, 61, 58, 70, 63, 60, 72, 65, 61, 73, 67, 63, 75, 68, 65, 77, 70, 67],
    [53, 46, 43, 55, 48, 44, 56, 50, 46, 58, 51, 48, 60, 53, 50, 62, 55, 51, 63, 56, 53, 65, 58, 55, 67, 60, 56, 68, 62, 58, 70, 63, 60, 72, 65, 62, 74, 67, 63, 75, 68, 65, 77, 70, 67],
    [53, 46, 43, 55, 48, 45, 57, 50, 46, 58, 51, 48, 60, 53, 50, 62, 55, 51, 63, 57, 53, 65, 58, 55, 67, 60, 57, 69, 62, 58, 70, 63, 60, 72, 65, 62, 74, 67, 63, 75, 69, 65, 77, 70, 67],
    [53, 46, 43, 55, 48, 45, 57, 50, 46, 58, 52, 48, 60, 53, 50, 62, 55, 52, 64, 57, 53, 65, 58, 55, 67, 60, 57, 69, 62, 58, 70, 64, 60, 72, 65, 62, 74, 67, 64, 76, 69, 65, 77, 70, 67],
    [53, 47, 43, 55, 48, 45, 57, 50, 47, 59, 52, 48, 60, 53, 50, 62, 55, 52, 64, 57, 53, 65, 59, 55, 67, 60, 57, 69, 62, 59, 71, 64, 60, 72, 65, 62, 74, 67, 64, 76, 69, 65, 77, 71, 67],
];

let mod_safe = (divisor, dividend) => {
    return ((divisor % dividend) + dividend) % dividend;
};

let indexOffset = 0;

let setIndexOffset = (boundLower) => {
    let indices = [
        scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)].indexOf(boundLower - 1),
        scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)].indexOf(boundLower),
        scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)].indexOf(boundLower + 1)
    ];
    indexOffset = Math.min(
        ...indices.filter(i => i > 0)
    );
    post(indexOffset);
};

const lengthIntervalsScaleWind = 8;

let nextPitch = () => {
    if (bWindRight) {
        if (mod_safe(indexPitchCurrent, lengthIntervalsScaleWind * scaleFactor) == 0) {
            right();
            indexPitchCurrent = 0;
        }
        messenger.message([
            'midi', scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)][mod_safe(indexPitchCurrent, lengthIntervalsScaleWind * scaleFactor) + indexOffset]
        ]);
    } else if (bWindLeft) {
        if (mod_safe(indexPitchCurrent, lengthIntervalsScaleWind * scaleFactor) == 0) {
            left();
            indexPitchCurrent = 0;
        }
        messenger.message([
            'midi', scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)][mod_safe(indexPitchCurrent, lengthIntervalsScaleWind * scaleFactor) + indexOffset]
        ]);
    } else {
        messenger.message([
            'midi', scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)][mod_safe(indexPitchCurrent, scaleTypeCurrent[mod_safe(indexScaleCurrent, 12)].length)]
        ]);
    }
    indexPitchCurrent += 1;
};

const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'D-', 'A-', 'E-', 'B-', 'F'];

let bWindRight = false;

let bWindLeft = false;

let windRight = () => {
    bWindRight = !bWindRight;
    indexPitchCurrent = 0;
};

let windLeft = () => {
    bWindLeft = !bWindLeft;
    indexPitchCurrent = 0;
};

let setKey = (indexKey) => {
    indexScaleCurrent = indexKey - 60;
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let plus2semitones = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent + 2), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let plus1semitones = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent - 5), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let minus1semitones = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent + 5), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let minus2semitones = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent - 2), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let right = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent + 1), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let left = () => {
    indexScaleCurrent = mod_safe((indexScaleCurrent - 1), 12);
    messenger.message(['key_current', keys[indexScaleCurrent]]);
};

let resetPitch = () => {
    indexPitchCurrent = 0;
};

let scaleFactor;

let setScale = (choice) => {
    switch (choice) {
        case 0:
            scaleTypeCurrent = seconds;
            scaleFactor = 1;
            break;
        case 1:
            scaleTypeCurrent = thirds_rise;
            scaleFactor = 2;
            break;
        case 2:
            scaleTypeCurrent = thirds_fall;
            scaleFactor = 2;
            break;
        case 3:
            scaleTypeCurrent = fourths_rise;
            scaleFactor = 2;
            break;
        case 4:
            scaleTypeCurrent = fourths_fall;
            scaleFactor = 2;
            break;
        case 5:
            scaleTypeCurrent = fifths_rise;
            scaleFactor = 2;
            break;
        case 6:
            scaleTypeCurrent = fifths_fall;
            scaleFactor = 2;
            break;
        case 7:
            scaleTypeCurrent = triads_rise;
            scaleFactor = 3;
            break;
        case 8:
            scaleTypeCurrent = triads_rise_and_fall;
            scaleFactor = 3;
            break;
        case 9:
            scaleTypeCurrent = triads_fall;
            scaleFactor = 3;
            break;
        case 10:
            scaleTypeCurrent = triads_rise_first_inv;
            scaleFactor = 3;
            break;
        case 11:
            scaleTypeCurrent = triads_fall_first_inv;
            scaleFactor = 3;
            break;
        case 12:
            scaleTypeCurrent = triads_rise_second_inv;
            scaleFactor = 3;
            break;
        case 13:
            scaleTypeCurrent = triads_fall_second_inv;
            scaleFactor = 3;
            break;
        default:
            throw 'not a valid scale choice'
    }
    indexScaleCurrent = 0;
    indexPitchCurrent = 0;
};

if (typeof Global !== "undefined") {
    Global.scale_cycler = {};
    Global.scale_cycler.right = right;
    Global.scale_cycler.left = left;
    Global.scale_cycler.setScale = setScale;
    Global.scale_cycler.nextPitch = nextPitch;
    Global.scale_cycler.resetPitch = resetPitch;
    Global.scale_cycler.windRight = windRight;
    Global.scale_cycler.windLeft = windLeft;
    Global.scale_cycler.setKey = setKey;
    Global.scale_cycler.setIndexOffset = setIndexOffset;
    Global.scale_cycler.plus2semitones = plus2semitones;
    Global.scale_cycler.plus1semitones = plus1semitones;
    Global.scale_cycler.minus1semitones = minus1semitones;
    Global.scale_cycler.minus2semitones = minus2semitones;
}
