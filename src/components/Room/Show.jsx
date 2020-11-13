import React from "react";
import { withRouter } from "react-router";
import ModelStore from "../../stores/ModelStore";
import * as MyActions from "../../actions/MyActions";
import $ from 'jquery';
import { dict } from "../../Dict";
import { conf } from "../../conf";
import Janus from "../../lib/kitty/janus.js";
import SideBar from "./SideBar";
import Menu from "./Menu";
import Main from "./Main";
import Header from "./Header";

//import {newRemoteFeed} from "./newRemoteFeed.js"

export default class Layout extends React.Component {
    constructor() {
        super();
        this.getList = this.getList.bind(this);
        this.sessionCreate = this.sessionCreate.bind(this);
        this.registerUsername = this.registerUsername.bind(this);
        this.newRemoteFeed = this.newRemoteFeed.bind(this);
        this.publishCamera = this.publishCamera.bind(this);
        this.publishMicrophone = this.publishMicrophone.bind(this);
        this.off = this.off.bind(this);
        this.on = this.on.bind(this);
        this.pageAfterIn = this.pageAfterIn.bind(this);
        this.streamAttacher = this.streamAttacher.bind(this);
        this.streamDettacher = this.streamDettacher.bind(this);
        this.unmute = this.unmute.bind(this);
        this.getInstance = this.getInstance.bind(this);
        this.sendData = this.sendData.bind(this);
        this.setInstance = this.setInstance.bind(this);
        this.speakRequest = this.speakRequest.bind(this);
        this.publishData = this.publishData.bind(this);
        this.removeRequest = this.removeRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
        this.removeParticipant = this.removeParticipant.bind(this);
        this.unPublishData = this.unPublishData.bind(this);
        this.exisitingParticipant = this.exisitingParticipant.bind(this);
        this.requestAccepted = this.requestAccepted.bind(this);
        this.findParticpantByUuid = this.findParticpantByUuid.bind(this);
        this.participantIndex = this.participantIndex.bind(this);
        this.findParticpantById = this.findParticpantById.bind(this);
        this.findFeedByRfid = this.findFeedByRfid.bind(this);
        this.findFeedById = this.findFeedById.bind(this);
        this.feedToRole = this.feedToRole.bind(this);
        this.attachMedia = this.attachMedia.bind(this);
        this.unPublishCamera = this.unPublishCamera.bind(this);
        this.beforeRemove = this.beforeRemove.bind(this);
        this.toggleCamera = this.toggleCamera.bind(this);
        this.toggleMicrophone = this.toggleMicrophone.bind(this);
        this.submitParticipation = this.submitParticipation.bind(this);
        this.publishDesktop = this.publishDesktop.bind(this);
        this.presentMessage = this.presentMessage.bind(this);
        this.unPublishDesktop = this.unPublishDesktop.bind(this);
        this.cameraPublisher = this.cameraPublisher.bind(this);
        this.toggleDesktop = this.toggleDesktop.bind(this)
        this.changeParticipantRole = this.changeParticipantRole.bind(this)

        
        this.state = {
            token: window.localStorage.getItem("token"),
            shortners: null,
            server: conf.janusServer,
            janus: null,
            sfutest: null,
            opaqueId: "videoroomtest-" + Janus.randomString(12),
            roomId: null,
            myusername: null,
            myid: null,
            mystream: null,
            mypvtid: "videoroomtest-" + Janus.randomString(12),
            pin: null,
            feeds: [],
            activeFeeds: [],
            bitrateTimer: [],
            userUUID: null,
            fullname: null,
            isOwner: false,
            urls: [],
            publishedCamera: false,
            publishedMicrophone: false,
            publishedDesktop: false,
            muted: true,
            requests: [],
            lowFeeds: [],
            participants: [],
            room: null,
            notification: {}
        };
    }
    componentWillMount() {
        ModelStore.on("got_instance", this.getInstance);
        ModelStore.on("set_instance", this.setInstance);
    }

    componentWillUnmount() {
        ModelStore.removeListener("got_instance", this.getInstance);
        ModelStore.removeListener("set_instance", this.setInstance);
        window.removeEventListener("beforeunload", this.unPublishData);
    }



    updateSubscribers() {
        var data = { room_id: this.state.roomId }
        MyActions.setInstance('subscribers', data, this.state.token);
    }

    renewSubscribers() {
        MyActions.getInstance('subscribers', this.state.roomId, this.state.token);
    }

