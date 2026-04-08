
const API_BASE_URL = 'http://localhost:8080/api';
//AUTH
export async function register(username, password, publicKey, certificate) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, publicKey, certificate }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}
export async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

//USER

export async function getUserByID(userID) {
    const response = await fetch(`${API_BASE_URL}/users/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
}

export async function getUserByUsername(username) {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
}

export async function getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
}

//GROUPS

export async function createGroup(groupName, memberIDs, encryptedGroupKey) {
    const response = await fetch(`${API_BASE_URL}/groups/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName, memberIDs, encryptedGroupKey }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

export async function getGroup(groupID) {
    const response = await fetch(`${API_BASE_URL}/groups/get/${groupID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

export async function getAllGroups() {
    const response = await fetch(`${API_BASE_URL}/groups/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

export async function addGroupMember(groupID, memberID, encryptedGroupKey) {
    const response = await fetch(`${API_BASE_URL}/groups/addMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupID, memberID, encryptedGroupKey }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

export async function removeGroupMember(groupID, memberID, encryptedGroupKeys) {
    const response = await fetch(`${API_BASE_URL}/groups/removeMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupID, memberID, encryptedGroupKeys }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}