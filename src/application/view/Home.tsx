import React, { ChangeEvent } from 'react';
import ReactTable, { Filter } from "react-table";
import "react-table/react-table.css";
// import { MapContainer } from './MapContainer';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import ReactPlayer from 'react-player';
import GoogleMapReact from 'google-map-react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import RemoveIcon from '../util/removeIcon';
import Camera from 'react-camera';

interface InternalState {
	data: any;
	popUp: boolean;
	mapData: any;
	video: any;
	videoUrl: string;
	playing: boolean;
	errorMessage: string;
	errorState: boolean;
	loading: boolean;
	forDtna: boolean;
	forDepartureCheck: boolean;
	licensePlate: string;
	files: Blob[];
}

interface Props {
	google: any;
}


class Home extends React.Component<Props, InternalState> {

	constructor(props: Props) {
		super(props);

		this.state = {
			data: [],
			popUp: false,
			mapData: {},
			video: {},
			videoUrl: '',
			playing: false,
			errorMessage: '',
			errorState: false,
			loading: true,
			forDtna: false,
			forDepartureCheck: true,
			licensePlate: '',
			files: []
		}

		this.filterTable = this.filterTable.bind(this);
		this.imageClicked = this.imageClicked.bind(this);
		this.closeButton = this.closeButton.bind(this);
		this.playError = this.playError.bind(this);
		this.renderMarkers = this.renderMarkers.bind(this);
		this.onChange = this.onChange.bind(this);
		this.upload = this.upload.bind(this);
		this.removeImage = this.removeImage.bind(this);
		this.takePicture = this.takePicture.bind(this);
		this.submitForAnalysis = this.submitForAnalysis.bind(this);
	}

	static defaultProps = {
		center: {
		lat: 59.95,
		lng: 30.33
		},
		zoom: 11
	};


	camera: any;
	img: any;
	src: any;

	headers= {
		'Content-Type': 'multipart/form-data',
		'Access-Control-Allow-Origin': '*',
		"Accept": "application/json",
        "type": "formData"
	}

	async submitForAnalysis(){

		const vehicleData = new FormData();

		this.state.files.map( (file: Blob, index: number)=> {
			vehicleData.append(`image${index}`, file);
		})
		vehicleData.append('license', this.state.licensePlate);
		// vehicleData.append('images', this.state.files);
		
		await axios.post('http://localhost:8080/processImages', vehicleData, { headers: this.headers })
		.then((response: any) => {
			// something
		}).catch((error: any) => {
			console.log('not able to reach the server')
		});


	}

	removeImage = (idx : number) => {
		const newFiles = this.state.files.filter(
			(file: any, index: number) => {
				return index!== idx 
			});
		
		this.setState({
			files : newFiles
		})

	}
	

	upload = (event: any) => {
		const newFiles = [...this.state.files, event.target.files[0] ];
		this.setState({
			files: newFiles
		})
	}

	onChange = (event: any) => {
		this.setState({
			licensePlate: event.target.value
		});
	}

	onPlay = () => {
		this.setState({ playing: true })
	}

	playError = (error: any) => {
		this.setState({
			errorMessage :'No video to display',
			errorState: true
		})
	}

	filterTable = (filter: Filter, row: any) => {
		return String(row[filter.id]).indexOf(filter.value) > -1;
	}

	imageClicked = (vin: string) => {

		// filter out the vehicle data from the vehicles
        const vehicleData = this.state.data.filter((element: any) => element.vin === vin)

		this.setState({
			popUp: true,
			mapData: vehicleData[0].location,
			videoUrl: vehicleData[0].videoUrl
		});
	}


	closeButton = () => {
		this.setState({
			popUp: false,
			videoUrl: ''
		});
	}

	renderMarkers = (map: any, maps: any) => {
		const myLatLng = {
			lat: this.state.mapData.latitude,
			lng: this.state.mapData.longitude
		}
		let marker = new maps.Marker({
			position: myLatLng,
			map,
			title: 'Accident Site!!!',
			// animation: maps.Animation.BOUNCE
		});
		marker.setMap(map);
		map.setCenter(myLatLng);
	}

