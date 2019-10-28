import axios from 'axios';

const CLIENT_ID = '392547936353-d40uvlhbp4okcjj9ppkbtevutqrgtfcc.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDtLPI19Jsg_33xH2Z_IyIBy8Hmx0FVZC8';
const REDIRECT_URI = 'http://localhost:8080/';
const PREMISION_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const ACCESS_TOKEN = localStorage.getItem('token');
const AUTH_HEADER_KEY = 'Authorization';

export const setAuthHeader = (token = null) => {
	if (token) {
		axios.defaults.headers.common[AUTH_HEADER_KEY] = `Bearer ${token}`;
	} else {
		axios.defaults.headers.common[AUTH_HEADER_KEY] = null;
		delete axios.defaults.headers.common[AUTH_HEADER_KEY];
	}
};

if (ACCESS_TOKEN) {
	setAuthHeader(ACCESS_TOKEN);
}

export const getUser = () => {
	return axios.get('https://www.googleapis.com/gmail/v1/users/me/profile', {
		params: {
			key: API_KEY
		}
	});
};

export const getLables = () => {
	return axios.get('https://www.googleapis.com/gmail/v1/users/me/labels', {
		params: {
			key: API_KEY
		}
	});
};
// function that give us data of ten message
export const getMessages = () => {
	//choose ids of 10 last inbox messages
	return new Promise((resolve, reject) => {
		axios
			.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
				params: {
					labelIds: 'INBOX',
					maxResults: 10,
					key: API_KEY
				}
			})
			.then((resp) => {
				//create an array of axios to each message
				let axiosArr = resp.data.messages.map((a) => {
					return axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${a.id}`, {
						params: {
							key: API_KEY
						}
					});
				});

				Promise.all(axiosArr).then((values) => {
					const hasErrors = values.some((index, item) => item instanceof Error);
					if (hasErrors) {
						return reject('Ошибка при загрузке сообщений');
					} else {
						let data = values.map((e) => {
							return e.data;
						});

						let all = data.map(function(element) {
							let z = element.id;
							let a = element.payload.headers.find((el) => el.name === 'From');
							a = a.value.replace(/"/g, '').replace(/<.*?>/g, '').trim();

							let b = element.payload.headers.find((el) => el.name === 'Subject');
							b = b.value;
							let c = element.payload.headers.find((el) => el.name === 'Date');
							c = c.value.replace(/\+.*|-.*/g, '');

							let t;
							if (typeof element.payload.parts === 'undefined') {
								t = element.payload.body.data;
							}
							if (typeof element.payload.parts !== 'undefined') {
								element.payload.parts.forEach((el) => {
									if (el.mimeType === 'text/html') {
										t = el.body.data;
									} else if (el.mimeType === 'multipart/alternative') {
										el.parts.forEach((e) => (t = e.body.data));
									}
								});
							}
							t = t.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
							let decodet = decodeURIComponent(escape(window.atob(t)));
							return {
								id: z,
								from: a,
								sub: b,
								date: c,
								text: decodet
							};
						});

						resolve(all);
					}
				});
			})
			.catch((err) => {
				reject(err);
			});
	});
};

export const oauth2SignIn = () => {
	//oauth2SignIn = () =>

	// Google's OAuth 2.0 endpoint for requesting an access token
	const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

	// Create element to open OAuth 2.0 endpoint in new window.
	const form = document.createElement('form');
	form.setAttribute('method', 'GET'); // Send as a GET request.
	form.setAttribute('action', oauth2Endpoint);

	// Parameters to pass to OAuth 2.0 endpoint.
	const params = {
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		scope: PREMISION_SCOPE,
		state: 'try_sample_request',
		include_granted_scopes: 'true',
		response_type: 'token'
	};

	// Add form parameters as hidden input values.
	for (let p in params) {
		const input = document.createElement('input');
		input.setAttribute('type', 'hidden');
		input.setAttribute('name', p);
		input.setAttribute('value', params[p]);
		form.appendChild(input);
	}

	// Add form to page and submit it to open the OAuth 2.0 endpoint.
	document.body.appendChild(form);
	form.submit();
};
