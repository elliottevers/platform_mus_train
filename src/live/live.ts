let node = require("deasync");
// @ts-ignore
node.loop = node.runLoopOnce;

declare let LiveAPI: any;
declare let outlet: any;
declare let global: any;

export namespace live {

    export enum TypeIdentifier {
        PATH = 'path',
        ID = 'id'
    }

    export enum Env {
        NODE_FOR_MAX,
        MAX,
        NODE  // simulation of environment
    }

    export class LiveApiFactory {
        // TODO: env, type of identifier
        public static create(env: Env, identifier: string, typeIdentifier: TypeIdentifier) {
            switch(env) {
                case Env.NODE_FOR_MAX:
                    return new LiveApiNode(
                        identifier,
                        typeIdentifier
                    );
                case Env.MAX:
                    return new LiveApiJsProxy(
                        null,
                        identifier,
                        typeIdentifier
                    );
                case Env.NODE:
                    // TODO: How will we be able to do read queries?
                    break;
                default:
                    throw 'cannot create LiveApi'
            }
        }

        public static createFromConstructor(nameConstructor: string, identifier: string, typeIdentifier: TypeIdentifier) {
            switch(nameConstructor) {
                case 'LiveApiNode':
                    return new LiveApiNode(
                        identifier,
                        typeIdentifier,
                    );
                case 'LiveApiJsProxy':
                    return new LiveApiJsProxy(
                        null,
                        identifier,
                        typeIdentifier
                    );
                default:
                    throw 'cannot create LiveApi'
            }
        }
    }

    export interface iLiveApi {
        get(property: string, deferlow?: boolean, synchronous?: boolean): any;
        set(property: string, value: any, deferlow?: boolean, synchronous?: boolean): void;
        call(args: string[], deferlow?: boolean, synchronous?: boolean): any;
        get_id(deferlow?: boolean, synchronous?: boolean): any;
        get_path(deferlow?: boolean, synchronous?: boolean): any;
        get_children(deferlow?: boolean, synchronous?: boolean): any;
    }

    export class LiveApiJsProxy implements iLiveApi {

        private maxApi: any;
        private refLive: string;
        private typeRef: TypeIdentifier;

        constructor(usuallyNull: any, refLive: string, typeIdentifier: TypeIdentifier) {
            this.maxApi = new LiveAPI(null, refLive);
            this.refLive = refLive;
            this.typeRef = typeIdentifier;
        }

        call(args: string[], deferlow: boolean = false, synchronous: boolean = true): any {

            if (deferlow && synchronous) {
                throw 'too hard to deferlow a task and expect it to be synchronous in JS objects - would require a lock, looping in Max, and a response handler';
            }

            // used heavily in training - tasks that need to be done while other UI things are currently happening
            if (deferlow && !synchronous) {
                outlet(0, ['batch', 'deferlow', 'delegateAsync', this.typeRef, this.refLive, 'call', ...args]);
                return;
            }

            // used heavily in preprocessing/batch processing - tasks that can block rendering tasks
            if (!deferlow && synchronous) {
                return this.maxApi.call(...args)
            }

            // this is when we don't care when the task gets executed, just that it happens relatively quicker than rendering
            // since not flowing through `deferlow` and generating new event/task, should be equivalent to calling LiveAPI directly
            // but we could force it to generate a new task with `delay 0`
            // TODO: would this reverse order of the tasks put on the queue like this?
            if (!deferlow && !synchronous) {
                throw '!deferlow && !synchronous not yet implemented'
            }
        }

        get(property: string, deferlow: boolean = false, synchronous: boolean = true): any {
            return this.maxApi.get(property)
        }

        set(property: string, value: any, deferlow: boolean = false, synchronous: boolean = true): void {
            this.maxApi.set(property, value)
        }

        // TODO: better return type
        get_children(deferlow: boolean = false, synchronous: boolean = true): any {
            return this.maxApi.children;
        }

        // TODO: better return type
        get_id(deferlow: boolean = false, synchronous: boolean = true): any {
            return this.maxApi.id;
        }

        // TODO: better return type
        get_path(deferlow: boolean = false, synchronous: boolean = true): any {
            return this.maxApi.path;
        }
    }

