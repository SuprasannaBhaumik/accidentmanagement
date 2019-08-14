import React from 'react';
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
import { VehicleImage } from '../model/VehicleImage';

import VehicleImageTile from '../view/VehicleImageTile';

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
	searchLicensePlate: string;
	activeTab: string;
	vehicleImages: VehicleImage[];
	searchVehicles: VehicleImage[];
	loadingPrediction: boolean;
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
			files: [],
			searchLicensePlate: '',
			activeTab: "first",
			vehicleImages: [],
			searchVehicles: [],
			loadingPrediction: false
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
		this.searchWith = this.searchWith.bind(this);
		this.redirectTab = this.redirectTab.bind(this);
		this.toggleLoader = this.toggleLoader.bind(this);
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

		this.toggleLoader();
		const vehicleData = new FormData();

		this.state.files.map( (file: Blob, index: number)=> {
			vehicleData.append(`image${index}`, file);
		})
		vehicleData.append('license', this.state.licensePlate);
		
		await axios.post('http://localhost:8080/processImages', vehicleData, { headers: this.headers })
		.then((response: any) => {
			// on success redirect to the first tab and make another axios call to fetch the data for the vehicle
			console.log(response);
			
			// remove the loader
			this.toggleLoader();

			this.redirectTab("second")
		}).catch((error: any) => {
			console.log('not able to reach the server')
		});
	}

	toggleLoader = () => {
		this.setState( {
			loadingPrediction: !this.state.loadingPrediction
		})
	}


	async fetchAllVehicleData () {
		await axios.get('http://localhost:8080/getVehicleImageData')
			.then( (response: any) => {
				this.setState( {
					vehicleImages: response.data,
					searchVehicles: response.data
				})
			}).catch((error: any)=> {
				console.log(error);
			})
	}

	redirectTab = (key: string) => {

		if (key === "second") {
			this.fetchAllVehicleData();
		}

		this.setState({
			activeTab: key
		})
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
				Cell: (props: any) => <span><img onClick={() => this.imageClicked(props.value)} height="40" width="40" src={process.env.PUBLIC_URL + '/images/viewer.png'}  alt=""/></span>
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
							<Tabs defaultActiveKey="1" id="tabs">
								<Tab eventKey="1" title="Location">
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
								<Tab eventKey="2" title="Video">
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
				{this.state.loadingPrediction && 
					<div>
						<img src={process.env.PUBLIC_URL + '/images/loading.gif'}/>
					</div>
				}
				{	
					this.state.forDepartureCheck && 
					<Tab.Container id="left-tabs-example" activeKey={this.state.activeTab} onSelect={this.redirectTab}>
						<div style={{display:'flex', flexDirection:'row'}} className={` ${this.state.loadingPrediction ? "overlay" : "z0"}`}>
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
												<div style={{display: 'flex', flexDirection: 'column'}}>
														<div style={{flex:'1', paddingTop: '20px'}}>
															<Form.Control type="text" placeholder="Enter License Plate" value={this.state.searchLicensePlate} onChange={this.searchWith} />
														</div>
														<div style={{flex:'1', paddingTop: '40px'}}>
															{this.state.searchVehicles.length === 0 && 
																<p>No results to display</p>
															}
															{this.state.searchVehicles.length > 0  &&  
																<>
																	{this.state.searchVehicles.map( (vehicle: VehicleImage, idx: number) => {
																		return (
																			<VehicleImageTile
																				key={idx}
																				imageUrl = {vehicle.genericImage}
																				license = {vehicle.license}
																				uploadedDate = {vehicle.uploadedDate}
																				images = {vehicle.images}
																			/>
																		)
																		})
																	}	
																</>
															}	
														</div>
												</div>
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
	
	searchWith(event: any) {
		const searchField = event.target.value;
		let searchVehicles = this.state.vehicleImages;
		searchVehicles = searchVehicles.filter( (vehicle: VehicleImage) => {
			let license = vehicle.license;
			if ( license.indexOf(searchField) > -1) {
				return true;
			}
		});
		this.setState({
			searchVehicles,
			searchLicensePlate: event.target.value
		});
	}

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
				});
			})
			 .catch((error: any) => {
				 console.log('error occured');
			 })


		//fetchAllVehicleData();

	}

}

export default Home;