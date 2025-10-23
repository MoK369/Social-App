import { EventEmitter } from "node:events";
const eventEmitter = new EventEmitter();
var EventsEnum;
(function (EventsEnum) {
    EventsEnum["verifyEmail"] = "verifyEmail";
})(EventsEnum || (EventsEnum = {}));
class Events {
    static subscribe = ({ eventName, onError, backgroundFunction, }) => {
        eventEmitter.on(eventName, async () => {
            try {
                await backgroundFunction();
            }
            catch (e) {
                console.log((onError ? onError : `Failed Executing ${eventName} Event: `) + e);
            }
        });
    };
}
