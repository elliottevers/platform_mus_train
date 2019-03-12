import TreeModel = require("tree-model");
import {message, message as m} from "../message/messenger"
import {clip, clip as c} from "../clip/clip";
import {note as n} from "../note/note";
import {live} from "../live/live";
import * as _ from "lodash";
import {segment} from "../segment/segment";
import {algorithm} from "../train/algorithm";
import {iterate} from "../train/iterate";
import {parse} from "../parse/parse";

export namespace window {

    import LiveClipVirtual = live.LiveClipVirtual;
    import Messenger = message.Messenger;
    import Segment = segment.Segment;
    import Clip = clip.Clip;
    import Algorithm = algorithm.Algorithm;
    import MatrixIterator = iterate.MatrixIterator;
    import StructParse = parse.StructParse;

    const red = [255, 0, 0];
    const white = [255, 255, 255];
    const black = [0, 0, 0];
    const region_yellow = [254, 254, 10];
    const region_green = [33, 354, 6];
    const region_red = [251, 1, 6];
    const blue = [10, 10, 251];

    interface Temporal {
        get_message_render_region_past(interval_current);
        get_message_render_region_present(interval_current);
        get_message_render_region_future(interval_current);
    }

    export abstract class Window {
        list_clips: Clip[];
        height: number;
        width: number;
        messenger: Messenger;
        length_beats: number;

        protected constructor(height, width, messenger) {
            this.height = height;
            this.width = width;
            this.messenger = messenger;
        }

        public clear() {
            let msg_clear = ["clear"];
            this.messenger.message(msg_clear);
        }

        // because it's a *list* of clips
        public static coord_to_index_clip(coord): number {
            if (coord[0] === -1) {
                return 0
            } else {
                return coord[0] + 1
            }
        }

        public initialize_clips(algorithm: Algorithm, segments: Segment[]) {
            let list_clips = [];
            let depth = algorithm.get_depth();
            let beat_start_song = segments[0].beat_start;
            let beat_end_song = segments[segments.length - 1].beat_end;
            for (let i in _.range(0, depth + 1)) {
                let clip_dao_virtual = new LiveClipVirtual([]);
                clip_dao_virtual.beat_start = beat_start_song;
                clip_dao_virtual.beat_end = beat_end_song;
                let clip_virtual = new c.Clip(clip_dao_virtual);
                list_clips.push(clip_virtual)
            }
            this.list_clips = list_clips;
        }

        public set_length_beats(beats) {
            this.length_beats = beats;
        }

        public add_notes_to_clip(notes_to_add_to_clip, coord_current) {
            let index_clip = Window.coord_to_index_clip(coord_current);
            for (let note of notes_to_add_to_clip) {
                this.list_clips[index_clip].append(note);
            }
        }

        add_note_to_clip_root(note) {
            this.list_clips[0].set_notes(
                [note]
            )
        }

        get_messages_render_clip(index_clip: number) {
            let clip_virtual = this.list_clips[index_clip];
            let quadruplets = [];
            for (let node of clip_virtual.get_notes_within_loop_brackets()) {
                quadruplets.push(this.get_position_quadruplet(node, index_clip));
            }
            return quadruplets.map(function (tuplet) {
                let message = <any>["paintrect"].concat(tuplet);
                message = message.concat(black);
                return message;
            })
        };

        get_position_quadruplet(node: TreeModel.Node<n.Note>, index_clip: number) {
            var dist_from_left_beat_start, dist_from_top_note_top, dist_from_left_beat_end, dist_from_top_note_bottom;

            dist_from_left_beat_start = this.get_dist_from_left(node.model.note.beat_start);
            dist_from_left_beat_end = this.get_dist_from_left(node.model.note.beat_start + node.model.note.beats_duration);
            dist_from_top_note_top = this.get_dist_from_top(node.model.note.pitch, index_clip);
            dist_from_top_note_bottom = this.get_dist_from_top(node.model.note.pitch - 1, index_clip);

            return [dist_from_left_beat_start, dist_from_top_note_top, dist_from_left_beat_end, dist_from_top_note_bottom]
        };

