import {message} from "../message/messenger";
import {log} from "../log/logger";
const _ = require("underscore");

export namespace control {

    import Messenger = message.Messenger;
    type midi = number;

    const string_to_root_note_map = {
        6: 40,
        5: 45,
        4: 50,
        3: 55,
        2: 59,
        1: 64
    };

    export class Fretboard {

        currently_sounding: number[];

        strings;

        num_frets: number;

        constructor(num_strings, num_frets, messenger) {
            let strings = {};

            let create_string = (i) => {
                strings[num_strings - Number(i)] = new control.String(string_to_root_note_map[num_strings - Number(i)], messenger);
                // strings.push(new control.String(string_to_root_note_map[num_strings - Number(i)], messenger))
            };

            _.times(num_strings, create_string);

            this.strings = strings;

            this.num_frets = num_frets;
        }

        // get_coordinate_duple(coordinate_scalar: number) {
        //     let position_string = Math.floor(coordinate_scalar/ this.num_frets);
        //     let position_fret = coordinate_scalar % this.num_frets;
        //     return [position_string + 1, position_fret]
        // }

        // fret(coordinate_duple: number[]) {
        //     // string, position fret
        //     let string_fretted = this.strings[coordinate_duple[0]];
        //     string_fretted.fret(coordinate_duple[1]);
        // }

        fret(position_string: number, position_fret: number) {
            // string, position fret
            // post(position_string - 1);
            // log.Logger.log_max_static(this.strings);
            // let string_fretted = this.strings[(position_string - 1).toString()];
            let string_fretted = this.strings[position_string];
            string_fretted.fret(position_fret);
        }

        dampen(position_string: number) {
            // for (string of this.strings) {
            //     string.dampen()
            // }
            this.strings[position_string].dampen(position_string)
        }

        pluck(position_string: number) {
            this.strings[position_string].pluck(position_string)
        }
    }

    export class String {
        // note_sounding: midi | null;

        // fret_fretted: number | null;

        note_root: midi;

        messenger: Messenger;

        fret_highest_fretted: number;

        constructor(note_root: midi, messenger: Messenger) {
            this.note_root = note_root;
            this.messenger = messenger;
            // this.fret_fretted = null;
            this.fret_highest_fretted = 0;
        }

        // is_sounding(): boolean {
        //     return this.note_sounding === null;
        // }

        // TODO: don't make this an argument
        dampen(position_string) {
            // this.messenger.message([this.note_sounding, 0]);
            // this.note_sounding = null;
            // TODO: will have to flush on a per string basis
            this.messenger.message(['string' + position_string, 'dampen', position_string]);
        }

        get_note(position_fret: number) {
            return this.note_root + position_fret
        }

        pluck(position_string) {
            this.messenger.message(['string' + position_string, 'pluck', this.will_sound_note(), 127])
        }

        public will_sound_note():midi {
            return this.get_note(this.fret_highest_fretted);
        }

        // fret(position_fret: number) {
        //     if (this.fret_fretted === null || this.fret_fretted < position_fret) {
        //         this.fret_fretted = position_fret;
        //     }
        // }

        fret(position_fret: number) {
            this.fret_highest_fretted = position_fret;
        }
    }
}