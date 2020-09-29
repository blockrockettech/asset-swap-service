import {ethers} from 'ethers';

export default new class Web3Service {
    validateSignature(address, message, signature) {
        const recovered = ethers.utils.verifyMessage(message, signature);
        return this.checksum(address) === this.checksum(recovered);
    }

    checksum(address) {
        return ethers.utils.getAddress(address);
    }
}