        get_dist_from_top(pitch: number, index_clip: number): number {
            var clip = this.list_clips[index_clip];
            let offset = index_clip;
            // TODO: make this configurable
            if (false) {
                offset = this.list_clips.length - 1 - index_clip;

            }
            var dist = (clip.get_pitch_max() - pitch) * this.get_height_note(index_clip);
            return dist + (this.get_height_clip() * offset);
        };

        beat_to_pixel = function (beat: number): number {
            let num_pixels_width = this.width;
            return beat * (num_pixels_width / this.length_beats);
        };

        get_dist_from_left(beat: number): number {
            return this.beat_to_pixel(beat);
        };

        get_offset_pixel_leftmost(): number {
            return 0;
        }

        get_offset_pixel_topmost(): number {
            return 0;
        }

        get_offset_pixel_rightmost(): number {
            return this.width;
        }

        get_offset_pixel_bottommost(): number {
            return this.height;
        }

        get_height_clip(): number {
            return this.height / this.list_clips.length;
        };

        get_height_note(index_clip: number): number {
            let clip = this.list_clips[index_clip];
            let ambitus = clip.get_ambitus();
            let dist_pitch = ambitus[1] - ambitus[0] + 1;

            // TODO: fix this hack for getting a margin around the note
            if (dist_pitch === 1) {
                dist_pitch = 3;
            }
            return this.get_height_clip() / dist_pitch;
        };
    }

    export interface Renderable {
        render_regions(
            iterator_matrix_train,
            matrix_target_iterator
        )

        render_notes(
            history_user_input
        )
    }

    export class MatrixWindow extends Window implements Temporal {

        constructor(height, width, messenger) {
            super(height, width, messenger);
        }

        public render(iterator_matrix_train, matrix_target_iterator, algorithm, parse_matrix) {
            this.clear();

            let notes, coord;

            if (algorithm.b_targeted()) {
                coord = iterator_matrix_train.get_coord_current();
                let target_iterator = matrix_target_iterator[coord[0]][coord[1]];
                notes = target_iterator.current().iterator_subtarget.subtargets.map((subtarget) => {
                    return subtarget.note
                });
            } else {
                coord = iterator_matrix_train.get_coord_current();
                let coord_segment = [0, coord[1]];
                notes = parse_matrix.get_roots_at_coord(coord_segment);
            }

            this.render_regions(
                iterator_matrix_train,
                notes,
                algorithm
            );

            if (algorithm.b_targeted()) {
                this.render_clips(
                    iterator_matrix_train,
                    null
                );
            } else {
                this.render_trees(
                    parse_matrix
                );
                this.render_clips(
                    iterator_matrix_train,
                    parse_matrix
                );
            }
        }

        public render_trees(parse_matrix) {
            let messages_render_trees = this.get_messages_render_trees(parse_matrix);
            for (let message_tree of messages_render_trees) {
                this.messenger.message(message_tree)
            }
        }

        public get_messages_render_trees(parse_matrix) {

            let color: number[];
            let messages: any[] = [];
            let message: any[];

            for (let coord of parse_matrix.coords_roots) {
                let roots_parse_tree;
                if (coord[0] === -1) {
                    roots_parse_tree = [parse_matrix.get_root()]
                } else {
                    roots_parse_tree = parse_matrix.get_roots_at_coord(coord);
                }

                for (let root of roots_parse_tree) {
                    root.walk((node)=>{

                        if (node.hasChildren()) {

                            for (let child of node.children) {

                                message = [
                                    "linesegment",
                                    this.get_centroid(child)[0],
                                    this.get_centroid(child)[1],
                                    this.get_centroid(node)[0],
                                    this.get_centroid(node)[1]
                                ];

                                color = black;

                                messages.push(message.concat(color));

                            }
                        }

                        return true;
                    });
                }
            }

            return messages;
        }

