require('dotenv').config();
const app = require('./app');
const { startEscalationJob } = require('./src/jobs/escalation');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  startEscalationJob();
});