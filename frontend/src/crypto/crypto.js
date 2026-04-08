import * as pkijs from "pkijs";
import * as asn1js from "asn1js";

// Set WebCrypto as the crypto engine for PKI.js
pkijs.setEngine('WebCypto', new pkijs.CryptoEngine({
    name: 'WebCrypto',
    crypto: globalThis.crypto,
}));

//generate RSA-2048 key pair as RSASSA-PKCS1v1_5
//when a user registers, we generate a key pair for them and store the private key 
// securely on the client side (e.g., IndexedDB) and the public key on the server for
// signature verification
export async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",  //pkijs supports only RSASSA-PKCS1v1_5 for signing
            modulusLength: 2048,  //RSA key size sercurity standard
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), //65537, prime and fast
            hash: { name: "SHA-256" },  //standard hash function for RSA signatures
        },
        true,   //extractable keys for export and storage
        ["sign", "verify"]
    );
    return keyPair;
}

export async function generateX509Certificate(keyPair, userName){
    const certificate = new pkijs.Certificate();
    certificate.version = 2; //X.509v3
    certificate.serialNumber = new asn1js.Integer({ value: Date.now() }); //unique serial number
    const now = new Date();

    certificate.notBefore.value = now;
    certificate.notAfter.value = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); //1 year validity
    const commonName = new pkijs.AttributeTypeAndValue({
        type: '2.5.4.3', // Common Name Object Identifier
        value: new asn1js.Utf8String({ value: userName }) //userName as common name
    });
    certificate.subject.typesAndValues.push(commonName); //who certificate belongs to
    certificate.issuer.typesAndValues.push(commonName); //who signed it (self-signed) (real world thrid party)
    await certificate.subjectPublicKeyInfo.importKey(keyPair.publicKey); //associate public key with certificate
    await certificate.sign(keyPair.privateKey, "SHA-256"); //sign certificate with private key
    
    const derBuffer = certificate.toSchema(true).toBER(false); //encode certificate to DER(Distinguished Encoding Rules) format (raw bytes)
    return derToPem(derBuffer, "CERTIFICATE"); //convert DER to PEM format for easier storage and transmission
}

//DER to PEM conversion helper function
export function derToPem(der,label){
    //convert raw bytes to string chars
    const byteArray = new Uint8Array(der);
    const charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
    const binaryString = charArray.join('');
    //base64 encode the binary string
    const base64String = btoa(binaryString);
    //split base64 string into lines of 64 characters for PEM formatting
    const lines = base64String.match(/.{1,64}/g).join('\n');
    //wrap with PEM header and footer
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

export function pemToDer(pem){
    //remove PEM header and footer
    const base64String = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s/g, '');
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

export function bufToBase64(buffer) {
    const byteArray = new Uint8Array(buffer);
    const charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
    const binaryString = charArray.join('');
    return btoa(binaryString);
}

export function base64ToBuf(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}


function openIndexedDB(){
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MatrixMessengerDB', 1);

        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('keys');
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

//store private key in IndexedDB under userID key for later retrieval and signing operations
export async function storePrivateKey(userID, privateKey){
    const keyData = await crypto.subtle.exportKey("pkcs8", privateKey); //export private key in PKCS#8 format for storage
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('keys', 'readwrite');
        transaction.objectStore('keys').put(keyData, userID);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
    });
}

export async function getPrivateKey(userID){
    const db = await openIndexedDB();
    //retrieve the private key data from IndexedDB using the userID as the key
    const keyData = await new Promise((resolve, reject) => {
        const transaction = db.transaction('keys', 'readonly');
        const request = transaction.objectStore('keys').get(userID);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
    if (!keyData) throw new Error('Private key not found for user: ' + userID);

    // Re-import the same key bytes as RSA-OAEP
    // The raw RSA bytes are identical — only the algorithm label differs
    return crypto.subtle.importKey(
        'pkcs8',
        keyData,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,          // not extractable — no need to export again
        ['decrypt']     //restrict usage to decryption operations
    );
    //This returns a private key that can be used for decryption operations, even though it was originally generated for signing.
}

// a random AES-256 key, one for each group
export async function generateAESKey() {
    return await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,   //extractable for export and storage
        ["encrypt", "decrypt"]
    );
}

export async function encryptMessage(aesKey, plaintext) {
    //convert plaintext string to Uint8Array for encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    //generate a random 96-bit IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        data
    );
    //return both the IV and ciphertext, (IV is needed for decryption)
    return { iv: bufToBase64(iv.buffer), ciphertext: bufToBase64(ciphertext) };
}
export async function decryptMessage(aesKey, iv, ciphertext) {
    //convert base64 back to raw bytes
    const ciphertextBuf = base64ToBuf(ciphertext);
    const ivBuf = base64ToBuf(iv);
    
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBuf,
        },
        aesKey,
        ciphertextBuf
    );
    //convert the decrypted bytes back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

// Takes a certificate !! Using public key directly lead to leak!
export async function encryptAESKeyForMember(AESKey, memberCertificatePem){
    //import the member's public key from their X.509 certificate
    const certDer = pemToDer(memberCertificatePem);
    const asn1 = asn1js.fromBER(certDer); //parse the DER-encoded certificate to extract the public key
    const cert = new pkijs.Certificate({ schema: asn1.result });
    //get the raw bytes of the public key in SPKI format
    const spkiBytes = cert.subjectPublicKeyInfo.toSchema().toBER(false); 
    //re-import the same raw bytes as an RSA-OAEP key for encryption operations
    const publicKey = await crypto.subtle.importKey(
        'spki',  //format of the public key in X.509 certificates is SPKI (Subject Public Key Info)
        spkiBytes, //the raw bytes of the public key extracted from the certificate
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,          //not extractable
        ['encrypt']     //only for encryption
    );

    //export the AES key in raw format for encryption
    const aesKeyRaw = await crypto.subtle.exportKey('raw', AESKey);

    //encrypt the AES key using the member's public RSA key with RSA-OAEP
    const encryptedAESKey = await crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP',
        },
        publicKey,
        aesKeyRaw
    );
    return bufToBase64(encryptedAESKey); //return the encrypted AES key as a base64 string for transmission
}

// Decrypt the AES key using the member's private RSA key
export async function decryptAESKeyForMember(encryptedAESKey, privateKey){
    const encryptedAESKeyRaw = base64ToBuf(encryptedAESKey); //convert base64 back to raw bytes

    //decrypt the AES key using the member's private RSA key with RSA-OAEP
    const aesKeyRaw = await crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP',
        },
        privateKey,
        encryptedAESKeyRaw
    );
    //import the decrypted raw AES key back into a CryptoKey object for use in encryption/decryption operations
    return await crypto.subtle.importKey(
        'raw',
        aesKeyRaw,
        { name: 'AES-GCM', length: 256 },
        false,          //not extractable
        ['encrypt', 'decrypt'] //allow both encryption and decryption with this key
    );
}

export async function verifyCertificate(certificatePem){
    //get certificate object
    const certDer = pemToDer(certificatePem);
    const asn1 = asn1js.fromBER(certDer);
    const cert = new pkijs.Certificate({ schema: asn1.result });

    //self signed certificate, verify against itself
    const isValid = await cert.verify(cert); //verify the certificate's signature and validity
    return isValid;
}

// Aliases for frontend compatibility
export const generateRSAKeyPair = generateKeyPair;
export const loadPrivateKey = getPrivateKey;