import { DrawEventParams } from "../../common/type";
export interface IStageEvent {
    eventName: string;
    handle: (DrawEventParams: DrawEventParams, e: any) => void;
}

export interface IStageEventMap {
    [key: string]: IStageEvent[];
}