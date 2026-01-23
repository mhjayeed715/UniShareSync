const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/lost-found');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get all items (browse)
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.lostFoundItem.findMany({
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.itemType?.toUpperCase() || 'LOST',
      category: item.category || 'Other',
      location: item.lastSeenLocation || 'Unknown',
      contactInfo: item.contactEmail || item.contactPhone || 'Contact admin',
      status: item.itemStatus?.toUpperCase() || 'ACTIVE',
      reportedBy: item.poster?.name || item.contactName || 'Anonymous',
      reportedAt: item.createdAt,
      imageUrl: item.imageUrl
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Get lost-found items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's items
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.lostFoundItem.findMany({
      where: { postedBy: userId },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.itemType?.toUpperCase() || 'LOST',
      category: item.category || 'Other',
      location: item.lastSeenLocation || 'Unknown',
      contactInfo: item.contactEmail || item.contactPhone || 'Contact admin',
      status: item.itemStatus?.toUpperCase() || 'ACTIVE',
      reportedBy: item.poster?.name || item.contactName || 'Anonymous',
      reportedAt: item.createdAt,
      imageUrl: item.imageUrl
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Get my lost-found items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.lostFoundItem.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Transform data
    const transformedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.itemType?.toUpperCase() || 'LOST',
      category: item.category || 'Other',
      location: item.lastSeenLocation || 'Unknown',
      contactInfo: item.contactEmail || item.contactPhone || 'Contact admin',
      status: item.itemStatus?.toUpperCase() || 'ACTIVE',
      reportedBy: item.poster?.name || item.contactName || 'Anonymous',
      reportedAt: item.createdAt,
      imageUrl: item.imageUrl
    };

    res.json(transformedItem);
  } catch (error) {
    console.error('Get lost-found item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, contactInfo } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/lost-found/${req.file.filename}` : null;

    const item = await prisma.lostFoundItem.create({
      data: {
        title,
        description,
        category: category || 'Other',
        itemType: type?.toLowerCase() || 'lost',
        color: null,
        imageUrl,
        lastSeenLocation: location,
        lastSeenDate: new Date(),
        status: 'active',
        itemStatus: 'open',
        postedBy: userId,
        contactName: req.user.name,
        contactPhone: null,
        contactEmail: contactInfo,
        isAnonymous: false,
        resolved: false
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Transform data
    const transformedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.itemType?.toUpperCase() || 'LOST',
      category: item.category || 'Other',
      location: item.lastSeenLocation || 'Unknown',
      contactInfo: item.contactEmail || item.contactPhone || 'Contact admin',
      status: 'ACTIVE',
      reportedBy: item.poster?.name || 'Anonymous',
      reportedAt: item.createdAt,
      imageUrl: item.imageUrl
    };

    res.status(201).json({ 
      message: 'Item reported successfully', 
      item: transformedItem 
    });
  } catch (error) {
    console.error('Create lost-found item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, contactInfo } = req.body;
    const userId = req.user.id;

    // Check if user owns the item
    const item = await prisma.lostFoundItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy !== userId) {
      return res.status(403).json({ message: 'You can only update your own items' });
    }

    const imageUrl = req.file ? `/uploads/lost-found/${req.file.filename}` : item.imageUrl;

    const updatedItem = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        title,
        description,
        category,
        lastSeenLocation: location,
        contactEmail: contactInfo,
        imageUrl
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      message: 'Item updated successfully', 
      item: updatedItem 
    });
  } catch (error) {
    console.error('Update lost-found item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const item = await prisma.lostFoundItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the owner or admin
    if (item.postedBy !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update status of your own items' });
    }

    const updatedItem = await prisma.lostFoundItem.update({
      where: { id },
      data: {
        itemStatus: status.toLowerCase(),
        resolved: status.toLowerCase() === 'resolved',
        resolvedDate: status.toLowerCase() === 'resolved' ? new Date() : null
      }
    });

    res.json({ 
      message: 'Item status updated successfully', 
      item: updatedItem 
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create public item (no auth required)
exports.createPublicItem = async (req, res) => {
  try {
    const { title, description, type, category, location, contactInfo } = req.body;
    const imageUrl = req.file ? `/uploads/lost-found/${req.file.filename}` : null;

    const item = await prisma.lostFoundItem.create({
      data: {
        title,
        description,
        category: category || 'Other',
        itemType: type?.toLowerCase() || 'found',
        imageUrl,
        lastSeenLocation: location,
        lastSeenDate: new Date(),
        status: 'active',
        itemStatus: 'open',
        postedBy: null, // No user ID for public reports
        contactName: 'Anonymous Reporter',
        contactEmail: contactInfo,
        isAnonymous: true,
        resolved: false
      }
    });

    res.status(201).json({ 
      message: 'Item reported successfully', 
      item 
    });
  } catch (error) {
    console.error('Create public item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Found response
exports.foundResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const item = await prisma.lostFoundItem.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update item status to matched
    await prisma.lostFoundItem.update({
      where: { id },
      data: {
        itemStatus: 'matched',
        resolutionNotes: `Found response from ${req.user.name}: ${message}`
      }
    });

    res.json({ message: 'Response sent successfully' });
  } catch (error) {
    console.error('Found response error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the item or is admin
    const item = await prisma.lostFoundItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own items' });
    }

    // Delete associated image file if exists
    if (item.imageUrl) {
      const imagePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.lostFoundItem.delete({
      where: { id }
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete lost-found item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};