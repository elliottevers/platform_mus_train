export namespace log {

    declare function post(o: any): void;

    export class Logger  {

        public env: string;

        constructor(env: string) {
            this.env = env;
        }

        static log_max_static(message: string): void {
            for(var i=0,len=arguments.length; i<len; i++) {
                if(message && message.toString) {
                    var s = message.toString();
                    if(s.indexOf("[object ") >= 0) {
                        s = JSON.stringify(message);
                    }
                    post(s);
                }
                else if(message === null) {
                    post("<null>");
                }
                else {
                    post(message);
                }
            }
            post("\n");
        }

        log(message: string): void {
            if (this.env === 'max') {
                this.log_max(message);
            } else if (this.env === 'node') {
                this.log_node(message);
            } else {
                post('env: ' + this.env);
                post('\n');
                throw 'environment invalid'
            }
        }

        // TODO: make static
        log_max(...args: any[]): void {
            for(var i=0,len=arguments.length; i<len; i++) {
                var message = arguments[i];
                if(message && message.toString) {
                    var s = message.toString();
                    if(s.indexOf("[object ") >= 0) {
                        s = JSON.stringify(message);
                    }
                    post(s);
                }
                else if(message === null) {
                    post("<null>");
                }
                else {
                    post(message);
                }
            }
            post("\n");
        }

        // TODO: make static
        log_node(...args: any[]): void {
            for(var i=0,len=arguments.length; i<len; i++) {
                var message = arguments[i];
                if(message && message.toString) {
                    var s = message.toString();
                    if(s.indexOf("[object ") >= 0) {
                        s = JSON.stringify(message);
                    }
                    console.log(s);
                }
                else if(message === null) {
                    console.log("<null>");
                }
                else {
                    console.log(message);
                }
            }
            console.log("\n");
        }

    }
}