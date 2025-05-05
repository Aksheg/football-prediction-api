import { 
    Table, Column, Model, DataType, 
    ForeignKey, BelongsTo, BelongsToMany, HasMany, Default
  } from 'sequelize-typescript';
  import { v4 as uuidv4 } from 'uuid';
  import User from './User';
  import LeagueMember from './LeagueMember';
  import Leaderboard from './Leaderboard';
  
  @Table({ tableName: 'leagues' })
  export default class League extends Model {
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
    name!: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.UUID,
      allowNull: false,
    })
    ownerId!: string;
  
    @BelongsTo(() => User, 'ownerId')
    owner!: User;
  
    @Column({
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    isPrivate!: boolean;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    inviteCode?: string;
  
    @BelongsToMany(() => User, () => LeagueMember)
    members!: User[];
  
    @HasMany(() => Leaderboard)
    leaderboardEntries!: Leaderboard[];
  }