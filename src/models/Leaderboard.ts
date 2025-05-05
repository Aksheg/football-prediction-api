import { 
    Table, Column, Model, DataType, 
    ForeignKey, BelongsTo, Default
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import User from './User';
  import League from './League';
  
  @Table({ tableName: 'leaderboards' })
  export default class Leaderboard extends Model {
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
  
    @ForeignKey(() => League)
    @Column({
      type: DataType.UUID,
      allowNull: true,
    })
    leagueId?: string;
  
    @BelongsTo(() => League)
    league?: League;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
    points!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    rank!: number;
  }