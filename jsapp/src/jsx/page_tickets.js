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
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col, Radio, Nav, NavItem, DropdownButton, MenuItem, Label, Pagination } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import PubSub from 'pubsub-js';

class NewTicket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: '', types: [], tel: null, textareaValue: '', subjectValue: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.setState({tel: e.target.value});
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#newTicketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		var _window = window;
		xFetchJSON("/api/tickets", {
			method:"POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			window.location = "#/tickets/" + obj.id
			_this.props.handleNewTicketAdded(obj);
		}).catch((msg) => {
			console.error("ticket", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	componentWillMount() {
		var _this = this;
		const username = localStorage.getItem('xui.username');
		xFetchJSON("/api/users/cur_user/" + username).then((data) => {
			_this.setState({tel: data.tel});
		});
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
	}

	handleSelect(selectedKey) {
		let templates = [['用户举报', '时间：\n地点：\n事件：'], ['网站留言投诉', '投诉内容：'], ['来人来访', '时间：\n来人：']];
		this.setState({subjectValue: templates[selectedKey - 1][0]});
		this.setState({textareaValue: templates[selectedKey - 1][1]});
	}

	TextareaChange(event) {
		this.setState({textareaValue: event.target.value});
	}

	SubjectChange(event) {
		this.setState({subjectValue: event.target.value});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		delete props.handleNewTicketAdded;
		const emergencys = ['NORMAL', 'EMERGENT', 'URGENT'];

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Ticket" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newTicketForm">
				<FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" value={this.state.tel} onChange={this.handleChange}/></Col>
				</FormGroup>
				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="subject" placeholder="" value={this.state.subjectValue} onChange={this.SubjectChange.bind(this)} /></Col>
				</FormGroup>
				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>

					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								return <option key={t.id} value={t.k}>{T.translate(t.v)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="emergency">
							{emergencys.map(function(t) {
								return <option key={t} value={t}>{T.translate(t)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formDeadline">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Deadline"/></Col>
					<Col sm={10}><FormControl type="date" name="deadline"/></Col>
				</FormGroup>
				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={10}><FormControl componentClass="textarea" rows="5" name="content" placeholder="" value={this.state.textareaValue} onChange={this.TextareaChange.bind(this)}/></Col>
				</FormGroup>
				<FormGroup controlId="formPri">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Ticket Privilege"/></Col>
					<Col sm={10}>
						<Radio name="privacy" value="TICKET_PRIV_PRIVATE" inline defaultChecked><T.span text="Private"/></Radio>
						<Radio name="privacy" value="TICKET_PRIV_PUBLIC" inline><T.span text="Public"/></Radio>
					</Col>
				</FormGroup>
				<FormGroup>
					<Col smOffset={2} sm={2}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
					<Col smOffset={5} sm={2}>
						<DropdownButton bsStyle='primary' title={T.translate("Ticket Templates")} key='1' id='dropdown' onSelect={this.handleSelect.bind(this)}>
							<MenuItem eventKey="1">模版1</MenuItem>
							<MenuItem eventKey="2">模版2</MenuItem>
							<MenuItem eventKey="3">模版3</MenuItem>
						</DropdownButton>
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

class TicketPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ticket: {},
			users: [],
			user_options: null,
			ticket_comments: [],
			deal_user: null,
			edit: false,
			types: [],
			call: "回拨",
			content: false,
			rate: '',
			record_src: '',
			media_files: [],
			comment: '',
			hiddendiv: 'none',
			showSelect: false,
			picWidth: "50%",
			ticket_data: {}
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCommit = this.handleCommit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleSubmitChange = this.handleSubmitChange.bind(this);
		this.handleControlClose = this.handleControlClose.bind(this);
		this.handleClickChange = this.handleClickChange.bind(this);
		this.handleSatisfiedSubmit = this.handleSatisfiedSubmit.bind(this);
		this.handleRateSubmit = this.handleRateSubmit.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.handleCommitUpload = this.handleCommitUpload.bind(this);
		this.handleShowPic = this.handleShowPic.bind(this);
		this.handleOnClickBack = this.handleOnClickBack.bind(this);
	}

	handleCommitUpload() {
		this.dropzone.open();
	}

	exportCsv(obj) {
		var title = obj.title;
		var titleForKey = obj.titleForKey;
		var data = obj.data;
		var str = [];
		str.push(obj.title.join(",") + "\n");
		for (var i = 0; i < data.length; i++) {
			var temp = [];
			for (var j = 0; j < titleForKey.length; j++) {
				temp.push(data[i][titleForKey[j]]);
			}
			str.push(temp.join(":") + "  ");
		}
		var uri = 'data:text/plain;charset=uft8,' + encodeURIComponent(str.join(""));
		var downloadLink = document.createElement("a");
		downloadLink.href = uri;
		downloadLink.download = this.state.ticket.subject + ".txt";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	handleDownload() {
		const ticket = this.state.ticket;
		this.exportCsv({
			title: ["工单内容", this.state.ticket.subject],
			titleForKey: ["num1", "num2"],
			data: [
				{
					num1: "主题",
					num2: ticket.subject
				}, {
					num1: "主叫号码",
					num2: ticket.cid_number
				}, {
					num1: "创建时间",
					num2: ticket.created_at
				}, {
					num1: "内容",
					num2: ticket.content
				}, {
					num1: "类型",
					num2: T.translate(ticket.type)
				}, {
					num1: "状态",
					num2: T.translate(ticket.status)
				}, {
					num1: "紧急程度",
					num2: T.translate(ticket.emergency)
				}, {
					num1: "处理期限",
					num2: ticket.deadline
				}, {
					num1: "派单人",
					num2: ticket.user_name
				}]
		});
	}

	handleSatisfiedSubmit(e) {
		var _this = this;
		var satisfied = form2json('#SatisfiedForm');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/satisfied", {
			method: "PUT",
			body: JSON.stringify(satisfied)
		}).then((obj) => {
			console.log('submit successfully')
		}).catch((err) => {
			console.error("satisfied", err);
			notify(err, "error");
		});
		xFetchJSON("/api/tickets/" + _this.props.params.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});
	}

	handleClickChange(e) {
		const users = this.state.users;
		const ticket = this.state.ticket;
		delete ticket.current_user_id;
		let deal_user = <FormControl componentClass="select" name="current_user_id">{
				users.map(function(row) {
					return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
				})
			}
		</FormControl>;
		this.setState({deal_user: deal_user});
	}

	handleControlClose() {
		let _this = this;
		let ticket = this.state.ticket;
		console.log('ticket', ticket)
		let id = this.state.ticket.id;
		xFetchJSON("/api/tickets/" + id  + "/close", {
			method: "PUT"
		}).then(() => {
			ticket.status = "TICKET_ST_DONE";
			_this.setState({ticket: ticket});
			notify(<T.span text={{key:"Finished at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("ticket", msg);
		});

		xFetchJSON("/api/tickets/" + _this.state.ticket.id + '/comments').then((data) => {
			console.log('data', data)
			_this.setState({ticket_comments: data});
		});
	} 

	handleSubmit(e) {
		var _this = this;
		var ticket = form2json('#ticketAssignForm');
		var username;
		_this.state.users.map((user) => {
			if (user.id == ticket.current_user_id) {
				username = user.name;
			}
		})
		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/assign/" + ticket.current_user_id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then(() => {
			console.log('assign successfully');
			notify(<T.span text={{key:"Assigned to", username: username}}/>);
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});

		xFetchJSON("/api/tickets/" + _this.state.ticket.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});
	}

	handleCommit(e) {
		var _this = this;
		var ticket = {content: this.state.comment};

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/comments", {
			method: "POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			var rows = this.state.ticket_comments;
			rows.unshift(obj);
			this.setState({ticket_comments: rows, deal_user: null, hidden_user: null, comment: ''});
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleRateSubmit(e) {
		var _this = this;
		var ticket = form2json('#FormRate');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/rate", {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then((data) => {
			console.log('data', data);
			_this.setState({rate: data.rate, content: true});
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleSubmitChange(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#ticketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/tickets/" + ticket.id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then((data) => {
			_this.setState({ticket: ticket, errmsg: {key: "Saved at", time: Date()}, edit: !_this.state.edit});
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	}

	handleControlClick(e) {
		if (localStorage.getItem('xui.username') == 'admin') {
			this.setState({edit: !this.state.edit});
		} else {
			notify(<T.span text={'Only Admin has the right to edit ticket'}/>);
		}
	}

	handleOnClickBack(e) {
		history.back()
	}

	componentWillMount() {

	}

	componentWillUnmount () {
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/tickets/" + _this.props.params.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
			if( _this.state.ticket.media_file_id){
				xFetchJSON("/api/tickets/" + _this.props.params.id + '/record?file_id=' + _this.state.ticket.media_file_id).then((data) => {
					this.setState({record_src: data.rel_path});
				}).catch((e) => {
					console.error("get ticket record", e);
				});
			}
		}).catch((e) => {
			console.error("get ticket", e);
		});

		xFetchJSON("/api/users/bind").then((data) => {
			this.setState({users: data});
		});

		xFetchJSON("/api/tickets/" + _this.props.params.id + '/comments').then((data) => {
			console.log('data', data)
			this.setState({ticket_comments: data});
		});

		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});

		xFetchJSON("/api/tickets/" + _this.props.params.id + "/comments/media_files").then((media_files) => {
			console.log("media_files", media_files);
			_this.setState({media_files: media_files});
		});
	}

	callBack(e) {
		this.setState({call: "回拨中..."});
		xFetchJSON('/api/call_back/' + e).then((data) => {
			this.setState({call: "回拨"});
		});
	}

	onDrop(acceptedFiles, rejectedFiles) {
		const _this = this;

		console.log('Accepted files: ', acceptedFiles);
		console.log('Rejected files: ', rejectedFiles);

		if (this.state.readonly) return;

		const formdataSupported = !!window.FormData;

		let data = new FormData()

		for (var i = 0; i < acceptedFiles.length; i++) {
			data.append('file', acceptedFiles[i])
		}

		let xhr = new XMLHttpRequest();
		const progressSupported = "upload" in xhr;

		xhr.onload = function(e) {
			_this.setState({progress: 100});
			_this.setState({progress: -1});
		};

		if (progressSupported) {
			xhr.upload.onprogress = function (e) {
				// console.log("event", e);
				if (event.lengthComputable) {
					let progress = (event.loaded / event.total * 100 | 0);
					// console.log("complete", progress);
					_this.setState({progress: progress});
				}
			}
		} else {
			console.log("XHR upload progress is not supported in your browswer!");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					// console.log('response=',xhr.responseText);
					let mfiles = JSON.parse(xhr.responseText);
					console.log(mfiles);
					_this.setState({rows: mfiles.concat(_this.state.rows)});
				} else {
					// console.error("upload err");
				}
			}
		}

		xhr.open('POST', '/api/tickets/' + _this.props.params.id + '/comment_upload');
		xhr.send(data);
	}

	HandleChangeComment(event) {
		this.setState({comment: event.target.value});
	}

	handleMore(e) {
		e.preventDefault();

		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}

	handleShowDealusers() {
		const users = this.state.users;
		this.setState({
			showSelect: true,
			deal_user: <FormControl componentClass="select" name="current_user_id">{
								users.map(function(row) {
									return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
								})
							}
						</FormControl>
		})
	}

	handleShowPic() {
		this.setState({	picWidth: this.state.picWidth == '50%' ? '100%' : '50%'	});
	}

	handleDelete(id) {
		var _this = this;
		xFetchJSON("/api/tickets/" + id, {method: "DELETE"}).then(() => {
			console.log("ticket deleted");
			notify(<T.span text="This ticket has been deleted"/>, "error");
		}).catch((msg) => {
			console.error("user", msg);
			notify(msg, 'error');
		});
	}

	render() {
		const idArray = this.state.media_files.map((m) => {
			return m.comment_id;
		})
		let _this = this;
		let savebtn = "";
		if (this.state.edit) {
			savebtn = <Button onClick={this.handleSubmitChange}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		const ticket_comments = this.state.ticket_comments.map(function(row) {
			if (row.avatar_url) {
				var src = row.avatar_url;
			} else {
				var src = "/assets/img/default_avatar.png";
			}
			var vasrc = '';

			_this.state.media_files.map((m) => {
				if(m.comment_id == row.id){
					vasrc = "/upload/" + m.src;
				}
			})
			var va;
			if ( vasrc.slice(-3) == 'mp4' ) {
				va = <video src={vasrc} controls="controls" style={{maxWidth: "80%", maxHeight: "200px"}}/>;
			}else if ( vasrc.slice(-3) == 'amr' ) {
				va = <audio src={vasrc.slice(0, -3) + 'mp3'} controls="controls"></audio>;
			}else if ( vasrc.slice(-3) == 'png' || vasrc.slice(-3) == 'jpg' ) {
				va = <img src={vasrc} style={{width: _this.state.picWidth, height: ""}} onClick={_this.handleShowPic}/>
			}
		    var content =  _.indexOf(idArray, row.id) != -1 ? va : <EditControl componentClass="textarea" defaultValue={row.content}/>
			let style = {width: '40px'};
			return <Row key={row.id}>
				<Col componentClass={ControlLabel} sm={1} smOffset={2}><img src={src} style={style}/></Col>
				<Col sm={7}> <strong>{row.user_name}</strong>&nbsp;<small>{row.created_at}</small>
					<br/><br/>{content}
				</Col>
			</Row>
		})

		const ticket = this.state.ticket;
		if (ticket.rate || this.state.rate) {
			this.state.content = true;
		}
		let types = {};
		this.state.types.forEach((type) => {
			types[type.k] = type.v;
		})
		var status = '';
		var style = null;
		if(ticket.status == "TICKET_ST_NEW"){
			style = {color: 'red'};
		}
		if(ticket.status == 'TICKET_ST_DONE'){
			style = {color: 'green'};
		}

		let save_btn = "";
		let commit_btn = "";
		let hidden_user = "";
		const users = this.state.users;
		var deal_user;

		save_btn = <Button onClick={this.handleSubmit}><T.span text="Assign"/></Button>

		if(ticket.current_user_id) {
			users.map(function(row) {
				if(row.id == ticket.current_user_id){
					deal_user = <FormGroup>
									<Col componentClass={ControlLabel} sm={2}><T.span text="处理人" /></Col>
									<Col sm={2}><FormControl.Static><Label bsStyle="default" bsSize="lg"><T.span text={row.name} onClick={_this.handleClickChange} style={{fontSize: '14px'}}/></Label></FormControl.Static></Col>
								</FormGroup>
					hidden_user = <FormControl type="hidden" name="current_user_id" value={row.id}/>
				}
			})
		} else if(!this.state.showSelect) {
			deal_user = <FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="处理人" /></Col>
							<Col sm={2}><FormControl.Static><T.a onClick={() => this.handleShowDealusers()} text="Select" style={{cursor: "pointer"}}/></FormControl.Static></Col>
						</FormGroup>;
		} else {
			deal_user = <FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="处理人" /></Col>
							<Col sm={4}><FormControl componentClass="select" name="current_user_id">{
									users.map(function(row) {
										return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
									})
								}
							</FormControl></Col>
							<Col sm={2}>{save_btn}</Col>
						</FormGroup>;
		}

		this.state.deal_user = deal_user;
		this.state.hidden_user = hidden_user;

		commit_btn = <Button onClick={this.handleCommit}><T.span text="Comment"/></Button>
		const upload_btn = <Button onClick={this.handleCommitUpload}><T.span text="Upload" /></Button>

		const options = this.state.deal_user;
		let Audio;
		if (_this.state.record_src) {
			const src = "/recordings/" + _this.state.record_src;
			Audio = <FormGroup controlId="formCaller_id_name">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Record"/></Col>
						<Col sm={10}><audio src={src} controls="controls" /></Col>
					</FormGroup>
		} else {
			Audio = <div></div>;
		};
		let FORM;
		if (this.state.edit == false) {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="type" defaultValue={types[ticket.type]}/></Col>
				</FormGroup>;
		} else {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								if (t.v == ticket.type) {
									return <option key={t.id} value={t.k} selected="selected">{T.translate(t.v)}</option>;
								} else {
									return <option key={t.id} value={t.k}>{T.translate(t.v)}</option>;
								};
							})}
						</FormControl>
					</Col>
				</FormGroup>;
		};
		const emergencys = ['URGENT', 'EMERGENT', 'NORMAL'];
		let EMERGENRY;
		if (this.state.edit == false) {
			EMERGENRY = <FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="emergency" defaultValue={ticket.emergency}/></Col>
				</FormGroup>;
		} else {
			EMERGENRY = <FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="emergency">
							{emergencys.map(function(t) {
								if (t == ticket.type) {
									return <option key={t} value={t} defaultValue={T.translate(t)}>{T.translate(t)}</option>;
								} else {
									return <option key={t} value={t}>{T.translate(t)}</option>;
								};
							})}
						</FormControl>
					</Col>
				</FormGroup>;
		};
		let satisfied;
		switch(_this.state.ticket.satisfied){
			case undefined:
			case null:
			case '': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="Satisfaction" /></Col>
										<Col sm={3}>
											<span>
												<Radio name="satisfied" value="1" inline defaultChecked><T.span text="Satisfied"/></Radio>
												<Radio name="satisfied" value="0" inline><T.span text="Unsatisfied"/></Radio>
											</span>
										</Col>
										<Col sm={2}>
											<Button onClick={this.handleSatisfiedSubmit}><T.span onClick={this.handleSatisfiedSubmit} text="Submit"/></Button>
										</Col>
									</FormGroup>
								</Form>;
								break;
			case '1': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="Satisfaction" /></Col>
										<Col sm={3}>
											<span>
												<T.span text="Satisfied"/>
											</span>
										</Col>
									</FormGroup>
								</Form>;
								break;
			case '0': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="Satisfaction" /></Col>
										<Col sm={3}>
											<span>
												<T.span text="Unsatisfied"/>
											</span>
										</Col>
									</FormGroup>
								</Form>;
								break;
		}

		let ticket_privacy = ticket.privacy == "TICKET_PRIV_PRIVATE" ? "TICKET_PRIV_PRIVATE" : "TICKET_PRIV_PUBLIC";

		var ticket_privacy_component = <FormControl.Static><T.span text={ticket.privacy == "TICKET_PRIV_PRIVATE" ? "Private" : "Public"}/></FormControl.Static>
		if (this.state.edit) {
			if (ticket.privacy == "TICKET_PRIV_PRIVATE") {
				ticket_privacy_component = <span>
					<Radio name="privacy" value="TICKET_PRIV_PRIVATE" inline defaultChecked><T.span text="Private"/></Radio>
					<Radio name="privacy" value="TICKET_PRIV_PUBLIC" inline><T.span text="Public"/></Radio>
				</span>
			} else {
				ticket_privacy_component = <span>
					<Radio name="privacy" value="TICKET_PRIV_PRIVATE" inline><T.span text="Private"/></Radio>
					<Radio name="privacy" value="TICKET_PRIV_PUBLIC" inline defaultChecked><T.span text="Public"/></Radio>
				</span>
			}
		}

		return <Dropzone ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleMore.bind(this)}><i className="fa fa-comments" aria-hidden="true"></i>&nbsp;<T.span text="Rating"/></Button>
			</ButtonGroup>

			<ButtonGroup>
				<Link className="btn btn-default" onClick={this.handleOnClickBack}>
					<i className="fa fa-chevron-circle-left" aria-hidden="true"></i>&nbsp;<T.span text="Back"/>
				</Link>
				<Button onClick={this.handleDownload}><i className="fa fa-download" aria-hidden="true"></i>&nbsp;<T.span text="Download"/></Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={() => _this.callBack(ticket.id)}><i className="fa fa-phone-square" aria-hidden="true"></i>&nbsp;<T.span text={_this.state.call}/></Button>
			</ButtonGroup>

			<ButtonGroup>
				<Button onClick={this.handleControlClose}><i className="fa fa-check-square" aria-hidden="true"></i>&nbsp;<T.span text="Finished"/></Button>
				{ savebtn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>

			<ButtonGroup>
				<Link to={`/tickets`} className="btn btn-danger" onClick={() => _this.handleDelete(ticket.id)}>
						<i className="fa fa-times" aria-hidden="true"></i>&nbsp;<T.span text="Delete"/>
				</Link>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="工单"/> <small>{ticket.serial_number}</small></h1>
			<hr/>
			<div style={{display: this.state.hiddendiv}}>
				{satisfied}
				<Form horizontal id="FormRate">
					{
						this.state.content ?
						<FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="工单评价" /></Col>
							<Col sm={4}>
								<EditControl componentClass="textarea" name="rate" defaultValue={this.state.rate ? this.state.rate : this.state.ticket.rate}/>
							</Col>
						</FormGroup> :
						<FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="工单评价" /></Col>
							<Col sm={3}>
								<FormControl componentClass="textarea" name="rate" placeholder="评价内容" />
							</Col>
							<Col sm={1}>
								<Button onClick={this.handleRateSubmit}><T.span onClick={this.handleRateSubmit} text="Submit"/></Button>
							</Col>
						</FormGroup>
					}
				</Form>
				<hr/>
			</div>
			<Form horizontal id="ticketForm">
				<input type="hidden" name="id" defaultValue={ticket.id}/>
				<FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_number" defaultValue={ticket.cid_number}/></Col>
				</FormGroup>

				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="subject" defaultValue={ticket.subject}/></Col>
				</FormGroup>

				<FormGroup controlId="formCreatedAt">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Created At"/></Col>
					<Col sm={10}><FormControl.Static>{ticket.created_at}</FormControl.Static></Col>
				</FormGroup>

				<FormGroup controlId="formPri">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Ticket Privilege" /></Col>
					<Col sm={10}>{ticket_privacy_component}</Col>
				</FormGroup>

				<FormGroup controlId="formFinishedAt">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Deadline"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} type="date" name="deadline" defaultValue={ticket.deadline}/></Col>
				</FormGroup>

				{FORM}

				<FormGroup controlId="formStatus">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Status"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.status} style={style}/></FormControl.Static></Col>
				</FormGroup>

				{EMERGENRY}

				<FormGroup controlId="formUser">
					<Col componentClass={ControlLabel} sm={2}><T.span text="派单人"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.user_name}/></FormControl.Static></Col>
				</FormGroup>

				{Audio}

				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={8}><EditControl componentClass="textarea" edit={this.state.edit} name="content" defaultValue={ticket.content}/></Col>
				</FormGroup>
			</Form>

			<Form horizontal id="ticketAssignForm">
					{this.state.hidden_user}
					{options}
			</Form>
			<br/>
			<hr />
			<Form horizontal id="ticketProcessingForm">
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}><T.span text="内容"/></Col>
					<Col sm={8}>
						<FormControl componentClass="textarea" name="content" value={this.state.comment} onChange={this.HandleChangeComment.bind(this)} />
					</Col>
				</FormGroup>
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={2}>{commit_btn}</Col>
					<Col sm={2}>{upload_btn}</Col>
				</FormGroup>
			</Form>
			<hr />
			{ticket_comments}
		</div></Dropzone>
	}
}

