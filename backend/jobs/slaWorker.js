const cron = require('node-cron');
const Complaint = require('../models/Complaint');

const getComplaintAgeHours = (createdAt) => {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs / (1000 * 60 * 60);
};

const runSlaScan = async () => {
  const slaHours = Number(process.env.SLA_HOURS || 48);
  const escalationHours = Number(process.env.ESCALATION_HOURS || 72);

  const complaints = await Complaint.find({ status: { $nin: ['resolved', 'rejected'] } });
  const updates = [];

  complaints.forEach((complaint) => {
    const ageHours = getComplaintAgeHours(complaint.createdAt);
    const setFields = {};

    if (ageHours >= slaHours && !complaint.delayFlag) {
      setFields.delayFlag = true;
      setFields.reminderSentAt = new Date();
    }

    if (ageHours >= escalationHours && complaint.escalationLevel < 1) {
      setFields.escalationLevel = 1;
      setFields.escalationSentAt = new Date();
    }

    if (Object.keys(setFields).length > 0) {
      updates.push({
        updateOne: {
          filter: { _id: complaint._id },
          update: { $set: setFields }
        }
      });
    }
  });

  if (updates.length > 0) {
    await Complaint.bulkWrite(updates);
    console.log(
      `[SLA Worker] ${updates.length} complaint(s) updated at ${new Date().toISOString()} for reminder/escalation`
    );
  }
};

const initSlaWorker = () => {
  const timezone = process.env.TIMEZONE || 'Asia/Kolkata';
  cron.schedule(
    '0 * * * *',
    () => {
      runSlaScan().catch((error) => {
        console.error('[SLA Worker] Error during SLA scan:', error.message);
      });
    },
    { timezone }
  );

  setTimeout(() => {
    runSlaScan().catch((error) => {
      console.error('[SLA Worker] Initial scan failed:', error.message);
    });
  }, 5000);

  console.log('[SLA Worker] Scheduled to run every hour');
};

module.exports = {
  initSlaWorker,
  runSlaScan
};
