"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var harmony_1 = require("../music/harmony");
var constants_1 = require("../constants/constants");
var algorithm;
(function (algorithm) {
    algorithm.DETECT = 'detect';
    algorithm.PREDICT = 'predict';
    algorithm.PARSE = 'parse';
    algorithm.DERIVE = 'derive';
    var Harmony = harmony_1.harmony.Harmony;
    var Targeted = /** @class */ (function () {
        function Targeted() {
        }
        Targeted.prototype.b_targeted = function () {
            return true;
        };
        return Targeted;
    }());
    var Detect = /** @class */ (function (_super) {
        __extends(Detect, _super);
        function Detect(user_input_handler) {
            var _this = this;
            _this.user_input_handler = user_input_handler;
            return _this;
        }
        Detect.prototype.get_depth = function () {
            return 1;
        };
        Detect.prototype.get_name = function () {
            return algorithm.DETECT;
        };
        Detect.prototype.determine_targets = function (notes_segment_next) {
            if (this.user_input_handler.mode_texture === constants_1.modes_texture.POLYPHONY) {
                var chords_grouped = Harmony.group(notes_segment_next);
                var chords_monophonified = Harmony.monophonify(notes_segment_next);
                // Subtarget -> Subtarget Iterator -> Target -> Target Iterator
                return chords_monophonified;
            }
            else if (this.user_input_handler.mode_texture === constants_1.modes_texture.MONOPONY) {
                var notes_grouped_trivial = [];
                for (var _i = 0, notes_segment_next_1 = notes_segment_next; _i < notes_segment_next_1.length; _i++) {
                    var note_1 = notes_segment_next_1[_i];
                    notes_grouped_trivial.push(note_1);
                }
                // Subtarget -> Subtarget Iterator -> Target -> Target Iterator
                return notes_grouped_trivial;
            }
            else {
                throw ['mode', this.mode, 'not supported'].join(' ');
            }
        };
        Detect.prototype.pre_advance = function (clip_user_input) {
        };
        return Detect;
    }(Targeted));
    algorithm.Detect = Detect;
    var Predict = /** @class */ (function (_super) {
        __extends(Predict, _super);
        function Predict() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Predict.prototype.get_name = function () {
            return algorithm.PREDICT;
        };
        Predict.prototype.get_depth = function () {
            return 1;
        };
        // TODO: put all calls to Clip in whatever class is a client to algorithms
        // NB: there can be multiple targets per segment
        // TODO: replace the notes in clip_target with these
        Predict.prototype.determine_targets = function (notes_segment_next) {
            if (this.mode === modes.HARMONY) {
                var chords_grouped = harmony_1.harmony.group(notes_segment_next);
                var chords_monophonified = harmony_1.harmony.monophonify(notes_segment_next);
                return chords_monophonified;
            }
            else if (this.mode === modes.MELODY) {
                var notes_grouped_trivial = [];
                for (var _i = 0, notes_segment_next_2 = notes_segment_next; _i < notes_segment_next_2.length; _i++) {
                    var note_2 = notes_segment_next_2[_i];
                    notes_grouped_trivial.push(note_2);
                }
                return notes_grouped_trivial;
            }
            else {
                throw ['mode', this.mode, 'not supported'].join(' ');
            }
        };
        Predict.prototype.determine_region_current = function (notes_target_next) {
            return [
                notes_target_next[0].model.note.beat_start,
                notes_target_next[notes_target_next.length - 1].model.note.get_beat_end()
            ];
        };
        // set right interval
        Predict.prototype.determine_region_past = function (notes_target_next) {
            return notes_target_next[0].model.note.beat_start;
        };
        // set left interval
        Predict.prototype.determine_region_upcoming = function (notes_target_next) {
            return notes_target_next[notes_target_next.length - 1].model.note.get_beat_end();
        };
        Predict.prototype.pre_advance = function () {
            //
        };
        return Predict;
    }(Targeted));
    algorithm.Predict = Predict;
    var Parse = /** @class */ (function () {
        function Parse() {
        }
        Parse.prototype.get_name = function () {
            return algorithm.PARSE;
        };
        Parse.prototype.get_depth = function () {
            return this.depth;
        };
        Parse.prototype.set_depth = function (depth) {
            this.depth = depth;
        };
        // happens after loop of first target is set
        Parse.prototype.post_init = function (song, clip_user_input) {
            song.set_overdub(1);
            song.set_session_record(1);
            clip_user_input.fire();
        };
        // happens after last target is guessed
        Parse.prototype.pre_terminate = function (song, clip_user_input) {
            song.set_overdub(0);
            song.set_session_record(0);
            clip_user_input.stop();
        };
        return Parse;
    }());
    algorithm.Parse = Parse;
    var Derive = /** @class */ (function () {
        function Derive() {
        }
        Derive.prototype.get_name = function () {
            return algorithm.DERIVE;
        };
        Derive.prototype.get_depth = function () {
            return this.depth;
        };
        Derive.prototype.set_depth = function (depth) {
            this.depth = depth;
        };
        // happens after loop of first target is set
        Derive.prototype.post_init = function (song, clip_user_input) {
            song.set_overdub(1);
            song.set_session_record(1);
            clip_user_input.fire();
        };
        // happens after last target is guessed
        Derive.prototype.pre_terminate = function (song, clip_user_input) {
            song.set_overdub(0);
            song.set_session_record(0);
            clip_user_input.stop();
        };
        Derive.prototype.determine_region_current = function (notes_target_next) {
            return [
                notes_target_next[0].model.note.beat_start,
                notes_target_next[notes_target_next.length - 1].model.note.get_beat_end()
            ];
        };
        // set right interval
        Derive.prototype.determine_region_past = function (notes_target_next) {
            return notes_target_next[0].model.note.beat_start;
        };
        // set left interval
        Derive.prototype.determine_region_upcoming = function (notes_target_next) {
            return notes_target_next[notes_target_next.length - 1].model.note.get_beat_end();
        };
        Derive.prototype.accept = function (elaboration, i_depth, i_breadth) {
            this.struct_train.append(elaboration);
            nextthis.iterator_train.next();
            // if (index_layer + 1 > this.clips.length) {
            //     let clip_dao_virtual = new LiveClipVirtual(elaboration);
            //
            //     clip_dao_virtual.beat_start = elaboration[0].model.note.beat_start;
            //     clip_dao_virtual.beat_end = elaboration[elaboration.length - 1].model.note.get_beat_end();
            //
            //     let clip_virtual = new c.Clip(clip_dao_virtual);
            //     this.add_clsip(clip_virtual);
            // } else {
            //     let clip_last = this.clips[this.clips.length - 1];
            //     clip_last.clip_dao.beat_end = elaboration[elaboration.length - 1].model.note.get_beat_end();
            //     clip_last.set_notes(elaboration);
            // }
            //
            // let leaves_within_interval = this.get_leaves_within_interval(beat_start, beat_end);
            //
            // if (index_layer == 1) {
            //     this.add_first_layer(elaboration, this.clips.length - 1)
            // } else {
            //     this.add_layer(leaves_within_interval, elaboration, this.clips.length - 1);
            // }
            //
            // this.update_leaves(leaves_within_interval);
        };
        return Derive;
    }());
    algorithm.Derive = Derive;
    var Harmonic = /** @class */ (function () {
        function Harmonic() {
        }
        Harmonic.prototype.transform = function (notes_target) {
            function compare(note_former, note_latter) {
                if (note_former.model.note.beat_start < note_latter.model.note.beat_start)
                    return -1;
                if (note_former.model.note.beat_start > note_latter.model.note.beat_start)
                    return 1;
                return 0;
            }
            notes_target.sort(compare);
            var length_beats = notes_target[notes_target.length - 1].model.note.get_beat_end() - notes_target[0].model.note.beat_start;
            var duration_monophonic = length_beats / notes_target.length;
            clip_user_input.set_notes();
        };
        return Harmonic;
    }());
    algorithm.Harmonic = Harmonic;
    var Melodic = /** @class */ (function () {
        function Melodic() {
        }
        return Melodic;
    }());
    algorithm.Melodic = Melodic;
})(algorithm = exports.algorithm || (exports.algorithm = {}));
//# sourceMappingURL=algorithm.js.map