class TicketsPage extends React.Component {
	constructor(props) {
		super(props);

		function getTime(time){
			var month = (time.getMonth() + 1);
			var day = time.getDate();
			if (month < 10)
				month = "0" + month;
			if (day < 10)
				day = "0" + day;
			return time.getFullYear() + '-' + month + '-' + day;
		}

		let now = new Date();
		let nowdate = Date.parse(now);
		let sevenDaysBeforenowtime = nowdate - 7*24*60*60*1000;
		let sevenDaysBeforenowdate = new Date(sevenDaysBeforenowtime);
		let today = getTime(now);
		let sevenDaysBeforeToday = getTime(sevenDaysBeforenowdate);

		this.state = {
			rows: [],
			danger: false,
			formShow: false,
			t_qs: '',
			last: 7,
			ticket_type: 0,
			curPage: 1,
			rowCount: 0,
			pageCount: 0,
			rowsPerPage: null,
			hiddendiv: 'none',
			loaded: false,
			activeKey: 0,
			types: [],
			init_start_date: sevenDaysBeforeToday,
			init_end_date: today,
			search_settings_show: false,
			search_start_date: sevenDaysBeforeToday,
			search_end_date: today,
			search_serial_number: '',
			search_cid_number: '',
			search_status: 0
		};

		this.handleDelete = this.handleDelete.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleQuery = this.handleQuery.bind(this);
		this.handleMore = this.handleMore.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.handlePageTurn = this.handlePageTurn.bind(this);
		this.handleOnClickSerial = this.handleOnClickSerial.bind(this);
	}

