import { EventEmitter } from "node:events";

class CustomEvents<EventNameType extends string, PayloadType> {
  constructor(private emitter: EventEmitter) {}

  subscribe = ({
    eventName,
    onError,
    backgroundFunction,
  }: {
    eventName: EventNameType;
    onError?: string;
    backgroundFunction: (payload: PayloadType) => Promise<void>;
  }) => {
    this.emitter.on(eventName, async (args) => {
      try {
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
    eventName: EventNameType;
    payload: PayloadType;
  }) => {
    this.emitter.emit(eventName, payload);
  };
}

export default CustomEvents;
