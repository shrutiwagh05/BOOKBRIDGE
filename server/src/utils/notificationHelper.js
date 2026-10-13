const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  return Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    link,
  });
};

module.exports = {
  createNotification,
};