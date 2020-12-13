import React from "react";
import VideoPlayer from "./Video";

const Main = (props) => {

  function videos(spec, id) {
    var width = '140'
    var height = '120'
    if (spec === 'high') {
      width = '240'
      height = ''
    }
    if (spec === 'present') {
      width = '640'
      height = ''
    }
    return (
      <div class="column is-horizontal-center has-text-centered">
        <video
          controls={true}
          key={id}
          id={"video-" + id}
          src=""
          width={width}
          height={height}
          autoPlay
          playsInline
          muted={props.muted}
          poster="https://picsum.photos/300/200"
        />
      </div>
    )
  }

  function highVidoes() {
    var result = [];
    if (props.feeds) {
      {
        props.feeds.map((feed) => {
          if (props.feedToRole(feed.id) === 'speaker') {
            console.log(feed.id, 'is a speaker')
            result.push(videos('high', 'h-' + feed.id));
          }
        });
      }
    }
    return result;
  }

  function presentVideo() {
    var result = [];
    if (props.feeds) {
      {
        props.feeds.map((feed) => {
          if (props.feedToRole(feed.id) === 'presenter') {
            console.log(feed.id, 'is a presenter')
            result.push(videos('present', 'p-' + feed.id));
          }
        });
      }
    }
    return result;
  }

  function lowVideos() {
    var result = [];
    if (props.feeds) {
      {
        props.feeds.map((feed) => {

          if (props.feedToRole(feed.id) === 'listener') {
            console.log(feed.id, 'is a listener')
            result.push(videos('low', feed.id));
            //props.streamAttacher(feed)
          }
          // var participant = () =>props.findParticpantById(feed.rfid)
          //console.log(props.findParticpantById(feed.rfid))
          // if (participant && !props.participantIsSpeaker(participant.uuid)) {
          //  result.push(videos('low', feed.id));
          //  props.streamAttacher(feed)
          // }

        });
      }
    }
    return result;
  }


  function participants() {
    var result = [];
    if (props.participants) {
      props.participants.map((participant) => {
        result.push(
          <div className="chip br-0">

            <div className="chip-label  mr-2">{participant.display}</div>
          </div>

        )
      });
    }
    return result;
  }

  function title() {
    if (props.room) {
      return (props.room.title)
    }
  }

  function controlButtons(published, icon) {
    if (!published) {
      return (
        <span class="fa-stack">
          <i className={"fas fa-" + icon}></i>
        </span>
      )
    } else {
      return (
        <span class="fa-stack">
          <i class={"fas fa-" + icon + " fa-stack-1x"}></i>
          <i class="fas fa-slash fa-stack-1x" style={{ textShadow: "0.1em 0.15em white" }}></i>
        </span>
      )
    }
  }

  function notification() {
    if (props.notification && props.notification.type === 'cameraSwitch') {
      var deactivateBtn = ''
      if (props.notification.from === 'screen sharing'){
        deactivateBtn = <button className="button deactivate-btn" onClick={() => props.toggleDesktop()}>Deactivate</button>
      }
      if (props.notification.from === 'camera'){
        deactivateBtn = <button className="button deactivate-btn" onClick={() => props.toggleCamera()}>Deactivate</button>
      }
      return (
        <div className="notification is-warning">
          <button className="delete"></button>
              You must deactivate your <strong>{props.notification.from}</strong> in order to activate <strong>{props.notification.to}</strong>.
          {deactivateBtn}
        </div>
      )
    } else {
      return(null)
    }
  }
  if (props.room) {
    return (
      <aside className="column pl-0 aside hero is-fullheight">
        <div className='media-bar p-2 pl-4 has-background-dark has-text-white-ter'>
          <a onClick={() => props.toggleMicrophone()} className='has-text-white-bis'>
            {controlButtons(props.publishedMicrophone, 'microphone')}
          </a>

          <a onClick={() => props.toggleCamera()} className='has-text-white-bis'>
            {controlButtons(props.publishedCamera, 'camera')}
          </a>

          <a onClick={() => props.toggleDesktop()} className='has-text-white-bis ml-2'>
            {controlButtons(props.publishedDesktop, 'desktop')}
          </a>
          <a onClick={() => props.toggleDesktop()} className='has-text-white-bis ml-2'>
            <i className="fas fa-hand-paper va-2" aria-hidden="true"></i>
          </a>
        </div>
        <div className="container p-4">
          {notification()}
          <div className="columns mt-2 is-mobile is-multiline is-centered p-4">
            {highVidoes()}
          </div>

          <div className="columns mt-2 is-mobile is-multiline is-centered p-4 is-horizontal-center">
            {presentVideo()}
          </div>

          <div className="columns is-mobile is-multiline has-background-white-bis p-4">
            <div className="column is-narrow">
              {lowVideos()}
            </div>
          </div>

        </div>
      </aside>
    )
  } else {
    return (null)
  }
}
export default Main;