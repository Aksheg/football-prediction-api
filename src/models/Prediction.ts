import { 
    Table, Column, Model, DataType, 
    ForeignKey, BelongsTo, Default, IsIn, HasMany
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import User from './User';
  import Match from './Match';
  import Reward from './Reward';
  
  export enum PredictionStatus {
    PENDING = 'PENDING',
    CALCULATED = 'CALCULATED',
  }
  
  @Table({ tableName: 'predictions' })
  export default class Prediction extends Model {
    @Default(uuidv4)
    @Column({
      primaryKey: true,
      type: DataType.UUID,
    })
    id!: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    userId!: string;
  
    @BelongsTo(() => User)
    user!: User;
  
    @ForeignKey(() => Match)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    matchId!: string;
  
    @BelongsTo(() => Match)
    match!: Match;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    homeScore!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    awayScore!: number;
  
    @Default(0)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    points!: number;
  
    @IsIn({
      args: [[PredictionStatus.PENDING, PredictionStatus.CALCULATED]],
      msg: "Status must be one of: PENDING, CALCULATED",
    })
    @Default(PredictionStatus.PENDING)
    @Column({
      type: DataType.ENUM(...Object.values(PredictionStatus)),
      allowNull: false,
    })
    status!: PredictionStatus;
  
    @HasMany(() => Reward)
    rewards!: Reward[];
  }