const prisma = require('../config/prisma');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'upcoming') {
      where.eventDate = { gte: new Date() };
    } else if (status === 'past') {
      where.eventDate = { lt: new Date() };
    }
    if (search) {
      where.eventName = { contains: search, mode: 'insensitive' };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { eventDate: 'desc' },
        include: {
          organizer: { select: { id: true, name: true, email: true } },
          _count: { select: { registrations: true } }
        }
      }),
      prisma.event.count({ where })
    ]);

    const eventsWithCount = events.map(event => ({
      ...event,
      registrationCount: event._count.registrations
    }));

    res.json({
      success: true,
      data: eventsWithCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        registrations: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const { eventName, description, eventDate, location, maxParticipants } = req.body;

    const event = await prisma.event.create({
      data: {
        eventName,
        description,
        eventDate: new Date(eventDate),
        location,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        organizerId: req.user.id
      },
      include: {
        organizer: { select: { name: true, email: true } }
      }
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, description, eventDate, location, maxParticipants } = req.body;

    const updateData = {};
    if (eventName) updateData.eventName = eventName;
    if (description !== undefined) updateData.description = description;
    if (eventDate) updateData.eventDate = new Date(eventDate);
    if (location !== undefined) updateData.location = location;
    if (maxParticipants !== undefined) {
      updateData.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: { select: { name: true } }
      }
    });

    res.json({ success: true, data: event, message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete registrations first
    await prisma.eventRegistration.deleteMany({ where: { eventId: id } });
    
    // Delete event
    await prisma.event.delete({ where: { id } });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get event registrations
exports.getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, department: true } }
      },
      orderBy: { registeredAt: 'desc' }
    });

    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
