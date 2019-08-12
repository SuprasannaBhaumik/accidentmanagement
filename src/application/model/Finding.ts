import {Result} from './Result';

export interface Finding {
	isPredicted: boolean;
	image: string;
	result: Result[];
}