require('dotenv').config();
const logger = require('./src/utils/logger');
const PORT = process.env.PORT || 3000;

app = require('./src/app');
app.listen(PORT, () => {
  logger.info(`URL of app: http://127.0.0.1:${PORT}/`);
});
