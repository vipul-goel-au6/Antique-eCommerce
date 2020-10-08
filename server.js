const app = require("./app");

const domainName = process.env.DOMAIN_NAME || `http://localhost:1234`;
const port = process.env.PORT || 1234;

app.listen(port, () => console.log(`Server connected at ${domainName}`));
