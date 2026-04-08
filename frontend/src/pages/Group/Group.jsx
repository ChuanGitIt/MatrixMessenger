import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGroups, getAllUsers,getUserByID,createGroup } from '../../api/api';
import { generateAESKey, encryptAESKeyForMember } from '../../crypto/crypto';
import { addMember, removeMember } from '../../api/groupOp';

export default function Groups() {
    const [groups, setGroups]   = useState([]);
    const [users, setUsers]     = useState([]);
    const [error, setError]     = useState('');

    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]); //for creating group
    const [addingMemberID, setAddingMemberID] = useState(''); // user ID we're adding to a group
    const [addingToGroup, setAddingToGroup] = useState(null); // group ID we're adding to

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const userId   = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    
    useEffect(() => {fetchData();}, []);

    async function fetchData() {
            try {
                const [groupData, userData] = await Promise.all([
                    getAllGroups(),
                    getAllUsers()
                ]);
                setGroups(groupData);
                setUsers(userData);
            } catch (err) {
                setError(err.message);
            }
        }

    //create group
    async function handleCreateGroup(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
            //get all member IDs
            const allMemberIDs = selectedMembers;
            //gnerate AES key for the group
            const aesKey = await generateAESKey();

            const encryptedKeys = {};
            for(const memberID of allMemberIDs){
                const member = await getUserByID(memberID);
                if(!member.certificate){
                    throw new Error(`User ${member.username} does not have a certificate`);
                }
                encryptedKeys[memberID] = await encryptAESKeyForMember(aesKey, member.certificate);
            }
            await createGroup(newGroupName, allMemberIDs, encryptedKeys);

            //refresh
            setNewGroupName('');
            setSelectedMembers([]);
            await fetchData();
        } catch(err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    //Add memeber
    async function handleAddMember(groupID){
        if(!addingMemberID) return; // No user selected
        setError('');
        setLoading(true);
        try{
            await addMember(groupID, userId, addingMemberID);
            //refresh
            await fetchData();
        } catch(err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveMember(groupID, removedUserID){
        setError('');
        setLoading(true);
        try{
            await removeMember(groupID, removedUserID);
            //refresh
            await fetchData();
        } catch(err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

// Helpers
    function toggleMember(id) {
        const alreadySelected = selectedMembers.includes(id);

        if (alreadySelected) {
            // Remove from selection
            const withoutId = selectedMembers.filter(x => x !== id);
            setSelectedMembers(withoutId);
        } else {
            // Add to selection
            const withId = [...selectedMembers, id];
            setSelectedMembers(withId);
        }
    }

    function isMember(group) {
        return group.memberIds.includes(userId);
    }

    function getUsernameById(id) {
        const user = users.find(u => u.id === id);
        return user ? user.username : 'Unknown';
    }

    function getNonMembers(group) {
        return users.filter(u => !group.memberIds.includes(u.id));
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Groups</h2>
                <div>
                    <span>Logged in as <strong>{username}</strong></span>
                    <button onClick={() => navigate('/posts')} style={{ marginLeft: '10px' }}>
                        View Posts
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ marginLeft: '10px' }}>
                        Logout
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* ── Create Group Form ── */}
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
                <h3>Create New Group</h3>
                <form onSubmit={handleCreateGroup}>
                    <input
                        type="text"
                        placeholder="Group name"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        required
                    />

                    <p>Select members:</p>
                    {users //fetched from backend
                        //.filter(u => u.id !== userId) // exclude yourself — added automatically
                        .map(u => (
                            <label key={u.id} style={{ display: 'block' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(u.id)}
                                    onChange={() => toggleMember(u.id)}
                                />
                                {u.username}
                            </label>
                        ))
                    }

                    <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
            </div>

            {/* ── Group List ── */}
            {groups.map(group => (
                <div key={group.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                    <h3>{group.name}</h3>
                    <p>Status: {isMember(group) ? '✅ Member' : '🔒 Not a member'}</p>

                    <p><strong>Members:</strong></p>
                    <ul>
                        {group.memberIds && group.memberIds.map(memberId => (
                            <li key={memberId}>
                                {getUsernameById(memberId)}
                                {/* Only show remove button if you're a member and it's not yourself */}
                                {isMember(group) && memberId !== userId && (
                                    <button
                                        onClick={() => handleRemoveMember(group.id, memberId)}
                                        disabled={loading}
                                        style={{ marginLeft: '10px', color: 'red' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Add member — only visible if you're a member */}
                    {isMember(group) && (
                        <div>
                            {addingToGroup === group.id ? (
                                <div>
                                    <select
                                        value={addingMemberID}
                                        onChange={e => setAddingMemberID(e.target.value)}
                                    >
                                        <option value="">Select user</option>
                                        {getNonMembers(group).map(u => (
                                            <option key={u.id} value={u.id}>{u.username}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleAddMember(group.id)} disabled={loading}>
                                        {loading ? 'Adding...' : 'Confirm'}
                                    </button>
                                    <button onClick={() => { setAddingToGroup(null); setAddingMemberID(''); }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setAddingToGroup(group.id)}>
                                    + Add Member
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
