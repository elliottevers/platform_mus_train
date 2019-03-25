import {live} from "../live/live";
import {clip} from "../clip/clip";
import {message} from "../message/messenger";
import {note} from "../note/note";
import TreeModel = require("tree-model");
import {clip_slot} from "../clip_slot/clip_slot";
import {utils} from "../utils/utils";
import {log} from "../log/logger";
const _ = require('underscore');

export namespace track {
    import LiveApiJs = live.LiveApiJs;
    import Clip = clip.Clip;
    import Messenger = message.Messenger;
    import Note = note.Note;
    import ClipSlot = clip_slot.ClipSlot;
    import ClipSlotDao = clip_slot.ClipSlotDao;
    import ClipDao = clip.ClipDao;
    import Logger = log.Logger;
    import ClipSlotDaoVirtual = clip_slot.ClipSlotDaoVirtual;
    import iLiveApiJs = live.iLiveApiJs;

    // export let get_notes_on_track = (path_track) => {
    //     let index_track = Number(path_track.split(' ')[2]);
    //
    //     let track = new Track(
    //         new TrackDao(
    //             new li.LiveApiJs(path_track)
    //         )
    //     );
    //
    //     let num_clip_slots = track.get_num_clip_slots();
    //
    //     let notes_amassed = [];
    //
    //     for (let i_clipslot of _.range(0, num_clip_slots)) {
    //         let path_clipslot = ['live_set', 'tracks', index_track, 'clip_slots', Number(i_clipslot)].join(' ');
    //
    //         let clip = new Clip(
    //             new ClipDao(
    //                 new li.LiveApiJs(
    //                     path_clipslot.split(' ').concat(['clip']).join(' ')
    //                 ),
    //                 new Messenger('max', 0)
    //             )
    //         );
    //
    //         notes_amassed = notes_amassed.concat(
    //             clip.get_notes(
    //                 clip.get_loop_bracket_lower(),
    //                 0,
    //                 clip.get_loop_bracket_upper(),
    //                 128
    //             )
    //         );
    //     }
    //
    //     return notes_amassed
    // };

    export class Track {

        public track_dao;

        clip_slots: ClipSlot[] = [];

        constructor(track_dao: iTrackDao) {
            this.track_dao = track_dao;
        }

        public static get_clip_at_index(index_track: number, index_clip_slot: number, messenger: Messenger): Clip {
            return new Clip(
                new ClipDao(
                    new LiveApiJs(
                        ['live_set', 'tracks', String(index_track), 'clip_slots', String(index_clip_slot), 'clip'].join(' ')
                    ),
                    messenger
                )
            );
        }

        public static get_clip_slot_at_index(index_track: number, index_clip_slot: number, messenger: Messenger): ClipSlot {
            return new ClipSlot(
                new ClipSlotDao(
                    new LiveApiJs(
                        ['live_set', 'tracks', String(index_track), 'clip_slots', String(index_clip_slot)].join(' ')
                    ),
                    messenger
                )
            );
        }

        public get_index(): number {
            return Number(this.track_dao.get_path().split(' ')[2])
        }

        public load_clip_slots(): void {
            this.clip_slots = this.track_dao.get_clip_slots();
        }

        public mute() {
            this.track_dao.mute(true);
        }

        public unmute() {
            this.track_dao.mute(false);
        }

        // public load_clips(): void {
        //     //
        //     let id_pairs: string[][] = this.get_clip_slots();
        //     for (let id_pair of id_pairs) {
        //         let clip_slot = new ClipSlot(
        //             new ClipSlotDao(
        //                 new LiveApiJs(
        //                     id_pair.join(' ')
        //                 ),
        //                 this.track_dao.messenger
        //             )
        //         );
        //
        //         if (clip_slot.b_has_clip()) {
        //             this.clip
        //         }
        //     }
        // }

        public load_clips() {
            this.load_clip_slots();

            // let logger = new Logger('max');
            // logger.log(JSON.stringify(this.clip_slots))

            for (let clip_slot of this.clip_slots) {
                clip_slot.load_clip();
                // clip_slot.load_clip()
                // if (clip_slot.b_has_clip()) {
                //     logger.log(JSON.stringify(clip_slot.get_clip().get_notes_within_markers()))
                // }
            }
        }

