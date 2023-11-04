async function startServer() {
    try {
        const { default: fetch } = await
        import ('node-fetch');
    } catch (err) {
        console.error('Error starting the server:', err);
    }
}
module.exports = { startServer }