"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messenger_1 = require("../message/messenger");
var Messenger = messenger_1.message.Messenger;
var trainer_1 = require("../train/trainer");
var Trainer = trainer_1.trainer.Trainer;
var serialize_1 = require("../serialize/serialize");
var TrainThawer = serialize_1.thaw.TrainThawer;
var algorithm_1 = require("../train/algorithm");
var Detect = algorithm_1.algorithm.Detect;
var live_1 = require("../live/live");
var segment_1 = require("../segment/segment");
var Segment = segment_1.segment.Segment;
var constants_1 = require("../constants/constants");
var INSTRUMENTAL = constants_1.modes_control.INSTRUMENTAL;
var clip_1 = require("../clip/clip");
var user_input_1 = require("../control/user_input");
var UserInputHandler = user_input_1.user_input.UserInputHandler;
var POLYPHONY = constants_1.modes_texture.POLYPHONY;
var TrainFreezer = serialize_1.freeze.TrainFreezer;
var window_1 = require("../render/window");
var MatrixWindow = window_1.window.MatrixWindow;
var logger_1 = require("../log/logger");
var Logger = logger_1.log.Logger;
var MONOPHONY = constants_1.modes_texture.MONOPHONY;
var VOCAL = constants_1.modes_control.VOCAL;
var utils_1 = require("../utils/utils");
var path_clip_from_list_path_device = utils_1.utils.path_clip_from_list_path_device;
var DETECT = algorithm_1.algorithm.DETECT;
var PREDICT = algorithm_1.algorithm.PREDICT;
var PARSE = algorithm_1.algorithm.PARSE;
var DERIVE = algorithm_1.algorithm.DERIVE;
var Predict = algorithm_1.algorithm.Predict;
var Derive = algorithm_1.algorithm.Derive;
var Parse = algorithm_1.algorithm.Parse;
var FREESTYLE = algorithm_1.algorithm.FREESTYLE;
var song_1 = require("../song/song");
var Song = song_1.song.Song;
var SongDao = song_1.song.SongDao;
var env = 'max';
if (env === 'max') {
    post('recompile successful');
    autowatch = 1;
}
// let accept = (user_input, ground_truth) => {
//     messenger.message([FretMapper.get_interval(user_input ,ground_truth)])
// };
var logger = new Logger(env);
var messenger_render = new Messenger(env, 0, 'render');
var mode_texture, mode_control, depth_tree, clip_user_input, song, algorithm_train, user_input_handler, window, clip_target, segments, trainer;
var set_mode_texture = function (option) {
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
            post('error setting texture');
        }
    }
};
var set_mode_control = function (option) {
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
            post('error setting control');
        }
    }
};
var set_algorithm_train = function (option) {
    user_input_handler = new UserInputHandler(mode_texture, mode_control);
    switch (option) {
        case FREESTYLE: {
            // algorithm_train = new Freestyle(
            //     user_input_handler
            // );
            break;
        }
        case DETECT: {
            algorithm_train = new Detect(user_input_handler);
            break;
        }
        case PREDICT: {
            algorithm_train = new Predict(user_input_handler);
            break;
        }
        case PARSE: {
            algorithm_train = new Parse(user_input_handler);
            break;
        }
        case DERIVE: {
            algorithm_train = new Derive(user_input_handler);
            break;
        }
        default: {
            post('error setting algorithm');
        }
    }
    window = new MatrixWindow(384, 384, messenger_render, algorithm_train);
};
var set_depth_tree = function (depth) {
    algorithm_train.set_depth(depth);
};
var set_clip_user_input = function () {
    var live_api = new live_1.live.LiveApiJs('live_set view highlighted_clip_slot clip');
    clip_user_input = new clip_1.clip.Clip(new clip_1.clip.ClipDao(live_api, new messenger_1.message.Messenger(env, 0), true, 'clip_user_input'));
    clip_user_input.set_path_deferlow('set_path_clip_user_input');
};
var set_segments = function () {
    // @ts-ignore
    var list_path_device = Array.prototype.slice.call(arguments);
    var live_api;
    live_api = new live_1.live.LiveApiJs(path_clip_from_list_path_device(list_path_device));
    var clip = new clip_1.clip.Clip(new clip_1.clip.ClipDao(live_api, new messenger_1.message.Messenger(env, 0), false));
    // TODO: how do we get beat_start, beat_end?
    var notes_segments = clip.get_notes(0, 0, 17 * 4, 128);
    // let logger = new Logger(env);
    // logger.log(JSON.stringify(notes_segments));
    var segments_local = [];
    for (var _i = 0, notes_segments_1 = notes_segments; _i < notes_segments_1.length; _i++) {
        var note = notes_segments_1[_i];
        segments_local.push(new Segment(note));
    }
    segments = segments_local;
};
// TODO: send this via bus based on options in radio
var set_clip_target = function () {
    // @ts-ignore
    var list_path_device = Array.prototype.slice.call(arguments);
    var live_api;
    live_api = new live_1.live.LiveApiJs(path_clip_from_list_path_device(list_path_device));
    clip_target = new clip_1.clip.Clip(new clip_1.clip.ClipDao(live_api, new messenger_1.message.Messenger(env, 0), false));
};
var begin = function () {
    song = new Song(new SongDao(new live_1.live.LiveApiJs('live_set'), new Messenger(env, 0), false));
    trainer = new Trainer(window, user_input_handler, algorithm_train, clip_user_input, clip_target, song, segments, messenger_render);
    trainer.init();
    trainer.render_window();
};
var pause = function () {
    trainer.pause();
};
var resume = function () {
    trainer.resume();
};
var erase = function () {
};
var reset = function () {
};
var accept = function () {
};
var accept_input = function () {
    var notes;
    if (true) {
        // midi values
    }
    else {
        // signal to use user input clip
    }
    trainer.accept_input(notes);
};
var load = function () {
    // TODO: logic to determine, from project folder, name of file
    var freezer = new TrainFreezer(env);
    freezer.freeze(trainer, '/Users/elliottevers/Documents/DocumentsSymlinked/git-repos.nosync/tk_music_ts/cache/train_detect.json');
};
var save = function () {
    // TODO: logic to determine, from project folder, name of file
    var config = {
        'window': window,
        'user_input_handler': user_input_handler,
        'algorithm': algorithm_train,
        'clip_user_input': clip_user_input,
        'clip_target': clip_target,
        'song': song,
        'segments': segments,
        'messenger': messenger_render,
        'env': env
    };
    var thawer = new TrainThawer(env);
    var train_thawed = thawer.thaw('/Users/elliottevers/Documents/DocumentsSymlinked/git-repos.nosync/tk_music_ts/cache/train_detect.json', config);
    train_thawed.render_window();
};
// 1 "task" used as
// 1 alg train 2 mode texture 3 mode control 4 clip user input (figure out if we have to highlight and click)  5 clip target (won't need to highlight) 6 segments
// 1) dependencies 2) ground truth
if (typeof Global !== "undefined") {
    Global.train = {};
    Global.train.load = load;
    Global.train.save = save;
    Global.train.begin = begin;
    Global.train.pause = pause;
    Global.train.resume = resume;
    Global.train.erase = erase;
    Global.train.reset = reset;
    Global.train.accept = accept;
    Global.train.accept_input = accept_input;
    Global.train.set_segments = set_segments;
    Global.train.set_clip_user_input = set_clip_user_input;
    Global.train.set_clip_target = set_clip_target;
    Global.train.set_depth_tree = set_depth_tree;
    Global.train.set_algorithm_train = set_algorithm_train;
    Global.train.set_mode_control = set_mode_control;
    Global.train.set_mode_texture = set_mode_texture;
}
//# sourceMappingURL=train.js.map