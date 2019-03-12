import {note, note as n} from "../note/note";
import TreeModel = require("tree-model");
import {algorithm} from "./algorithm";
import {history} from "../history/history";
import {target} from "../target/target";
import {segment} from "../segment/segment";
import {parse} from "../parse/parse";
import {message} from "../message/messenger";
import {song} from "../song/song";
import {clip} from "../clip/clip";
import {iterate} from "./iterate";
const _ = require('underscore');
const l = require('lodash');

export namespace trainer {

    import HistoryUserInput = history.HistoryUserInput;
    import TargetIterator = target.TargetIterator;
    import Segment = segment.Segment;
    import PARSE = algorithm.PARSE;
    import DERIVE = algorithm.DERIVE;
    import DETECT = algorithm.DETECT;
    import PREDICT = algorithm.PREDICT;
    import Subtarget = target.Subtarget;
    import Target = target.Target;
    import Messenger = message.Messenger;
    import Song = song.Song;
    import Clip = clip.Clip;
    import SubtargetIterator = target.SubtargetIterator;
    import StructParse = parse.StructParse;
    import MatrixIterator = iterate.MatrixIterator;
    import FactoryMatrixTargetIterator = iterate.FactoryMatrixTargetIterator;
    import IteratorTrainFactory = iterate.IteratorTrainFactory;

    export class Trainer {

        private window;
        private algorithm; // TODO: type
        private clip_user_input: Clip;
        private clip_target: Clip;
        private song: Song;
        private segments: Segment[];
        private messenger: Messenger;

        private struct_parse: StructParse;
        public history_user_input;

        private counter_user_input: number;
        private limit_user_input: number;
        private limit_input_reached: boolean;

        private segment_current: Segment;
        private target_current: Target;
        private subtarget_current: Subtarget;

        private matrix_focus: TargetIterator[][];
        private iterator_matrix_train: MatrixIterator;
        private iterator_target_current: TargetIterator;
        private iterator_subtarget_current: SubtargetIterator;

        constructor(window, user_input_handler, algorithm, clip_user_input, clip_target, song, segments, messenger) {
            this.window = window;
            this.algorithm = algorithm;
            this.clip_user_input = clip_user_input;
            this.clip_target = clip_target;
            this.song = song;
            this.segments = segments;
            this.messenger = messenger;

            this.iterator_matrix_train = IteratorTrainFactory.get_iterator_train(
                this.algorithm,
                this.segments
            );

            this.matrix_focus = FactoryMatrixTargetIterator.create_matrix_focus(
                this.algorithm,
                this.segments
            );

            this.history_user_input = new HistoryUserInput(
                l.cloneDeep(this.matrix_focus)
            );

            this.window.initialize_clips(
                this.algorithm,
                this.segments
            );

            this.window.set_length_beats(
                this.segments[this.segments.length - 1].beat_end
            );

            if (this.algorithm.b_targeted()) {
                this.create_targets()
            } else {
                this.struct_parse = new StructParse(
                    l.cloneDeep(this.matrix_focus)
                );
                this.initialize_struct_parse();
            }
        }

        private initialize_struct_parse() {

            let note_segment_last = this.segments[this.segments.length - 1].get_note();

            let tree: TreeModel = new TreeModel();

            this.struct_parse.set_root(
                tree.parse(
                    {
                        id: -1, // TODO: hashing scheme for clip id and beat start
                        note: new n.Note(
                            note_segment_last.model.note.pitch,
                            this.segments[0].get_note().model.note.beat_start,
                            (note_segment_last.model.note.beat_start + note_segment_last.model.note.beats_duration) - this.segments[0].get_note().model.note.beat_start,
                            note_segment_last.model.note.velocity,
                            note_segment_last.model.note.muted
                        ),
                        children: [

                        ]
                    }
                )
            );

            // TODO: make the root the length of the entire song

            this.window.add_note_to_clip_root(
                note_segment_last
            );

            // set first layer, which are the various key center estimates

            for (let i_segment in this.segments) {

                let segment = this.segments[Number(i_segment)];

                let note = segment.get_note();

                let coord_current_virtual = [0, Number(i_segment)];

                this.struct_parse.set_notes(
                    [note],
                    coord_current_virtual
                );
                this.window.add_notes_to_clip(
                    [note],
                    coord_current_virtual
                )
            }

            switch (this.algorithm.get_name()) {
                case PARSE: {
                    for (let i_segment in this.segments) {
                        let segment = this.segments[Number(i_segment)];
                        let notes = this.clip_target.get_notes(
                            segment.beat_start,
                            0,
                            segment.beat_end - segment.beat_start,
                            128
                        );
                        let coord_current_virtual = [this.algorithm.get_depth() - 1, Number(i_segment)];

                        this.struct_parse.set_notes(
                            notes,
                            coord_current_virtual
                        );
                        this.window.add_notes_to_clip(
                            notes,
                            coord_current_virtual
                        )
                    }
                    break;
                }
                case DERIVE: {
                    //  TODO: anything?
                    break;
                }
                default: {
                    throw ['algorithm of name', this.algorithm.get_name(), 'not supported'].join(' ')
                }
            }
        }



