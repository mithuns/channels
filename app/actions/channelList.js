// @flow
import actionTypes from '../constants/actionTypes';
import type { Action, Dispatch, AccessTokenState } from '../constants/typeAliases';
import { apiRequest, Methods } from '../services/fetch';
import { getChannelsUri, getSubscriptionsUri } from '../services/uriGenerator';

type GetState = () => { accessToken: AccessTokenState };

type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;

export function fetchChannels(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(requestChannels());
    const { accessToken } = getState().accessToken;
    const subscriptions = fetchSubscriptions(accessToken);
    return subscriptions.then(json => {
      if (json.items == null) {
        return dispatch(receiveChannels([]));
      }
      const subscriptions = json.items.map(item => item.snippet.resourceId.channelId).join();
      const uri = getChannelsUri(accessToken, subscriptions);
      return apiRequest(uri, Methods.GET)
        .then(json => {
          if (json.items == null) {
            return dispatch(receiveChannels([]));
          }
          return dispatch(receiveChannels(json.items));
        });
    })
    .catch(() => dispatch(channelsError()));
  };
}

export function fetchSubscriptions(accessToken: string): Promise<any> {
  const uri = getSubscriptionsUri(accessToken);
  return apiRequest(uri, Methods.GET);
}

export function requestChannels(): Action {
  return {
    type: actionTypes.REQUEST_CHANNELS
  };
}

export function receiveChannels(items: any): Action {
  return {
    type: actionTypes.RECEIVE_CHANNELS,
    payload: items
  };
}

export function channelsError(): Action {
  return {
    type: actionTypes.CHANNELS_ERROR
  };
}