        public delete_clips() {
            for (let clip_slot of this.clip_slots) {
                if (clip_slot.b_has_clip()) {
                    clip_slot.delete_clip()
                }
            }
        }

        public create_clip_at_index(index: number, length_beats: number): void {
            this.clip_slots[index].create_clip(length_beats)
        }

        public get_clip_slot_at_index(index_clip_slot: number): ClipSlot {
            return this.clip_slots[index_clip_slot]
        }

        // TODO: should return null if the there aren't even that many scenes
        public get_clip_at_index(index: number): Clip {
            let clip_slot = this.clip_slots[index];
            return clip_slot.get_clip()
        }

        public get_num_clip_slots() {
            return this.get_clip_slots().length
        }

        public get_clip_slots() {
            return this.track_dao.get_clip_slots()
        }

        // NB: assumes that the clips form a perfect partition of the duration inside the start, end marker
        get_notes(): TreeModel.Node<Note>[] {
            let notes_amassed = [];
            for (let clip_slot of this.clip_slots) {
                if (clip_slot.b_has_clip()) {
                    notes_amassed = notes_amassed.concat(
                        clip_slot.get_clip().get_notes_within_markers()
                    )
                }
            }
            return notes_amassed;
        }

        public get_path(): string {
            // TODO: implement
            return this.track_dao.get_path()
        }
    }

    export interface iTrackDao {
        // get_notes(): TreeModel.Node<Note>[]
        get_clip_slots(int: number)
        get_path()
    }

    // TODO: please change everything in here
    export class TrackDaoVirtual implements iTrackDao {

        num_clip_slots: number;
        clips: Clip[];

        constructor(clips: Clip[]) {
            this.clips = clips;
        }

        mute() {

        }

        // get_num_clip_slots(): number {
        //     return this.num_clip_slots;
        // }

        get_notes(): TreeModel.Node<Note>[] {
            let notes_amassed = [];
            for (let clip of this.clips) {
                notes_amassed = notes_amassed.concat(
                    clip.get_notes(
                        clip.get_loop_bracket_lower(),
                        0,
                        clip.get_loop_bracket_upper(),
                        128
                    )
                )
            }
            return notes_amassed;
        }

        // only return as many clip slots as there are clips
        get_clip_slots(): ClipSlot[] {
            let clip_slots = [];
            for (let clip of this.clips) {
                clip_slots.push(
                    new ClipSlot(
                        new ClipSlotDaoVirtual(
                            clip
                        )
                    )
                )
            }
            return clip_slots
        }

        get_path(): string {
            return
        }
    }

    export class TrackDao implements iTrackDao {

        live_api;
        messenger: Messenger;
        deferlow: boolean;
        key_route: string;
        env: string;

        constructor(live_api: iLiveApiJs, messenger, deferlow?: boolean, key_route?: string, env?: string) {
            this.live_api = live_api;
            this.messenger = messenger;
            if (deferlow && !key_route) {
                throw new Error('key route not specified when using deferlow');
            }
            this.deferlow = deferlow;
            this.key_route = key_route;
            this.env = env;
        }

        set_path_deferlow(key_route_override: string, path_live: string): void {
            let mess: any[] = [key_route_override];

            for (let word of utils.PathLive.to_message(path_live)) {
                mess.push(word)
            }

            this.messenger.message(mess)
        }

        get_clip_slots(): ClipSlot[] {
            let data_clip_slots = this.live_api.get("clip_slots");

            let clip_slots = [];

            let clip_slot = [];

            for (let i_datum in data_clip_slots) {

                let datum = data_clip_slots[Number(i_datum)];

                clip_slot.push(datum);

                if (Number(i_datum) % 2 === 1) {
                    clip_slots.push(clip_slot);
                    clip_slot = [];
                }
            }

            return clip_slots.map((list_id_clip_slot) => {
                return new ClipSlot(
                    new ClipSlotDao(
                        new LiveApiJs(
                            list_id_clip_slot.join(' ')
                        ),
                        new Messenger('max', 0)
                    )
                )
            });
        }

        mute(val: boolean) {
            if (val) {
                this.live_api.call('mute', '1')
            } else {
                this.live_api.call('mute', '0')
            }
        }

        get_path(): string {
            return utils.cleanse_path(this.live_api.get_path())
        }
    }
}