    // this should only work for node_for_max (node should just use a virtual dao?)
    export class LiveApiNode implements iLiveApi {

        private refLive: string;  // either path or id
        private typeRef: TypeIdentifier;
        private maxApi: any;

        constructor(refLive: string, typeRef: TypeIdentifier) {
            this.refLive = refLive;
            this.typeRef = typeRef;
            this.maxApi = require('max-api');
        }

        // block in all cases
        get(property: string, deferlow: boolean = false, synchronous: boolean = true): any {
            global.liveApi.locked = true;

            global.liveApi.responses = [];

            global.liveApi.responsesProcessed = 0;

            global.liveApi.responsesExpected = 1;

            this.maxApi.outlet('batch', 'deferlow', 'delegateAsync', this.typeRef, this.refLive, 'get', property);

            while (global.liveApi.locked)
                node.loop();

            return global.liveApi.responses;
        }

        // block in all cases
        public set(property: string, value: any, deferlow: boolean = false, synchronous: boolean = true): void {

            if ((deferlow && synchronous) || (!deferlow && synchronous)) {
                global.liveApi.locked = true;

                global.liveApi.responses = [];

                global.liveApi.responsesProcessed = 0;

                global.liveApi.responsesExpected = 1;

                this.maxApi.outlet('batch', 'prioritize', 'delegateSync', this.typeRef, this.refLive, 'set', property, value);

                while (global.liveApi.locked)
                    node.loop();
            }

            if ((deferlow && !synchronous) || (!deferlow && !synchronous)) {
                this.maxApi.outlet('batch', 'deferlow', 'delegateAsync', this.typeRef, this.refLive, 'set', property, value);
            }
        }

        // essentially if synchronous ... else ...
        public call(args: string[], deferlow: boolean = false, synchronous: boolean = true): any {

            // TODO: figure out which condition is actually modeled by this situation
            if ((deferlow && synchronous) || (!deferlow && synchronous)) {
                global.liveApi.locked = true;

                global.liveApi.responses = [];

                global.liveApi.responsesProcessed = 0;

                global.liveApi.responsesExpected = 1;

                // TODO: add routing key in order to defer?
                this.maxApi.outlet('batch', 'prioritize', 'delegateSync', this.typeRef, this.refLive, 'call', ...args);

                while (global.liveApi.locked)
                    // @ts-ignore
                    node.loop();

                // @ts-ignore
                return global.liveApi.responses;
            }

            // can it be synchronous **and** not-void?
            // TODO: too much work to support asynchronous calls with variable responses?
            // TODO: are void calls equivalent to async calls?  Since they wouldn't return anything and can run whenever
            if ((deferlow && !synchronous) || (!deferlow && !synchronous)) {
                this.maxApi.outlet('batch', 'deferlow', 'delegateAsync', this.typeRef, this.refLive, 'call', ...args);
            }
        }

        public get_id(deferlow: boolean = false, synchronous: boolean = true) {

            global.liveApi.locked = true;

            global.liveApi.responses = [];

            global.liveApi.responsesProcessed = 0;

            global.liveApi.responsesExpected = 1;

            this.maxApi.outlet('batch', 'prioritize', 'delegateSync', this.typeRef, this.refLive, 'getid');

            while (global.liveApi.locked)
                node.loop();

            return global.liveApi.responses;
        }

        public get_path(deferlow: boolean = false, synchronous: boolean = true) {

            global.liveApi.locked = true;

            global.liveApi.responses = [];

            global.liveApi.responsesProcessed = 0;

            global.liveApi.responsesExpected = 1;

            this.maxApi.outlet('batch', 'prioritize', 'delegateSync', this.typeRef, this.refLive, 'getpath');

            while (global.liveApi.locked)
                node.loop();

            return global.liveApi.responses.join(' ');
        }

        public get_children(deferlow: boolean = false, synchronous: boolean = true) {

            global.liveApi.locked = true;

            global.liveApi.responses = [];

            global.liveApi.responsesProcessed = 0;

            global.liveApi.responsesExpected = 1;

            this.maxApi.outlet('batch', 'prioritize', 'delegateSync', this.typeRef, this.refLive, 'getchildren');

            while (global.liveApi.locked)
                node.loop();

            return global.liveApi.responses;
        }
    }
}