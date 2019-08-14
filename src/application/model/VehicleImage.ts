import { Finding } from './Finding';
import { Image } from './Image';

export interface VehicleImage {
	license: string;
	uploadedDate: string;
	images: Image[];
	genericImage: string;
}