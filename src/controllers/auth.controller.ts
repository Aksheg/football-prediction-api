import { Request, Response } from 'express';
import { AuthService, RegisterUserDto, LoginUserDto } from '../services/auth.service';
import { logger } from '../utils/logger';

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response): Promise<void> {
    const userData: RegisterUserDto = req.body;
    
    if (!userData.username || !userData.email || !userData.password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const result = await this.authService.register(userData);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const loginData: LoginUserDto = req.body;
    
    if (!loginData.email || !loginData.password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await this.authService.login(loginData);
    res.status(200).json(result);
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const profile = await this.authService.getProfile(req.user.id);
    res.status(200).json(profile);
  }
}