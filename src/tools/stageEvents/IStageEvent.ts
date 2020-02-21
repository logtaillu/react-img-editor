import { DrawEventPramas } from "../../type";
export interface IStageEvent {
    eventName: string;
    handle: (DrawEventPramas: DrawEventPramas, e: any) => void;
}

export interface IStageEventMap {
    [key: string]: IStageEvent
}