const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalComplaints = await prisma.complaint.count();
    
    const openIssues = await prisma.complaint.count({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS']
        }
      }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const resolvedToday = await prisma.complaint.count({
      where: {
        status: {
          in: ['RESOLVED', 'CLOSED']
        },
        updatedAt: {
          gte: startOfToday
        }
      }
    });

    // Group by category
    const categoryGroup = await prisma.complaint.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });
    const categoryStats = categoryGroup.map(item => ({
      category: item.category,
      count: item._count.id
    }));

    // Group by status
    const statusGroup = await prisma.complaint.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    const statusStats = statusGroup.map(item => ({
      status: item.status,
      count: item._count.id
    }));

    res.json({
      totalUsers,
      totalComplaints,
      openIssues,
      resolvedToday,
      categoryStats,
      statusStats
    });
  } catch (error) {
    console.error('Fetch Admin Stats Error:', error);
    res.status(500).json({ message: 'Failed to load stats.' });
  }
};

// @desc    Get all complaints with search and filter
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { id: true, name: true, email: true, department: true }
        },
        staff: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    });

    res.json(complaints);
  } catch (error) {
    console.error('Fetch All Complaints Error:', error);
    res.status(500).json({ message: 'Failed to load complaints.' });
  }
};

// @desc    Assign a complaint to a staff member
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin)
const assignComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required for assignment.' });
    }

    const parsedStaffId = parseInt(staffId);

    // Verify staff exists and is actually a staff member
    const staff = await prisma.user.findUnique({
      where: { id: parsedStaffId }
    });

    if (!staff || staff.role !== 'STAFF') {
      return res.status(400).json({ message: 'Invalid staff member selected.' });
    }

    // Verify complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Update complaint - change status to ASSIGNED if it was PENDING
    const updatedStatus = complaint.status === 'PENDING' ? 'ASSIGNED' : complaint.status;

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        staffId: parsedStaffId,
        status: updatedStatus
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true, email: true } }
      }
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: complaint.studentId,
        message: `Your complaint "${complaint.title}" has been assigned to staff "${staff.name}".`
      }
    });

    // Notify Staff
    await prisma.notification.create({
      data: {
        userId: parsedStaffId,
        message: `New complaint assigned to you: "${complaint.title}" (Priority: ${complaint.priority})`
      }
    });

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Assign Complaint Error:', error);
    res.status(500).json({ message: 'Failed to assign complaint.' });
  }
};

// @desc    Get list of all staff members
// @route   GET /api/admin/staff
// @access  Private (Admin)
const getStaffList = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        department: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (error) {
    console.error('Fetch Staff Error:', error);
    res.status(500).json({ message: 'Failed to load staff list.' });
  }
};

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ message: 'Failed to load users.' });
  }
};

module.exports = {
  getAdminStats,
  getAllComplaints,
  assignComplaint,
  getStaffList,
  getAllUsers
};
