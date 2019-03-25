import {message as m, message} from "../message/messenger";
import Messenger = message.Messenger;
import {map} from "../control/map";
import FretMapper = map.FretMapper;
import {trainer as tr} from "../train/trainer";
import Trainer = tr.Trainer;
import {freeze, thaw} from "../serialize/serialize";
import TrainThawer = thaw.TrainThawer;
import {algorithm} from "../train/algorithm";
import Detect = algorithm.Detect;
import {live as li, live} from "../live/live";
import {segment as module_segment} from "../segment/segment";
import Segment = module_segment.Segment;
import {modes_control, modes_texture} from "../constants/constants";
import INSTRUMENTAL = modes_control.INSTRUMENTAL;
import {clip} from "../clip/clip";
import Clip = clip.Clip;
import {user_input} from "../control/user_input";
import UserInputHandler = user_input.UserInputHandler;
import POLYPHONY = modes_texture.POLYPHONY;
import TrainFreezer = freeze.TrainFreezer;
import {window as w} from "../render/window";
import MatrixWindow = w.MatrixWindow;
import LiveApiJs = live.LiveApiJs;
import {log} from "../log/logger";
import Logger = log.Logger;
import MONOPHONY = modes_texture.MONOPHONY;
import VOCAL = modes_control.VOCAL;
import {utils} from "../utils/utils";
import DETECT = algorithm.DETECT;
import PREDICT = algorithm.PREDICT;
import PARSE = algorithm.PARSE;
import DERIVE = algorithm.DERIVE;
import Predict = algorithm.Predict;
import Derive = algorithm.Derive;
import Parse = algorithm.Parse;
import FREESTYLE = algorithm.FREESTYLE;
import {song as sng} from "../song/song";
import Song = sng.Song;
import SongDao = sng.SongDao;
import {note as n} from "../note/note";
import TreeModel = require("tree-model");
import {scene} from "../scene/scene";
import SceneDao = scene.SceneDao;
import Scene = scene.Scene;
import ClipDao = clip.ClipDao;
import {track} from "../track/track";
import TrackDao = track.TrackDao;
import Track = track.Track;


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

let logger = new Logger(env);
let messenger_render = new Messenger(env, 0, 'render');
let messenger_monitor_target = new Messenger(env, 0, 'index_track_target');
let messenger_num_segments = new Messenger(env, 0, 'num_segments');
let mode_texture, mode_control, song, algorithm_train, user_input_handler, window, segments_train, trainer;
let track_target: Track, track_user_input: Track;

let set_mode_texture = (option) => {
    switch (option) {
        case POLYPHONY: {
            mode_texture = option;
            break;
        }
        case MONOPHONY: {
            mode_texture = option;
            break;
        }
        default: {
            post('error setting texture')
        }
    }
};

let set_mode_control = (option) => {
    switch (option) {
        case VOCAL: {
            mode_control = option;
            break;
        }
        case INSTRUMENTAL: {
            mode_control = option;
            break;
        }
        default: {
            post('error setting control')
        }
    }
};

let set_algorithm_train = (option) => {

    user_input_handler = new UserInputHandler(
        mode_texture,
        mode_control
    );

    switch (option) {
        case FREESTYLE: {
            // algorithm_train = new Freestyle(
            //     user_input_handler
            // );
            break;
        }
        case DETECT: {
            algorithm_train = new Detect();
            break;
        }
        case PREDICT: {
            algorithm_train = new Predict();
            break;
        }
        case PARSE: {
            algorithm_train = new Parse();
            break;
        }
        case DERIVE: {
            algorithm_train = new Derive();
            break;
        }
        default: {
            post('error setting algorithm')
        }
    }

    window = new MatrixWindow(
        384,
        384,
        messenger_render
    );
};

let set_depth_tree = (depth) => {
    algorithm_train.set_depth(
        depth
    );
};