	handleMore(e) {
		e.preventDefault()

		if (this.state.hiddendiv == 'block') {
			this.setState({
				search_settings_show: false,
				search_start_date: this.state.init_start_date,
				search_end_date: this.state.init_end_date,
				search_serial_number: '',
				search_cid_number: '',
				search_status: 0
			})

			window.location = "#/tickets"
		}
		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}

	handleOnClickSerial(e) {
		console.log("history:", this.props.location.query)
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		var _this = this;
		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON("/api/tickets/" + id, {method: "DELETE"}).then(() => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("user", msg);
			notify(msg, 'error');
		});
	}

	componentWillMount() {
	}

	componentWillUnmount () {
	}

	componentDidMount () {
		var _this = this
		let url_params_obj = this.props.location.query
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		_this.setState({ rowsPerPage: rowsPerPage });

		if (url_params_obj.curPage) {

			if (!url_params_obj.rowsPerPage) {
				url_params_obj.rowsPerPage = rowsPerPage
			}

			url_params_obj.curPage = parseInt(url_params_obj.curPage)
			let urlParameters = Object.entries(url_params_obj).map(e => encodeURIComponent(e[0])+"="+encodeURIComponent(e[1])).join('&');

			xFetchJSON("/api/tickets?" + urlParameters).then((tickets) => {
				console.log('data', tickets.data)
				_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});

				{
					for (var key in url_params_obj) {
						var state_key = key

						if (url_params_obj[key]) {
							if (key == "start_date" || key == "end_date" ||
								key == "cid_number" || key == "status" ||
								key == "ticket_type" || key == "serial_number") {

								state_key = "search_" + key
								url_params_obj[state_key] = url_params_obj[key]
								delete url_params_obj[key]
							} else if (key == "rowsPerPage") {
								delete url_params_obj[key]
							}
						} else {
							delete url_params_obj[key]
						}
					}
					_this.setState(url_params_obj)
				}
			});
		} else {
			xFetchJSON("/api/tickets?ticket_type=" + _this.state.ticket_type + "&rowsPerPage=" + rowsPerPage).then((tickets) => {
				console.log('data', tickets.data)
				_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
			});
		}

		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});

	}

	handlePageTurn(pageNum) {
		var _this = this;
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		_this.setState({ rowsPerPage: rowsPerPage });
		console.log('ticket_type:', _this.state.ticket_type);
		xFetchJSON("/api/tickets?last=" + _this.state.last + "&ticket_type=" + _this.state.ticket_type + "&rowsPerPage=" + rowsPerPage + "&pageNum=" + pageNum + _this.state.t_qs).then((tickets) => {
			_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
			let url_params_obj = this.props.location.query
			url_params_obj.curPage = pageNum
			let urlParameters = Object.entries(url_params_obj).map(e => encodeURIComponent(e[0])+"="+encodeURIComponent(e[1])).join('&');

			window.location = "#/tickets?" + urlParameters
		});
	}

	handleRowsChange(e) {
		console.log('rows per page', e.target.value);
		const rowsPerPage = parseInt(e.target.value);

		localStorage.setItem("rowsPerPage", rowsPerPage);
	}

	handleTicketAdded(ticket) {
		var rows = this.state.rows;
		rows.unshift(ticket);
		this.setState({rows: rows, formShow: false});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", e);
		switch (data) {
			case "new":
				this.setState({ formShow: true});
				break;
			case "settings":
				this.setState({ search_settings_show: !this.state.search_settings_show });
				break;
			default:
				break;
		}
	}

	/*handleQuery (e) {
		var data = parseInt(e.target.getAttribute("data"));
		this.days = data;
		var _this = this;
		e.preventDefault();
		var type = _this.state.activeKey;
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		_this.setState({ rowsPerPage: rowsPerPage, last: data, t_qs: '' });
		xFetchJSON("/api/tickets?last=" + data + "&ticket_type=" + _this.state.ticket_type + "&rowsPerPage=" + rowsPerPage).then((tickets) => {
			_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
		});
	}*/

	handleQuery(days) {
		var _this = this;
		var type = _this.state.activeKey;
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		_this.setState({ rowsPerPage: rowsPerPage, last: days, t_qs: ''});
		var url = "/api/tickets?last=" + days + "&ticket_type=" + _this.state.ticket_type + "&rowsPerPage=" + rowsPerPage
		xFetchJSON(url).then((tickets) => {
			_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
		});
	}

	handleSearch(e) {
		var _this = this;
		const qs = "start_date=" + _this.start_date.value +
			"&end_date=" + _this.end_date.value +
			"&cid_number=" + _this.cid_number.value +
			"&status=" + _this.status.value +
			"&ticket_type=" + _this.state.ticket_type +
			"&serial_number=" + _this.serial_number.value;

		_this.setState({
			search_start_date: _this.start_date.value,
			search_end_date: _this.end_date.value,
			search_cid_number: _this.cid_number.value,
			search_status: _this.status.value,
			search_ticket_type: _this.state.ticket_type,
			search_serial_number: _this.serial_number.value
		})

		console.log("qs:", qs);
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		var ts_qs = "&" + qs
		_this.setState({ rowsPerPage: rowsPerPage, t_qs: ts_qs });
		xFetchJSON("/api/tickets?" + qs + "&rowsPerPage=" + rowsPerPage + "&activeKey=" + _this.state.activeKey).then((tickets) => {
			console.log("tickets:",tickets);
			_this.setState({rows: tickets.data, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
		});

		window.location = "#/tickets?" + qs + "&rowsPerPage=" + rowsPerPage + "&hiddendiv=" + _this.state.hiddendiv + "&curPage=" + _this.state.curPage + "&activeKey=" +_this.state.activeKey
	}

	handleSelect(selectedKey) {

		let _this = this;
		console.log("selectedKey:", selectedKey)
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		_this.setState({ rowsPerPage: rowsPerPage, t_qs: '', last: 7});
		xFetchJSON("/api/tickets?last=7&ticket_type=" + selectedKey + "&rowsPerPage=" + rowsPerPage).then((tickets) => {
			_this.setState({rows: tickets.data, ticket_type: selectedKey, activeKey: selectedKey, loaded: true, pageCount: tickets.pageCount, rowCount: tickets.rowCount, curPage: tickets.curPage});
		});
	}

	handleDownload() {
		var uri = "/api/tickets/download";
		var downloadLink = document.createElement("a");
		downloadLink.href = uri;
		downloadLink.download = "tickets_download" + ".csv";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	handleChangeSerialNumber(e) {
		this.setState({
			search_serial_number:e.target.value
		})
	}

	handleChangeCidNumber(e) {
		this.setState({
			search_cid_number:e.target.value
		})
	}

	handleChangeStartDate(e) {
		this.setState({
			search_start_date:e.target.value
		})
	}

	handleChangeEndDate(e) {
		this.setState({
			search_end_date:e.target.value
		})
	}

	handleChangeSelctStatus(e) {
		this.setState({
			search_status:e.target.value
		})
	}

	render () {
		var _this = this;
		let hand = { cursor: "pointer"};
		var danger = this.state.danger ? "danger" : "";
		let formClose = () => this.setState({ formShow: false });
		let toggleDanger = () => this.setState({ danger: !this.state.danger });
		const rowsPerPage = localStorage.getItem('rowsPerPage') || 30;
		var rows = _this.state.rows.map(function(row) {
			var status = '';
			var style = null;
			if(row.status == "TICKET_ST_NEW"){
				style = {color: 'red'};
			}
			if(row.status == 'TICKET_ST_DONE'){
				style = {color: 'green'};
			}
			var color;
			if (row.emergency == "NORMAL") {
				color = 'green';
			} else if (row.emergency == 'EMERGENT'){
				color = '#e98c01';
			} else if (row.emergency == 'URGENT'){
				color = 'red';
			}
			var star_six = {
								width: 0,
								height: 0,
								borderLeft: '6px solid transparent',
								borderRight: '6px solid transparent',
								borderBottom: '12px solid' + " " + color,
								position: 'relative'
							};
			return <tr key={row.id}>
				<td><div style={star_six}></div></td>
				<td>{row.id}</td>
				<td><Link to={`/tickets/${row.id}`} onClick={_this.handleOnClickSerial}>{row.serial_number}</Link></td>
				<td>{row.cid_number}</td>
				<td>{row.subject}</td>
				<td>{row.created_at}</td>
				<td>{row.deadline}</td>
				<td><T.span text={row.status} style={style}/></td>
				<td><T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>
		})

		let isShow;
		if(this.state.loaded){
			isShow = "none";
		}
		const loadSpinner = {
			width: "200px",
			height: "200px",
			margin: "auto", 
			clear: "both",
			display: "block",
			color: 'gray',
			display : isShow
		}

		var pagination = function() {
			var maxButtons = 7;
			if (_this.state.pageCount == 0) return <div/>

			if (maxButtons > _this.state.pageCount) maxButtons = _this.state.pageCount;

			return (
				<nav className="pull-right">
					<Pagination
						prev={T.translate("Prev Page")}
						next={T.translate("Next Page")}
						first={T.translate("First Page")}
						last={T.translate("Last Page")}
						ellipsis={false}
						items={_this.state.pageCount}
						maxButtons={maxButtons}
						activePage={_this.state.curPage}
						onSelect={_this.handlePageTurn} />
				</nav>
			);
		}();

		var url_params = "ticket_type=" + _this.state.ticket_type + "&rowsPerPage=" + rowsPerPage + "&activeKey=" + _this.state.activeKey 

		return <div>
			<ButtonToolbar className="pull-right">
				<br/>
				<Button onClick={this.handleControlClick} className="pull-right" data="settings" title={T.translate("Settings")}>
					<i className="fa fa-gear" aria-hidden="true" data="settings"></i>
				</Button>
				<Button onClick={this.handleDownload} className="pull-right">
					<i className="fa fa-download" aria-hidden="true"></i>&nbsp;
					<T.span text="Export" />
				</Button>&nbsp;
				<Button onClick={this.handleControlClick} data="new" className="pull-right">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New"/>
				</Button>
				<br/><br/>
				<div style={{display: 'inline'}}>
					<T.span text="Last"/> &nbsp;

					{/*
					    <T.a onClick={this.handleQuery} text={{key:"days", day: 7}} data="7" href="#"/>&nbsp;|&nbsp;
						<T.a onClick={this.handleQuery} text={{key:"days", day: 15}} data="15" href="#"/>&nbsp;|&nbsp;
						<T.a onClick={this.handleQuery} text={{key:"days", day: 30}} data="30" href="#"/>&nbsp;|&nbsp;
						<T.a onClick={this.handleQuery} text={{key:"days", day: 60}} data="60" href="#"/>&nbsp;|&nbsp;
						<T.a onClick={this.handleQuery} text={{key:"days", day: 90}} data="90" href="#"/>&nbsp;|&nbsp;
						<T.a onClick={this.handleMore} text="More" data="more" href="#"/>...
					*/}
					<Link to={`/tickets?last=7&${url_params}`} onClick={() => this.handleQuery("7")}>{"7"+T.translate("days")}</Link>&nbsp;|&nbsp;
					<Link to={`/tickets?last=15&${url_params}`} onClick={() => this.handleQuery("15")}>{"15"+T.translate("days")}</Link>&nbsp;|&nbsp;
					<Link to={`/tickets?last=30&${url_params}`} onClick={() => this.handleQuery("30")}>{"30"+T.translate("days")}</Link>&nbsp;|&nbsp;
					<Link to={`/tickets?last=60&${url_params}`} onClick={() => this.handleQuery("60")}>{"60"+T.translate("days")}</Link>&nbsp;|&nbsp;
					<Link to={`/tickets?last=90&${url_params}`} onClick={() => this.handleQuery("90")}>{"90"+T.translate("days")}</Link>&nbsp;|&nbsp;
					<T.a onClick={this.handleMore} text="More" data="more" href="#"/>...
				</div>
				<br/>
				<div className="pull-right">
					<T.span text="Total Rows"/>: {this.state.rowCount} &nbsp;&nbsp;
					<T.span text="Current Page/Total Page"/>: {this.state.curPage}/{this.state.pageCount}
				</div>
			</ButtonToolbar>

			{
				!this.state.search_settings_show ? null :
				<div style={{position: "absolute", top: "120px", right: "10px", width: "180px", border: "2px solid grey", padding: "10px", zIndex: 999, backgroundColor: "#EEE", textAlign: "right"}}>
					<T.span text="Paginate Settings"/>
					<br/>
					<T.span text="Per Page"/>
					&nbsp;<input  onChange={this.handleRowsChange.bind(this)} defaultValue={this.state.rowsPerPage} size={3}/>&nbsp;
					<T.span text="Row"/>
				</div>
			}

			<h1 style={{float: "left"}}><T.span text="Tickets" />&nbsp;&nbsp;&nbsp;&nbsp;</h1>

			<br/>
			<Nav bsStyle="tabs" activeKey={this.state.activeKey} onSelect={this.handleSelect}>
				<NavItem eventKey={0}><Link to={`/tickets?last=${this.state.last}&ticket_type=0&rowsPerPage=${rowsPerPage}&curPage=${this.state.curPage}&activeKey=0`}>{T.translate("ALL")}</Link></NavItem>
				{
					this.state.types.map((type) => {
						return <NavItem key={type.k} eventKey={type.k}><Link to={`/tickets?last=${this.state.last}&ticket_type=${type.k}&rowsPerPage=${rowsPerPage}&curPage=${this.state.curPage}&activeKey=${type.k}`}>{T.translate(type.v)}</Link></NavItem>
					})
				}
			</Nav>

			<div style={{padding: "3px", display: _this.state.hiddendiv}} className="pull-right">
				<input type="date" ref={(input) => { _this.start_date = input; }} value={_this.state.search_start_date} onChange={this.handleChangeStartDate.bind(this)}/> -&nbsp;
				<input type="date" ref={(input) => { _this.end_date = input; }} value={_this.state.search_end_date} onChange={this.handleChangeEndDate.bind(this)}/> &nbsp;
				<T.span text="Serial Number"/><input style={{'text-align':'center'}} ref={(input) => { _this.serial_number = input;}} value={_this.state.search_serial_number} onChange={this.handleChangeSerialNumber.bind(this)}/> &nbsp;
				<T.span text="CID Number"/><input style={{'text-align':'center'}} ref={(input) => { _this.cid_number = input; }} value={_this.state.search_cid_number} onChange={this.handleChangeCidNumber.bind(this)}/> &nbsp;
				<T.span text="Status"/>
				<select ref={(input) => { _this.status = input; }} value={_this.state.search_status} onChange={this.handleChangeSelctStatus.bind(this)}>
					<option value ="">{T.translate("ALL")}</option>
					<option value ="TICKET_ST_NEW">{T.translate("TICKET_ST_NEW")}</option>
					<option value ="TICKET_ST_PROCESSING">{T.translate("TICKET_ST_PROCESSING")}</option>
					<option value="TICKET_ST_DONE">{T.translate("TICKET_ST_DONE")}</option>
				</select>&nbsp;
				<T.button text="Search" onClick={this.handleSearch}/>
			</div>

			<table className="table">
				<tbody>
					<tr>
						<th></th>
						<th><T.span text="ID"/></th>
						<th><T.span text="Serial Number"/></th>
						<th><T.span text="CID Number"/></th>
						<th><T.span text="Subject"/></th>
						<th><T.span text="Created At"/></th>
						<th><T.span text="Deadline"/></th>
						<th><T.span text="Status"/></th>
						<th><T.span style={hand} text="Delete" className={danger} onClick={toggleDanger} title={T.translate("Click me to toggle fast delete mode")}/></th>
					</tr>
					{rows}
					<tr>
						<td colSpan="12">
							{pagination}
						</td>
					</tr>
				</tbody>
			</table>
			<NewTicket show={this.state.formShow} onHide={formClose} handleNewTicketAdded={this.handleTicketAdded.bind(this)}/>
			<div style={{textAlign: "center"}}>
				<img style={loadSpinner} src="/assets/img/loading.gif"/>
			</div>
		</div>
	}
}

export {TicketPage, TicketsPage};
