import {live, live as li} from "../live/live";
import {song} from "../song/song";
import SongDao = song.SongDao;
import Song = song.Song;
import {message} from "../message/messenger";
import Messenger = message.Messenger;
import {track} from "../track/track";
import TrackDao = track.TrackDao;
import Track = track.Track;
import LiveApiFactory = live.LiveApiFactory;
import Env = live.Env;
import TypeIdentifier = live.TypeIdentifier;

export {}
const max_api = require('max-api');

max_api.addHandler('liveApiMaxSynchronousResult', (...res) => {
    // @ts-ignore
    global.liveApiMaxSynchronousResult = res.slice(1);
    // @ts-ignore
    global.liveApiMaxSynchronousLocked = false;
});

max_api.addHandler('expand_track', (path_track: string, name_part?: string) => {

    path_track = 'live_set tracks 2';

    let track = new Track(
        new TrackDao(
            LiveApiFactory.create(
                Env.NODE_FOR_MAX,
                path_track,
                TypeIdentifier.PATH
            ),
            null,
            false
        )
    );

    track.load_clips();

    let clip_slot = track.get_clip_slot_at_index(0);

    let clip = clip_slot.get_clip();

    let notes = clip.get_notes(0, 0, 8, 128);

    let testing = 1;

    // track.create_clip_at_index(1, 8)

    // let song = new Song(
    //     new SongDao(
    //         new li.LiveApiJs(
    //             'live_set',
    //             'node'
    //         ),
    //         // new Messenger('node_for_max', 0),
    //         null,
    //         false
    //     )
    // );
    //
    // // song.start()
    // max_api.post(song.get_tempo());
    // max_api.post('finished');
});