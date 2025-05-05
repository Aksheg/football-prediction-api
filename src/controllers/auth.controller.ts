import { Request, Response } from 'express';
import { AuthService, RegisterUserDto, LoginUserDto } from '../services/auth.service';
import { logger } from '../utils/logger';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const userData: RegisterUserDto = req.body;
      
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const result = await this.authService.register(userData);
      return res.status(201).json(result);
    } catch (error: any) {
      logger.error('Register controller error:', error);
      
      if (error.message.includes('already exists') || error.message.includes('already taken')) {
        return res.status(409).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  login = async (req: Request, res: Response) => {
    try {
      const loginData: LoginUserDto = req.body;
      
      if (!loginData.email || !loginData.password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await this.authService.login(loginData);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Login controller error:', error);
      
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getProfile = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const profile = await this.authService.getProfile(req.user.id);
      return res.status(200).json(profile);
    } catch (error: any) {
      logger.error('Get profile controller error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}