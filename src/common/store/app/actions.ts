import { push, replace } from 'connected-react-router';
import { ipcRenderer } from 'electron';
import { action } from 'typesafe-actions';
import { ThunkResult } from '../../../types';
import { EVENTS } from '../../constants/events';
import { SC } from '../../utils';
import { getAuth, getAuthFeed, getAuthFollowings, getAuthLikeIds, getAuthLikesIfNeeded, getAuthPlaylists, getAuthReposts } from '../auth/actions';
import { setConfigKey } from '../config';
import { changeTrack, ChangeTypes, PlayerStatus, toggleStatus, VolumeChangeTypes } from '../player';
import { toggleLike, toggleRepost } from '../track/actions';
import { AppActionTypes, CanGoHistory, Dimensions } from './types';
import fetchRemainingPlays from '../../api/fetchRemainingTracks';

export function getRemainingPlays(): ThunkResult<void> {
    return (dispatch, getState) => {
        const { config: { app: { overrideClientId } } } = getState();

        dispatch({
            type: AppActionTypes.SET_REMAINING_PLAYS,
            payload: fetchRemainingPlays(overrideClientId)
        });
    };
}

export function initApp(): ThunkResult<void> {
    return (dispatch, getState) => {

        const { config: { token } } = getState();

        if (!token) {
            dispatch(replace('/login'));
            return;
        }

        SC.initialize(token);

        dispatch(initWatchers());

        if (process.env.NODE_ENV === 'development') {
            dispatch(action(AppActionTypes.RESET_STORE));
        }

        return dispatch(action(AppActionTypes.SET_LOADED, Promise.all([
            dispatch(getAuth()),
            dispatch(getAuthFollowings()),
            dispatch(getAuthReposts()),

            dispatch(getAuthFeed()),
            dispatch(getAuthLikesIfNeeded()),
            dispatch(getAuthLikeIds()),
            dispatch(getAuthPlaylists()),
            dispatch(getRemainingPlays()),
        ]).then(() => {
            setInterval(() => dispatch(getRemainingPlays()), 30000);
        })));
    };
}

export const setDimensions = (dimensions: Dimensions) => action(AppActionTypes.SET_DIMENSIONS, dimensions);
export const canGoInHistory = (canGoHistory: CanGoHistory) => action(AppActionTypes.SET_CAN_GO, canGoHistory);
export const setLastfmLoading = (loading: boolean) => action(AppActionTypes.SET_LASTFM_LOADING, loading);

export const toggleOffline = (offline: boolean) => action(AppActionTypes.TOGGLE_OFFLINE, {
    time: new Date().getTime(),
    offline
});
export const setUpdateAvailable = (version: string) => action(AppActionTypes.SET_UPDATE_AVAILABLE, {
    version
});

let listeners: Array<any> = [];

export function initWatchers(): ThunkResult<any> {
    return (dispatch, getState) => {

        if (!listeners.length) {
            listeners.push({
                event: EVENTS.APP.PUSH_NAVIGATION,
                handler: (_e: any, path: string, url: string) => {
                    dispatch(push({
                        pathname: path,
                        search: url
                    }));
                }
            });

            listeners.push({
                event: EVENTS.PLAYER.CHANGE_TRACK,
                handler: (_e: any, data: ChangeTypes) => {
                    dispatch(changeTrack(data));
                }
            });

            listeners.push({
                event: EVENTS.PLAYER.CHANGE_VOLUME,
                handler: (_e: any, data: VolumeChangeTypes) => {
                    const { config: { audio: { volume } } } = getState();

                    let new_volume = volume + .05;

                    if (data === VolumeChangeTypes.DOWN) {
                        new_volume = volume - .05;
                    }

                    if (new_volume > 1) {
                        new_volume = 1;
                    } else if (new_volume < 0) {
                        new_volume = 0;
                    }

                    if (volume !== new_volume) {
                        dispatch(setConfigKey('audio.volume', new_volume));
                    }
                }
            });

            listeners.push({
                event: EVENTS.PLAYER.TOGGLE_STATUS,
                handler: (_e: any, newStatus: PlayerStatus) => {

                    const { player: { status } } = getState();

                    if (!newStatus || typeof newStatus !== 'string') {
                        newStatus = status !== PlayerStatus.PLAYING ? PlayerStatus.PLAYING : PlayerStatus.PAUSED;
                    }
                    dispatch(toggleStatus(newStatus));
                }
            });

            listeners.push({
                event: EVENTS.TRACK.LIKE,
                handler: (_e: any, trackId: string) => {
                    if (trackId) {
                        dispatch(toggleLike(+trackId, false)); // TODO determine if track or playlist
                    }
                }
            });

            listeners.push({
                event: EVENTS.TRACK.REPOST,
                handler: (_e: string, trackId: string) => {
                    if (trackId) {
                        dispatch(toggleRepost(+trackId, false)); // TODO determine if track or playlist
                    }
                }
            });

            listeners.push({
                event: EVENTS.APP.SEND_NOTIFICATION,
                handler: (_e: string, contents: { title: string; message: string; image: string }) => {

                    const myNotification = new Notification(contents.title, {
                        body: contents.message,
                        icon: contents.image,
                        silent: true,
                    });

                    myNotification.onclick = () => {
                        ipcRenderer.send(EVENTS.APP.RAISE);
                    };

                }
            });

            listeners.forEach((l) => {
                ipcRenderer.on(l.event, l.handler);
            });
        }
    };
}

export function stopWatchers(): void {
    listeners.forEach((l) => {
        ipcRenderer.removeListener(l.event, l.handler);
    });

    listeners = [];
}
