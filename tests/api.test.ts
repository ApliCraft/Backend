import fetch from 'node-fetch';

describe('Test api state', () => {
    it('should return 200 if api is running', async () => {
        const response = await fetch("http://localhost:4001/api");

        expect(response.status).toBe(200);
    });
});
