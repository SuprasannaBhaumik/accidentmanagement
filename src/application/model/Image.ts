import {Finding} from './Finding';

export interface Image {
	imageUrl: string;
	prediction: Finding[];
}