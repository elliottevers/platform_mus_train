"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var algorithm_1 = require("./algorithm");
var history_1 = require("../history/history");
var parse_1 = require("../parse/parse");
var utils_1 = require("../utils/utils");
var trainer;
(function (trainer) {
    var HistoryUserInput = history_1.history.HistoryUserInput;
    var MatrixIterator = history_1.history.MatrixIterator;
    var ParseTree = parse_1.parse.ParseTree;
    var division_int = utils_1.utils.division_int;
    var remainder = utils_1.utils.remainder;
    var MatrixIterator = /** @class */ (function () {
        function MatrixIterator(num_rows, num_columns) {
            this.num_rows = num_rows;
            this.num_columns = num_columns;
            this.i = -1;
        }
        MatrixIterator.prototype.next_row = function () {
            this.i = this.i + this.num_columns;
        };
        MatrixIterator.prototype.next_column = function () {
            this.i = this.i + 1;
        };
        MatrixIterator.prototype.next = function () {
            var value = null;
            this.next_column();
            if (this.i === this.num_columns * this.num_rows + 1) {
                return {
                    value: value,
                    done: true
                };
            }
            var pos_row = division_int(this.i + 1, this.num_columns);
            var pos_column = remainder(this.i + 1, this.num_columns);
            value = [pos_row, pos_column];
            return {
                value: value,
                done: false
            };
        };
        return MatrixIterator;
    }());
    trainer.MatrixIterator = MatrixIterator;
    var IteratorTrainFactory = /** @class */ (function () {
        function IteratorTrainFactory() {
        }
        IteratorTrainFactory.get_iterator_train = function (algorithm, segments) {
            var iterator;
            switch (algorithm.get_name()) {
                case algorithm_1.algorithm.DETECT: {
                    iterator = new MatrixIterator(1, segments.length);
                    break;
                }
                case algorithm_1.algorithm.PREDICT: {
                    iterator = new MatrixIterator(1, segments.length);
                    break;
                }
                case algorithm_1.algorithm.PARSE: {
                    iterator = new MatrixIterator(algorithm.get_depth(), segments.length);
                    break;
                }
                case algorithm_1.algorithm.DERIVE: {
                    iterator = new MatrixIterator(algorithm.get_depth(), segments.length);
                    break;
                }
                default: {
                    throw ['algorithm of name', algorithm.get_name(), 'not supported'].join(' ');
                }
            }
            return iterator;
        };
        return IteratorTrainFactory;
    }());
    var Trainer = /** @class */ (function () {
        // window is either tree or list
        // mode is either harmonic or melodic
        // algorithm is either detect, predict, parse, or derive
        // history
        function Trainer(window, user_input_handler, algorithm, clip_user_input, clip_target, song, segments, messenger) {
            this.window = window;
            this.algorithm = algorithm;
            this.clip_user_input = clip_user_input;
            this.clip_target = clip_target;
            this.song = song;
            this.segments = segments;
            this.messenger = messenger;
            // this.struct = new StructFactory.get_struct(user_input_handler.mode);
            this.history_user_input = new HistoryUserInput(this.algorithm, this.segments);
            if (this.algorithm.b_targetable()) {
                this.create_targets();
            }
            if (this.algorithm.b_growable()) {
                this.create_parse_trees();
            }
            this.iterator_matrix_train = IteratorTrainFactory.get_iterator_train(this.algorithm, this.segments);
        }
        Trainer.prototype.create_parse_trees = function () {
            var list_parse_tree = [];
            switch (this.algorithm.get_name()) {
                case :
                    algorithms.PARSE;
                    {
                        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
                            var segment_1 = _a[_i];
                            for (var _b = 0, _c = segment_1.get_notes(); _b < _c.length; _b++) {
                                var note = _c[_b];
                                list_parse_tree.push(new ParseTree(note, this.algorithm.get_depth()));
                            }
                        }
                        break;
                    }
                case :
                    algorithms.DERIVE;
                    {
                        var note = this.segments[0].get_note();
                        list_parse_tree.push(new ParseTree(note, this.algorithm.get_depth()));
                        break;
                    }
                default: {
                    throw ['algorithm of name', this.algorithm.get_name(), 'not supported'].join(' ');
                }
            }
            return list_parse_tree;
        };
        // now we can assume we have a list instead of a matrix
        Trainer.prototype.create_targets = function () {
            this.clip_target.load_notes_within_markers();
            // let segment_targetable: SegmentTargetable;
            var target_iterators = [];
            for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
                var segment_2 = _a[_i];
                // need SegmentTargetable -> TargetIterator
                target_iterators.push(this.algorithm.determine_targets(this.clip_target.get_notes(segment_2.beat_start, 0, segment_2.beat_end, 128)));
            }
            this.target_iterators = target_iterators;
        };
        Trainer.prototype.clear_window = function () {
            this.window.clear();
        };
        Trainer.prototype.render_window = function () {
            this.window.render();
        };
        Trainer.prototype.reset_user_input = function () {
            if ([algorithms.DETECT, algorithms.PREDICT].includes(this.algorithm.name)) {
                this.clip_user_input.set_notes(this.struct.get_notes(
                // TODO: pass requisite information
                ));
            }
            else {
                return;
            }
        };
        Trainer.prototype.set_loop = function () {
            var interval = this.segment_current.get_endpoints_loop();
            this.clip_user_input.set_endpoints_loop(interval[0], interval[1]);
        };
        Trainer.prototype.resume = function () {
            // set segment current
            // set target current
            // set subtarget current
            this.algorithm.post_init();
        };
        Trainer.prototype.pause = function () {
            this.algorithm.pre_terminate();
        };
        // calls next() under the hood, emits intervals to the UserInputHandler, renders the region of interest to cue user
        Trainer.prototype.init = function () {
            this.advance();
            this.algorithm.post_init();
        };
        Trainer.prototype.advance_segment = function () {
        };
        Trainer.prototype.advance = function () {
            var _a;
            // this.segment_current = this.segment_iterator.next();
            // this.target_current = this.target_iterator.next();
            // this.subtarget_current = this.subtarget_current.next();
            _a = this.iterator_matrix_train.next(), i_height = _a[0], i_width = _a[1];
            if (this.algorithm.b_targeted()) {
                // set the targets and shit
            }
            // set the context in ableton
            this.set_loop();
            if (done) {
                this.algorithm.pre_terminate();
            }
        };
        // advance_target() {
        //     this.target_current = this.target_iterator.next()
        // }
        //
        // advance_subtarget() {
        //     let val = this.subtarget_iterator.next();
        //     if (val.done) {
        //         this.advance_target()
        //     } else {
        //         this.subtarget_current = val.value
        //     }
        // }
        Trainer.prototype.accept_input = function (input_user) {
            this.counter_user_input++;
            if (this.counter_user_input >= this.limit_user_input) {
                this.limit_input_reached = true;
            }
            if (this.limit_input_reached) {
                // completely ignore
                return;
            }
            if (!this.algorithm.b_targeted()) {
                this.advance_segment();
            }
            if (input_user.note.pitch === this.subtarget_current.note.pitch) {
                // NB: we actually add the note that the user was trying to guess, not the note played
                this.history_user_input.add_subtarget(this.target_iterator.current().subtarget_iterator.current());
                this.advance();
                // TODO: make sure for detection/prediction we're making "input_user" exactly the same as the "target note", if we're restoring sessions from user input
                // this.window.add(input_user);
                this.struct.add(input_user);
                this.window.render(
                // this.struct
                );
            }
        };
        return Trainer;
    }());
    trainer.Trainer = Trainer;
})(trainer = exports.trainer || (exports.trainer = {}));
//# sourceMappingURL=trainer.js.map