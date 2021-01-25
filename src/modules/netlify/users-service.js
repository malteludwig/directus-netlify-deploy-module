export function getUserAsync(api, userId) {
    if (!api || !api.get) throw new Error('invalid api');
    if (!userId || userId.trim().length === 0) throw new Error('invalid user id');
    return api
        .get(`/users/me`, {
            params: {
                fields: ['email', 'first_name', 'last_name', 'avatar.id', 'role.name', 'status', 'email'],
            },
        })
        .then((response) => {
            if (!response || !response.hasOwnProperty('data') || !response.data.hasOwnProperty('data')) {
                throw new Error('invalid response parsing');
            }
            const { first_name: firstName, last_name: lastName, ...rest } = response.data.data;
            return {
                ...rest,
                firstName,
                lastName,
            };
        });
}
