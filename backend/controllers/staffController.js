const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get complaints assigned to logged in staff member
// @route   GET /api/staff/complaints
// @access  Private (Staff)
const getAssignedComplaints = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { status, category } = req.query;

    const filter = { staffId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await prisma.complaint.findMany({
      where: filter,
      orderBy: { updatedAt: 'desc' },
      include: {
        student: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    });

    res.json(complaints);
  } catch (error) {
    console.error('Fetch Staff Assigned Complaints Error:', error);
    res.status(500).json({ message: 'Failed to load assigned complaints.' });
  }
};

// @desc    Update status of assigned complaint
// @route   PUT /api/staff/complaints/:id/status
// @access  Private (Staff)
const updateComplaintStatus = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const staffId = req.user.id;
    const staffName = req.user.name;
    const { status, resolutionNote } = req.body;

    const ALLOWED_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update requested.' });
    }

    // Verify complaint exists and is assigned to this staff
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (complaint.staffId !== staffId) {
      return res.status(403).json({ message: 'Not authorized. You are not assigned to this complaint.' });
    }

    // Extract resolution image if present
    const resolutionImage = req.file ? req.file.filename : undefined;

    // Update data object
    const updateData = { status };
    if (resolutionImage) {
      updateData.resolutionImage = resolutionImage;
    }

    // Update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    });

    // If staff added a resolution note, insert it as a comment
    if (resolutionNote && resolutionNote.trim() !== '') {
      await prisma.comment.create({
        data: {
          complaintId,
          userId: staffId,
          message: `[Resolution Note/Status Update]: ${resolutionNote}`
        }
      });
    }

    // Create notification for student
    let notificationMsg = `Your complaint "${complaint.title}" status has been updated to "${status}" by ${staffName}.`;
    if (status === 'RESOLVED') {
      if (resolutionImage) {
        notificationMsg = `Your complaint "${complaint.title}" has been RESOLVED. A resolution proof image has been uploaded. Please check and provide feedback or close the ticket.`;
      } else {
        notificationMsg = `Your complaint "${complaint.title}" has been RESOLVED. Please check and provide feedback or close the ticket.`;
      }
    }

    await prisma.notification.create({
      data: {
        userId: complaint.studentId,
        message: notificationMsg
      }
    });

    // Notify Admin of resolution
    if (status === 'RESOLVED' || status === 'CLOSED') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `Staff member "${staffName}" marked complaint #${complaint.id} as "${status}".`
          }
        });
      }
    }

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Update Complaint Status Error:', error);
    res.status(500).json({ message: 'Failed to update status.' });
  }
};

module.exports = {
  getAssignedComplaints,
  updateComplaintStatus
};
