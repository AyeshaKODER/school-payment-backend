import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Order, OrderDocument } from '../payment/schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../transaction/schemas/order-status.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';

async function seedData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const orderModel = app.get<Model<OrderDocument>>(getModelToken(Order.name));
  const orderStatusModel = app.get<Model<OrderStatusDocument>>(
    getModelToken(OrderStatus.name),
  );
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  try {
    // Clear existing data
    await orderModel.deleteMany({});
    await orderStatusModel.deleteMany({});
    await userModel.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin', 10);
    const user = new userModel({
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });
    await user.save();
    console.log('👤 Created admin user (email: admin@gmail.com, password: admin)');

    const schools = [
      '65b0e6293e9f76a9694d84b4',
      '65b0e6293e9f76a9694d84b5',
      '65b0e6293e9f76a9694d84b6',
    ];

    const trustees = [
      '65b0e552dd31950a9b41c5ba',
      '65b0e552dd31950a9b41c5bb',
      '65b0e552dd31950a9b41c5bc',
    ];

    const gateways = ['PhonePe', 'Paytm', 'Razorpay', 'UPI'];
    const paymentModes = ['upi', 'card', 'netbanking', 'wallet'];
    const statuses = ['success', 'failed', 'pending', 'processing'];

    // Create sample orders and statuses
    for (let i = 1; i <= 50; i++) {
      const customOrderId = `ORD_${Date.now()}_${i}_${Math.random()
        .toString(36)
        .substr(2, 6)}`;
      const schoolId = schools[Math.floor(Math.random() * schools.length)];
      const trusteeId = trustees[Math.floor(Math.random() * trustees.length)];
      const gateway = gateways[Math.floor(Math.random() * gateways.length)];
      const paymentMode =
        paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderAmount = Math.floor(Math.random() * 5000) + 500;
      const transactionAmount =
        status === 'success'
          ? orderAmount
          : Math.floor(Math.random() * orderAmount);

// Create order
const order = new orderModel({
  school_id: schoolId,
  trustee_id: trusteeId,
  student_info: {
    name: `Student ${i}`,
    id: `STU${i.toString().padStart(3, '0')}`,
    email: `student${i}@school.edu`,
  },
  gateway_name: gateway,
  custom_order_id: customOrderId,  // ✅ only in Order
});

const savedOrder = await order.save();
console.log(`Created order ${i}: customOrderId = ${customOrderId}`);

// Create order status (NO custom_order_id here)
const orderStatus = new orderStatusModel({
  collect_id: savedOrder._id,  // ✅ link via ObjectId
  order_amount: orderAmount,
  transaction_amount: transactionAmount,
  payment_mode: paymentMode,
  payment_details: status === 'success' ? `success@${gateway.toLowerCase()}` : 'failed',
  bank_reference: `${gateway.toUpperCase()}${Math.floor(Math.random() * 10000)}`,
  payment_message: status === 'success' ? 'Payment successful' : 'Payment failed',
  status: status,
  error_message: status === 'failed' ? 'Insufficient balance' : 'NA',
  payment_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
});

await orderStatus.save();


      console.log(`✅ Created order ${i}: ${customOrderId} [${status}]`);
    }

    console.log('🎉 Seeded 50 sample transactions successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  seedData();
}
