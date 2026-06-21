const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Add a comment to a complaint
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { complaintId, message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userName = req.user.name;

    if (!complaintId || !message || message.trim() === '') {
      return res.status(400).json({ message: 'Complaint ID and message are required.' });
    }

    const parsedComplaintId = parseInt(complaintId);

    // Verify complaint exists and user is authorized to comment on it
    const complaint = await prisma.complaint.findUnique({
      where: { id: parsedComplaintId }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Check authorizations
    if (userRole === 'STUDENT' && complaint.studentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to comment on this issue.' });
    }
    if (userRole === 'STAFF' && complaint.staffId !== userId) {
      return res.status(403).json({ message: 'Not authorized. You are not assigned to this issue.' });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        complaintId: parsedComplaintId,
        userId,
        message
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // Send notifications
    // Scenario 1: Student comments -> Notify Staff (if assigned) and Admins
    if (userRole === 'STUDENT') {
      if (complaint.staffId) {
        await prisma.notification.create({
          data: {
            userId: complaint.staffId,
            message: `Student "${userName}" commented on ticket #${complaint.id}: "${message.substring(0, 30)}..."`
          }
        });
      }
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `Student "${userName}" commented on ticket #${complaint.id}: "${message.substring(0, 30)}..."`
          }
        });
      }
    }
    // Scenario 2: Staff comments -> Notify Student and Admins
    else if (userRole === 'STAFF') {
      await prisma.notification.create({
        data: {
          userId: complaint.studentId,
          message: `Staff "${userName}" commented on your ticket #${complaint.id}: "${message.substring(0, 30)}..."`
        }
      });
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `Staff "${userName}" commented on ticket #${complaint.id}: "${message.substring(0, 30)}..."`
          }
        });
      }
    }
    // Scenario 3: Admin comments -> Notify Student and Staff (if assigned)
    else if (userRole === 'ADMIN') {
      await prisma.notification.create({
        data: {
          userId: complaint.studentId,
          message: `Admin "${userName}" commented on your ticket #${complaint.id}: "${message.substring(0, 30)}..."`
        }
      });
      if (complaint.staffId) {
        await prisma.notification.create({
          data: {
            userId: complaint.staffId,
            message: `Admin "${userName}" commented on ticket #${complaint.id}: "${message.substring(0, 30)}..."`
          }
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

module.exports = {
  addComment
};
