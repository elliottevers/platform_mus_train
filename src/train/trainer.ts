import {note as n} from "../note/note";
import TreeModel = require("tree-model");
// import {parse_matrix, pwindow} from "../scripts/parse_tree";
import {algorithm, algorithm as algo} from "./algorithm";
import {history} from "../history/history";
import {target} from "../target/target";
import {segment} from "../segment/segment";
import {parse} from "../parse/parse";
import {utils} from "../utils/utils";
import {window} from "../render/window";
import {message} from "../message/messenger";
import {song} from "../song/song";
import {clip} from "../clip/clip";
const _ = require('underscore');
const l = require('lodash');

export namespace trainer {

    // import Targetable = train.algorithm.Targetable;
    import HistoryUserInput = history.HistoryUserInput;
    // import TargetType = target.TargetType;
    import TargetIterator = target.TargetIterator;
    // import MatrixIterator = history.MatrixIterator;
    import Segment = segment.Segment;
    import ParseTree = parse.ParseTree;
    import Algorithm = algorithm.Algorithm;
    import division_int = utils.division_int;
    import remainder = utils.remainder;
    import PARSE = algorithm.PARSE;
    import DERIVE = algorithm.DERIVE;
    import DETECT = algorithm.DETECT;
    import PREDICT = algorithm.PREDICT;
    import Parse = algorithm.Parse;
    import Renderable = window.Renderable;
    import TreeRenderable = window.TreeRenderable;
    import Subtarget = target.Subtarget;
    import Target = target.Target;
    import Messenger = message.Messenger;
    import Song = song.Song;
    import Clip = clip.Clip;
    import FactoryHistoryUserInput = history.FactoryHistoryUserInput;
    import SubtargetIterator = target.SubtargetIterator;

    export class MatrixIterator {
        private num_rows: number;
        private num_columns: number;

        private row_current: number;
        private column_current: number;

        private i;

        constructor(num_rows: number, num_columns: number) {
            this.num_rows = num_rows;
            this.num_columns = num_columns;

            this.i = -1;
        }

        private next_row() {
            this.i = this.i + this.num_columns;
        }

        private next_column() {
            this.i = this.i + 1;
        }

        public next() {

            let value: number[] = null;

            this.next_column();

            if (this.i === this.num_columns * this.num_rows + 1) {
                return {
                    value: value,
                    done: true
                }
            }

            return {
                value: this.get_coord_current(),
                done: false
            };
        }

        public get_coord_current(): number[] {
                // let pos_row = division_int(this.i + 1, this.num_columns);
                // let pos_column = remainder(this.i + 1, this.num_columns);
            let pos_row = division_int(this.i, this.num_columns);
            let pos_column = remainder(this.i, this.num_columns);
            return [pos_row, pos_column]
        }
    }

    class IteratorTrainFactory {
        public static get_iterator_train(algorithm: Algorithm, segments: Segment[]) {

            let iterator: MatrixIterator;

            switch (algorithm.get_name()) {
                case algo.DETECT: {
                    iterator = new MatrixIterator(1, segments.length);
                    break;
                }
                case algo.PREDICT: {
                    iterator = new MatrixIterator(1, segments.length);
                    break;
                }
                case algo.PARSE: {
                    iterator = new MatrixIterator(algorithm.get_depth(), segments.length);
                    break;
                }
                case algo.DERIVE: {
                    iterator = new MatrixIterator(algorithm.get_depth(), segments.length);
                    break;
                }
                default: {
                    throw ['algorithm of name', algorithm.get_name(), 'not supported'].join(' ')
                }
            }
            return iterator
        }
    }

    export class Trainer {

        private window;
        private algorithm; // TODO: type
        private clip_user_input: Clip;
        private clip_target: Clip;
        private song: Song;
        private segments: Segment[];
        private messenger: Messenger;

        private list_parse_tree: ParseTree[];
        public history_user_input;

        private counter_user_input: number;
        private limit_user_input: number;
        private limit_input_reached: boolean;