        // now we can assume we have a list instead of a matrix
        private create_targets() {

            this.clip_target.load_notes_within_markers();

            for (let i_segment in this.segments) {
                let sequence_targets = this.algorithm.determine_targets(
                    this.clip_target.get_notes(
                        this.segments[Number(i_segment)].beat_start,
                        0,
                        this.segments[Number(i_segment)].beat_end - this.segments[Number(i_segment)].beat_start,
                        128
                    )
                );
                this.matrix_focus[0][Number(i_segment)] = TargetIterator.from_sequence_target(sequence_targets);
            }
        }

        public clear_window() {
            this.window.clear()
        }

        public render_window() {
            this.window.render(
                this.iterator_matrix_train,
                this.matrix_focus,
                this.algorithm,
                this.struct_parse
            )
        }

        public reset_user_input() {
            if (_.contains([DETECT, PREDICT], this.algorithm.get_name())) {
                let coords = this.iterator_matrix_train.get_coord_current();
                let notes_last = this.matrix_focus[coords[0] - 1][coords[1]].get_notes();
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
            this.algorithm.post_init()
        }

        public pause() {
            this.algorithm.pre_terminate()
        }

        public terminate() {
            this.algorithm.pre_terminate()
        }

        public init() {
            if (this.algorithm.b_targeted()) {
                this.advance_subtarget();
            } else {
                this.advance_segment();
            }
            this.algorithm.post_init(this.song, this.clip_user_input)
        }

        private advance_segment() {

            let coords_at_time = this.iterator_matrix_train.get_coord_current();
            let obj_next_coord = this.iterator_matrix_train.next();

            if (obj_next_coord.done) {
                if (this.algorithm.get_name() === PARSE) {
                    // TODO: make the connections with the root
                    for (let segment of this.segments) {
                        this.struct_parse.add(
                            [segment.get_note()],
                            coords_at_time,
                            this.algorithm
                        );
                    }
                    this.struct_parse.finish()
                }
                this.algorithm.pre_terminate(this.song, this.clip_user_input);
                return
            }

            let coord = obj_next_coord.value;

            this.segment_current = this.segments[coord[1]];
        }

        private advance_subtarget() {

            let possibly_history: Target[] = this.iterator_target_current.targets;

            let coord_at_time: number[] = this.iterator_matrix_train.get_coord_current();

            let obj_next_subtarget = this.iterator_subtarget_current.next();

            if (obj_next_subtarget.done) {

                let obj_next_target = this.iterator_target_current.next();

                if (obj_next_target.done) {

                    let obj_next_coord = this.iterator_matrix_train.next();

                    this.history_user_input.add_sequence_target(
                        possibly_history,
                        coord_at_time
                    );

                    if (obj_next_coord.done) {
                        this.history_user_input.add_sequence_target(
                            possibly_history,
                            coord_at_time
                        );

                        this.algorithm.pre_terminate();

                        return
                    }

                    let coord_next = obj_next_coord.value;

                    this.iterator_target_current = this.matrix_focus[coord_next[0]][coord_next[1]];

                    this.segment_current = this.segments[coord_next[1]];

                    let obj_next_target_twice_nested = this.iterator_target_current.next();

                    this.target_current = obj_next_target_twice_nested.value;

                    let obj_next_subtarget_twice_nested = this.target_current.iterator_subtarget.next();

                    this.subtarget_current = obj_next_subtarget_twice_nested.value;

                    this.iterator_subtarget_current = this.target_current.iterator_subtarget;

                    return
                }

                this.target_current = obj_next_target.value;

                let obj_next_subtarget_once_nested = this.target_current.iterator_subtarget.next();

                this.subtarget_current = obj_next_subtarget_once_nested.value;

                this.iterator_subtarget_current = this.target_current.iterator_subtarget;

                return
            }

            this.subtarget_current = obj_next_subtarget.value;
        }

        // user input can be either 1) a pitch or 2) a sequence of notes
        accept_input(notes_input_user: TreeModel.Node<n.Note>[]) {

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

                this.history_user_input.add(
                    notes_input_user,
                    this.iterator_matrix_train.get_coord_current()
                );

                this.window.add_notes_to_clip(
                    notes_input_user,
                    this.iterator_matrix_train.get_coord_current()
                );

                // TODO: implement
                this.struct_parse.add(
                    notes_input_user,
                    this.iterator_matrix_train.get_coord_current(),
                    this.algorithm
                );

                this.advance_segment();

                this.render_window();

                return
            }

            // detect/predict logic
            // NB: assumes we're only giving list of a single note as input
            if (notes_input_user[0].model.note.pitch === this.subtarget_current.note.model.note.pitch) {

                this.window.add_notes_to_clip(
                    [this.subtarget_current.note],
                    this.iterator_matrix_train.get_coord_current()
                );

                if (this.algorithm.b_targeted()) {
                    // set the targets and shit
                }

                this.advance_subtarget();

                this.set_loop();

                this.render_window();
            }
        }
    }
}