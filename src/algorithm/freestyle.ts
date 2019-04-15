import {trainable} from "./trainable";
import {song} from "../song/song";
import {note} from "../note/note";
import {history} from "../history/history";
import {message} from "../message/messenger";
import {scene} from "../scene/scene";
import {target} from "../target/target";
import {user_input} from "../control/user_input";
import {trainer} from "../train/trainer";
import {segment} from "../segment/segment";
import {window} from "../render/window";
import {track} from "../track/track";
import {iterate} from "../train/iterate";
import TreeModel = require("tree-model");

export namespace freestyle {
    import Trainable = trainable.Trainable;

    export class Freestyle implements Trainable {
        b_parsed: boolean;
        b_targeted: boolean;
        depth: number;

        advance_scene(scene_current: scene.Scene, song: song.Song) {
            return
        }

        coord_to_index_clip_render(coord: number[]): number {
            return 0;
        }

        coord_to_index_history_user_input(coord: number[]): number[] {
            return [];
        }

        coord_to_index_struct_train(coord: number[]): number[] {
            return [];
        }

        create_struct_train(window: window.MatrixWindow, segments: segment.Segment[], track_target: track.Track, user_input_handler: user_input.UserInputHandler, struct_train: trainer.StructTrain): trainer.StructTrain {
            return null;
        }

        determine_region_present(notes_next: TreeModel.Node<note.Note>[], segment_current: segment.Segment) {

        }

        get_name(): string {
            return "freestyle";
        }

        get_notes_in_region(target: target.Target, segment: segment.Segment): TreeModel.Node<note.Note>[] {
            return [];
        }

        get_num_layers_clips_to_render(): number {
            return 0;
        }

        get_num_layers_input(): number {
            return 0;
        }

        // TODO: look how others handle this - should we advance song's loop here?
        handle_command(command: string, trainer: trainer.Trainer): void {

        }

        handle_midi(pitch: number, velocity: number, trainer: trainer.Trainer): void {

        }

        initialize_render(window: window.MatrixWindow, segments: segment.Segment[], notes_track_target: TreeModel.Node<note.Note>[], struct_train: trainer.StructTrain): window.MatrixWindow {
            return null;
        }

        initialize_tracks(segments: segment.Segment[], track_target: track.Track, track_user_input: track.Track, struct_train: trainer.StructTrain) {

        }

        // TODO: see how other's implement
        pause(song: song.Song, scene_current: scene.Scene) {

        }

        postprocess_user_input(notes_user_input: TreeModel.Node<note.Note>[], subtarget_current: target.Subtarget): TreeModel.Node<note.Note>[] {
            return [];
        }

        preprocess_history_user_input(history_user_input: history.HistoryUserInput, segments: segment.Segment[]): history.HistoryUserInput {
            return undefined;
        }

        preprocess_struct_train(struct_train: trainer.StructTrain, segments: segment.Segment[], notes_target_track: TreeModel.Node<note.Note>[]): trainer.StructTrain {
            return null;
        }

        set_depth(depth: number): void {

        }

        stream_bounds(messenger: message.Messenger, subtarget_current: target.Subtarget, segment_current: segment.Segment, segments: segment.Segment[]): void {

        }

        // TODO: see how others implement
        terminate(struct_train: trainer.StructTrain, segments: segment.Segment[]) {

        }

        // TODO: see how others implement
        unpause(song: song.Song, scene_current: scene.Scene) {

        }

        update_history_user_input(input_postprocessed: TreeModel.Node<note.Note>[], history_user_input: history.HistoryUserInput, iterator_matrix_train: iterate.MatrixIterator, trainable: trainable.Trainable): history.HistoryUserInput {
            return null;
        }

        update_struct(notes_input_user: TreeModel.Node<note.Note>[], struct_train: trainer.StructTrain, trainable: trainable.Trainable, iterator_matrix_train: iterate.MatrixIterator): trainer.StructTrain {
            return null;
        }

        warrants_advance(notes_user_input: TreeModel.Node<note.Note>[], subtarget_current: target.Subtarget): boolean {
            return true;
        }

    }
}