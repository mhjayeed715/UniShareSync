const prisma = require('../config/prisma');
const { notifyAll, NotificationTypes } = require('../utils/notificationHelper');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { status, search, clubId } = req.query;

    const where = {};
    if (status === 'upcoming') {
      where.eventDate = { gte: new Date() };
    } else if (status === 'past') {
      where.eventDate = { lt: new Date() };
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (clubId) {
      where.clubId = clubId;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        club: { select: { id: true, name: true } },
        _count: { select: { registrations: true } }
      }
    });

    const eventsWithCount = events.map(event => ({
      ...event,
      registrationCount: event._count.registrations
    }));

    res.json({ success: true, data: eventsWithCount });
  } catch (error) {
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
        creator: { select: { id: true, name: true, email: true } },
        club: { select: { id: true, name: true } },
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
    const { title, description, clubId, eventDate, startTime, endTime, location, maxCapacity, imageUrl } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        clubId,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        location,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        imageUrl,
        createdBy: req.user.id
      },
      include: {
        creator: { select: { name: true, email: true } },
        club: { select: { name: true } }
      }
    });

    // Notify all users about new event
    await notifyAll(
      'New Event',
      `${title} on ${new Date(eventDate).toLocaleDateString()}. Register now!`,
      NotificationTypes.INFO,
      `/events/${event.id}`
    );

    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, clubId, eventDate, startTime, endTime, location, maxCapacity, imageUrl, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (clubId !== undefined) updateData.clubId = clubId;
    if (eventDate) updateData.eventDate = new Date(eventDate);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (location !== undefined) updateData.location = location;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity ? parseInt(maxCapacity) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (status) updateData.status = status;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { name: true } },
        club: { select: { name: true } }
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
      orderBy: { registrationDate: 'desc' }
    });

    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register for event (Student)
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.maxCapacity && event.currentRegistrations >= event.maxCapacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: id, userId: req.user.id } }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    await prisma.$transaction([
      prisma.eventRegistration.create({
        data: { eventId: id, userId: req.user.id }
      }),
      prisma.event.update({
        where: { id },
        data: { currentRegistrations: { increment: 1 } }
      })
    ]);

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unregister from event
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: id, userId: req.user.id } }
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    await prisma.$transaction([
      prisma.eventRegistration.delete({ where: { id: registration.id } }),
      prisma.event.update({
        where: { id },
        data: { currentRegistrations: { decrement: 1 } }
      })
    ]);

    res.json({ success: true, message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
