import {message} from "../message/messenger";
import Messenger = message.Messenger;

declare let autowatch: any;
declare let inlets: any;
declare let outlets: any;
declare function outlet(n: number, o: any): void;
declare function post(message?: any): void;

export {}

declare let Global: any;

let env: string = 'max';

if (env === 'max') {
    post('recompile successful');
    autowatch = 1;
}

let parts = ['key_center', 'bass', 'chord', 'melody', 'vocal_harmony'];

let messenger: Messenger = new Messenger(env, 0);

// let test = () => {
//
// };

let broadcast_dependencies = () => {
    //@ts-ignore
    let list_args = Array.prototype.slice.call(arguments);

    for (let i_option in list_args) {
        let option = list_args[Number(i_option)];
        messenger.message([parts[i_option], 'gate_render_dependency', option])
    }
};

let broadcast_ground_truth = (i_option: number) => {
    for (let i_part in parts) {
        if (String(i_part) === String(i_option)) {
            messenger.message([parts[String(i_part)], 'gate_ground_truth', 1]);
            continue;
        }

        messenger.message([parts[String(i_part)], 'gate_ground_truth', 0]);
    }
};

// test();

if (typeof Global !== "undefined") {
    Global.dependency_broadcaster = {};
    Global.dependency_broadcaster.broadcast_dependencies = broadcast_dependencies;
    Global.dependency_broadcaster.broadcast_ground_truth = broadcast_ground_truth;
}