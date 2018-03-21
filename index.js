const EC = require('elliptic').ec
const BN = require('bn.js')
const ec = new EC('secp256k1')
const G = ec.g; // Generator point
const keccak256 = require('js-sha3').keccak256


// Refer to https://etherworld.co/2017/11/17/understanding-the-concept-of-private-key-public-key-and-address-in-ethereum-blockchain/
/// Get public key from private key. `privateKey` is private key in buffer
const getPublickKeyFromPrivateKey = (privateKey) => {
    if (!(privateKey instanceof Buffer)) {
        throw new TypeError('param privateKey must be of Buffer type');
    }
    
    const pk = new BN(privateKey) // private key as big number
    const publicPoint = G.mul(pk) // EC multiplication to determine public point 
    const x = publicPoint.getX().toBuffer() //32 bit x co-ordinate of public point 
    const y = publicPoint.getY().toBuffer() //32 bit y co-ordinate of public point 
    
    const publicKey = Buffer.concat([x,y])
    return publicKey
}

/// Get address from public key. `publicKey` is public key in buffer
const getAddressFromPublicKey = (publicKey) => {
    if (!(publicKey instanceof Buffer)) {
        throw new TypeError('param privateKey must be of Buffer type');
    }
    
    const hash = keccak256(publicKey)
    const address = Buffer.from(hash, 'hex').slice(-20)
    return address
}

/// Get address from private key. `privateKey` is private key in buffer
const getAddressFromPrivateKey = (privateKey) => {
    if (!(privateKey instanceof Buffer)) {
        throw new TypeError('param privateKey must be of Buffer type');
    }

    const publicKey = getPublickKeyFromPrivateKey(privateKey)
    const address = getAddressFromPublicKey(publicKey)
    return address
}

const findPrivateKeyForAddress = (privateKeyStr, addressStr) => {
    if (typeof privateKeyStr !== 'string') {
        throw new TypeError('param privateKeyStr must be of String');
    } else if (typeof addressStr !== 'string') {
        throw new TypeError('param addressStr must be of String');
    }

    const hexStr = '0123456789abcdef'

    const targetAddress = Buffer.from(addressStr, 'hex')

    const privateKeyLength = privateKeyStr.length
    
    // Place the first blue stick from first to the second last of the hex
    for (let i = 0; i < privateKeyLength - 1; i++) {
        // Swap the first blue stick with a new hex (from `0` to `f`)
        for (const c1 of hexStr) {
            // Place the second red stick from one right of the placed blue stick the last of the hex
            for (let j = i + 1; j < privateKeyLength ; j++) {
                // Swap the second red stick with a new hex (from `0` to `f`)
                for (const c2 of hexStr) {
                    const privateKeyInChars = privateKeyStr.split('')
                    privateKeyInChars[i] = c1
                    privateKeyInChars[j] = c2
                    
                    // Generate the Ethereum address from the swapped private key
                    const privateKey = Buffer.from(privateKeyInChars.join(''), 'hex')
                    const address = getAddressFromPrivateKey(privateKey)
                    // Compare the generated address with the target address
                    if (address.equals(targetAddress)) {
                        // Bingo, we found it.
                        console.log('💥💥💥 PRIVATE KEY FOUND 💥💥💥')
                        return privateKey.toString('hex')
                    }
                }

            }
        }
    }
}

const main = () => {
    const privateKeyStr = '1c2bbd4fd5627db7a2cd3d2c16737826335bdcf2333ff2c212bcd222223265ff'
    const targetAddressStr = '7858121D26cE162011C97F0fd38c8CfB0859796c'

    console.log(`Private key:: ${privateKeyStr}`)
    console.log(`Target address:: ${targetAddressStr}`)
    const foundPrivateKey = findPrivateKeyForAddress(privateKeyStr, targetAddressStr)
    console.log(`Found private key:: ${foundPrivateKey}`)
}

main()
