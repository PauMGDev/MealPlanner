import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShoppingListService } from './shopping-list.service.js';

const mockPrisma = {
  shoppingListItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('ShoppingListService', () => {
  let service: ShoppingListService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoppingListService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ShoppingListService>(ShoppingListService);
  });

  describe('findAll', () => {
    it('returns items for the user ordered by checked then createdAt', async () => {
      mockPrisma.shoppingListItem.findMany.mockResolvedValue([]);

      await service.findAll('user-1');

      expect(mockPrisma.shoppingListItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [{ checked: 'asc' }, { createdAt: 'asc' }],
        include: { ingredient: true },
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the item does not exist', async () => {
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the item belongs to another user', async () => {
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue({
        id: 'item-1',
        userId: 'other-user',
      });

      await expect(service.findOne('item-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('returns the item when it belongs to the user', async () => {
      const item = { id: 'item-1', userId: 'user-1' };
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue(item);

      await expect(service.findOne('item-1', 'user-1')).resolves.toBe(item);
    });
  });

  describe('create', () => {
    it('creates an item for the user with a null ingredientId by default', async () => {
      mockPrisma.shoppingListItem.create.mockResolvedValue({ id: 'item-1' });

      await service.create('user-1', { name: 'Tomates', quantity: 3, unit: 'kg' });

      expect(mockPrisma.shoppingListItem.create).toHaveBeenCalledWith({
        data: { name: 'Tomates', quantity: 3, unit: 'kg', ingredientId: null, userId: 'user-1' },
        include: { ingredient: true },
      });
    });

    it('links the item to a catalog ingredient when ingredientId is provided', async () => {
      mockPrisma.shoppingListItem.create.mockResolvedValue({ id: 'item-1' });

      await service.create('user-1', { name: 'Tomates', ingredientId: 'ing-1' });

      expect(mockPrisma.shoppingListItem.create).toHaveBeenCalledWith({
        data: { name: 'Tomates', ingredientId: 'ing-1', userId: 'user-1' },
        include: { ingredient: true },
      });
    });
  });

  describe('update', () => {
    it('verifies ownership before updating', async () => {
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue({ id: 'item-1', userId: 'user-1' });
      mockPrisma.shoppingListItem.update.mockResolvedValue({ id: 'item-1', checked: true });

      await service.update('item-1', 'user-1', { checked: true });

      expect(mockPrisma.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { checked: true },
        include: { ingredient: true },
      });
    });

    it('throws ForbiddenException when updating another user item', async () => {
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue({
        id: 'item-1',
        userId: 'other-user',
      });

      await expect(service.update('item-1', 'user-1', { checked: true })).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.shoppingListItem.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('verifies ownership before deleting', async () => {
      mockPrisma.shoppingListItem.findUnique.mockResolvedValue({ id: 'item-1', userId: 'user-1' });
      mockPrisma.shoppingListItem.delete.mockResolvedValue({ id: 'item-1' });

      await service.remove('item-1', 'user-1');

      expect(mockPrisma.shoppingListItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
    });
  });

  describe('clearChecked', () => {
    it('deletes all checked items for the user', async () => {
      mockPrisma.shoppingListItem.deleteMany.mockResolvedValue({ count: 2 });

      await service.clearChecked('user-1');

      expect(mockPrisma.shoppingListItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', checked: true },
      });
    });
  });
});