    sessionCreate() {
        var self = this;
        Janus.init({
            debug: "none",
            callback: function () {
                var janus = new Janus({
                    server: self.state.server,
                    success: function () {
                        janus.attach({
                            plugin: "janus.plugin.videoroom",
                            opaqueId: self.state.opaqueId,
                            success: function (pluginHandle) {
                                self.setState({ janus: janus });
                                self.setState({ sfutest: pluginHandle });
                                Janus.log(
                                    "Plugin attached! (" +
                                    self.state.sfutest.getPlugin() +
                                    ", id=" +
                                    self.state.sfutest.getId() +
                                    ")"
                                );
                                Janus.log("  -- This is a publisher/manager");
                                self.registerUsername();
                                //self.publishData();
                            },
                            error: function (error) {
                                Janus.error("  -- Error attaching plugin...", error);
                                window.alert("Error attaching plugin... " + error);
                            },
                            consentDialog: function (on) {
                                Janus.debug(
                                    "Consent dialog should be " + (on ? "on" : "off") + " now"
                                );
                            },
                            iceState: function (state) {
                                Janus.log("ICE state changed to " + state);
                            },
                            mediaState: function (medium, on) {
                                Janus.log(
                                    "Janus " +
                                    (on ? "started" : "stopped") +
                                    " receiving our " +
                                    medium
                                );
                            },
                            webrtcState: function (on) {
                                Janus.log(
                                    "Janus says our WebRTC PeerConnection is " +
                                    (on ? "up" : "down") +
                                    " now"
                                );
                            },
                            onmessage: function (msg, jsep) {
                                Janus.log(" ::: Got a message (publisher) :::", msg);
                                var event = msg["videoroom"];
                                Janus.debug("Event: " + event);
                                if (event) {
                                    if (event === "joined") {
                                        console.log("joined");
                                        self.setState({
                                            myid: msg["id"],
                                            mypvtid: msg["private_id"],
                                        });
                                        //self.publishData();
                                        // console.log('message ??????', msg)
                                        self.addParticipant(msg["id"], self.state.fullname + '§' + self.state.userUUID);

                                        if (msg["publishers"]) {
                                            var list = msg["publishers"];
                                            console.log(
                                                "Got a list of available publishers/feeds:",
                                                list
                                            );
                                            for (var f in list) {
                                                var id = list[f]["id"];
                                                var display = list[f]["display"];
                                                var audio = list[f]["audio_codec"];
                                                var video = list[f]["video_codec"];
                                                Janus.debug(
                                                    "  >> [" +
                                                    id +
                                                    "] " +
                                                    display +
                                                    " (audio: " +
                                                    audio +
                                                    ", video: " +
                                                    video +
                                                    ")"
                                                );
                                                self.addParticipant(list[f]["id"], list[f]["display"]);
                                                self.newRemoteFeed(id, display, audio, video);

                                            }
                                        }
                                    } else if (event === "destroyed") {
                                        // The room has been destroyed
                                        Janus.warn("The room has been destroyed!");
                                    } else if (event === "event") {
                                        // Any new feed to attach to?
                                        if (msg["publishers"]) {
                                            var list = msg["publishers"];
                                            Janus.log(
                                                "Got a list of available publishers/feeds:",
                                                list
                                            );
                                            for (var f in list) {
                                                var id = list[f]["id"];
                                                var display = list[f]["display"];
                                                var audio = list[f]["audio_codec"];
                                                var video = list[f]["video_codec"];
                                                Janus.log(
                                                    "  >> [" +
                                                    id +
                                                    "] " +
                                                    display +
                                                    " (audio: " +
                                                    audio +
                                                    ", video: " +
                                                    video +
                                                    ")"
                                                );
                                                // if(audio || video) {
                                                self.addParticipant(list[f]["id"], list[f]["display"]);
                                                self.newRemoteFeed(id, display, audio, video);
                                                // }

                                            }
                                        } else if (msg["leaving"]) {
                                            var leaving = msg["leaving"];
                                            console.log("Publisher leaving: " + leaving);
                                            self.setState(
                                                {
                                                    feeds: self.state.feeds.filter(
                                                        (item) => item.rfid != leaving
                                                    ),
                                                },
                                                () => console.log("feeds: >>>>", self.state.feeds)
                                            );
                                            var unPublishedFeed = self.state.feeds.filter(
                                                (item) => item.rfid === leaving
                                            );
                                            var remoteFeed = unPublishedFeed.shift();
                                            if (remoteFeed != null) {
                                                remoteFeed.detach();
                                            }
                                            self.removeParticipant(leaving)
                                        } else if (msg["unpublished"]) {
                                            var unpublished = msg["unpublished"];
                                            console.log("Publisher left: " + unpublished);
                                            if (unpublished === "ok") {
                                                self.state.sfutest.hangup();
                                                self.streamDettacher(self.state.sfutest);
                                                return;
                                            }
                                            self.setState(
                                                {
                                                    feeds: self.state.feeds.filter(
                                                        (item) => item.rfid != unpublished
                                                    ),
                                                }
                                            );
                                            var unPublishedFeed = self.state.feeds.filter(
                                                (item) => item.rfid === unpublished
                                            );

                                            self.setState(
                                                {
                                                    lowFeeds: self.state.lowFeeds.filter(
                                                        (item) => item.rfid != unpublished
                                                    ),
                                                }
                                            );

                                            var remoteFeed = unPublishedFeed.shift();
                                            if (remoteFeed != null) {
                                                remoteFeed.detach();
                                                self.streamDettacher(remoteFeed);
                                            }
                                            self.removeParticipant(unpublished)

                                        } else if (msg["error"]) {
                                        }
                                        else if (msg["configured"]) {
                                        }
                                        else if (msg["joining"]) {
                                            console.log('Somebodu joining')
                                            self.addParticipant(msg["joining"].id, msg["joining"].display);
                                        }
                                    }
                                }
                                if (jsep) {
                                    Janus.log("Handling SDP as well...", jsep);
                                    self.state.sfutest.handleRemoteJsep({ jsep: jsep });
                                    //self.streamDettacher(self.state.sfutest)
                                }
                            },
                            onlocalstream: function (stream) {
                                console.log(" ::: Got a local stream :::", stream);
                                console.log(self.state.sfutest.id);
                                var exisiting = self.state.feeds.filter(
                                    (item) => item.id === self.state.sfutest.id
                                );
                                if (exisiting.length === 0) {
                                    self.state.sfutest.rfid = self.state.myid

                                    self.setState({
                                        feeds: self.state.feeds.concat(self.state.sfutest),
                                    });
                                    if (self.state.isOwner) {
                                        self.requestAccepted(self.state.userUUID)
                                    }

                                }


                                var videoTracks = stream.getVideoTracks();

                                if (!videoTracks || videoTracks.length === 0) {
                                    //  self.$$("#video-" + self.state.sfutest.id).hide();
                                    self.streamDettacher(self.state.sfutest);
                                } else {
                                    console.log(self.state.participants)
                                    //   self.$$("#video-" + self.state.sfutest.id).show();
                                    self.streamAttacher(self.state.sfutest)
                                    //Janus.attachMediaStream(
                                    //  document.getElementById("video-" + self.state.sfutest.id),
                                    //  stream
                                    //);
                                    //document.getElementById("video-" + self.state.sfutest.id).muted = true;
                                }
                            },
                            onremotestream: function (stream) {
                                Janus.log(" ::: Got a remote stream :::", stream);
                                // The publisher stream is sendonly, we don't expect anything here
                            },
                            ondata: function (data) {
                                Janus.debug("We got data from the DataChannel!", data);
                                //$('#datarecv').val(data);
                            },
                            oncleanup: function () {

                                Janus.log(
                                    " ::: Got a cleanup notification: we are unpublished now :::"
                                );
                            },
                        });
                    },
                    error: function (error) {
                        Janus.error(error);
                        window.alert(error, function () {
                            window.location.reload();
                        });
                    },
                    destroyed: function () {
                        window.location.reload();
                    },
                });
            },
        });
    }
    registerUsername() {
        var self = this;
        var register = {
            request: "join",
            room: self.state.roomId,
            ptype: "publisher",
            display: self.state.fullname + " §" + self.state.userUUID,
            pin: self.state.pin
        };
        self.state.sfutest.send({ message: register });
        setTimeout(function () {
            this.publishData();
        }.bind(this), 3000)
    }

