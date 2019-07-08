import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import React, { Component } from 'react';


interface Props {
	google: any;
}

interface InternalState{
	centerLatitude: number;
	centerLongitude: number;
	showingInfoWindow: boolean;
	activeMarker: any;
}
export class MapContainer extends Component<Props, InternalState> {

	constructor(props: Props) {
		super(props);

		this.state = ({
			centerLongitude: 0,
			centerLatitude: 0,
			showingInfoWindow: false,
			activeMarker: {}
		});

		this.onMarkerClick = this.onMarkerClick.bind(this);
		this.onMapClick = this.onMapClick.bind(this);
		this.onInfoWindowClose = this.onInfoWindowClose.bind(this);
	}


	render() {

		const style = {
			width: '100%',
			height: '100%'
		}

		if (!this.props.google) {
			return <div>Loading...</div>;
		}

		return (

			<div>
				<p>Hello</p>
				<Map google={this.props.google} />
			</div>
		);
	}

	public onMarkerClick(props: any, marker: any, e: any) {
		console.log('clicked on the marker');
		this.setState({
			showingInfoWindow: true,
			activeMarker: marker
		});
	}

	public onMapClick(props: any) {
		if (this.state.showingInfoWindow) {
			this.setState({
				showingInfoWindow: false
			});
		}
	}

	public onInfoWindowClose(props: any) {
		this.setState({
				showingInfoWindow: false,
				activeMarker: null
		});
	}
}

//  apiKey: ('AIzaSyBGAYbnXBspIOqP7jC_IFUDIL7mFFXISMc')
export default GoogleApiWrapper({
	apiKey: ('AIzaSyCm_W5Ft1HW1VOhqx-hOTSAN9n8Ryh75L8')
})(MapContainer)