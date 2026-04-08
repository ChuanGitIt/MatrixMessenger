import { getPrivateKey,getGroup, decryptAESKeyForMember, encryptAESKeyForMember, generateAESKey} from "../crypto/crypto"
import { addGroupMember, getUser, removeGroupMember } from "./api"

export async function addMember(groupID,myUserID, newUserID){
    const privateKey = await getPrivateKey(myUserID);
    const group = await getGroup(groupID);

    const aesKey = await decryptAESKeyForMember(group.encryptionKeys[myUserID], privateKey);

    const newUser = await getUser(newUserID);
    const encryptedGroupKey = await encryptAESKeyForMember(aesKey, newUser.certificate);
    
    await addGroupMember(groupID, newUserID, encryptedGroupKey);
}

export async function removeMember(groupID, removedUserID){
    const group = await getGroup(groupID);
    const remainingMemberIDs = group.memberIds.filter(id => id !== removedUserID);
    // Generate a new AES key for the group
    const newAESKey = await generateAESKey();
    
    // Encrypt the new AES key for each remaining member
    const newEncryptedKeys = {};
    for (const memberID of remainingMemberIDs) {
        const member = await getUser(memberID);
        newEncryptedKeys[memberID] = await encryptAESKeyForMember(newAESKey, member.certificate);
    }
    // Update the group with the new encrypted keys and member list
    await removeGroupMember(groupID, removedUserID, newEncryptedKeys);
}