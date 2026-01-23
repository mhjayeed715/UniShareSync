const prisma = require('../config/prisma');

// Get all clubs
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { members: true, events: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const clubsWithCounts = clubs.map(club => ({
      ...club,
      memberCount: club._count.members,
      eventCount: club._count.events
    }));

    res.json({ success: true, data: clubsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single club
exports.getClub = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        events: { orderBy: { eventDate: 'desc' } }
      }
    });

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    res.json({ success: true, data: club });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create club (Admin/Faculty only)
exports.createClub = async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;

    const club = await prisma.club.create({
      data: {
        name,
        description,
        logoUrl,
        founderId: req.user.id
      }
    });

    res.status(201).json({ success: true, data: club, message: 'Club created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update club (Admin/Faculty only)
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, isActive } = req.body;

    const club = await prisma.club.update({
      where: { id },
      data: { name, description, logoUrl, isActive }
    });

    res.json({ success: true, data: club, message: 'Club updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete club (Admin/Faculty only)
exports.deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.club.delete({ where: { id } });
    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join club request (Student)
exports.requestJoinClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const existing = await prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId: req.user.id } }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already a member or request pending' });
    }

    const member = await prisma.clubMember.create({
      data: {
        clubId,
        userId: req.user.id,
        role: 'pending'
      }
    });

    res.status(201).json({ success: true, data: member, message: 'Join request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending join requests (Admin/Faculty only)
exports.getPendingRequests = async (req, res) => {
  try {
    const { clubId } = req.params;

    const requests = await prisma.clubMember.findMany({
      where: { clubId, role: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } }
      }
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject join request (Admin/Faculty only)
exports.handleJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (action === 'approve') {
      await prisma.clubMember.update({
        where: { id: memberId },
        data: { role: 'member' }
      });
      res.json({ success: true, message: 'Member approved' });
    } else {
      await prisma.clubMember.delete({ where: { id: memberId } });
      res.json({ success: true, message: 'Request rejected' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's clubs
exports.getUserClubs = async (req, res) => {
  try {
    const clubs = await prisma.clubMember.findMany({
      where: { userId: req.user.id, role: { not: 'pending' } },
      include: {
        club: {
          include: {
            _count: { select: { members: true, events: true } }
          }
        }
      }
    });

    res.json({ success: true, data: clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
