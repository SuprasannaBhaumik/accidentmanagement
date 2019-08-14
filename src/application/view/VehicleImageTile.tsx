import React from 'react';
import { Finding } from '../model/Finding';
import { Image } from '../model/Image';

import Modal from 'react-bootstrap/Modal';

interface Props {
	imageUrl: string;
	license: string;
	uploadedDate: string;
	images: Image[];
}

interface InternalState {
	popupState: boolean;
	

}

class VehicleImageTile extends React.Component<Props, InternalState> {


	constructor(props: Props) {
		super(props);

		this.state = {
			popupState: false
		}

		this.openModalPopUp = this.openModalPopUp.bind(this);
		this.closeButton = this.closeButton.bind(this);
	}


	openModalPopUp = (event: any) => {
		this.setState({
			popupState: true
		})
	}


	closeButton = () => {
		this.setState ({
			popupState: false
		})
	}

	render() {
		return(
			<div style={{display:'flex', flexDirection:'row', borderRadius: '20px', boxShadow: '0 0 12px #b3cccc', marginTop: '25px', marginBottom: '15px'}}>
				<div style={{flex:'2', display:'flex', flexDirection: 'column'}}>
					<div style={{flex: '1', textAlign: 'left', marginLeft: '15px', fontWeight: 'bold', marginTop: '15px'}}>{this.props.license}</div>
					<div style={{flex: '2', display: 'flex', flexDirection: 'row'}}>
						<div style={{flex: '1', alignItems: 'center', textAlign: 'left', marginLeft: '15px'}}>
							{this.props.uploadedDate}
						</div>
						<div style={{flex: '1'}}>
							<img
								style={{width: '100%', height: '75px'}}
								src={this.props.imageUrl}
							/>
						</div>
					</div>
				</div>
				<div style={{flex:'1', alignItems: 'center', margin:'auto'}}>
					 <img style={{width: '45px', height: '45px', cursor: 'pointer'}} 
						src={process.env.PUBLIC_URL + '/images/viewer.png'} 
						title='Action'
						onClick={this.openModalPopUp}
						
					  />
				</div>
				{ this.state.popupState && 
					<Modal 
						show= {this.state.popupState} 
						onHide={this.closeButton}
						size="sm"
						aria-labelledby="contained-modal-title-vcenter"
						dialogClassName=''
					>
						<Modal.Header closeButton>
							<Modal.Title>{'Detailed Report '}</Modal.Title>
						</Modal.Header>

						<Modal.Body>
							<div style={{display: 'flex', flexDirection: 'column'}}>
								{ this.props.images.map ( (image: Image, idx: number) => {
									return (
										<div key={idx} style={{ float:'right', display: 'flex', flexDirection: 'row', paddingBottom: '5px'}}>
											<div style={{flex:'1'}}>
												<img src={image.imageUrl} height={150} width={150}/>
											</div>
											<ul>
												{image.prediction.length > 0 && image.prediction.map((pred: Finding, index: number)=> {
													return (
														<li key={index}>{pred.classification}</li>
													)
												})
												}
												{
													image.prediction.length === 0 && 
													<li>{'No flaws detected'}</li>
												}
											</ul>
										</div>
									)
								 })
								}
							</div>
						</Modal.Body>
                    </Modal>
				}
			</div>
		)
	}
}

export default VehicleImageTile;