        private segment_current: Segment;
        private target_current: Target;
        private subtarget_current: Subtarget;

        private matrix_target_iterator: TargetIterator[][];
        private iterator_target_current: TargetIterator;

        private iterator_matrix_train: MatrixIterator;

        private iterator_subtarget_current: SubtargetIterator;

        // window is either tree or list
        // mode is either harmonic or melodic
        // algorithm is either detect, predict, parse, or derive
        // history
        constructor(window, user_input_handler, algorithm, clip_user_input, clip_target, song, segments, messenger) {
            this.window = window;
            this.algorithm = algorithm;
            this.clip_user_input = clip_user_input;
            this.clip_target = clip_target;
            this.song = song;
            this.segments = segments;
            this.messenger = messenger;

            // this.struct = new StructFactory.get_struct(user_input_handler.mode);
            // this.history_user_input = new HistoryUserInput(
            //     this.algorithm,
            //     this.segments
            // );

            this.history_user_input = FactoryHistoryUserInput.create_history_user_input(
                this.algorithm,
                this.segments
            );

            this.iterator_matrix_train = IteratorTrainFactory.get_iterator_train(
                this.algorithm,
                this.segments
            );

            this.matrix_target_iterator = l.cloneDeep(this.history_user_input.matrix_data);

            if (this.algorithm.b_targeted()) {
                this.create_targets()
            } else {
                this.create_parse_trees();
            }
        }

        private create_parse_trees() {
            let list_parse_tree: ParseTree[] = [];

            switch (this.algorithm.get_name()) {
                case PARSE: {
                    for (let segment of this.segments) {
                        let notes = this.clip_user_input.get_notes(
                            segment.beat_start,
                            0,
                            segment.beat_end - segment.beat_start,
                            128
                        );
                        for (let note of notes) {
                            list_parse_tree.push(
                                new ParseTree(
                                    note,
                                    this.algorithm.get_depth()
                                )
                            )
                        }
                    }
                    break;
                }
                case DERIVE: {
                    let note = this.segments[0].get_note();
                    list_parse_tree.push(
                        new ParseTree(
                            note,
                            this.algorithm.get_depth()
                        )
                    );
                    break;
                }
                default: {
                    throw ['algorithm of name', this.algorithm.get_name(), 'not supported'].join(' ')
                }
            }
            return list_parse_tree;
        }

        // now we can assume we have a list instead of a matrix
        private create_targets() {

            this.clip_target.load_notes_within_markers();

            // let segment_targetable: SegmentTargetable;

            // let iterators_target: TargetIterator[] = [];

            for (let i_segment in this.segments) {
                // need SegmentTargetable -> TargetIterator
                let segment = this.segments[Number(i_segment)];
                 let sequence_targets = this.algorithm.determine_targets(
                    this.clip_target.get_notes(
                        segment.beat_start,
                        0,
                        segment.beat_end,
                        128
                    )
                );
                this.matrix_target_iterator[0][Number(i_segment)] = TargetIterator.from_sequence_target(sequence_targets);
            }
        }

        public clear_window() {
            this.window.clear()
        }

        public render_window() {
            this.window.render()
        }

        public reset_user_input() {
            if (_.contains([DETECT, PREDICT], this.algorithm.get_name())) {
                let coords = this.iterator_matrix_train.get_coord_current();
                let notes_last = this.matrix_target_iterator[coords[0] - 1][coords[1]].get_notes();
                this.clip_user_input.set_notes(
                    notes_last
                );
            } else {
                return
            }
        }

        private set_loop() {
            let interval = this.segment_current.get_endpoints_loop();

            this.clip_user_input.set_endpoints_loop(
                interval[0],
                interval[1]
            )
        }

        public resume() {
            // set segment current
            // set target current
            // set subtarget current
            this.algorithm.post_init()
        }

        public pause() {
            this.algorithm.pre_terminate()
        }

