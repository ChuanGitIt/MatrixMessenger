import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPosts, getAllGroups, createPost } from "../../api/api";
import { getPrivateKey, decryptMessage, encryptMessage, decryptAESKeyForMember } from "../../crypto/crypto";

export default function Post() {
    const navigate = useNavigate();
    const userID = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [aesKeys, setAesKeys] = useState({});
    const [newPost, setNewPost] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllPosts();
    }, []);

    async function fetchAllPosts() {
        try {
            const [postData, groupData] = await Promise.all([getAllPosts(), getAllGroups()]);
            setPosts(postData);
            setGroups(groupData);

            //decrypt AES keys for groups the user is a member of
            const privateKey = await getPrivateKey(userID);
            const keys = {};
            for (const group of groupData) {
                if (group.memberIds.includes(userID)) {
                    const encryptedGroupKey = group.encryptionKeys[userID];
                    if (encryptedGroupKey) {
                        keys[group.id] = await decryptAESKeyForMember(encryptedGroupKey, privateKey);
                    }
                }
            }
            setAesKeys(keys);
        } catch (err) {
            setError(err.message);
        }

    }

    const myGroups = groups.filter(group => group.memberIds.includes(userID)); //get groups the user is a member of

    async function handleCreatePost(e) {
        e.preventDefault();

        if (!newPost.trim()) return;
        setLoading(true);
        setError("");
        try {
            //encrypt post content for each group
            for (const group of myGroups) {
                const aesKey = aesKeys[group.id];
                const { ciphertext, iv } = await encryptMessage(aesKey, newPost);
                await createPost(userID, group.id, ciphertext, iv);
            }
            setNewPost("");
            await fetchAllPosts(); //refresh posts after creating
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function getGroupName(groupId) {
        const g = groups.find(g => g.id === groupId);
        return g ? g.name : groupId;
    }

    function PostItem({ post, aesKey, groupName }) {
        const [text, setText] = useState(null);

        useEffect(() => {
            if (!aesKey) { setText(null); return; }
            decryptMessage(aesKey, post.iv, post.cipherText)
                .then(setText)
                .catch(() => setText('[decryption failed]'));
        }, [aesKey, post]);

        const time = new Date(post.timestamp).toLocaleString();

        return (
            <div style={{ marginBottom: '10px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                <span style={{ color: '#666', fontSize: '0.85em' }}>#{groupName}</span>
                <span style={{ color: '#999', fontSize: '0.8em', marginLeft: '10px' }}>{time}</span>
                <p style={{
                    margin: '4px 0',
                    fontFamily: aesKey ? 'inherit' : 'monospace',
                    fontSize: aesKey ? 'inherit' : '0.75em',
                    wordBreak: 'break-all',
                    color: aesKey ? 'inherit' : '#999'
                }}>
                    {aesKey ? (text ?? 'Decrypting...') : post.cipherText}
                </p>
            </div>
        );
    }
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>All Posts</h2>
                <div>
                    <span>Logged in as <strong>{username}</strong></span>
                    <button onClick={() => navigate('/groups')} style={{ marginLeft: '10px' }}>Groups</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ marginLeft: '10px' }}>Logout</button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Send a post */}
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                <h3>New Post</h3>
                {myGroups.length === 0 ? (
                    <p>You are not a member of any group.</p>
                ) : (
                    <form onSubmit={handleCreatePost} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={newPost}
                            onChange={e => setNewPost(e.target.value)}
                            placeholder="Type a message..."
                            style={{ flex: 1 }}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                )}
            </div>

            {/* Post feed */}
            <div>
                {posts.length === 0 && <p>No posts yet.</p>}
                {posts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        aesKey={aesKeys[post.groupID] ?? null}
                        groupName={getGroupName(post.groupID)}
                    />
                ))}
            </div>
        </div>
    );
}