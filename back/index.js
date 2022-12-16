const app = require('./app');
const http = require('http');
const config = require('./utils/config');
const logger = require('./utils/logger');

const server = http.createServer(app);
//Log le port ou le canal nommé sur lequel le serveur s'exécute dans la console
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
