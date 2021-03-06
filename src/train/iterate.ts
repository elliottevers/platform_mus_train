import {utils} from "../utils/utils";
import {segment} from "../segment/segment";
import {parsed} from "../algorithm/parsed";
import {targeted} from "../algorithm/targeted";
import {trainable} from "../algorithm/trainable";

export namespace iterate {
    import division_int = utils.division_int;
    import remainder = utils.remainder;
    import Segment = segment.Segment;
    import Parsed = parsed.Parsed;
    import Targeted = targeted.Targeted;
    import Trainable = trainable.Trainable;
    import DETECT = trainable.DETECT;
    import PREDICT = trainable.PREDICT;
    import PARSE = trainable.PARSE;
    import DERIVE = trainable.DERIVE;

    export let FORWARDS = 'forwards';
    export let BACKWARDS = 'backwards';

    export class MatrixIterator {

        private num_rows: number;
        private num_columns: number;

        private downward: boolean;
        private rightward: boolean;

        private index_row_start: number;
        private index_row_stop: number;

        private i;
        private index_start;
        private index_stop;

        private history: number[];
        public done: boolean;
        public b_started: boolean;

        constructor(num_rows: number, num_columns: number, downward?: boolean, rightward?: boolean, start_at_row?: number, stop_at_row?: number) {
            this.num_rows = num_rows;
            this.num_columns = num_columns;

            this.downward = (downward == null) ? true : downward;
            this.rightward = (rightward == null) ? true : rightward;

            this.index_row_start = start_at_row;
            this.index_row_stop = stop_at_row;

            this.determine_index_start();
            this.determine_index_stop();

            this.i = this.index_start;
            this.history = [];
            this.done = false;
            this.b_started = false;
        }

        private determine_index_start() {

            let i_start;

            if (this.downward && this.rightward) {
                i_start = this.num_columns * this.index_row_start - 1
            } else if (!this.downward && this.rightward) {
                i_start = (this.num_columns * (this.index_row_start + 2)) - 1 - this.num_columns
            } else if (this.downward && !this.rightward) {
                i_start = (this.index_row_start - 1) * this.num_columns
            }
            else if (!this.downward && !this.rightward) {
                i_start = this.index_row_start * this.num_columns
            }
            else {
                throw 'not yet supported'
            }

            this.index_start = i_start;
        }

        private determine_index_stop() {

            let i_stop;

            if (this.downward && this.rightward) {
                i_stop = this.index_row_stop * this.num_columns
            } else if (!this.downward && this.rightward) {
                i_stop = (this.index_row_stop - 1) * this.num_columns
            } else if (this.downward && !this.rightward) {
                i_stop = this.index_start + (this.index_row_stop - this.index_row_start + 2) * this.num_columns - 1
            }
            else if (!this.downward && !this.rightward) {
                i_stop = this.num_columns * this.index_row_stop - 1
            }
            else {
                throw 'not yet supported'
            }

            this.index_stop = i_stop;
        }

        private next_column() {
            if (this.downward && this.rightward) {
                this.i++;
            } else if (!this.downward && this.rightward) {
                if (remainder(this.i + 1, this.num_columns) === 0) {
                    this.i = this.i - 2 * this.num_columns + 1
                } else {
                    this.i++
                }
            } else if (this.downward && !this.rightward) {
                if (remainder(this.i, this.num_columns) === 0) {
                    this.i = this.i + 2 * this.num_columns - 1
                } else {
                    this.i--
                }
            } else if (!this.downward && !this.rightward) {
                this.i--
            } else {
                throw 'not yet supported'
            }
        }

        add_history(i): void {
            this.history.push(i)
        }

        get_history(): number[] {
            return this.history
        }

        public next() {

            this.b_started = true;

            let value: number[] = null;

            this.next_column();

            this.add_history(this.i);

            if (this.i === this.index_stop) {
                this.done = true;
                return {
                    value: value,
                    done: this.done
                }
            }

            return {
                value: this.get_coord_current(),
                done: false
            };
        }

        public get_coord_current(): number[] {
            return MatrixIterator.get_coord(this.get_state_current(), this.num_columns)
        }

        public get_state_current(): number {
            return this.i;
        }

        public static get_coord(i, num_columns): number[] {
            let pos_row = division_int(i, num_columns);
            let pos_column = remainder(i, num_columns);
            return [pos_row, pos_column]
        }

        public static get_coords_above(coord): number[][] {
            if (coord[0] === 0) {
                // TODO: -1
                return [[-1]]
            } else {
                return [[coord[0] - 1, coord[1]]]
            }
        }

        public static get_coords_below(coord): number[][] {
            return [[coord[0] + 1, coord[1]]]
        }
    }

    export class FactoryMatrixObjectives {
        public static create_matrix_user_input_history(trainable: Trainable, segments: Segment[]): any[][] {

            let matrix_data = [];

            for (let i=0; i < trainable.get_num_layers_input(); i++) {
                matrix_data.push([]);
                for (let i_segment in segments) {
                    matrix_data[i][Number(i_segment)] = []
                }
            }

            return matrix_data;
        }

        public static create_matrix_targets(targeted: Targeted, segments: Segment[]): any[][] {

            let matrix_data = [];

            switch(targeted.get_name()) {
                case DETECT: {
                    for (let i=0; i < 1; i++) {
                        matrix_data.push([]);
                        for (let i_segment in segments) {
                            matrix_data[i][Number(i_segment)] = []
                        }
                    }
                    break;
                }
                case PREDICT: {
                    for (let i=0; i < 1; i++) {
                        matrix_data.push([]);
                        for (let i_segment in segments) {
                            matrix_data[i][Number(i_segment)] = []
                        }
                    }
                    break;
                }
                // depth - 1, since depth includes root... actually this might be against convention
                case PARSE: {
                    throw 'parse has no targets';
                }
                case DERIVE: {
                    throw 'derive has no targets'
                }
                default: {
                    throw 'case not considered';
                }
            }
            return matrix_data;
        }

        public static create_matrix_parse(parsed: Parsed, segments: Segment[]): any[][] {

            let matrix_data = [];

            switch(parsed.get_name()) {
                // depth - 1, since depth includes root... actually this might be against convention
                case PARSE: {
                    for (let i=0; i < parsed.get_num_layers_input() + 2; i++) {
                        matrix_data.push([]);
                        for (let i_segment in segments) {
                            matrix_data[i][Number(i_segment)] = []
                        }
                    }
                    break;
                }
                case DERIVE: {
                    for (let i=0; i < parsed.get_num_layers_input() + 1; i++) {
                        matrix_data.push([]);
                        for (let i_segment in segments) {
                            matrix_data[i][Number(i_segment)] = []
                        }
                    }
                    break;
                }
                default: {
                    throw 'case not considered';
                }
            }
            return matrix_data;
        }
    }
}