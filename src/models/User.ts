import { 
    Table, Column, Model, DataType, HasMany, 
    BelongsToMany, Default, BeforeCreate, BeforeUpdate, Unique
  } from 'sequelize-typescript';
  import bcrypt from 'bcryptjs';
  import { v4 as uuidv4 } from 'uuid';
  import Prediction from './Prediction';
  import League from './League';
  import LeagueMember from './LeagueMember';
  import Reward from './Reward';
  import Leaderboard from './Leaderboard';
  
  @Table({ tableName: 'users' })
  export default class User extends Model {
    @Default(uuidv4)
    @Column({
      primaryKey: true,
      type: DataType.UUID,
    })
    id!: string;
  
    @Unique
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    username!: string;
  
    @Unique
    @Column({
      type: DataType.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    })
    email!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    password!: string;
  
    @Default(0)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    points!: number;
  
    @HasMany(() => Prediction)
    predictions!: Prediction[];
  
    @HasMany(() => League, 'ownerId')
    ownedLeagues!: League[];
  
    @BelongsToMany(() => League, () => LeagueMember)
    leagues!: League[];
  
    @HasMany(() => Reward)
    rewards!: Reward[];
  
    @HasMany(() => Leaderboard)
    leaderboardEntries!: Leaderboard[];
  
    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: User) {
      if (instance.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        instance.password = await bcrypt.hash(instance.password, salt);
      }
    }
  
    async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password);
    }
  }
  