        public terminate() {
            this.algorithm.pre_terminate()
        }

        // calls next() under the hood, emits intervals to the UserInputHandler, renders the region of interest to cue user
        public init() {
            this.advance_segment();
            this.algorithm.post_init(this.song, this.clip_user_input)
        }

        private advance_segment() {
            // TODO:
            let obj_next_coord = this.iterator_matrix_train.next();

            if (obj_next_coord.done) {
                this.algorithm.terminate()
            }

            let coord = obj_next_coord.value;
            this.segment_current = this.segments[coord[1]];
            this.iterator_target_current = this.matrix_target_iterator[coord[0]][coord[1]];

            // TODO: why isn't this a 'TargetIterator'?
            let obj_target = this.iterator_target_current.next();

            if (obj_target.done) {
                return
            }

            this.target_current = obj_target.value;

            this.iterator_subtarget_current = this.target_current.iterator_subtarget;

            let obj_subtarget = this.iterator_subtarget_current.next();

            if (obj_subtarget.done) {
                return
            }

            this.subtarget_current = obj_subtarget.value;
        }

        private advance_subtarget() {

            let possibly_history: Target[] = this.iterator_target_current.targets;

            let obj_next_subtarget = this.iterator_subtarget_current.next();

            if (obj_next_subtarget.done) {

                let obj_next_target = this.iterator_target_current.next();

                if (obj_next_target.done) {

                    let obj_next_coord = this.iterator_matrix_train.next();

                    if (obj_next_coord.done) {
                        this.history_user_input.add_sequence_target(
                            possibly_history,
                            this.iterator_matrix_train
                        );
                        this.algorithm.pre_terminate();
                        return
                    }

                    let coord_next = obj_next_coord.value;

                    this.iterator_target_current = this.matrix_target_iterator[coord_next[0]][coord_next[1]];

                    this.segment_current = this.segments[coord_next[1]]
                }

                this.target_current = obj_next_target.value;

                let obj_next_subtarget_again = this.target_current.iterator_subtarget.next();

                this.subtarget_current = obj_next_subtarget_again.value;

                this.iterator_subtarget_current = this.target_current.iterator_subtarget
            } else {
                this.subtarget_current = obj_next_subtarget.value;
            }


            if (this.algorithm.b_targeted()) {
                // set the targets and shit
            }

            // set the context in ableton
            this.set_loop();
        }

        // user input can be either 1) a pitch or 2) a sequence of notes
        accept_input(input_user: TreeModel.Node<n.Note>[]) {

            this.counter_user_input++;

            if (this.counter_user_input >= this.limit_user_input) {
                this.limit_input_reached = true
            }

            if (this.limit_input_reached) {
                // completely ignore
                return
            }

            // parse/derive logic
            if (!this.algorithm.b_targeted()) {
                // this.struct.add(
                //     input_user
                // );

                this.list_parse_tree = ParseTree.add(
                    input_user,
                    this.list_parse_tree,
                    this.iterator_matrix_train
                );

                this.advance_segment();

                this.window.render_regions(
                    this.iterator_matrix_train,
                    this.matrix_target_iterator
                );

                this.window.render_notes(
                    this.history_user_input
                );

                this.window.render_tree(
                    this.list_parse_tree
                );

                return
            }

            // detect/predict logic
            // NB: assumes we're only giving list of a single note as input
            if (input_user[0].model.note.pitch === this.subtarget_current.note.model.note.pitch) {

                // let coords = this.iterator_matrix_train.get_coord_current();

                // let target_iterator_current = this.matrix_target_iterator[coords[0]][coords[1]];

                // NB: we actually add the note that the user was trying to guess, not the note played
                // this.history_user_input.add_subtarget(
                //     this.iterator_target_current.current().iterator_subtarget.current(),
                //     this.iterator_matrix_train
                // );

                this.advance_subtarget();

                this.window.render_regions(
                    this.iterator_matrix_train,
                    this.matrix_target_iterator
                );
            }
        }
    }
}