const prisma = require('../config/prisma');

// Get all lost & found items
exports.getAllItems = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.itemName = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.lostFoundItem.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: { select: { id: true, name: true, email: true } },
          foundBy: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.lostFoundItem.count({ where })
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.lostFoundItem.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { id: true, name: true, email: true, phone: true } },
        foundBy: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create item (admin)
exports.createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, contactInfo } = req.body;
    const userId = req.user.id;

    const item = await prisma.lostFoundItem.create({
      data: {
        title,
        description,
        category: category || 'Other',
        itemType: type?.toLowerCase() || 'lost',
        lastSeenLocation: location,
        lastSeenDate: new Date(),
        status: 'active',
        itemStatus: 'open',
        postedBy: userId,
        contactName: req.user.name,
        contactEmail: contactInfo,
        isAnonymous: false,
        resolved: false
      }
    });

    res.status(201).json({ 
      success: true,
      message: 'Item created successfully', 
      data: item 
    });
  } catch (error) {
    console.error('Admin create item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, foundByEmail } = req.body;

    if (!['LOST', 'FOUND', 'CLAIMED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status };

    if (status === 'CLAIMED' && foundByEmail) {
      const foundByUser = await prisma.user.findUnique({
        where: { email: foundByEmail }
      });
      if (foundByUser) {
        updateData.foundById = foundByUser.id;
        updateData.foundDate = new Date();
      }
    }

    const item = await prisma.lostFoundItem.update({
      where: { id },
      data: updateData,
      include: {
        reportedBy: { select: { name: true } },
        foundBy: { select: { name: true } }
      }
    });

    res.json({ success: true, data: item, message: 'Item status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item (admin)
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, contactInfo } = req.body;

    const item = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        title,
        description,
        category,
        lastSeenLocation: location,
        contactEmail: contactInfo
      }
    });

    res.json({ 
      success: true, 
      data: item, 
      message: 'Item updated successfully' 
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lostFoundItem.delete({ where: { id } });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Match lost and found items (admin helper)
exports.findMatches = async (req, res) => {
  try {
    const { itemName, location } = req.query;

    const lostItems = await prisma.lostFoundItem.findMany({
      where: {
        status: 'LOST',
        itemName: { contains: itemName || '', mode: 'insensitive' },
        location: location ? { contains: location, mode: 'insensitive' } : undefined
      },
      include: {
        reportedBy: { select: { name: true, email: true } }
      },
      take: 10
    });

    const foundItems = await prisma.lostFoundItem.findMany({
      where: {
        status: 'FOUND',
        itemName: { contains: itemName || '', mode: 'insensitive' },
        location: location ? { contains: location, mode: 'insensitive' } : undefined
      },
      include: {
        reportedBy: { select: { name: true, email: true } }
      },
      take: 10
    });

    res.json({ success: true, data: { lostItems, foundItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
