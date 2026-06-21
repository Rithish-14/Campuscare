const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { classifyWithAI } = require('../utils/aiClassifier');

// @desc    Predict Category and Priority in real-time
// @route   POST /api/complaints/predict
// @access  Private (Student)
const predictComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required for AI prediction.' });
    }

    const prediction = await classifyWithAI(title, description);
    res.json(prediction);
  } catch (error) {
    console.error('AI Prediction Error:', error);
    res.status(500).json({ message: 'AI prediction failed.' });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const studentId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    // Determine final category and priority
    // If not supplied, run AI classification. If supplied, use them (allowing user override).
    let finalCategory = category;
    let finalPriority = priority;

    if (!finalCategory || !finalPriority) {
      const aiPrediction = await classifyWithAI(title, description);
      if (!finalCategory) finalCategory = aiPrediction.category;
      if (!finalPriority) finalPriority = aiPrediction.priority;
    }

    // Handle image upload if present
    const imagePath = req.file ? req.file.filename : null;

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category: finalCategory,
        priority: finalPriority,
        status: 'PENDING',
        image: imagePath,
        studentId
      },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create notification for Admin about new complaint
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New complaint filed: "${title}" in category "${finalCategory}"`
        }
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({ message: 'Failed to file complaint. Server error.' });
  }
};

// @desc    Get complaints for logged in student
// @route   GET /api/complaints/my
// @access  Private (Student)
const getStudentComplaints = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, category } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await prisma.complaint.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        staff: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    res.json(complaints);
  } catch (error) {
    console.error('Fetch Student Complaints Error:', error);
    res.status(500).json({ message: 'Failed to load complaints.' });
  }
};

// @desc    Get complaint details by ID (Accessible by student who filed, staff assigned, or admins)
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        student: {
          select: { id: true, name: true, email: true, department: true }
        },
        staff: {
          select: { id: true, name: true, email: true, department: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Authorization checks
    if (userRole === 'STUDENT' && complaint.studentId !== userId) {
      return res.status(403).json({ message: 'Access denied to this complaint.' });
    }
    if (userRole === 'STAFF' && complaint.staffId !== userId) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this complaint.' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Fetch Complaint Details Error:', error);
    res.status(500).json({ message: 'Failed to fetch details.' });
  }
};

// @desc    Close complaint (Only student who filed can close it)
// @route   PUT /api/complaints/:id/close
// @access  Private (Student)
const closeComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const userId = req.user.id;
    const userName = req.user.name;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (complaint.studentId !== userId) {
      return res.status(403).json({ message: 'Not authorized to close this complaint.' });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'CLOSED' },
      include: {
        staff: { select: { id: true, name: true } }
      }
    });

    // Notify Staff if assigned
    if (complaint.staffId) {
      await prisma.notification.create({
        data: {
          userId: complaint.staffId,
          message: `Student "${userName}" has CLOSED ticket #${complaint.id} ("${complaint.title}").`
        }
      });
    }

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `Ticket #${complaint.id} ("${complaint.title}") has been CLOSED by student "${userName}".`
        }
      });
    }

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Close Complaint Error:', error);
    res.status(500).json({ message: 'Failed to close complaint.' });
  }
};

module.exports = {
  predictComplaint,
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  closeComplaint
};
