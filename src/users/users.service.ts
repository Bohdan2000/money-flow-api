import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    email: string;
    password?: string;
    googleId?: string;
    name?: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      $or: [
        { email: data.email.toLowerCase() },
        ...(data.googleId ? [{ googleId: data.googleId }] : []),
      ],
    });
    if (existing) {
      throw new ConflictException(
        'User with this email or Google account already exists',
      );
    }
    const payload: Partial<User> = {
      email: data.email.toLowerCase(),
      name: data.name ?? '',
      password: null,
      googleId: data.googleId ?? null,
    };
    if (data.password) {
      payload.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.userModel.create(payload);
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId });
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findByIdOrThrow(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validatePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  async updateProfile(
    userId: string | Types.ObjectId,
    data: { name?: string },
  ): Promise<UserDocument> {
    const user = await this.findByIdOrThrow(userId);
    if (data.name !== undefined) user.name = data.name;
    await user.save();
    return user;
  }

  async setGoogleId(
    userId: string | Types.ObjectId,
    googleId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { googleId },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
