import { 
    Table, Column, Model, DataType, 
    HasMany, Default, IsIn
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import Prediction from './Prediction';
  
  export enum MatchStatus {
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
  }
  
  @Table({ tableName: 'matches' })
  export default class Match extends Model {
    @Default(uuidv4)
    @Column({
      primaryKey: true,
      type: DataType.UUID,
    })
    id!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    homeTeam!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    awayTeam!: string;
  
    @Column({
      type: DataType.DATE,
      allowNull: false,
    })
    startTime!: Date;
  
    @Column({
      type: DataType.DATE,
      allowNull: true,
    })
    endTime?: Date;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
    })
    homeScore?: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
    })
    awayScore?: number;
  
    @IsIn({
      args: [[MatchStatus.SCHEDULED, MatchStatus.LIVE, MatchStatus.COMPLETED, MatchStatus.CANCELLED]],
      msg: "Status must be one of: SCHEDULED, LIVE, COMPLETED, CANCELLED",
    })
    @Default(MatchStatus.SCHEDULED)
    @Column({
      type: DataType.ENUM(...Object.values(MatchStatus)),
      allowNull: false,
    })
    status!: MatchStatus;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    league!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    season!: string;
  
    @HasMany(() => Prediction)
    predictions!: Prediction[];
  }