    render(){

		const columns = [
			{
				Header: 'Vehicle Name',
				accessor: 'vehicleName'
			}, {
				Header: 'VIN',
				accessor: 'vin',
				Cell: (props: any) => <span className='number'>{props.value}</span>
			}, {
				id: 'accident',
				Header: 'Accident Date',
				accessor: (d: any) => d.accident
			}, {
				Header: (props: any) => <span>Action</span>,
				accessor: 'vin',
				Cell: (props: any) => <span><img onClick={() => this.imageClicked(props.value)} height="40" width="40" src="data:image/png;base64,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" alt=""/></span>
			}
		];

		const Marker = (props: any) => {
			return (
			<React.Fragment>
				<div className="pin" />
				<div className='pulse'></div>
			</React.Fragment>
			);
		}


		const tabs = [ 
			{
				'name':'Upload Departure Check',
				'key':'1'
			}, 
			{	
				'name':'View Results', 
				'key':'2'
			}
		];
		
        return(
			<React.Fragment>
				{ this.state.forDtna &&
				<div className={'encloser'}>
					
					
					 <ReactTable
					    loading = {this.state.loading}
						noDataText=" "
						data={this.state.data}
						filterable
						defaultFilterMethod={this.filterTable}
						columns={columns}
						defaultPageSize={5}
						className="-striped -highlight"
					/>
					<br />

					<Modal 
						show= {this.state.popUp} 
						onHide={this.closeButton}
						size="xl"
        				aria-labelledby="contained-modal-title-vcenter"
						dialogClassName='custom-dialog'
					>
						<Modal.Header closeButton>
							<Modal.Title>Vehicle Details</Modal.Title>
						</Modal.Header>

						<Modal.Body>
							<Tabs defaultActiveKey="location" id="tabs">
								<Tab eventKey="location" title="Location">
									<div style={{height: '40vw', paddingTop: '20px'}}>
										<GoogleMapReact
											style={{height: '400px'}}
											bootstrapURLKeys={{key:'AIzaSyA0r5rhBNOqL4FFcJgf2lT_mR9ymwan2tw'}}
																	//AIzaSyA_4TafJPc4kKbOvLHibTfnFKkP1Az5QvM
											defaultZoom={0}
											yesIWantToUseGoogleMapApiInternals
											center={{lat: 12.97, lng: 77.59}}
											resetBoundsOnResize = {true}
											onGoogleApiLoaded={({map, maps}) => this.renderMarkers(map, maps)}
										>
											{false && <Marker lat={12.97} lng={77.59}/>}
										</GoogleMapReact>	
									</div>
								</Tab>
								<Tab eventKey="video" title="Video">
									<div style={{height: '40vw', paddingTop: '20px'}}>
										<br/>
										{ !this.state.errorState && 
										<ReactPlayer
											url={this.state.videoUrl}
											className='react-player'
											playing = {false}
											controls
											width='450px'
											height='400px'
											onError={this.playError}
										/>
										}
										{ this.state.errorState && 
											<span>{this.state.errorMessage}</span>
										}
									</div>	
								</Tab>
							</Tabs>
						</Modal.Body>
					</Modal>
				</div>}

				{
					this.state.forDepartureCheck && 
					
					<Tab.Container id="left-tabs-example" defaultActiveKey="first">
						<div style={{display:'flex', flexDirection:'row'}}>
							<div style={{flex:'4', display:'flex', flexDirection:'row'}}>
								<div style={{flex:'2'}} />
								<div style={{flex:'3', alignItems:'center', display:'flex', flexDirection:'column'}}>
									<div style={{flex:'3'}}>
										<Nav variant="pills" className="flex-column">
											<Nav.Item>
												<Nav.Link eventKey="first">Add Departure Check</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="second">View Results</Nav.Link>
											</Nav.Item>
										</Nav>
									</div>
								</div>


							</div>
							<div style={{flex:'8'}}>
									<Row>
										<Col sm={3}>
										
										</Col>
										<Col sm={9}>
										<Tab.Content>
											<Tab.Pane eventKey="first">
												<div style={{display: 'flex', flexDirection:'column', paddingTop: '20%'}} >
													<div style={{flex: '1', display:'flex', flexDirection:'row', paddingBottom:'20px'}}>
														<div style={{marginRight: '10px'}}>
															<h4>License Plate: </h4>
														</div>
														<div>
															<Form.Control type="text" placeholder="License Plate" value={this.state.licensePlate} onChange={this.onChange} />
														</div>

													</div>
													<div style={{flex: '1', display:'flex', flexDirection:'row'}}>
														<div style={{marginRight: '10px'}}>
															<h4>Click Images: </h4>
														</div>
														<div>
															{this.state.files.length === 10 && 
															<span style={{color: 'red'}}>
																You cannot click more than 10 pictures
															</span>
															}

															{this.state.files.length < 10 && 
															<Camera style={{position: 'relative'}}
																ref={(cam: any) => {
																	this.camera = cam;
																}}
															>
																<div style={{display: 'flex', position: 'absolute',	justifyContent: 'center', zIndex: 1, bottom: 0, width: '100%'}} onClick={this.takePicture}>
            														<div style={{backgroundColor: '#fff', borderRadius: '50%', height: 56, width: 56, color: '#000', margin: 20}} />
																</div>
															</Camera>
															}
														</div>

													</div>

													{this.state.files.length > 0 && 
													
													<div style={{flex: '1', display:'flex', flexDirection:'row', flexWrap: 'wrap'}}>
														
														{this.state.files.map( (file: any, idx: number) => {
															return (
																<div key={idx} style={{marginRight: '5px', marginBottom: '5px'}}>
																	<RemoveIcon onClick={ ()=> this.removeImage(idx) } style={{top: '-54px', right: '-150px', backgroundColor: 'red'}}/>
																	<img src={URL.createObjectURL(file)} width={150} height={150}/>
																</div>
															)
														})
														}

													</div>}
												</div>
												<div style = {{flex: '1', justifyContent:'left'}}>
													<Button type='button' variant="outline-primary" disabled={!this.state.licensePlate} onClick={() => this.submitForAnalysis()}>Submit</Button>
												</div>
											</Tab.Pane>
											<Tab.Pane eventKey="second">
												<span>Second div</span>
											</Tab.Pane>
										</Tab.Content>
										</Col>
									</Row>
							</div>
							<div style={{flex:'4'}}></div>
						</div> 
					</Tab.Container>

				}
			</React.Fragment>
        );
	}
	// "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
	
	takePicture = () => {
    	this.camera.capture()
			.then( (blob: any) => {
				const newFiles = [...this.state.files, blob ];
				this.setState({
					files: newFiles
				});
				//this.img.src = URL.createObjectURL(blob);
				//this.img.onload = () => { URL.revokeObjectURL(this.src); }
			})
	}

	public componentDidMount() {
		
		axios.get('https://dtna-server.azurewebsites.net/listAll')
             .then( (response: any) => {
				 this.setState({
					data: response.data,
					loading: false
				})
			})
			 .catch((error: any) => {
				 console.log('error occured');
			 });

	}

}

export default Home;
