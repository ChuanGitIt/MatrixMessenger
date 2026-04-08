
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
    return response;
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
    return response;
}

//USER

export async function getUserByID(userID) {
    const response = await fetch(`${API_BASE_URL}/users/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

export async function getUserByUsername(username) {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

export async function getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

//GROUPS

export async function createGroup(name, memberIDs, encryptedGroupKey) {
    const response = await fetch(`${API_BASE_URL}/groups/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, memberIDs, encryptedGroupKey }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
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

export async function addGroupMember(groupID, userID, encryptedGroupKey) {
    const response = await fetch(`${API_BASE_URL}/groups/addMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupID, userID, encryptedGroupKey }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
}

export async function removeGroupMember(groupID, userID, encryptedGroupKeys) {
    const response = await fetch(`${API_BASE_URL}/groups/removeMember`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupID, userID, encryptedGroupKeys }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
}

//POSTS

export async function getAllPosts(){
    const response = await fetch(`${API_BASE_URL}/posts/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
}

export async function createPost(senderID,groupID,ciphertext,iv){
    const response = await fetch(`${API_BASE_URL}/posts/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderID, groupID, ciphertext, iv }),
    });
     if (!response.ok) {
        throw new Error(await response.text());
    }
    return response;
}