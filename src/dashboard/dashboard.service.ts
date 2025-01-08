import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/shared/schema/category.schema';
import { Order } from 'src/shared/schema/order.schema';
import { Product } from 'src/shared/schema/product.schema';
import { Review } from 'src/shared/schema/review.schema';
import { Supplier } from 'src/shared/schema/supplier.schema';
import { User } from 'src/shared/schema/user.schema';
import { Voucher } from 'src/shared/schema/voucher';

interface OrderCompleted {
  _id: string;
  totalAmount: number;
  discount: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    @InjectModel(Supplier.name)
    private supplierModel: Model<Supplier>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Voucher.name)
    private voucherModel: Model<Voucher>,
    @InjectModel(Review.name)
    private reviewModel: Model<Review>,
  ) {}

  async getDashboard() {
    const totalRevenue = await this.orderModel.aggregate([
      {
        $match: {
          orderStatus: 'completed',
          paymentStatus: 'success',
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalDiscount = await this.orderModel.aggregate([
      { $match: { orderStatus: 'completed', paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$discount' } } },
    ]);

    const orderCompleted = await this.orderModel.find({
      orderStatus: 'completed',
      paymentStatus: 'success',
    });

    const importFee = await this.getImportFee(orderCompleted);

    const profit = totalRevenue[0].total - importFee;

    const totalOrder = await this.orderModel.countDocuments();
    const orderStatus = await this.getOrderStatus();

    const totalCategory = await this.categoryModel.countDocuments();
    const totalProduct = await this.productModel.countDocuments();
    const totalSupplier = await this.supplierModel.countDocuments();
    const totalUser = await this.userModel.countDocuments();
    const totalVoucher = await this.voucherModel.countDocuments();
    const totalReview = await this.reviewModel.countDocuments();

    const barChartData = await this.getBarChartData();
    const countReviewByRating = await this.getCountReviewByRating();

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue[0].total,
        totalDiscount: totalDiscount[0].total,
        profit: profit,
        totalOrder: totalOrder,
        orderStatus: orderStatus,
        totalCategory: totalCategory,
        totalProduct: totalProduct,
        totalSupplier: totalSupplier,
        totalUser: totalUser,
        totalVoucher: totalVoucher,
        totalReview: totalReview,
        barChartData: barChartData,
        countReviewByRating: countReviewByRating,
      },
    };
  }

  async getImportFee(orderCompleted: any[]) {
    let importFee = 0;

    for (const order of orderCompleted) {
      for (const item of order.products) {
        if (!item.hasVariant) {
          importFee += item?.product?.importPrice * item?.buyQuantity;
        } else {
          importFee += item?.variant?.importPrice * item?.buyQuantity;
        }
      }
    }

    return importFee;
  }

  async getOrderStatus() {
    const statusOrder = [
      'confirmed',
      'processing',
      'shipping',
      'completed',
      'cancelled',
    ];

    const result = {};

    for (const status of statusOrder) {
      result[status] = await this.orderModel.countDocuments({
        orderStatus: status,
      });
    }

    return result;
  }

  async getBarChartData() {
    const currentYear = new Date().getFullYear();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const result = [];

    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const startDate = new Date(currentYear, monthIndex, 1);
      const endDate = new Date(currentYear, monthIndex + 1, 0);

      const totalRevenue = await this.orderModel.aggregate([
        {
          $match: {
            orderStatus: 'completed',
            paymentStatus: 'success',
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]);

      const totalOrder = await this.orderModel.countDocuments({
        orderStatus: 'completed',
        paymentStatus: 'success',
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const monthlyOrders = await this.orderModel.find({
        orderStatus: 'completed',
        paymentStatus: 'success',
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const importFee = await this.getImportFee(monthlyOrders);
      const profit = totalRevenue[0]?.total || 0 - importFee;

      result.push({
        month: months[monthIndex],
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrder: totalOrder,
        profit: profit,
      });
    }

    return result;
  }

  async getCountReviewByRating() {
    const result = await this.reviewModel.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    return result;
  }
}