    findFeedByRfid(rfid) {
        var feeds = this.state.feeds.filter(
            (item) => item.rfid === rfid
        );
        if (feeds && feeds[0]) {
            return feeds[0]
        }
    }

    findFeedById(id) {
        var feeds = this.state.feeds.filter(
            (item) => item.id === id
        );
        if (feeds && feeds[0]) {
            return feeds[0]
        }
    }

    feedIdToRfid(id) {
        var feeds = this.state.feeds.filter(
            (item) => item.id === id
        );
        if (feeds && feeds[0]) {
            return feeds[0].rfid
        }
    }

    addParticipant(id, p) {
        console.log('Adding Participants ...', id, p)
        var self = this;
        var participant = p.split('§')
        if (this.exisitingParticipant(participant[1])) {
            self.setState({ participants: self.state.participants.concat({ id: id, display: participant[0], uuid: participant[1], role: 'listener' }) });
        }
        console.log('participant added:', participant[1])
    }

    exisitingParticipant(participantId) {
        var self = this;
        var exisiting = self.state.participants.filter(
            (item) => item.uuid === participantId
        );
        if (exisiting.length === 0) {
            return true
        } else {
            return false
        }
    }

    findParticpantById(id) {
        var participants = this.state.participants.filter(item => item.id === id);
        if (participants && participants[0]) {
            return participants[0]
        }
    }

