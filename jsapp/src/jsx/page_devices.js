/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Radio, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from 'riek'
import { EditControl, xFetchJSON } from './libs/xtools'

class NewDevice extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var dt = form2json('#newDeviceForm');
		console.log("dt", dt);

		if (!dt.name || !dt.type) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}
		xFetchJSON("/api/devices", {
			method: "POST",
			body: JSON.stringify(dt)
		}).then((obj) => {
			dt.id = obj.id;
			_this.props.handleNewDeviceAdded(dt);
		}).catch((msg) => {
			console.error("device", msg);
			_this.setState({errmsg: msg});
		});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.handleNewDeviceAdded;

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Device" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newDeviceForm">
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="name" placeholder="realm1" /></Col>
				</FormGroup>

				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="type" placeholder="" /></Col>
				</FormGroup>

				<FormGroup controlId="formVender">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Vendor"/></Col>
					<Col sm={10}><FormControl type="input" name="vendor" placeholder="" /></Col>
				</FormGroup>

				<FormGroup controlId="formMAC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="MAC"/></Col>
					<Col sm={10}><FormControl type="input" name="mac" placeholder="" /></Col>
				</FormGroup>

				<FormGroup>
					<Col smOffset={2} sm={10}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class DevicePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {errmsg: '', dt: {}, edit: false, device_users: []};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var dt = form2json('newDeviceForm');
		console.log("dt", dt);

		xFetchJSON("/api/devices/" + dt.id, {
			method: "PUT",
			body: JSON.stringify(dt)
		}).then((data) => {
			_this.setState({dt: dt, errmsg: {key: "Saved at", time: Date()}, edit: false})
		}).catch((msg) => {
			console.error("device", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/devices/" + this.props.params.id).then((data) => {
			console.log("dt", data);
			_this.setState({dt: data});
		}).catch((msg) => {
			console.log("get device ERR");
		});
	}

	render() {
		const dt = this.state.dt;
		let save_btn = "";
		let err_msg = "";
		var userlist = [];

		if (this.state.edit) {
			save_btn = <Button onClick={this.handleSubmit}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		return <div>
			<ButtonToolbar className="pull-right" onClick={this.handleControlClick}>
			<ButtonGroup>
				{err_msg} { save_btn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1>{dt.name}</h1>
			<hr/>

			<Form horizontal id="newDeviceForm">
				<input type="hidden" name="id" defaultValue={dt.id}/>
				<FormGroup controlId="formName">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Name" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="name" defaultValue={dt.name}/></Col>
				</FormGroup>

				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="type" defaultValue={dt.type}/></Col>
				</FormGroup>

				<FormGroup controlId="formVendor">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Vendor"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="vendor" defaultValue={dt.vendor}/></Col>
				</FormGroup>

				<FormGroup controlId="formMAC">
					<Col componentClass={ControlLabel} sm={2}><T.span text="MAC"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="mac" defaultValue={dt.mac}/></Col>
				</FormGroup>

				<FormGroup controlId="formSave">
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={10}>{save_btn}</Col>
				</FormGroup>
			</Form>
		</div>
	}
}

class DevicesPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { formShow: false, rows: [], danger: false};

		// This binding is necessary to make `this` work in the callback
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleControlClick(data) {
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleDelete(id) {
		console.log("deleting id", id);
		var _this = this;

		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}

		xFetchJSON("/api/dicts/" + id, {
			method: "DELETE"
		}).then((obj) => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			_this.setState({rows: rows});
		}).catch((msg) => {
				console.error("route", msg);
		});
	}

	componentDidMount() {
		var _this = this;

		xFetchJSON('/api/devices').then((data) => {
			console.log("dt", data)
			_this.setState({rows: data});
		}).catch((msg) => {
			console.log("get devices ERR");
		});
	}

	handleDictAdded(route) {
		var rows = this.state.rows;
		rows.unshift(route);
		this.setState({rows: rows, formShow: false});
	}

	render() {
		const row = this.state.rows;
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		let hand = { cursor: "pointer" };
	    var danger = this.state.danger ? "danger" : "";

		var _this = this;

		var rows = this.state.rows.map(function(row) {
			var id = (row.id).toString();
			return <tr key={row.id}>
					<td>{row.id}</td>
					<td><Link to={`/settings/devices/${row.id}`}>{row.name}</Link></td>
					<td>{row.type}</td>
					<td>{row.vendor}</td>
					<td>{row.mac}</td>
					<td><T.a onClick={() => _this.handleDelete(row.id)} text="Delete" className={danger} style={{cursor:"pointer"}}/></td>
			</tr>;
		})

		return <div>
			<ButtonToolbar className="pull-right">
				<ButtonGroup>
					<Button onClick={() => this.handleControlClick("new")}>
						<i className="fa fa-plus" aria-hidden="true" onClick={() => this.handleControlClick("new")}></i>&nbsp;
						<T.span onClick={() => this.handleControlClick("new")} text="New" />
					</Button>
				</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="Devices"/></h1>
			<div>
				<table className="table">
				<tbody>
				<tr>
					<th><T.span text="ID"/></th>
					<th><T.span text="Name" /></th>
					<th><T.span text="Type" /></th>
					<th><T.span text="Vendor"/></th>
					<th><T.span text="MAC"/></th>
					<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
				</tr>
				{rows}
				</tbody>
				</table>
			</div>

			<NewDevice show={this.state.formShow} onHide={formClose} handleNewDeviceAdded={this.handleDictAdded.bind(this)}/>
		</div>
	}
}

export {DevicePage, DevicesPage};
