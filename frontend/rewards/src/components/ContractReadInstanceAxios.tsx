import axios, { AxiosResponse } from "axios";
import * as qs from "qs";

const contract_owner_http = "http://localhost:5000/";

const instance = axios.create({
    baseURL: contract_owner_http,
});

const config = {
    headers: {
        'content-type':'application/json, multipart/form-data',
        'accept':'application/json, text/plain, /',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Origin': "*",
        withCredentials: false,
    }
}

export interface PostTypeString {
	data?: string;
    statusCode?: number;
}

export interface PostTypeNumber {
	data?: number;
    statusCode?: number;
}

const responseBody = (response: AxiosResponse) => response.data;

instance.interceptors.request.use((config) => {
    return config;
});

const requests = {
	get: (url: string) => instance.get(url).then(responseBody),
    post: (url: string, body: string) => instance.post(url,body).then(responseBody),
	put: (url: string, body: {}) => instance.put(url, body).then(responseBody),
	delete: (url: string) => instance.delete(url).then(responseBody),
};

export const ContractInstanceAxios = {
    /* tweetID: string => string */
    getProofLocation: (tweetID : string): Promise<PostTypeString> =>
        requests.post("getProofLocation", qs.stringify({"tweetID": tweetID})),
    getWinnerTwitterID: (tweetID : string): Promise<PostTypeString> =>
        requests.post("getWinnerTwitterID", qs.stringify({"tweetID": tweetID})),

    /* tweetID: string => number */
    getContestState: (tweetID : string): Promise<PostTypeNumber> =>
        requests.post("getContestState", qs.stringify({"tweetID": tweetID})),
    getContestRewardAmount: (tweetID : string): Promise<PostTypeNumber> =>
        requests.post("getContestRewardAmount", qs.stringify({"tweetID": tweetID})),
    getRewardBalanceWithTwitterID: (tweetID : string): Promise<PostTypeNumber> =>
        requests.post("getRewardBalanceWithTwitterID", qs.stringify({"tweetID": tweetID})),
    getRandomSeed: (tweetID : string): Promise<PostTypeNumber> =>
        requests.post("getRandomSeed", qs.stringify({"tweetID": tweetID})),
    
    /* address : string => string */
    getTwitterID: (address : string): Promise<PostTypeString> =>
    requests.post("getTwitterID", qs.stringify({"address": address})),
    getAddressFromTwitterID: (address : string): Promise<PostTypeString> =>
        requests.post("getAddressFromTwitterID", qs.stringify({"address": address})),
    getEtherBalanceWithAddress: (address : string): Promise<PostTypeString> =>
        requests.post("getEtherBalanceWithAddress", qs.stringify({"address": address})),
};

/*
examples:
getPosts: (): Promise<PostType[]> => requests.get('posts'),
	getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
	createPost: (post: PostType): Promise<PostType> =>
		requests.post('posts', post),
	updatePost: (post: PostType, id: number): Promise<PostType> =>
		requests.put(`posts/${id}`, post),
	deletePost: (id: number): Promise<void> => requests.delete(`posts/${id}`),
*/