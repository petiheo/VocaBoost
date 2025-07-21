require('dotenv').config();
const PORT = process.env.PORT;
const logger = require('./src/utils/logger');

app = require('./src/app');
app.listen(PORT, () => {
  logger.info(`URL of app: http://127.0.0.1:${PORT}/`);
});
