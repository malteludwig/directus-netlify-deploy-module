export function getAuthUrl(clientID, state, redirectURI) {
    const authUrl = `https://app.netlify.com/authorize?client_id=${clientID}&response_type=token&state=${state}&redirect_uri=${redirectURI}`;
    return authUrl;
}
