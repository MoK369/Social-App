import { EventEmitter } from "node:events";
const eventEmitter = new EventEmitter();

enum EventsEnum {
  verifyEmail = "verifyEmail",
}

class Events {
  static subscribe = ({
    eventName,
    onError,
    backgroundFunction,
  }: {
    eventName: EventsEnum;
    onError?: string;
    backgroundFunction: () => Promise<any>;
  }) => {
    eventEmitter.on(eventName, async () => {
      try {
        await backgroundFunction();
      } catch (e) {
        console.log(
          (onError ? onError : `Failed Executing ${eventName} Event: `) + e
        );
      }
    });
  };
}

export default Events;