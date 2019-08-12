import { Finding } from './Finding';

export interface VehicleImage {
	license: string;
	time: string;
	findings?: Finding[];
	imageUrl: string;
}