let set_segments = () => {

    // TODO: this assumes the trainer device is on the same track as the segmenter
    // let notes_segments = get_notes_segments();

    let this_device = new li.LiveApiJs('this_device');

    let this_track = new Track(
        new TrackDao(
            new LiveApiJs(
                utils.cleanse_path(this.get_path())
            ),
            new Messenger(env, 0)
        )
    );

    let notes_segments = this_track.get_notes();

    let segments = [];

    for (let i_note in notes_segments) {
        let note = notes_segments[Number(i_note)];

        let path_scene = ['live_set', 'scenes', Number(i_note)].join(' ');

        let segment = new Segment(
            note
        );

        segment.set_scene(
            new Scene(
                new SceneDao(
                    new li.LiveApiJs(
                        path_scene
                    ),
                    new Messenger(env, 0),
                    true,
                    'scene'
                )
            )
        );

        let path_this_track = utils.get_path_track_from_path_device(
            utils.cleanse_path(
                this_device.get_path()
            )
        );

        segment.set_clip_user_input_sync(
            new Clip(
                new ClipDao(
                    new LiveApiJs(
                        path_this_track.split(' ').concat(['clip_slots', i_note, 'clip']).join(' ')
                    ),
                    new Messenger(env, 0)
                )
            )
        );

        segment.set_clip_user_input_async(
            new Clip(
                new ClipDao(
                    new LiveApiJs(
                        path_this_track.split(' ').concat(['clip_slots', i_note, 'clip']).join(' ')
                    ),
                    new Messenger(env, 0),
                    true,
                    'clip_user_input'
                )
            )
        );

        segments.push(
            segment
        )

    }

    messenger_num_segments.message([segments.length]);

    segments_train = segments
};

let test = () => {

};

// const _ = require('underscore');

// TODO: send this via bus based on options in radio
let set_track_target = () => {
    // @ts-ignore
    let list_path_device_target = Array.prototype.slice.call(arguments);

    let path_device_target = utils.cleanse_path(list_path_device_target.join());

    track_target = new Track(
        new TrackDao(
            new LiveApiJs(
                utils.get_path_track_from_path_device(path_device_target)
            ),
            new Messenger(env, 0),
            true,
            'track_target'
        )
    );

    messenger_monitor_target.message([track_target.get_index()])
};

let initialize = () => {
    let this_device = new li.LiveApiJs('this_device');

    let path_this_track = utils.get_path_track_from_path_device(
        utils.cleanse_path(
            this_device.get_path()
        )
    );

    track_user_input = new Track(
        new TrackDao(
            new LiveApiJs(
                path_this_track
            ),
            new Messenger(env, 0),
            true,
            'track_user_input'
        )
    );


    let song = new Song(
        new SongDao(
            new LiveApiJs(
                'live_set'
            ),
            new Messenger(env, 0),
            true,
            'song'
        )
    );

    trainer = new Trainer(
        window,
        user_input_handler,
        algorithm_train,
        track_target,
        track_user_input,
        song,
        segments_train,
        new Messenger(env, 0)
    );

    trainer.render_window();
};

let commence = () => {
    trainer.commence();
};

let pause = () => {
    trainer.pause()
};

let resume = () => {
    trainer.resume()
};

