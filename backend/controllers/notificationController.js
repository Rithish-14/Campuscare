const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20
    });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    res.status(500).json({ message: 'Failed to update notifications.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
