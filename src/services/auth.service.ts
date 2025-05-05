import { User } from '../models';
import { generateToken, JwtPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    points: number;
  };
  token: string;
}

export class AuthService {
  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    try {
      const existingUser = await User.findOne({
        where: {
          email: userData.email
        }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const existingUsername = await User.findOne({
        where: {
          username: userData.username
        }
      });

      if (existingUsername) {
        throw new Error('Username is already taken');
      }

      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      
      const token = generateToken(payload);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          points: user.points,
        },
        token,
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  async login(loginData: LoginUserDto): Promise<AuthResponse> {
    try {
      const user = await User.findOne({
        where: {
          email: loginData.email
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await user.validatePassword(loginData.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      
      const token = generateToken(payload);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          points: user.points,
        },
        token,
      };
    } catch (error) {
      logger.error('Error logging in user:', error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'points', 'createdAt']
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
