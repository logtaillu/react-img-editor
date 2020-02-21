import { DrawEventPramas } from "../../type";
export interface IStageEvent {
    eventName: string;
    handle: (DrawEventPramas, e) => void;
}

export interface IStageEventMap {
    [key: string]: IStageEvent
}