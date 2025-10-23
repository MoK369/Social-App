import { EventEmitter } from "node:events";
import type { EventsEnum } from "../constants/enum.constants.ts";

class CustomEvents<T> {
  constructor(private emitter: EventEmitter) {}

  subscribe = ({
    eventName,
    onError,
    backgroundFunction,
  }: {
    eventName: EventsEnum;
    onError?: string;
    backgroundFunction: (payload: T) => Promise<void>;
  }) => {
    this.emitter.on(eventName, async (args) => {
      try {
        console.log("inside subscribe custom event");
        
        await backgroundFunction(args);
      } catch (e) {
        console.log(
          (onError ? onError : `Failed Executing ${eventName} Event: `) + e
        );
      }
    });
  };

  publish = ({
    eventName,
    payload,
  }: {
    eventName: EventsEnum;
    payload: T;
  }) => {
    this.emitter.emit(eventName, payload);
  };
}

export default CustomEvents;