        get_centroid(node: TreeModel.Node<n.NoteRenderable>): number[] {

            let dist_from_left_beat_start, dist_from_left_beat_end, dist_from_top_note_top, dist_from_top_note_bottom;

            let coord_clip = node.model.note.get_coordinates_matrix();

            let index_clip = Window.coord_to_index_clip(coord_clip);

            // TODO: determine how to get the index of the clip from just depth of the node

            dist_from_left_beat_start = this.get_dist_from_left(node.model.note.beat_start);
            dist_from_left_beat_end = this.get_dist_from_left(node.model.note.beat_start + node.model.note.beats_duration);
            dist_from_top_note_top = this.get_dist_from_top(node.model.note.pitch, index_clip);
            dist_from_top_note_bottom = this.get_dist_from_top(node.model.note.pitch - 1, index_clip);

            return [
                dist_from_left_beat_end - ((dist_from_left_beat_end - dist_from_left_beat_start) / 2),
                dist_from_top_note_bottom - ((dist_from_top_note_bottom - dist_from_top_note_top) / 2)
            ]
        };

        public render_clips(iterator_matrix_train, parse_matrix) {
            let messages_render_clips = this.get_messages_render_clips(iterator_matrix_train, parse_matrix);
            for (let messages_notes of messages_render_clips) {
                for (let message_note of messages_notes) {
                    this.messenger.message(message_note);
                }
            }
        }

        public get_messages_render_clips(iterator_matrix_train, parse_matrix: StructParse): any[][] {
            let messages = [];

            let b_targeted = (parse_matrix === null);

            if (b_targeted) {
                for (let i of iterator_matrix_train.get_history()) {

                    let index_clip: number = Window.coord_to_index_clip(
                        MatrixIterator.get_coord(
                            i,
                            iterator_matrix_train.num_columns
                        )
                    );

                    messages.push(
                        this.get_messages_render_clip(index_clip)
                    )
                }
            } else {
                for (let coord of parse_matrix.get_history()) {
                    messages.push(
                        this.get_messages_render_clip(
                            Window.coord_to_index_clip(
                                coord
                            )
                        )
                    )
                }
            }

            return messages
        }

        public get_message_render_region_past(interval_current) {
            let offset_left_start, offset_top_start, offset_left_end, offset_top_end;

            offset_left_start = this.get_dist_from_left(this.get_offset_pixel_leftmost());
            offset_left_end = this.get_dist_from_left(interval_current[0]);
            offset_top_start = this.get_offset_pixel_topmost();
            offset_top_end = this.get_offset_pixel_bottommost();

            return [offset_left_start, offset_top_start, offset_left_end, offset_top_end]
        }

        public get_message_render_region_present(interval_current) {
            let offset_left_start, offset_top_start, offset_left_end, offset_top_end;

            offset_left_start = this.get_dist_from_left(interval_current[0]);
            offset_left_end = this.get_dist_from_left(interval_current[1]);
            offset_top_start = this.get_offset_pixel_topmost();
            offset_top_end = this.get_offset_pixel_bottommost();

            return [offset_left_start, offset_top_start, offset_left_end, offset_top_end]
        }

        public get_message_render_region_future(interval_current) {
            let offset_left_start, offset_top_start, offset_left_end, offset_top_end;

            offset_left_start = this.get_dist_from_left(interval_current[1]);
            offset_left_end = this.get_dist_from_left(this.get_offset_pixel_rightmost());
            offset_top_start = this.get_offset_pixel_topmost();
            offset_top_end = this.get_offset_pixel_bottommost();

            return [offset_left_start, offset_top_start, offset_left_end, offset_top_end]
        }

        public render_regions(iterator_matrix_train, notes, algorithm) {
            let interval_current = algorithm.determine_region_present(
                notes
            );

            let quadruplet_region_past = this.get_message_render_region_past(interval_current);
            let quadruplet_region_present = this.get_message_render_region_present(interval_current);
            let quadruplet_region_future = this.get_message_render_region_future(interval_current);

            quadruplet_region_past.unshift('paintrect');
            quadruplet_region_past = quadruplet_region_past.concat(region_green);

            quadruplet_region_present.unshift('paintrect');
            quadruplet_region_present = quadruplet_region_present.concat(region_red);

            quadruplet_region_future.unshift('paintrect');
            quadruplet_region_future = quadruplet_region_future.concat(region_yellow);

            for (let quadruplet of [quadruplet_region_past, quadruplet_region_present, quadruplet_region_future]) {
                this.messenger.message(quadruplet);
            }
        }
    }
}