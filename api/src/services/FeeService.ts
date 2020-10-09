export default new class FeeService {
    // TODO: this is not a real calculation - to be replaced
    // TODO: make big number aware
    async getDAISwapFee(amount) {
        return 0.01 * (amount / 10);
    }
}
