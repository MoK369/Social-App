import { EventEmitter } from "node:events";
class CustomEvents {
    emitter;
    constructor(emitter) {
        this.emitter = emitter;
    }
    subscribe = ({ eventName, onError, backgroundFunction, }) => {
        this.emitter.on(eventName, async (args) => {
            try {
                await backgroundFunction(args);
            }
            catch (e) {
                console.log((onError ? onError : `Failed Executing ${eventName} Event: `) + e);
            }
        });
    };
    publish = ({ eventName, payload, }) => {
        this.emitter.emit(eventName, payload);
    };
}
export default CustomEvents;
