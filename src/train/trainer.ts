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
import {log} from "../log/logger";
import {window} from "../render/window";
import {utils} from "../utils/utils";
import {live} from "../live/live";
import {track} from "../track/track";
// import {get_notes_on_track} from "../scripts/segmenter";
const _ = require('underscore');
const l = require('lodash');

export namespace trainer {

    import HistoryUserInput = history.HistoryUserInput;
    import TargetIterator = target.TargetIterator;
    import Segment = segment.Segment;
    import Subtarget = target.Subtarget;
    import Target = target.Target;
    import Messenger = message.Messenger;
    import Clip = clip.Clip;
    import SubtargetIterator = target.SubtargetIterator;
    import StructParse = parse.StructParse;
    import MatrixIterator = iterate.MatrixIterator;
    import IteratorTrainFactory = iterate.IteratorTrainFactory;
    import Note = note.Note;
    import Track = track.Track;
    import FactoryMatrixObjectives = iterate.FactoryMatrixObjectives;
    import Trainable = algorithm.Trainable;
    // import Algorithm = algorithm.Algorithm;

    export class Trainer {

        private window;
        public trainable: Trainable; // TODO: type
        public clip_user_input: Clip;
        public clip_user_input_synchronous: Clip;
        // private clip_target: Clip;
        private notes_target: TreeModel.Node<Note>[];
        private track_target: Track;
        private song;
        private segments: Segment[];
        private messenger: Messenger;

        public struct_parse: StructParse;
        public history_user_input: HistoryUserInput;

        private counter_user_input: number;
        private limit_user_input: number;
        private limit_input_reached: boolean;

        private segment_current: Segment;
        public target_current: Target;
        private subtarget_current: Subtarget;

        private matrix_targets: TargetIterator[][];
        public iterator_matrix_train: MatrixIterator;
        private iterator_target_current: TargetIterator;
        private iterator_subtarget_current: SubtargetIterator;

        constructor(window, user_input_handler, algorithm, clip_user_input, clip_user_input_synchronous, track_target, song, segments, messenger) {
            this.window = window;
            this.algorithm = algorithm;
            this.clip_user_input = clip_user_input;
            this.clip_user_input_synchronous = clip_user_input_synchronous;
            // this.notes_target = notes_target;
            this.track_target = track_target;
            this.song = song;
            this.segments = segments;
            this.messenger = messenger;


            this.notes_target = track.get_notes_on_track(
                track_target.get_path()
            );

            this.iterator_matrix_train = IteratorTrainFactory.get_iterator_train(
                this.trainable,
                this.segments
            );

            this.history_user_input = new HistoryUserInput(
                FactoryMatrixObjectives.create_matrix_objectives(
                    this.trainable,
                    this.segments
                )
            );

            this.window.initialize_clips(
                this.trainable,
                this.segments
            );

            this.window.set_length_beats(
                this.segments[this.segments.length - 1].beat_end
            );

            this.trainable.initialize(

            );

            this.matrix_targets = this.trainable.create_matrix_targets(

            );

            this.struct_parse = this.trainable.create_struct_parse(

            )

        }
        public clear_window() {
            this.window.clear()
        }

        public render_window() {
            this.window.render(
                this.iterator_matrix_train,
                this.target_current,
                this.trainable,
                this.struct_parse
            )
        }

        public unpause() {
            this.trainable.unpause()
        }

        public pause() {
            this.trainable.pause()
        }

        public init(virtual?: boolean) {

        }

        private advance_segment(first_time?: boolean) {

            let obj_next_coord = this.iterator_matrix_train.next();

            if (obj_next_coord.done) {

                this.trainable.terminate(this.song, this.clip_user_input);

                return
            }

            let coord = obj_next_coord.value;

            this.segment_current = this.segments[coord[1]];
        }

        private advance_subtarget() {

            let have_not_begun: boolean = (!this.iterator_matrix_train.b_started);

            if (have_not_begun) {
                this.iterator_matrix_train.next();

                this.iterator_target_current = this.matrix_targets[0][0];

                this.iterator_target_current.next();

                this.target_current = this.iterator_target_current.current();

                this.iterator_subtarget_current = this.target_current.iterator_subtarget;

                this.iterator_subtarget_current.next();

                this.subtarget_current = this.iterator_subtarget_current.current();

                return
            }

            let obj_next_subtarget = this.iterator_subtarget_current.next();

            if (obj_next_subtarget.done) {

                let obj_next_target = this.iterator_target_current.next();

                if (obj_next_target.done) {

                    let obj_next_coord = this.iterator_matrix_train.next();

                    if (obj_next_coord.done) {

                        this.trainable.terminate();

                        return
                    }

                    let coord_next = obj_next_coord.value;

                    this.iterator_target_current = this.matrix_targets[coord_next[0]][coord_next[1]];

                    let obj_next_target_twice_nested = this.iterator_target_current.next();

                    this.target_current = obj_next_target_twice_nested.value;

                    let obj_next_subtarget_twice_nested = this.target_current.iterator_subtarget.next();

                    this.subtarget_current = obj_next_subtarget_twice_nested.value;

                    this.iterator_subtarget_current = this.target_current.iterator_subtarget;

                    this.segment_current = this.segments[this.iterator_matrix_train.get_coord_current()[1]];

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

        accept_input(notes_input_user: TreeModel.Node<n.Note>[]) {

            this.counter_user_input++;

            if (this.counter_user_input >= this.limit_user_input) {
                this.limit_input_reached = true
            }

            if (this.limit_input_reached) {
                // completely ignore
                return
            }

            if (this.trainable.warrants_advance(notes_input_user, this.subtarget_current)) {

                let input_postprocessed = this.trainable.postprocess_user_input(notes_input_user, this.subtarget_current);

                this.history_user_input.concat(
                    input_postprocessed,
                    this.iterator_matrix_train.get_coord_current()
                );

                this.window.add_notes_to_clip(
                    input_postprocessed,
                    this.iterator_matrix_train.get_coord_current(),
                    this.trainable
                );

                if (this.trainable.b_parsed) {
                    this.advance_segment()
                } else if (this.trainable.b_targeted) {
                    this.advance_subtarget()
                } else {
                    throw 'cannot determine how to advance'
                }

                this.algorithm.advance();

                this.render_window();
            }
        }
    }
}