let user_input_command = (command: string) => {
    let logger = new Logger(env);

    // logger.log('user input command....');
    // TODO: there is literally one character difference between the two algorithms - please abstract
    switch(algorithm_train.get_name()) {
        case PARSE: {
            switch(command) {
                case 'confirm': {
                    let notes = trainer.clip_user_input_synchronous.get_notes(
                        trainer.segment_current.beat_start,
                        0,
                        trainer.segment_current.beat_end - trainer.segment_current.beat_start,
                        128
                    );

                    trainer.accept_input(notes);

                    break;
                }
                case 'reset': {
                    let coords_current = trainer.iterator_matrix_train.get_coord_current();

                    trainer.clip_user_input.set_notes(
                        trainer.history_user_input.get(
                            [coords_current[0] + 1, coords_current[1]]
                        )
                    );

                    break;
                }
                case 'erase': {
                    trainer.clip_user_input.remove_notes(
                        trainer.segment_current.beat_start,
                        0,
                        trainer.segment_current.beat_end - trainer.segment_current.beat_start,
                        128
                    );
                    break;
                }
                default: {
                    logger.log('command not recognized')
                }
            }
            break;
        }
        case DERIVE: {
            switch(command) {
                case 'confirm': {
                    let notes = trainer.clip_user_input_synchronous.get_notes(
                        trainer.segment_current.beat_start,
                        0,
                        trainer.segment_current.beat_end - trainer.segment_current.beat_start,
                        128
                    );

                    trainer.accept_input(notes);

                    break;
                }
                case 'reset': {
                    let coords_current = trainer.iterator_matrix_train.get_coord_current();

                    let notes = trainer.history_user_input.get(
                        [coords_current[0] - 1, coords_current[1]]
                    );

                    trainer.clip_user_input.set_notes(
                        notes
                    );

                    break;
                }
                case 'erase': {
                    let logger = new Logger(env);

                    logger.log(
                        JSON.stringify(
                            trainer.segment_current
                        )
                    );

                    trainer.clip_user_input.remove_notes(
                        trainer.segment_current.beat_start,
                        0,
                        trainer.segment_current.beat_end - trainer.segment_current.beat_start,
                        128
                    );
                    break;
                }
                default: {
                    logger.log('command not recognized')
                }
            }
            break;
        }
        default: {
            logger.log('command not supported for this type of algorithm')
        }
    }
};

let user_input_midi = (pitch: number, velocity: number) => {
    switch(algorithm_train.get_name()) {
        case DETECT: {
            let tree: TreeModel = new TreeModel();
            let note = tree.parse(
                {
                    id: -1,
                    note: new n.Note(
                        pitch,
                        -Infinity,
                        Infinity,
                        velocity,
                        0
                    ),
                    children: [

                    ]
                }
            );
            trainer.accept_input(
                [note]
            );
            break;
        }
        case PREDICT: {
            let tree: TreeModel = new TreeModel();
            let note = tree.parse(
                {
                    id: -1,
                    note: new n.Note(
                        pitch,
                        -Infinity,
                        Infinity,
                        velocity,
                        0
                    ),
                    children: [

                    ]
                }
            );
            trainer.accept_input(
                [note]
            );
            break;
        }
        default: {
            logger.log('command not supported for this type of algorithm')
        }
    }
};

let load = () => {

    // TODO: logic to determine, from project folder, name of file

    let freezer = new TrainFreezer(
        env
    );

    freezer.freeze(
        trainer,
        '/Users/elliottevers/Documents/DocumentsSymlinked/git-repos.nosync/tk_music_ts/cache/train_detect.json'
    );
};

let save = () => {

    // TODO: logic to determine, from project folder, name of file

    let config = {
        'window': window,
        'user_input_handler': user_input_handler,
        'trainable': algorithm_train,
        'track_target': track_target,
        'track_user_input': track_user_input,
        'song': song,
        'segments': segments_train,
        'messenger': messenger_render,
        'env': env
    };

    let thawer = new TrainThawer(
        env
    );

    let train_thawed = thawer.thaw(
        '/Users/elliottevers/Documents/DocumentsSymlinked/git-repos.nosync/tk_music_ts/cache/train_detect.json',
        config
    );

    train_thawed.render_window(

    );
};

if (typeof Global !== "undefined") {
    Global.train = {};
    Global.train.load = load;
    Global.train.save = save;
    Global.train.initialize = initialize;
    Global.train.commence = commence;
    Global.train.pause = pause;
    Global.train.resume = resume;
    Global.train.user_input_command = user_input_command;
    Global.train.user_input_midi = user_input_midi;
    Global.train.set_segments = set_segments;
    Global.train.set_track_target = set_track_target;
    Global.train.set_depth_tree = set_depth_tree;
    Global.train.set_algorithm_train = set_algorithm_train;
    Global.train.set_mode_control = set_mode_control;
    Global.train.set_mode_texture = set_mode_texture;
}