    findParticpantByUuid(id) {
        var participants = this.state.participants.filter(item => item.uuid === id);
        if (participants && participants[0]) {
            return participants[0]
        }
    }

    removeParticipant(id) {
        var self = this;
        self.setState({
            participants: self.state.participants.filter(
                (item) => item.id !== id
            )
        })

    }

    newRemoteFeed(id, feeds, display, audio, video) {
        var self = this;
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        var remoteFeed = null;
        self.state.janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: this.state.opaqueId,
            success: function (pluginHandle) {
                remoteFeed = pluginHandle;
                remoteFeed.simulcastStarted = false;
                Janus.log(
                    "Plugin attached! (" +
                    remoteFeed.getPlugin() +
                    ", id=" +
                    remoteFeed.getId() +
                    ")"
                );
                Janus.log("  -- This is a subscriber");
                // We wait for the plugin to send us an offer
                var subscribe = {
                    request: "join",
                    room: self.state.roomId,
                    ptype: "subscriber",
                    pin: self.state.pin,
                    feed: id,
                    private_id: self.state.mypvtid,
                };
                // In case you don't want to receive audio, video or data, even if the
                // publisher is sending them, set the 'offer_audio', 'offer_video' or
                // 'offer_data' properties to false (they're true by default), e.g.:
                // 		subscribe["offer_video"] = false;
                // For example, if the publisher is VP8 and this is Safari, let's avoid video
                if (
                    Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                    (video === "vp9" || (video === "vp8" && !Janus.safariVp8))
                ) {
                    if (video) video = video.toUpperCase();
                    console.log(
                        "Publisher is using " +
                        video +
                        ", but Safari doesn't support it: disabling video"
                    );
                    subscribe["offer_video"] = false;
                }
                remoteFeed.videoCodec = video;
                remoteFeed.send({ message: subscribe });
            },
            error: function (error) {
                Janus.error("  -- Error attaching plugin...", error);
                window.alert("Error attaching plugin... " + error);
            },
            onmessage: function (msg, jsep) {
                Janus.debug(" ::: Got a message (subscriber) :::", msg);
                var event = msg["videoroom"];
                Janus.log("Event: " + event);
                if (msg["error"]) {
                    window.alert(msg["error"]);
                } else if (event) {
                    if (event === "attached") {
                        remoteFeed.rfid = msg["id"];
                        remoteFeed.rfdisplay = msg["display"];
                        self.setState({ feeds: self.state.feeds.concat(remoteFeed) });
                        self.setState({ lowFeeds: self.state.lowFeeds.concat(remoteFeed) });
                        if (!video) {
                            self.streamDettacher(remoteFeed);
                        }

                        Janus.log(
                            "Successfully attached to feed " +
                            remoteFeed.rfid +
                            " (" +
                            remoteFeed.rfdisplay +
                            ") in room " +
                            msg["room"]
                        );
                    } else if (event === "event") {
                    } else {
                        // What has just happened?
                    }
                }
                if (jsep) {
                    Janus.log("Handling SDP as well...", jsep);
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
                        media: { audioSend: false, videoSend: false, data: true }, // We want recvonly audio/video
                        success: function (jsep) {
                            Janus.log("Got SDP!", jsep);
                            var body = { request: "start", room: self.state.roomId };
                            remoteFeed.send({ message: body, jsep: jsep });
                        },
                        error: function (error) {
                            Janus.log("WebRTC error:", error);
                            window.alert("WebRTC error... " + error.message);
                        },
                    });
                }
            },
            iceState: function (state) {
                Janus.log(
                    "ICE state of this WebRTC PeerConnection (feed #" +
                    remoteFeed.rfindex +
                    ") changed to " +
                    state
                );

            },
            webrtcState: function (on) {
                Janus.log(
                    "Janus says this WebRTC PeerConnection (feed #" +
                    remoteFeed.rfindex +
                    ") is " +
                    (on ? "up" : "down") +
                    " now"
                );
                if (on === "down") {
                    self.removeParticipant(remoteFeed.rfid)
                }
            },
            onlocalstream: function (stream) {
                console.log('>>>>>>>>>>>', stream)
            },
            onremotestream: function (stream) {
                self.streamAttacher(remoteFeed);
                /*
                //  console.log('§§§§§§§§§§§§§§§§§§', stream)
                var videoTracks = stream.getVideoTracks();
                var videoQuality = "video"
                // if (self.feedToRole(remoteFeed.id) && self.feedToRole(remoteFeed.id) === 'listener'){
                //  videoQuality = "lowVideo"
                //}

                console.log('>>>>>>>>>>>>>', self.feedToRole(remoteFeed.id), remoteFeed.id)
                if (!videoTracks || videoTracks.length === 0) {
                    //  self.$$("#video-" + remoteFeed.id).hide();
                    self.streamDettacher(remoteFeed.id);
                    // self.$$("#lowVideo-" + remoteFeed.id).hide();
                } else {
                    //self.$$(videoQuality + remoteFeed.id).show()
                    // self.$$('#' + videoQuality + '-' + remoteFeed.id).show()
                    //self.attachMedia(videoQuality, remoteFeed.id, stream)
                    //console.log(remoteFeed.webrtcStuff.remoteStream)
                    //console.log(stream)
                    Janus.attachMediaStream(
                        document.getElementById(videoQuality + '-' + remoteFeed.id),
                        stream
                    );
                }
                var audioTracks = stream.getAudioTracks();
                if (!audioTracks || audioTracks.length === 0) {
                    // self.$$("#video-" + remoteFeed.id).hide();
                } else {
                    //self.$$("#video-" + remoteFeed.id).hide();
                    Janus.attachMediaStream(
                        document.getElementById("video-" + remoteFeed.id),
                        stream
                    );
                }*/

            },
            ondata: function (data) {
                //Janus.debug("We got data from the DataChannel!", data);
                console.log(data)
                var message = JSON.parse(data)
                var exisiting = self.state.requests.filter(
                    (item) => item.uuid === message['uuid']
                );


                if (exisiting.length === 0 && message['request'] === 'up') {
                    self.setState({ requests: self.state.requests.concat({ display: message['display'], uuid: message['uuid'] }) });
                }

                if (message['request'] === 'present') {
                    console.log(message)
                    self.requestAccepted(message['uuid'], 'presenter')
                }

                if (message['request'] === 'removeRequest') {
                    self.setState({
                        requests: self.state.requests.filter(item => item.uuid != message['uuid'])
                    });
                }

                if (message['request'] === 'acceptRequest') {
                    self.setState({
                        requests: self.state.requests.filter(item => item.uuid != message['uuid'])
                    });
                    self.requestAccepted(message['uuid'])
                    if (message['uuid'] === self.state.userUUID) {
                        console.log('§§§§§§§', self.state.publishedCamera)
                        if (self.state.publishedCamera) {
                            self.unPublishCamera();
                            self.publishCamera(32);
                        } else {
                            self.publishMicrophone()
                        }

                    }
                }

            },
            oncleanup: function () {
                Janus.log(
                    " ::: Got a cleanup notification (remote feed " + id + ") :::"
                );
            },
        });
    }

    feedToRole(feedId) {
        var feed = this.findFeedById(feedId)
        if (feed && feed.rfid)
            var participant = this.findParticpantById(feed.rfid)
        if (participant) {
            return participant.role
        }
    }

    attachMedia(videoQuality, feedId, stream) {
        Janus.attachMediaStream(
            document.getElementById(videoQuality + '-' + feedId),
            stream
        );
    }


    requestAccepted(requesterUUId, role = 'speaker') {
        this.changeParticipantRole(requesterUUId, role)
    }   

    changeParticipantRole(participantUUID, role){
        let newState = Object.assign({}, this.state);
        var participant = this.findParticpantByUuid(participantUUID)
        var index = this.participantIndex(participantUUID)
        newState.participants[index] = { id: participant.id, display: participant.display, uuid: participant.uuid, role: role }
        this.setState(newState, () => {
            var feed = this.findFeedByRfid(participant.id)
            if (feed) {
                this.streamAttacher(feed)
            }
        });
    }



    participantIndex(id) {
        var index = this.state.participants.findIndex(item => item.uuid === id);
        console.log(index)
        if (Number.isInteger(index)) {
            return index
        }
    }

    participantIsSpeaker(requesterId) {
        var participant = this.findParticpantByUuid(requesterId)
        if (participant && participant.role === 'speaker') {
            return true
        } else {
            return false
        }
    }

    streamAttacher(feed) {
        console.log('Attaching ' + feed.id)
        $("#video-h-" + feed.id).show();
        $("#video-" + feed.id).show();
        $("#video-p-" + feed.id).show();
        var videoQuality = ''
        console.log('The role is ' + this.feedToRole(feed.id))

        switch (this.feedToRole(feed.id)) {
            case 'speaker':
                videoQuality = "video-h-"
                break;
            case 'presenter':
                videoQuality = "video-p-"
                break;
            default:
                videoQuality = "video-"
        }
        if (feed.id && feed.webrtcStuff && feed.webrtcStuff.remoteStream) {
            Janus.attachMediaStream(
                document.getElementById(videoQuality + feed.id),
                feed.webrtcStuff.remoteStream
            );
        }
        if (feed.id && feed.webrtcStuff && feed.webrtcStuff.myStream) {
            Janus.attachMediaStream(
                document.getElementById(videoQuality + feed.id),
                feed.webrtcStuff.myStream
            );
        }
        this.unmute();
    }


    streamDettacher(feed) {
        if (feed.id) {
            console.log('Dettaching ' + feed.id)
            $("#video-h-" + feed.id).hide();
            $("#video-p-" + feed.id).hide();
            $("#video-" + feed.id).hide();
        }
    }

    sendData() {
        var message = {
            textroom: "message",
            transaction: Janus.randomString(12),
            room: this.state.roomId,
            text: 'UUUUU',
        };
        this.state.sfutest.data({
            text: JSON.stringify(message),
            error: function (reason) { console.log(reason); },
            success: function () { console.log('sent'); },
        });
    }

    speakRequest() {
        var self = this;
        var message = {
            textroom: "message",
            transaction: Janus.randomString(12),
            room: this.state.roomId,
            request: 'up',
            uuid: this.state.userUUID,
            display: this.state.fullname
        };
        this.state.sfutest.data({
            text: JSON.stringify(message),
            error: function (reason) { console.log(reason); },
            success: function () {
                console.log('request sent')
                var exisiting = self.state.requests.filter(
                    (item) => item.uuid === message['uuid']
                );
                if (exisiting.length === 0 && message['request'] === 'up') {
                    self.setState({ requests: self.state.requests.concat({ display: message['display'], uuid: message['uuid'] }) });
                }
            },
        });
    }

    presentMessage() {
        var self = this;
        var message = {
            textroom: "message",
            transaction: Janus.randomString(12),
            room: this.state.roomId,
            request: 'present',
            uuid: this.state.userUUID,
            display: this.state.fullname
        };
        this.state.sfutest.data({
            text: JSON.stringify(message),
            error: function (reason) { console.log(reason); },
            success: function () {
                console.log('present request sent')
            },
        });
    }

    publishData() {
        var self = this;
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: true,
                videoSend: false,
                audioSend: false,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                if (jsep) {
                    var publish = {
                        request: "publish",
                        audio: true,
                        video: true,
                        data: true,
                    };
                    self.state.sfutest.send({ message: publish, jsep: jsep });
                }
                console.log('Data published ...')

            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }

    unPublishData() {
        var self = this;
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: false,
                videoSend: false,
                //removeVideo: false,
                audioSend: false,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                if (jsep) {
                    var unPublish = {
                        request: "unpublish",
                        audio: false,
                        video: false,
                        data: false,
                    };
                    self.state.sfutest.send({ message: unPublish, jsep: jsep });
                }
            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }



    publishCamera(bitrate = 16) {
        var self = this;
        console.log('publishedDesktop? ', self.state.publishedDesktop)
        if (self.state.publishedDesktop) {
            self.setState({ notification: { type: 'cameraSwitch', from: 'screen sharing', to: 'camera' } });
        } else {
            var self = this;
            self.state.sfutest.createOffer({
                media: {
                    audioRecv: false,
                    videoRecv: false,
                    data: true,
                    videoSend: true,
                    audioSend: self.state.publishedMicrophone,
                },

                success: function (jsep) {
                    Janus.debug("********* Got publisher SDP!", jsep);
                    console.log('switching to ' + bitrate)
                    if (jsep) {
                        var publish = {
                            request: 'configure',
                            audio: self.state.publishedMicrophone,
                            video: true,
                            data: true,
                            bitrate: bitrate * 8000,
                            bitrate_cap: true,
                            videocodec: 'vp8',
                        };
                        self.state.sfutest.send({ message: publish, jsep: jsep });
                    }
                    self.setState({ publishedCamera: true });
                    var tracks = self.state.sfutest.webrtcStuff.myStream.getTracks()
                    console.log(tracks)
                },
                error: function (error) {
                    Janus.error("***** WebRTC error:", error);
                },
            });
        }
    }



    cameraPublisher(bitrate = 16) {

    }


    publishDesktop(bitrate = 128) {
        var self = this;
        if (self.state.publishedCamera) {
            self.setState({ notification: { type: 'cameraSwitch', to: 'screen sharing', from: 'camera' } });
        } else {
            self.state.sfutest.createOffer({
                media: {
                    audioRecv: false,
                    videoRecv: false,
                    data: true,
                    videoSend: true,
                    video: "screen",
                    screenshareFrameRate: 6,
                    audioSend: self.state.publishedMicrophone,
                },

                success: function (jsep) {
                    Janus.debug("********* Got publisher SDP!", jsep);
                    console.log('switching to ' + bitrate)
                    if (jsep) {
                        var publish = {
                            request: 'configure',
                            audio: self.state.publishedMicrophone,
                            video: true,
                            data: true,
                            bitrate: 500000,
                            publishers: 1,
                            videocodec: 'vp8',
                        };
                        self.state.sfutest.send({ message: publish, jsep: jsep });
                    }
                    self.setState({ publishedDesktop: true });
                    self.changeParticipantRole(self.state.userUUID, 'presenter')
                    self.presentMessage();
                },
                error: function (error) {
                    Janus.error("***** WebRTC error:", error);
                },
            });
        }
    }




    toggleCamera() {
        if (this.state.publishedCamera) {
            this.unPublishCamera()
        } else {
            if (this.participantIsSpeaker(this.state.userUUID)) {
                this.publishCamera(32)
            } else {
                this.publishCamera(16)
            }

        }
    }


    toggleDesktop() {
        if (this.state.publishedDesktop) {
            this.unPublishDesktop()
        } else {
            this.publishDesktop()
        }
    }

    unPublishCamera() {
        console.log('unPublishing ..')
        this.setState({ notification: {} });
        var self = this;
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: true,
                videoSend: false,
                audioSend: self.state.publishedMicrophone,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                //console.log('switching to ' + bitrate)
                if (jsep) {
                    var publish = {
                        request: "unpublish",
                        audio: self.state.publishedMicrophone,
                        video: false,
                        data: true,
                    };
                    self.state.sfutest.send({ message: publish, jsep: jsep });
                }
                self.setState({ publishedCamera: false });
                self.setState({ publishedData: false });
                self.streamDettacher(self.state.sfutest);
                var tracks = self.state.sfutest.webrtcStuff.myStream.getTracks()
                tracks.forEach(function (track) {
                    if (track.kind === "video") {
                        track.stop();
                    }
                });
                setTimeout(function () {
                    self.publishData();
                }.bind(this), 2000)
                if (self.state.publishedMicrophone) {
                    self.publishMicrophone()
                }
            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }



    async unPublishDesktop() {
        console.log('unPublishing Desktop ...')
        this.setState({ notification: {} });
        var self = this;
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: true,
                videoSend: false,
                audioSend: self.state.publishedMicrophone,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                //console.log('switching to ' + bitrate)
                if (jsep) {
                    var publish = {
                        request: "unpublish",
                        audio: self.state.publishedMicrophone,
                        video: false,
                        data: true,
                    };
                    self.state.sfutest.send({ message: publish, jsep: jsep });
                }
                self.setState({ publishedDesktop: false });
                self.setState({ publishedData: false });
                setTimeout(function () {
                    self.publishData();
                }.bind(this), 2000)

                if (self.state.publishedMicrophone) {
                    self.publishMicrophone()
                }

            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }


    toggleMicrophone() {
        console.log('Microphone state', this.state.publishedMicrophone)
        if (this.state.publishedMicrophone) {
            this.unPublishMicrophone()
        } else {
            this.publishMicrophone()
        }
    }

    publishMicrophone() {
        var self = this;
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: true,
                audioSend: true,
                removeAudio: false,
                videoSend: self.state.publishedCamera,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                if (jsep) {
                    var publish = { request: "configure", data: true, audio: true, video: self.state.publishedCamera };
                    self.state.sfutest.send({ message: publish, jsep: jsep });

                }
                self.setState({ publishedMicrophone: true });
            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }

    unPublishMicrophone() {
        console.log('Unpublishing audio ...')
        var self = this;
        var video = false;
        if (self.state.publishedCamera || self.state.publishedDesktop) {
            video = true
        }
        self.state.sfutest.createOffer({
            media: {
                audioRecv: false,
                videoRecv: false,
                data: true,
                audioSend: false,
                removeAudio: true,
                videoSend: video,
            },

            success: function (jsep) {
                Janus.debug("********* Got publisher SDP!", jsep);
                if (jsep) {
                    var publish = { request: "configure", data: true, audio: false, video: video };
                    self.state.sfutest.send({ message: publish, jsep: jsep });

                }
                self.setState({ publishedMicrophone: false });
                var tracks = self.state.sfutest.webrtcStuff.myStream.getTracks()
                tracks.forEach(function (track) {
                    if (track.kind === "audio") {
                        //  track.stop();
                    }
                });
            },
            error: function (error) {
                Janus.error("***** WebRTC error:", error);
            },
        });
    }

    off() {
        console.log(this.state.feeds);
        var body = {
            request: "switch",
            feed: this.state.feeds[1].rfid,
            video: false,
        };
        this.state.feeds[1].send({ message: body });
    }

    on() {
        console.log(this.state.feeds);
        var body = {
            request: "switch",
            feed: this.state.feeds[1].rfid,
            video: true,
        };
        this.state.feeds[1].send({ message: body });
    }

    componentDidMount() {
        MyActions.getInstance('rooms', this.props.match.params.id, this.state.token);
        window.addEventListener("beforeunload", this.unPublishData);

    }

    submitParticipation(activity) {
        var data = { room_id: this.state.id, activity: activity }
        MyActions.setInstance('participations', data, this.state.token);
    }

    getInstance() {
        var room = ModelStore.getIntance()
        var klass = ModelStore.getKlass()
        if (room && klass === 'Room') {
            this.setState({
                room: room,
                id: room.id,
                roomId: room.room_id,
                pin: room.pin,
                //userUUID: room.user_uuid,
                fullname: room.user_fullname,
                title: room.title,
                isOwner: room.is_owner
            }, () => this.submitParticipation('joined'));
        }
        console.log(room)
    }

    pageAfterIn() {
        var self = this;
        self.sessionCreate();
        //  setTimeout(function () {
        // new Promise(() => self.sessionCreate())
        // .then(
        //    self.submitParticipation('joined')
        //)
        //     .then(
        //         self.unmute()
        //     );

        // }.bind(this), 12000)

    }

    setInstance() {
        var participation = ModelStore.getIntance()
        var klass = ModelStore.getKlass()
        if (participation && klass === 'Participation') {
            this.setState({
                userUUID: participation.uuid,
            }, () => this.pageAfterIn());
        }
        console.log(participation)
    }

    loadData() {
        const f7: Framework7 = Framework7.instance;
        f7.toast.show({
            text: dict.receiving,
            closeTimeout: 2000,
            position: "top",
        });
        MyActions.getList("shortners", this.state.page, {}, this.state.token);
    }

    localQualityChange() {

    }

    getList() {
        var shortners = ModelStore.getList();
        var klass = ModelStore.getKlass();
        if (shortners && klass === "Shortner") {
            this.setState({
                shortners: shortners,
            });
        }
    }

    unmute() {
        this.setState({ muted: false });
    }

    acceptRequest(uuid) {
        var self = this;
        var message = {
            textroom: "message",
            transaction: Janus.randomString(12),
            room: this.state.roomId,
            request: 'acceptRequest',
            uuid: uuid,
        };
        this.state.sfutest.data({
            text: JSON.stringify(message),
            error: function (reason) { console.log(reason); },
            success: function () {
                self.setState({
                    requests: self.state.requests.filter(item => item.uuid != uuid)
                });
                self.requestAccepted(uuid);
            },
        });
    }


    removeRequest(uuid) {
        var self = this;
        var message = {
            textroom: "message",
            transaction: Janus.randomString(12),
            room: this.state.roomId,
            request: 'removeRequest',
            uuid: uuid
        };
        this.state.sfutest.data({
            text: JSON.stringify(message),
            error: function (reason) { console.log(reason); },
            success: function () {
                self.setState({
                    requests: self.state.requests.filter(item => item.uuid != uuid)
                });
            },
        });
    }

    beforeRemove() {
        console.log('removing ...')
        this.unPublishCamera();
    }

    render() {
        const {
            token,
            shortners,
            urls,
            publishedMicrophone,
            publishedCamera,
            publishedDesktop,
            feeds,
            muted,
            lowFeeds,
            requests,
            participants,
            room,
            notification
        } = this.state;
        return (
            <React.Fragment>

                <Header token={token} />
                <div class="columns ">

                    <Menu 
                        room={this.state.room} 
                        participants={participants}    
                    />
                    <Main
                        beforeRemove={this.beforeRemove}
                        pageAfterIn={this.pageAfterIn}
                        shortners={shortners}
                        streamAttacher={this.streamAttacher}
                        findParticpantById={this.findParticpantById}
                        participantIsSpeaker={this.participantIsSpeaker}
                        feedToRole={this.feedToRole}
                        urls={urls}
                        off={this.off}
                        on={this.on}
                        feeds={feeds}
                        muted={muted}
                        lowFeeds={lowFeeds}
                        requests={requests}
                        room={room}
                        participants={participants}
                        unmute={this.unmute}
                        publishedCamera={publishedCamera}
                        toggleCamera={this.toggleCamera}
                        toggleMicrophone={this.toggleMicrophone}
                        publishedMicrophone={publishedMicrophone}
                        publishCamera={this.publishCamera}
                        publishMicrophone={this.publishMicrophone}
                        sendData={this.sendData}
                        speakRequest={this.speakRequest}
                        accept={this.accept}
                        removeRequest={this.removeRequest}
                        acceptRequest={this.acceptRequest}
                        toggleDesktop={this.toggleDesktop}
                        publishedDesktop={publishedDesktop}
                        notification={notification}

                    />
                </div>
            </React.Fragment>
        );
    }
}
